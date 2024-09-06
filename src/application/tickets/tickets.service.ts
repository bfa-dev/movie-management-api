import { Inject, Injectable } from '@nestjs/common';
import { Ticket } from '@domain/tickets/entities/ticket.entity';
import { ITicketRepository } from '@domain/tickets/repositories/ticket-repository.interface';
import { FindOneOptions } from 'typeorm';
import { GetTicketByIdDto } from '@api/tickets/dto/get-ticket-by-id.dto';

@Injectable()
export class TicketsService {
  constructor(
    @Inject('ITicketRepository')
    private ticketRepository: ITicketRepository,
  ) { }

  async findById(id: string): Promise<Ticket | null> {
    return this.ticketRepository.findOne({ where: { id } });
  }

  async findOne(options: FindOneOptions<Ticket>): Promise<Ticket | null> {
    return this.ticketRepository.findOne(options);
  }

  async updateOne(ticket: Ticket): Promise<Ticket> {
    return this.ticketRepository.save(ticket);
  }

  async create(ticket: Partial<Ticket>): Promise<Ticket> {
    const newTicket = this.ticketRepository.create(ticket);
    return this.ticketRepository.save(newTicket);
  }

  async getTicketsByUserId(userId: string): Promise<Ticket[]> {
    const tickets = await this.ticketRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'session', 'session.movie'],
    });
    return tickets;
  }

  async getUnusedTicketsByUserId(userId: string): Promise<Ticket[]> {
    return this.ticketRepository.find({ where: { user: { id: userId }, used: false } });
  }

  async getWatchHistoryByUserId(userId: string): Promise<Ticket[]> {
    return this.ticketRepository.find({ where: { user: { id: userId }, used: true } });
  }
}