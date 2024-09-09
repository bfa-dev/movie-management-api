import { DeepPartial, FindManyOptions, FindOneOptions } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';

export interface ITicketRepository {
  create(ticket: DeepPartial<Ticket>): Ticket;
  save(ticket: Ticket): Promise<Ticket>;
  find(options: FindManyOptions<Ticket>): Promise<Ticket[]>;
  findOneById(id: string): Promise<Ticket | null>;
  findOneWithRelations(relations: FindOneOptions<Ticket>): Promise<Ticket | null>;
}
