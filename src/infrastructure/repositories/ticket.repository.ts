import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Ticket } from '@domain/tickets/entities/ticket.entity';
import { ITicketRepository } from '@domain/tickets/repositories/ticket-repository.interface';

@Injectable()
export class TicketRepository implements ITicketRepository {
  constructor(
    @InjectRepository(Ticket)
    private readonly repository: Repository<Ticket>,
  ) { }

  create(ticket: Partial<Ticket>): Ticket {
    return this.repository.create(ticket);
  }

  async save(ticket: Ticket): Promise<Ticket> {
    return this.repository.save(ticket);
  }

  async findOne(options: FindOneOptions<Ticket>): Promise<Ticket | null> {
    return this.repository.findOne(options);
  }

  async find(options: FindManyOptions<Ticket>): Promise<Ticket[]> {
    return this.repository.find(options);
  }

  async findByUserId(userId: string): Promise<Ticket[]> {
    return this.repository.find({ where: { user: { id: userId } } });
  }

  async findUnusedTicketsByUserId(userId: string): Promise<Ticket[]> {
    return this.repository.find({ where: { user: { id: userId }, used: false } });
  }

  async findWatchHistoryByUserId(userId: string): Promise<Ticket[]> {
    return this.repository.find({ where: { user: { id: userId }, used: true } });
  }
}