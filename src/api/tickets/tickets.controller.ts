import { Controller, Get, Param, Req } from '@nestjs/common';
import { TicketsService } from '../../application/tickets/tickets.service'
import { GetTicketByIdDto } from './dto/get-ticket-by-id.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@domain/auth/role.enum';
import { Roles } from '@application/decorators/roles.decorator';
import { Public } from '@application/decorators/public.decorator';

@ApiTags('tickets')
@ApiBearerAuth()
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) { }

  @Public()
  @Get(':ticketId')
  @Roles(Role.CUSTOMER, Role.MANAGER)
  @ApiOperation({ summary: 'Get a ticket by ID' })
  @ApiResponse({ status: 200, description: 'The ticket has been successfully retrieved.' })
  @ApiResponse({ status: 400, description: 'Invalid ticket ID.' })
  async getTicket(@Param() getTicketByIdDto: GetTicketByIdDto) {
    return this.ticketsService.findById(getTicketByIdDto.ticketId);
  }
}