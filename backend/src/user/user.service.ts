import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { CreateUserPreferencesDto } from './dto/create-user-preferences.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// Define types locally to avoid import issues
type Address = {
  id: string;
  userId: string;
  type: 'SHIPPING' | 'BILLING';
  firstName: string;
  lastName: string;
  company?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type UserPreferences = {
  id: string;
  userId: string;
  preferredDeckSize?: string | null;
  preferredBrands: string[];
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
  ridingStyle: string[];
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  currency: string;
  measurementUnit: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: {
        addresses: true,
        preferences: true,
      },
    });
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash the password before storing
    const hashedPassword = await this.hashPassword(createUserDto.password);

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phone: createUserDto.phone,
        dateOfBirth: createUserDto.dateOfBirth
          ? new Date(createUserDto.dateOfBirth)
          : null,
        isActive: createUserDto.isActive ?? true,
      },
      include: {
        addresses: true,
        preferences: true,
      },
    });
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findById(id);

    const updateData: Record<string, any> = { ...updateUserDto };

    // Hash password if provided
    if (updateUserDto.password) {
      updateData.password = await this.hashPassword(updateUserDto.password);
    }

    // Convert dateOfBirth string to Date if provided
    if (updateUserDto.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateUserDto.dateOfBirth);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        addresses: true,
        preferences: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        addresses: true,
        preferences: true,
      },
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        preferences: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async deleteById(id: string): Promise<User> {
    await this.findById(id);

    return this.prisma.user.delete({
      where: { id },
    });
  }

  // Address management methods
  async createAddress(
    userId: string,
    createAddressDto: CreateAddressDto,
  ): Promise<Address> {
    await this.findById(userId);

    // If this is set as default, unset other default addresses of the same type
    if (createAddressDto.isDefault) {
      await this.prisma.address.updateMany({
        where: {
          userId,
          type: createAddressDto.type,
        },
        data: {
          isDefault: false,
        },
      });
    }

    return this.prisma.address.create({
      data: {
        ...createAddressDto,
        userId,
      },
    });
  }

  async getUserAddresses(userId: string): Promise<Address[]> {
    await this.findById(userId);

    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async updateAddress(
    userId: string,
    addressId: string,
    updateData: Partial<CreateAddressDto>,
  ): Promise<Address> {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // If this is set as default, unset other default addresses of the same type
    if (updateData.isDefault && updateData.type) {
      await this.prisma.address.updateMany({
        where: {
          userId,
          type: updateData.type,
          id: { not: addressId },
        },
        data: {
          isDefault: false,
        },
      });
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data: updateData,
    });
  }

  async deleteAddress(userId: string, addressId: string): Promise<Address> {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return this.prisma.address.delete({
      where: { id: addressId },
    });
  }

  // User preferences methods
  async createOrUpdatePreferences(
    userId: string,
    preferencesDto: CreateUserPreferencesDto,
  ): Promise<UserPreferences> {
    await this.findById(userId);

    return this.prisma.userPreferences.upsert({
      where: { userId },
      update: preferencesDto,
      create: {
        ...preferencesDto,
        userId,
      },
    });
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    return this.prisma.userPreferences.findUnique({
      where: { userId },
    });
  }

  // Avatar upload method
  async updateAvatar(userId: string, avatarUrl: string): Promise<User> {
    await this.findById(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      include: {
        addresses: true,
        preferences: true,
      },
    });
  }

  // Helper method to get user profile with all related data
  async getUserProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        },
        preferences: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userProfile } = user;
    return userProfile;
  }

  private async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });
  }
}
