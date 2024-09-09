import { Inject, Injectable } from '@nestjs/common';
import { Ticket } from '@domain/tickets/entities/ticket.entity';
import { ITicketRepository } from '@domain/tickets/repositories/ticket-repository.interface';
import { DeepPartial, FindOneOptions } from 'typeorm';
import { User } from '@domain/users/entities/user.entity';
import { SessionsService } from '@application/sessions/sessions.service';
import { WatchMovieDto } from '@api/tickets/dto/watch-movie.dto';
import {
  MovieIsNotActiveError,
  SessionNotFoundError,
  TicketAlreadyUsedError,
  TicketNotFoundError,
  UserNotOldEnoughError,
  TicketDoesNotBelongToUserError,
  SessionAlreadyPassedError,
} from '@domain/exceptions';
import { TimeSlot } from '@domain/sessions/enums/time.slot.enum';

@Injectable()
export class TicketsService {
  constructor(
    @Inject('ITicketRepository')
    private ticketRepository: ITicketRepository,
    private sessionsService: SessionsService,
  ) {}

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

    const isPassed = this.checkIfSessionHasPassed(session.date, session.timeSlot);

    if (isPassed) {
      throw new SessionAlreadyPassedError();
    }

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

  checkIfSessionHasPassed(sessionDate: Date, timeSlot: TimeSlot): boolean {
    const now = new Date();
    let isPassed = false;

    if (sessionDate < now) {
      isPassed = true;
    }

    const [startHour, startMinute] = timeSlot.split('-')[0].split(':').map(Number);
    const sessionStartTime = new Date(sessionDate);
    sessionStartTime.setHours(startHour, startMinute, 0, 0);

    if (now > sessionStartTime) {
      isPassed = true;
    }

    return isPassed;
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

    const session = await this.sessionsService.findOneById(ticket.sessionId);

    const isPassed = this.checkIfSessionHasPassed(session.date, session.timeSlot);

    if (isPassed) {
      throw new SessionAlreadyPassedError();
    }

    ticket.used = true;

    return this.updateOne(ticket);
  }

  async getUsersUsedTickets(userId: string): Promise<Ticket[]> {
    return this.ticketRepository.find({ where: { userId: userId, used: true } });
  }
}
