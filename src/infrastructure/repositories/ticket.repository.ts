import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Ticket } from '@domain/tickets/entities/ticket.entity';
import { ITicketRepository } from '@domain/tickets/repositories/ticket-repository.interface';

@Injectable()
export class TicketRepository implements ITicketRepository {
  constructor(
    @InjectRepository(Ticket)
    private readonly repository: Repository<Ticket>,
  ) { }

  create(ticket: DeepPartial<Ticket>): Ticket {
    return this.repository.create(ticket);
  }

  async save(ticket: Ticket): Promise<Ticket> {
    return this.repository.save(ticket);
  }

  async find(options: FindManyOptions<Ticket>): Promise<Ticket[]> {
    return this.repository.find(options);
  }

  async findOneById(id: string): Promise<Ticket | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findOneWithRelations(relations: FindOneOptions<Ticket>): Promise<Ticket | null> {
    return this.repository.findOne(relations);
  }
}