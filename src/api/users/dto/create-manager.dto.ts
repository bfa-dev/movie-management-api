import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@domain/auth/enums/role.enum';
import { BaseUser } from './base-user.dto';
import { IsEmail, IsEnum, IsInt, IsString } from 'class-validator';

export class CreateManagerDto extends BaseUser {
  @ApiProperty({ example: 'manager' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'manager@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 30 })
  @IsInt()
  age: number;

  @ApiProperty({ enum: Role, default: Role.MANAGER })
  @IsEnum(Role)
  role: Role = Role.MANAGER;

  createdAt?: Date = new Date();
}
