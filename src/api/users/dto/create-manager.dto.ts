import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@domain/auth/role.enum';
import { BaseUser } from "./base-user.dto";
import { IsEnum } from 'class-validator';

export class CreateManagerDto extends BaseUser {
  @ApiProperty({ enum: Role, default: Role.MANAGER })
  @IsEnum(Role)
  role: Role = Role.MANAGER;

  createdAt?: Date = new Date();
}