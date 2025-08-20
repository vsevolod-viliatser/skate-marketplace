import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';

interface User {
  id: string;
  email: string;
  password: string;
  role?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    try {
      const users = await this.userService.findAll();

      const user = users.find((u) => u.email === email);

      if (user && (await this.comparePasswords(password, user.password))) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
      }

      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async login(user: User) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role || 'USER',
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role || 'USER',
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    const hashedPassword = await this.hashPassword(createUserDto.password);

    const userData = {
      email: createUserDto.email,
      password: hashedPassword,
    };

    const user = await this.userService.createUser(userData);

    if (user) {
      return this.login(user as User);
    }

    throw new UnauthorizedException('Registration failed');
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
