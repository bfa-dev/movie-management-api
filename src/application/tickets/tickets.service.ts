import { Inject, Injectable } from '@nestjs/common';
import { Ticket } from '@domain/tickets/entities/ticket.entity';
import { ITicketRepository } from '@domain/tickets/repositories/ticket-repository.interface';
import { DeepPartial, FindOneOptions } from 'typeorm';
import { User } from '@domain/users/entities/user.entity';
import { SessionsService } from '@application/sessions/sessions.service';
import { WatchMovieDto } from '@api/movies/dto/watch-movie.dto';
import {
  MovieIsNotActiveError,
  SessionNotFoundError,
  TicketAlreadyUsedError,
  TicketNotFoundError,
  UserNotOldEnoughError,
  TicketDoesNotBelongToUserError
} from '@domain/exceptions';

@Injectable()
export class TicketsService {
  constructor(
    @Inject('ITicketRepository')
    private ticketRepository: ITicketRepository,
    private sessionsService: SessionsService,
  ) { }


  checkIfMovieIsActive(isActive: boolean) {
    if (isActive === false) {
      throw new MovieIsNotActiveError();
    }
  }

  checkIfUserIsOldEnough(userAge: number, movieAgeRestriction: number) {
    if (userAge <= movieAgeRestriction) {
      throw new UserNotOldEnoughError();
    }
  }

  async findById(id: string): Promise<Ticket | null> {
    return this.ticketRepository.findOneById(id);
  }

  async findOne(options: FindOneOptions<Ticket>): Promise<Ticket | null> {
    return this.ticketRepository.findOneWithRelations(options);
  }

  async updateOne(ticket: Ticket): Promise<Ticket> {
    return this.ticketRepository.save(ticket);
  }

  async create(ticket: DeepPartial<Ticket>): Promise<Ticket> {
    const newTicket = this.ticketRepository.create(ticket);
    return this.ticketRepository.save(newTicket);
  }

  async getWatchHistoryByUserId(userId: string): Promise<Ticket[]> {
    return this.ticketRepository.find({ where: { userId: userId, used: true } });
  }

  async buyTicket(user: User, sessionId: string): Promise<Ticket> {
    const session = await this.sessionsService.findOneWithRelations({
      where: { id: sessionId },
      relations: ['movie'],
    });

    if (!session) {
      throw new SessionNotFoundError();
    }

    this.checkIfMovieIsActive(session.movie.isActive);
    this.checkIfUserIsOldEnough(user.age, session.movie.ageRestriction);

    const ticket = await this.create({
      userId: user.id,
      sessionId,
      movieId: session.movie.id,
      used: false,
    });

    return ticket;
  }

  private checkIfTicketBelongsToUser(user: User, ticket: Ticket) {
    if (ticket.userId !== user.id) {
      throw new TicketDoesNotBelongToUserError();
    }
  }

  async watchMovie(user: User, watchMovieDto: WatchMovieDto): Promise<Ticket> {
    const ticket = await this.findOne({ where: { id: watchMovieDto.ticketId } });
    if (!ticket) {
      throw new TicketNotFoundError();
    }

    if (ticket.used) {
      throw new TicketAlreadyUsedError();
    }

    this.checkIfTicketBelongsToUser(user, ticket);

    ticket.used = true;

    return this.updateOne(ticket);
  }

  async getUsersUsedTickets(userId: string): Promise<Ticket[]> {
    return this.ticketRepository.find({ where: { userId: userId, used: true } });
  }
}