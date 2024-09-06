import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '@application/users/users.service';
import { Roles } from '@application/decorators/roles.decorator';
import { Role } from '@domain/auth/role.enum';
import { CurrentUser } from '@application/decorators/current-user.decorator';
import { User } from '@domain/users/entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @ApiBearerAuth()
  @Roles(Role.CUSTOMER, Role.MANAGER)
  @Get('tickets')
  @ApiOperation({ summary: 'Get all tickets for the authenticated user' })
  @ApiResponse({ status: 200, description: 'The tickets have been successfully retrieved.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 400, description: 'Invalid userId.' })
  async getTickets(@CurrentUser() user: { sub: string }) {
    const userId = user.sub;
    return this.usersService.getTicketsByUserId(userId);
  }

  @ApiBearerAuth()
  @Roles(Role.CUSTOMER, Role.MANAGER)
  @Get('unused-tickets')
  @ApiOperation({ summary: 'Get all unused tickets for the authenticated user' })
  @ApiResponse({ status: 200, description: 'The unused tickets have been successfully retrieved.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 400, description: 'Invalid userId.' })
  async getUnusedTickets(@CurrentUser() user: { sub: string }) {
    const userId = user.sub;
    return this.usersService.getUnusedTicketsByUserId(userId);
  }

  @ApiBearerAuth()
  @Roles(Role.CUSTOMER, Role.MANAGER)
  @Get('watch-history')
  @ApiOperation({ summary: 'Get all watch history for the authenticated user' })
  @ApiResponse({ status: 200, description: 'The watch history have been successfully retrieved.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 400, description: 'Invalid userId.' })
  async getWatchHistory(@CurrentUser() user: { sub: string }) {
    const userId = user.sub;
    return this.usersService.getWatchHistoryByUserId(userId);
  }
}