import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@domain/auth/enums/role.enum';
import { BaseUser } from './base-user.dto';
import { IsEnum, IsIn } from 'class-validator';

export class CreateUserDto extends BaseUser {
  @ApiProperty({ enum: Role, default: Role.CUSTOMER, example: Role.CUSTOMER })
  @IsEnum(Role)
  @IsIn([Role.CUSTOMER], { message: 'The role must be CUSTOMER.' })
  role: Role = Role.CUSTOMER;

  createdAt?: Date = new Date();
}
