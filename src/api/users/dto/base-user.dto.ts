import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@domain/auth/enums/role.enum';
import { IsString, IsInt, IsEnum, IsEmail, IsOptional } from 'class-validator';
import { PrimaryGeneratedColumn } from 'typeorm';

export class BaseUser {
  @PrimaryGeneratedColumn('uuid')
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ example: 'Furkan Akgul' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'user@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  password: string;

  @ApiProperty({ example: 15 })
  @IsInt()
  age: number;

  @ApiProperty({ enum: Role, default: Role.CUSTOMER })
  @IsEnum(Role)
  role: Role;
}
