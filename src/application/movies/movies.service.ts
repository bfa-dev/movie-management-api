import { Injectable, NotFoundException, ForbiddenException, ConflictException, Inject, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Movie } from '@domain/movies/entities/movie.entity';
import { Session, TimeSlot } from '@domain/movies/entities/session.entity';
import { Ticket } from '@domain/tickets/entities/ticket.entity';
import { CreateMovieDto } from '@api/movies/dto/create-movie.dto';
import { IMovieRepository } from '@domain/movies/repositories/movie-repository.interface';
import { ISessionRepository } from '@domain/movies/repositories/session-repository.interface';
import { UsersService } from '@application/users/users.service';
import { TicketsService } from '@application/tickets/tickets.service';

@Injectable()
export class MoviesService {
  constructor(
    @Inject('IMovieRepository')
    private movieRepository: IMovieRepository,
    @Inject('ISessionRepository')
    private sessionRepository: ISessionRepository,
    private dataSource: DataSource,
    private ticketsService: TicketsService,
    private userService: UsersService
  ) { }

  async createMovie(name: string, ageRestriction: number): Promise<Movie> {
    const movie = this.movieRepository.create({ name, ageRestriction });
    return this.movieRepository.save(movie);
  }

  async updateMovie(id: string, name: string, ageRestriction: number): Promise<Movie> {
    await this.movieRepository.update(id, { name, ageRestriction });
    return this.movieRepository.findOne(id);
  }

  async deleteMovie(id: string): Promise<void> {
    await this.movieRepository.delete(id);
  }

  async addSession(movieId: string, date: Date, timeSlot: TimeSlot, roomNumber: number): Promise<Session> {
    const movie = await this.movieRepository.findOne(movieId);
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    const existingSession = await this.sessionRepository.findOne({
      where: {
        date: date,
        timeSlot: timeSlot,
        roomNumber: roomNumber,
      },
    });

    if (existingSession) {
      throw new ConflictException('This room is already booked for the given date and time slot');
    }
    const session = this.sessionRepository.create({ date, timeSlot, roomNumber, movie });
    return this.sessionRepository.save(session);
  }

  async getMovies(): Promise<Movie[]> {
    return this.movieRepository.find({ relations: ['sessions'] });
  }

  async getMovie(id: string): Promise<Movie> {
    return this.movieRepository.findOne(id);
  }

  async listMovies(sortBy: string, sortOrder: 'ASC' | 'DESC', filter: any): Promise<Movie[]> {
    return this.movieRepository.find({ relations: ['sessions'], order: { [sortBy]: sortOrder }, where: filter });
  }

  async buyTicket(userId: string, sessionId: string): Promise<Ticket> {
    const user = await this.userService.findOne({ where: { id: userId }, relations: ['tickets'] });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const session = await this.sessionRepository.findOne({ where: { id: sessionId }, relations: ['movie'] });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (user.age < session.movie.ageRestriction) {
      throw new BadRequestException('User does not meet the age restriction for this movie');
    }

    const existingTicket = await this.ticketsService.findOne({ where: { user: { id: userId }, session: { id: sessionId } } });
    if (existingTicket) {
      throw new BadRequestException('User already has a ticket for this session');
    }

    const ticket = await this.ticketsService.create({
      user,
      session,
      movieId: session.movie.id,
      used: false,
    });
    return ticket;
  }

  async watchMovie(userId: string, ticketId: string): Promise<void> {
    const [ticket, user] = await Promise.all([
      this.ticketsService.findOne({ where: { id: ticketId }, relations: ['user', 'session', 'session.movie'] }),
      this.userService.findOne({ where: { id: userId }, relations: ['watchedMovies'] }),
    ]);

    if (!ticket || ticket.user.id !== userId) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.used) {
      throw new ForbiddenException('Ticket has already been used');
    }

    ticket.used = true;

    user.watchedMovies.push(ticket.session.movie);

    await Promise.all([
      this.ticketsService.updateOne(ticket),
      this.userService.updateOne(user),
    ]);
  }

  async getWatchHistory(userId: string): Promise<Movie[]> {
    const user = await this.userService.findOne({ where: { id: userId }, relations: ['watchedMovies'] });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.watchedMovies;
  }

  async bulkAddMovies(createMovieDtos: CreateMovieDto[]): Promise<Movie[]> {
    const movies = createMovieDtos.map(dto => this.movieRepository.create(dto));
    return Promise.all(movies.map(movie => this.movieRepository.save(movie)));
  }

  async bulkDeleteMovies(movieIds: string[]): Promise<void> {
    await Promise.all(movieIds.map(id => this.movieRepository.delete(id)));
  }
}