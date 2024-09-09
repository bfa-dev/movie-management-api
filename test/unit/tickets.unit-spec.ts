import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from '../../src/application/tickets/tickets.service';
import { SessionsService } from '../../src/application/sessions/sessions.service';
import { ITicketRepository } from '../../src/domain/tickets/repositories/ticket-repository.interface';
import { User } from '../../src/domain/users/entities/user.entity';
import { Ticket } from '../../src/domain/tickets/entities/ticket.entity';
import { Session } from '../../src/domain/sessions/entities/session.entity';
import { TimeSlot } from '../../src/domain/sessions/enums/time.slot.enum';
import { MovieIsNotActiveError, UserNotOldEnoughError, TicketAlreadyUsedError, TicketNotFoundError } from '../../src/domain/exceptions';
import { Movie } from '../../src/domain/movies/entities/movie.entity';

describe('TicketsService', () => {
  let ticketsService: TicketsService;
  let sessionsService: SessionsService;
  let ticketRepository: ITicketRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: 'ITicketRepository',
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneById: jest.fn(),
            findOneWithRelations: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: SessionsService,
          useValue: {
            findOneWithRelations: jest.fn(),
            findOneById: jest.fn(),
          },
        },
      ],
    }).compile();

    ticketsService = module.get<TicketsService>(TicketsService);
    sessionsService = module.get<SessionsService>(SessionsService);
    ticketRepository = module.get<ITicketRepository>('ITicketRepository');
  });

  it('should be defined', () => {
    expect(ticketsService).toBeDefined();
  });

  describe('buyTicket', () => {
    it('should create a ticket if movie is active and user is old enough', async () => {
      const user: User = { id: '1', age: 20 } as User;
      const session: Session = {
        id: 'fdc17c48-135d-4702-9f9b-bbe499412516',
        movie: { id: 'fdc17c48-135d-4702-9f9b-bbe499412516', isActive: true, ageRestriction: 18 } as any,
        date: new Date(Date.now() + 86400000),
        timeSlot: '10:00-12:00' as TimeSlot,
      } as Session;

      jest.spyOn(sessionsService, 'findOneWithRelations').mockResolvedValue(session);
      jest.spyOn(ticketRepository, 'create').mockReturnValue({} as Ticket);
      jest.spyOn(ticketRepository, 'save').mockResolvedValue({} as Ticket);

      const result = await ticketsService.buyTicket(user, 'fdc17c48-135d-4702-9f9b-bbe499412516');

      expect(result).toBeDefined();
      expect(ticketRepository.create).toHaveBeenCalledWith({
        userId: user.id,
        sessionId: session.id,
        movieId: session.movie.id,
        used: false,
      });
      expect(ticketRepository.save).toHaveBeenCalled();
    });

    it('should throw MovieIsNotActiveError if movie is not active', async () => {
      const user: User = { id: '1', age: 20 } as User;
      const session: Session = {
        id: 'fdc17c48-135d-4702-9f9b-bbe499412516',
        movie: { id: 'fdc17c48-135d-4702-9f9b-bbe499412516', isActive: false, ageRestriction: 18 } as any,
      } as Session;

      jest.spyOn(sessionsService, 'findOneWithRelations').mockResolvedValue(session);

      await expect(ticketsService.buyTicket(user, 'fdc17c48-135d-4702-9f9b-bbe499412516')).rejects.toThrow(MovieIsNotActiveError);
    });

    it('should throw UserNotOldEnoughError if user is not old enough', async () => {
      const user: User = { id: '4a736f64-616c-69-6173-696f6e', age: 16 } as User;
      const session: Session = {
        id: 'fdc17c48-135d-4702-9f9b-bbe499412516',
        movie: { id: 'fdc17c48-135d-4702-9f9b-bbe499412516', isActive: true, ageRestriction: 18 } as any,
      } as Session;

      jest.spyOn(sessionsService, 'findOneWithRelations').mockResolvedValue(session);

      await expect(ticketsService.buyTicket(user, 'fdc17c48-135d-4702-9f9b-bbe499412516')).rejects.toThrow(UserNotOldEnoughError);
    });
  });

  describe('watchMovie', () => {
    it('should update the ticket as used if it belongs to the user and is not already used', async () => {
      const user: User = { id: '4a736f64-616c-69-6173-696f6e' } as User;
      const ticket: Ticket = {
        id: '4a736f64-616c-69-6173-696f6e',
        userId: '4a736f64-616c-69-6173-696f6e',
        used: false,
        sessionId: 'session-id',
      } as Ticket;
      const session: Session = {
        id: 'session-id',
        date: new Date(Date.now() + 86400000),
        timeSlot: '10:00-12:00' as TimeSlot,
      } as Session;

      jest.spyOn(ticketRepository, 'findOneWithRelations').mockResolvedValue(ticket);
      jest.spyOn(ticketRepository, 'save').mockResolvedValue({ ...ticket, used: true } as Ticket);
      jest.spyOn(sessionsService, 'findOneById').mockResolvedValue(session);

      const result = await ticketsService.watchMovie(user, { ticketId: '4a736f64-616c-69-6173-696f6e' });

      expect(result).toBeDefined();
      expect(result.used).toBe(true);
      expect(ticketRepository.save).toHaveBeenCalledWith(expect.objectContaining({ id: '4a736f64-616c-69-6173-696f6e', used: true }));
    });

    it('should throw TicketAlreadyUsedError if the ticket is already used', async () => {
      const user: User = { id: '4a736f64-616c-69-6173-696f6e' } as User;
      const ticket: Ticket = {
        id: '4a736f64-616c-69-6173-696f6e',
        userId: '4a736f64-616c-69-6173-696f6e',
        used: true,
      } as Ticket;

      jest.spyOn(ticketRepository, 'findOneWithRelations').mockResolvedValue(ticket);

      await expect(ticketsService.watchMovie(user, { ticketId: '4a736f64-616c-69-6173-696f6e' })).rejects.toThrow(TicketAlreadyUsedError);
    });

    it('should throw TicketNotFoundError if the ticket does not exist', async () => {
      const user: User = { id: '4a736f64-616c-69-6173-696f6e' } as User;

      jest.spyOn(ticketRepository, 'findOneWithRelations').mockResolvedValue(null);

      await expect(ticketsService.watchMovie(user, { ticketId: '4a736f64-616c-69-6173-696f6e' })).rejects.toThrow(TicketNotFoundError);
    });
  });

  it('should buy a ticket for a session', async () => {
    const user: User = {
      id: '4a736f64-616c-69-6173-696f6e',
      age: 20,
      email: 'user@example.com',
      role: 'customer',
    } as User;
    const session = new Session(new Date(Date.now() + 86400000), '10:00-12:00' as TimeSlot, 1, { isActive: true, id: 'movie-id' } as Movie);
    jest.spyOn(sessionsService, 'findOneWithRelations').mockResolvedValue(session);
    jest.spyOn(ticketRepository, 'create').mockReturnValue({ id: 'ticket1' } as Ticket);
    jest.spyOn(ticketRepository, 'save').mockResolvedValue({ id: 'ticket1' } as Ticket);

    const result = await ticketsService.buyTicket(user, 'fdc17c48-135d-4702-9f9b-bbe499412516');

    expect(result.id).toBe('ticket1');
    expect(ticketRepository.create).toHaveBeenCalledWith({
      userId: '4a736f64-616c-69-6173-696f6e',
      sessionId: 'fdc17c48-135d-4702-9f9b-bbe499412516',
      movieId: 'movie-id',
      used: false,
    });
  });

  it('should mark a movie as watched using a ticket', async () => {
    const user: User = {
      id: '4a736f64-616c-69-6173-696f6e',
      age: 20,
      email: 'user@example.com',
      role: 'customer',
    } as User;
    const ticket = {
      id: '4a736f64-616c-69-6173-696f6e',
      userId: '4a736f64-616c-69-6173-696f6e',
      used: false,
      sessionId: 'session-id',
    } as Ticket;
    const session: Session = {
      id: 'session-id',
      date: new Date(Date.now() + 86400000),
      timeSlot: '10:00-12:00' as TimeSlot,
    } as Session;

    jest.spyOn(ticketRepository, 'findOneWithRelations').mockResolvedValue(ticket);
    jest.spyOn(ticketRepository, 'save').mockResolvedValue({ ...ticket, used: true } as Ticket);
    jest.spyOn(sessionsService, 'findOneById').mockResolvedValue(session);

    const result = await ticketsService.watchMovie(user, { ticketId: '4a736f64-616c-69-6173-696f6e' });

    expect(result.used).toBe(true);
    expect(ticketRepository.save).toHaveBeenCalledWith(expect.objectContaining({ id: '4a736f64-616c-69-6173-696f6e', used: true }));
  });
});
