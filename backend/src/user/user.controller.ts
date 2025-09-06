import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { FileUploadService } from '../common/services/file-upload.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { CreateUserPreferencesDto } from './dto/create-user-preferences.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

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

@Controller('users')
@UseGuards(JwtAuthGuard, RoleGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get()
  @Roles('ADMIN')
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @Get('profile')
  getProfile(
    @Request() req: { user: { id: string } },
  ): Promise<Omit<User, 'password'>> {
    return this.userService.getUserProfile(req.user.id);
  }

  @Put('profile')
  updateProfile(
    @Request() req: { user: { id: string } },
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(req.user.id, updateUserDto);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @Request() req: { user: { id: string } },
    @UploadedFile() file: Express.Multer.File,
  ): Promise<User> {
    this.fileUploadService.validateImageFile(file);
    const avatarUrl = this.fileUploadService.generateFileUrl(
      file.filename,
      'avatars',
    );
    return this.userService.updateAvatar(req.user.id, avatarUrl);
  }

  // Address management endpoints
  @Get('addresses')
  getUserAddresses(
    @Request() req: { user: { id: string } },
  ): Promise<Address[]> {
    return this.userService.getUserAddresses(req.user.id);
  }

  @Post('addresses')
  createAddress(
    @Request() req: { user: { id: string } },
    @Body() createAddressDto: CreateAddressDto,
  ): Promise<Address> {
    return this.userService.createAddress(req.user.id, createAddressDto);
  }

  @Put('addresses/:addressId')
  updateAddress(
    @Request() req: { user: { id: string } },
    @Param('addressId', ParseUUIDPipe) addressId: string,
    @Body() updateAddressDto: Partial<CreateAddressDto>,
  ): Promise<Address> {
    return this.userService.updateAddress(
      req.user.id,
      addressId,
      updateAddressDto,
    );
  }

  @Delete('addresses/:addressId')
  deleteAddress(
    @Request() req: { user: { id: string } },
    @Param('addressId', ParseUUIDPipe) addressId: string,
  ): Promise<Address> {
    return this.userService.deleteAddress(req.user.id, addressId);
  }

  // User preferences endpoints
  @Get('preferences')
  getUserPreferences(
    @Request() req: { user: { id: string } },
  ): Promise<UserPreferences | null> {
    return this.userService.getUserPreferences(req.user.id);
  }

  @Post('preferences')
  createOrUpdatePreferences(
    @Request() req: { user: { id: string } },
    @Body() preferencesDto: CreateUserPreferencesDto,
  ): Promise<UserPreferences> {
    return this.userService.createOrUpdatePreferences(
      req.user.id,
      preferencesDto,
    );
  }

  // Admin endpoints
  @Get(':id')
  @Roles('ADMIN')
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.userService.findById(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  deleteById(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.userService.deleteById(id);
  }
}
