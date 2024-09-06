import { FindManyOptions, FindOneOptions } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';

export interface ITicketRepository {
  create(ticket: Partial<Ticket>): Ticket;
  save(ticket: Ticket): Promise<Ticket>;
  findOne(options: FindOneOptions<Ticket>): Promise<Ticket | null>;
  find(options: FindManyOptions<Ticket>): Promise<Ticket[]>;
  findByUserId(userId: string): Promise<Ticket[]>;
  findUnusedTicketsByUserId(userId: string): Promise<Ticket[]>;
  findWatchHistoryByUserId(userId: string): Promise<Ticket[]>;
}