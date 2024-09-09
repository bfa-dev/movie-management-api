import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from '@application/movies/movies.service';
import { DataSource } from 'typeorm';
import { PinoLogger } from 'nestjs-pino';
import { Movie } from '@domain/movies/entities/movie.entity';
import { Session } from '@domain/sessions/entities/session.entity';
import { CreateMovieDto } from '@api/movies/dto/create-movie.dto';
import { UpdateMovieDto } from '@api/movies/dto/update-movie.dto';
import { TimeSlot } from '@domain/sessions/enums/time.slot.enum';
import { MovieNotFoundError, SessionAlreadyExistsError } from '@domain/exceptions';
import { BulkCreateMovieDto } from '@api/movies/dto/bulk/bulk-movie.dto';
import { ListMoviesDto } from '@api/movies/dto/list-movies.dto';
import { CreateSessionDto } from '@api/sessions/dto/create-session.dto';

describe('MoviesService', () => {
  let service: MoviesService;
  let mockMovieRepository: any;
  let mockSessionRepository: any;
  let mockDataSource: any;
  let mockLogger: any;

  beforeEach(async () => {
    mockMovieRepository = {
      findWithRelations: jest.fn(),
      findOneById: jest.fn(),
      save: jest.fn(),
      findOneWithRelations: jest.fn(),
      updateOne: jest.fn(),
      findActiveMovies2: jest.fn(),
    };

    mockSessionRepository = {
      findOneByOptions: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    mockDataSource = {
      transaction: jest.fn(),
    };

    mockLogger = {
      setContext: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        { provide: 'IMovieRepository', useValue: mockMovieRepository },
        { provide: 'ISessionRepository', useValue: mockSessionRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: PinoLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findMoviesByIds', () => {
    it('should return movies for given ids', async () => {
      const movieIds = ['1', '2'];
      const expectedMovies = [
        { id: '1', name: 'Movie 1' },
        { id: '2', name: 'Movie 2' },
      ];
      mockMovieRepository.findWithRelations.mockResolvedValue(expectedMovies);

      const result = await service.findMoviesByIds(movieIds);

      expect(result).toEqual(expectedMovies);
      expect(mockMovieRepository.findWithRelations).toHaveBeenCalledWith({ where: { id: expect.anything() } });
    });
  });

  describe('createMovie', () => {
    it('should create a movie with sessions', async () => {
      const createMovieDto: CreateMovieDto = {
        name: 'New Movie',
        ageRestriction: 12,
        sessions: [{ date: '2022-02-02', timeSlot: TimeSlot.SLOT_10_12, roomNumber: 1 }],
      };

      const savedMovie = { id: '1', ...createMovieDto };
      const savedSession = { id: '1', ...createMovieDto.sessions[0], movie: savedMovie };

      mockDataSource.transaction.mockImplementation(async (cb) => {
        const mockEntityManager = {
          save: jest.fn().mockResolvedValueOnce(savedMovie).mockResolvedValueOnce(savedSession),
          findOne: jest.fn().mockResolvedValue({ ...savedMovie, sessions: [savedSession] }),
        };
        return cb(mockEntityManager);
      });

      const result = await service.createMovie(createMovieDto);

      expect(result).toEqual({ ...savedMovie, sessions: [savedSession] });
      expect(mockDataSource.transaction).toHaveBeenCalled();
    });
  });

  describe('updateMovie', () => {
    it('should update a movie', async () => {
      const movieId = '1';
      const updateMovieDto: UpdateMovieDto = {
        name: 'Updated Movie',
        ageRestriction: 16,
        sessions: [],
      };

      const existingMovie = new Movie('Old Movie', 12);
      existingMovie.id = movieId;

      mockMovieRepository.findOneById.mockResolvedValue(existingMovie);
      mockMovieRepository.save.mockResolvedValue({ ...existingMovie, ...updateMovieDto });
      mockMovieRepository.findOneWithRelations.mockResolvedValue({ ...existingMovie, ...updateMovieDto, sessions: [] });

      const result = await service.updateMovie(movieId, updateMovieDto);

      expect(result).toEqual({ ...existingMovie, ...updateMovieDto, sessions: [] });
      expect(mockMovieRepository.findOneById).toHaveBeenCalledWith(movieId);
      expect(mockMovieRepository.save).toHaveBeenCalled();
    });

    it('should throw MovieNotFoundError if movie does not exist', async () => {
      const movieId = '1';
      const updateMovieDto: UpdateMovieDto = {
        name: 'Updated Movie',
        ageRestriction: 16,
        sessions: [],
      };

      mockMovieRepository.findOneById.mockResolvedValue(null);

      await expect(service.updateMovie(movieId, updateMovieDto)).rejects.toThrow(MovieNotFoundError);
    });
  });

  describe('deleteMovie', () => {
    it('should mark a movie as inactive', async () => {
      const movieId = '1';
      const deletedMovie = { id: movieId, isActive: false };

      mockMovieRepository.updateOne.mockResolvedValue(deletedMovie);

      const result = await service.deleteMovie(movieId);

      expect(result).toEqual(deletedMovie);
      expect(mockMovieRepository.updateOne).toHaveBeenCalledWith(movieId, { isActive: false });
    });
  });

  describe('addSessionToMovie', () => {
    it('should add a session to a movie', async () => {
      const movie = new Movie('Test Movie', 12);
      movie.id = '1';
      const createSessionDto: CreateSessionDto = {
        date: '2023-05-01',
        timeSlot: TimeSlot.SLOT_10_12,
        roomNumber: 1,
      };
      const expectedSession = new Session(new Date('2023-05-01'), TimeSlot.SLOT_10_12, 1, movie);
      expectedSession.id = '1';

      mockSessionRepository.findOneByOptions.mockResolvedValue(null);
      mockSessionRepository.save.mockResolvedValue(expectedSession);

      const result = await service.addSessionToMovie(movie, createSessionDto);

      expect(result).toEqual(expectedSession);
      expect(mockSessionRepository.findOneByOptions).toHaveBeenCalled();
      expect(mockSessionRepository.save).toHaveBeenCalled();
    });

    it('should throw SessionAlreadyExistsError if session already exists', async () => {
      const movie = new Movie('Test Movie', 12);
      movie.id = '1';
      const createSessionDto: CreateSessionDto = {
        date: '2023-05-01',
        timeSlot: TimeSlot.SLOT_10_12,
        roomNumber: 1,
      };

      mockSessionRepository.findOneByOptions.mockResolvedValue(new Session(new Date('2023-05-01'), TimeSlot.SLOT_10_12, 1, movie));

      await expect(service.addSessionToMovie(movie, createSessionDto)).rejects.toThrow(SessionAlreadyExistsError);
    });
  });

  describe('getMovieWithSessions', () => {
    it('should return a movie with its sessions', async () => {
      const movieId = '1';
      const movie = new Movie('Test Movie', 12);
      movie.id = movieId;
      movie.sessions = [new Session(new Date('2023-05-01'), TimeSlot.SLOT_10_12, 1, movie)];

      mockMovieRepository.findOneWithRelations.mockResolvedValue(movie);

      const result = await service.getMovieWithSessions(movieId);

      expect(result).toEqual(movie);
      expect(mockMovieRepository.findOneWithRelations).toHaveBeenCalledWith({ where: { id: movieId }, relations: ['sessions'] });
    });

    it('should throw MovieNotFoundError if movie does not exist', async () => {
      const movieId = '1';

      mockMovieRepository.findOneWithRelations.mockResolvedValue(null);

      await expect(service.getMovieWithSessions(movieId)).rejects.toThrow(MovieNotFoundError);
    });
  });

  describe('listActiveMovies', () => {
    it('should return a list of active movies', async () => {
      const listMoviesDto: ListMoviesDto = {
        sortBy: 'name',
        sortOrder: 'ASC',
        name: 'Test',
        ageRestriction: 12,
        ageRestrictionCondition: 'greaterOrEqual',
      };
      const expectedMovies = [new Movie('Test Movie 1', 14), new Movie('Test Movie 2', 16)];

      if (mockMovieRepository.findActiveMovies) {
        mockMovieRepository.findActiveMovies.mockResolvedValue(expectedMovies);
      } else {
        mockMovieRepository.findActiveMovies = jest.fn().mockResolvedValue(expectedMovies);
      }

      const result = await service.listActiveMovies(listMoviesDto);

      expect(result).toEqual(expectedMovies);
      expect(mockMovieRepository.findActiveMovies).toHaveBeenCalledWith(
        listMoviesDto.sortBy,
        listMoviesDto.sortOrder,
        listMoviesDto.name,
        listMoviesDto.ageRestriction,
        listMoviesDto.ageRestrictionCondition,
      );
    });
  });

  describe('bulkAddMovies', () => {
    it('should add multiple movies in a transaction', async () => {
      const bulkCreateMovieDto: BulkCreateMovieDto = {
        movies: [
          { name: 'Movie 1', ageRestriction: 12, sessions: [] },
          { name: 'Movie 2', ageRestriction: 16, sessions: [] },
        ],
      };
      const expectedMovies = [new Movie('Movie 2', 16), new Movie('Movie 1', 12)];

      mockDataSource.transaction.mockImplementation(async (cb) => {
        const mockEntityManager = {
          save: jest.fn().mockResolvedValueOnce(expectedMovies[0]).mockResolvedValueOnce(expectedMovies[1]),
          findOne: jest.fn().mockResolvedValueOnce(expectedMovies[0]).mockResolvedValueOnce(expectedMovies[1]),
        };
        return cb(mockEntityManager);
      });

      const result = await service.bulkAddMovies(bulkCreateMovieDto);

      expect(result).toEqual(expectedMovies);
      expect(mockDataSource.transaction).toHaveBeenCalled();
    });
  });
});
