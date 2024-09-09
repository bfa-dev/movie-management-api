import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from '../../src/application/sessions/sessions.service';
import { Repository } from 'typeorm';
import { Session } from '../../src/domain/sessions/entities/session.entity';
import { TimeSlot } from '../../src/domain/sessions/enums/time.slot.enum';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from '../../src/domain/movies/entities/movie.entity';
import { BadRequestException } from '@nestjs/common';

describe('SessionsService', () => {
  let service: SessionsService;
  let repository: Repository<Session>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: getRepositoryToken(Session),
          useValue: {
            save: jest.fn(),
            delete: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    repository = module.get<Repository<Session>>(getRepositoryToken(Session));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addSession', () => {
    it('should save a new session', async () => {
      const movie: Movie = { id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c66' } as Movie;
      const createSessionDto = {
        date: '2024-01-01',
        timeSlot: '10:00-12:00' as TimeSlot,
        roomNumber: 1,
      };

      jest.spyOn(repository, 'save').mockResolvedValue({} as Session);

      const result = await service.addSession(createSessionDto, movie);

      expect(result).toBeDefined();
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
        date: new Date(createSessionDto.date),
        timeSlot: createSessionDto.timeSlot,
        roomNumber: createSessionDto.roomNumber,
        movie: movie,
      }));
    });

    it('should create a session with correct properties', async () => {
      const movie: Movie = {
        id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c66',
        name: 'Test Movie'
      } as Movie;
      const createSessionDto = {
        date: '2024-01-01',
        timeSlot: '10:00-12:00' as TimeSlot,
        roomNumber: 1,
      };

      const savedSession = new Session(
        new Date(createSessionDto.date),
        createSessionDto.timeSlot,
        createSessionDto.roomNumber,
        movie
      );

      jest.spyOn(repository, 'save').mockResolvedValue(savedSession);

      const result = await service.addSession(createSessionDto, movie);

      expect(result).toEqual(savedSession);
      expect(result.date).toEqual(new Date(createSessionDto.date));
      expect(result.timeSlot).toEqual(createSessionDto.timeSlot);
      expect(result.roomNumber).toEqual(createSessionDto.roomNumber);
      expect(result.movie).toEqual(movie);
    });
  });

  describe('deleteSession', () => {
    it('should delete a session by id', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1 } as any);

      const result = await service.deleteSession('1');

      expect(result).toEqual({ result: true });
      expect(repository.delete).toHaveBeenCalledWith('1');
    });

    it('should delete all sessions by movie id', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 3 } as any);

      const result = await service.deleteAllSessions('4a7962f8-18f2-4c43-bbf3-34c1e5147c66');

      expect(result).toEqual({ result: true });
      expect(repository.delete).toHaveBeenCalledWith({ movie: { id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c66' } });
    });

    it('should return false if no session was deleted', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 0 } as any);

      const result = await service.deleteSession('4a7962f8-18f2-4c43-bbf3-34c1e5147c66');

      expect(result).toEqual({ result: false });
      expect(repository.delete).toHaveBeenCalledWith('4a7962f8-18f2-4c43-bbf3-34c1e5147c66');
    });
  });

  describe('deleteAllSessions', () => {
    it('should delete all sessions for a movie and return true', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 5 } as any);

      const result = await service.deleteAllSessions('4a7962f8-18f2-4c43-bbf3-34c1e5147c66');

      expect(result).toEqual({ result: true });
      expect(repository.delete).toHaveBeenCalledWith({ movie: { id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c66' } });
    });

    it('should return false if no sessions were deleted', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 0 } as any);

      const result = await service.deleteAllSessions('4a7962f8-18f2-4c43-bbf3-34c1e5147c66');

      expect(result).toEqual({ result: false });
      expect(repository.delete).toHaveBeenCalledWith({ movie: { id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c66' } });
    });

    it('should handle errors when deleting sessions', async () => {
      jest.spyOn(repository, 'delete').mockRejectedValue(new Error('Database error'));

      await expect(
        service.deleteAllSessions('4a7962f8-18f2-4c43-bbf3-34c1e5147c66'))
        .rejects.toThrow('Database error');
    });
  });

  describe('findOneWithRelations', () => {
    it('should find a session with relations', async () => {
      const session: Session = {
        id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c66'
      } as Session;

      jest.spyOn(repository, 'findOne').mockResolvedValue(session);

      const result = await service.findOneWithRelations({
        where: {
          id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c66'
        }
      });

      expect(result).toEqual(session);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c66'
        }
      });
    });

    it('should return null if no session is found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.findOneWithRelations({
        where: { id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c66' },
      });

      expect(result).toBeNull();
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c66' },
      });
    });

    it('should find a session with movie relation', async () => {
      const session: Session = {
        id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c66',
        movie: {
          id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c66',
          name: 'Test Movie',
          ageRestriction: 13,
          isActive: true
        } as Movie,
        date: new Date('2024-01-01'),
        timeSlot: '10:00-12:00' as TimeSlot,
        roomNumber: 1,
      } as Session;

      jest.spyOn(repository, 'findOne').mockResolvedValue(session);

      const result = await service.findOneWithRelations({
        where: { id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c66' },
        relations: ['movie']
      });

      expect(result).toEqual(session);
      expect(result.movie).toBeDefined();
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c66' },
        relations: ['movie']
      });
    });

    it('should find a session with specific properties', async () => {
      const session: Session = {
        id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c66',
        date: new Date('2024-01-01'),
        timeSlot: '10:00-12:00' as TimeSlot,
        roomNumber: 1,
        movie: { id: 'movie-1', name: 'Test Movie' } as Movie,
        tickets: []
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(session);

      const result = await service.findOneWithRelations({
        where: { id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c66' },
        relations: ['movie']
      });

      expect(result).toEqual(session);
      expect(result.id).toBe('4a7962f8-18f2-4c43-bbf3-34c1e5147c66');
      expect(result.date).toEqual(new Date('2024-01-01'));
      expect(result.timeSlot).toBe('10:00-12:00');
      expect(result.roomNumber).toBe(1);
      expect(result.movie.id).toBe('movie-1');
      expect(result.movie.name).toBe('Test Movie');
    });

    it('should handle errors when finding a session', async () => {
      jest.spyOn(repository, 'findOne').mockRejectedValue(new Error('Database error'));

      await expect(service.findOneWithRelations({
        where: { id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c66' }
      })).rejects.toThrow('Database error');
    });
  });

  it('should add a new session to a movie', async () => {
    const movie = new Movie('Inception', 13);
    const createSessionDto = {
      date: '2024-01-01',
      timeSlot: '10:00-12:00' as TimeSlot,
      roomNumber: 1,
    };
    const session = new Session(
      new Date(createSessionDto.date),
      createSessionDto.timeSlot,
      createSessionDto.roomNumber,
      movie
    );

    jest.spyOn(repository, 'save').mockResolvedValue(session);

    const result = await service.addSession(createSessionDto, movie);

    expect(result).toEqual(session);
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ movie }));
  });

  it('should delete a session by id', async () => {
    const sessionId = '123e4567-e89b-12d3-a456-426614174000';
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1 } as any);

    const result = await service.deleteSession(sessionId);

    expect(result).toEqual({ result: true });
    expect(repository.delete).toHaveBeenCalledWith(sessionId);
  });
});