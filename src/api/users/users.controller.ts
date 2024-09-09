import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '@application/users/users.service';
import { Roles } from '@application/decorators/roles.decorator';
import { Role } from '@domain/auth/enums/role.enum';
import { CurrentUser } from '@application/decorators/current-user.decorator';
import { GenericResponseDto } from '@api/shared/dto/generic-response.dto';
import { User } from '@domain/users/entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiBearerAuth()
  @Roles(Role.CUSTOMER, Role.MANAGER)
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiResponse({ status: 200, description: 'The user profile has been successfully retrieved.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getUserProfile(@CurrentUser() user: User) {
    const userProfile = await this.usersService.findOne({ where: { id: user.id } });
    return new GenericResponseDto(userProfile, 'The user profile has been successfully retrieved.');
  }

  @Get('watch-history')
  @ApiBearerAuth()
  @Roles(Role.CUSTOMER, Role.MANAGER)
  @ApiOperation({ summary: 'Get the watch history of the user' })
  @ApiResponse({ status: 200, description: 'The users watch history has been successfully retrieved.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getWatch(@CurrentUser() user: User) {
    const watchHistory = await this.usersService.getWatchHistory(user.id);
    return new GenericResponseDto(watchHistory, 'The users watch history has been successfully retrieved.');
  }
}
