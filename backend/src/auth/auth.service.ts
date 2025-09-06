import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { LoggerService } from '../common/services/logger.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';

interface UserWithoutPassword {
  id: string;
  email: string;
  role?: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  isActive?: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private logger: LoggerService,
  ) {}

  async login(loginDto: { email: string; password: string }) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return this.generateToken(user);
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.userService.createUser(createUserDto);

    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;
      return this.generateToken(userWithoutPassword);
    }

    throw new UnauthorizedException('Registration failed');
  }

  private async validateUser(
    email: string,
    password: string,
  ): Promise<UserWithoutPassword | null> {
    try {
      const user = await this.userService.findByEmail(email);

      if (user && (await this.comparePasswords(password, user.password))) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      this.logger.error(
        `Failed to validate user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'AuthService',
      );
      return null;
    }
  }

  private async generateToken(user: UserWithoutPassword) {
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
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isActive: user.isActive,
      },
    };
  }

  private async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });
  }

  private async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await argon2.verify(hashedPassword, plainPassword);
    } catch (error) {
      this.logger.error(
        `Failed to compare passwords: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'AuthService',
      );
      return false;
    }
  }
}
