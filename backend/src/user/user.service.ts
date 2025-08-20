import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

interface User {
  id: string;
  email: string;
  password: string;
  role?: string;
  createdAt: Date;
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: createUserDto.password,
      },
    });
  }
}
