import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  PROFESSIONAL = 'PROFESSIONAL',
}

export class CreateUserPreferencesDto {
  // Skate preferences
  @IsOptional()
  @IsString()
  preferredDeckSize?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredBrands?: string[];

  @IsOptional()
  @IsEnum(SkillLevel)
  skillLevel?: SkillLevel = SkillLevel.BEGINNER;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ridingStyle?: string[];

  // Notification preferences
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean = true;

  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean = false;

  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean = true;

  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean = true;

  // Shopping preferences
  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @IsOptional()
  @IsString()
  measurementUnit?: string = 'IMPERIAL';
}
