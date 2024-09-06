import { BaseUser } from "./base-user.dto";

export class UpdateUserDto extends BaseUser {
  updatedAt?: Date = new Date();
}