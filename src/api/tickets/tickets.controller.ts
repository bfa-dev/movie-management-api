import { Controller, Param, Post } from '@nestjs/common';
import { TicketsService } from '../../application/tickets/tickets.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@domain/auth/enums/role.enum';
import { Roles } from '@application/decorators/roles.decorator';
import { GenericResponseDto } from '@api/shared/dto/generic-response.dto';
import { CurrentUser } from '@application/decorators/current-user.decorator';
import { User } from '@domain/users/entities/user.entity';
import { WatchMovieDto } from '@api/tickets/dto/watch-movie.dto';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post(':sessionId/checkout')
  @ApiBearerAuth()
  @Roles(Role.CUSTOMER, Role.MANAGER)
  @ApiOperation({ summary: 'Buy a ticket for a movie session' })
  @ApiResponse({ status: 200, description: 'The ticket has been successfully bought.' })
  @ApiResponse({ status: 400, description: 'Invalid movie ID or session ID.' })
  async buyTicket(@CurrentUser() user: User, @Param('sessionId') sessionId: string) {
    const ticket = await this.ticketsService.buyTicket(user, sessionId);
    return new GenericResponseDto(ticket, 'The ticket has been successfully bought.');
  }

  @Post(':ticketId/watch')
  @ApiBearerAuth()
  @Roles(Role.CUSTOMER, Role.MANAGER)
  @ApiOperation({ summary: 'Watch a movie using a ticket' })
  @ApiResponse({ status: 200, description: 'The movie has been successfully watched.' })
  @ApiResponse({ status: 400, description: 'Invalid ticket ID.' })
  async watchMovie(@CurrentUser() user: User, @Param() watchMovieDto: WatchMovieDto) {
    const movie = await this.ticketsService.watchMovie(user, watchMovieDto);
    return new GenericResponseDto(movie, 'The movie has been successfully watched.');
  }
}
