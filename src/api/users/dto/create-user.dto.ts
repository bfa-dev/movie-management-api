import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@domain/auth/enums/role.enum';
import { BaseUser } from "./base-user.dto";
import { IsEnum } from 'class-validator';

export class CreateUserDto extends BaseUser {
  @ApiProperty({ enum: Role, default: Role.CUSTOMER, example: Role.MANAGER })
  @IsEnum(Role)
  role: Role = Role.CUSTOMER;

  createdAt?: Date = new Date();
}