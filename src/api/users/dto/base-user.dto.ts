import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@domain/auth/role.enum';
import { IsString, IsInt, IsEnum, IsEmail } from 'class-validator';
import { PrimaryGeneratedColumn } from 'typeorm';

export class BaseUser {
  @PrimaryGeneratedColumn('uuid')
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsInt()
  age: number;

  @ApiProperty({ enum: Role, default: Role.CUSTOMER })
  @IsEnum(Role)
  role: Role;
}