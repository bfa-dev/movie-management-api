import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from '@domain/tickets/entities/ticket.entity';
import { TicketsService } from './tickets.service';
import { TicketRepository } from '@infrastructure/repositories/ticket.repository';
import { TicketsController } from '@api/tickets/tickets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket])],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    {
      provide: 'ITicketRepository',
      useClass: TicketRepository,
    },
  ],
  exports: [TicketsService],
})
export class TicketsModule { }