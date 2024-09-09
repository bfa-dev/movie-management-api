import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from '../../src/application/movies/movies.service';
import { IMovieRepository } from '../../src/domain/movies/repositories/movie-repository.interface';
import { ISessionRepository } from '../../src/domain/sessions/repositories/session-repository.interface';
import { DataSource, EntityManager } from 'typeorm';
import { Movie } from '../../src/domain/movies/entities/movie.entity';
import { CreateMovieDto } from '../../src/api/movies/dto/create-movie.dto';
import { MovieNotFoundError, SessionAlreadyExistsError, SessionNotFoundError, ThereAreNoMoviesError } from '../../src/domain/exceptions';
import { CreateSessionDto } from '../../src/api/sessions/dto/create-session.dto';
import { Session } from '../../src/domain/sessions/entities/session.entity';
import { TimeSlot } from '../../src/domain/sessions/enums/time.slot.enum';
import { UpdateMovieDto } from '../../src/api/movies/dto/update-movie.dto';

describe('MoviesService', () => {
  let service: MoviesService;
  let movieRepository: IMovieRepository;
  let sessionRepository: ISessionRepository;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: 'IMovieRepository',
          useValue: {
            save: jest.fn(),
            findOneById: jest.fn(),
            updateOne: jest.fn(),
            findOneWithRelations: jest.fn(),
            findWithRelations: jest.fn(),
          },
        },
        {
          provide: 'ISessionRepository',
          useValue: {
            save: jest.fn(),
            findOneByOptions: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    movieRepository = module.get<IMovieRepository>('IMovieRepository');
    sessionRepository = module.get<ISessionRepository>('ISessionRepository');
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMovie', () => {
    it('should create a movie and return it', async () => {
      const createMovieDto: CreateMovieDto = {
        name: 'Inception',
        ageRestriction: 13,
        sessions: [],
      };
      const mockMovie = new Movie('Inception', 13);

      (movieRepository.save as jest.Mock).mockResolvedValue(mockMovie);
      (movieRepository.findOneWithRelations as jest.Mock).mockResolvedValue(mockMovie);

      const result = await service.createMovie(createMovieDto);

      expect(result).toEqual(mockMovie);
      expect(movieRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Inception', ageRestriction: 13 })
      );
    });
  });

  describe('addSession', () => {
    it('should add a session to a movie and return the session', async () => {
      const mockMovie = new Movie('Inception', 13);
      mockMovie.id = '1';

      const createSessionDto: CreateSessionDto = {
        date: '2024-01-01',
        timeSlot: '10:00-12:00' as TimeSlot,
        roomNumber: 1,
      };

      const mockSession = { id: '1', ...createSessionDto, movie: mockMovie };

      (movieRepository.findOneById as jest.Mock).mockResolvedValue(mockMovie);
      (sessionRepository.save as jest.Mock).mockResolvedValue(mockSession);

      const result = await service.addSession(
        mockMovie.id,
        new Date(createSessionDto.date),
        createSessionDto.timeSlot,
        createSessionDto.roomNumber
      );

      expect(result).toEqual(mockSession);
      expect(sessionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          date: new Date('2024-01-01'),
          timeSlot: '10:00-12:00',
          roomNumber: 1,
        })
      );
    });

    it('should throw a MovieNotFoundError if the movie does not exist', async () => {
      (movieRepository.findOneById as jest.Mock).mockResolvedValue(null);

      await expect(service.addSession('invalid-id', new Date('2024-01-01'), '10:00-12:00' as TimeSlot, 1)).rejects.toThrow(MovieNotFoundError);
    });
  });

  describe('bulkAddMovies', () => {
    it('should add multiple movies with sessions in a transaction', async () => {
      const mockManager = {
        save: jest.fn(),
      } as unknown as EntityManager;

      const bulkCreateMovieDto = {
        movies: [
          {
            name: 'Inception',
            ageRestriction: 13,
            sessions: [],
          },
        ],
      };

      const mockMovie = new Movie('Inception', 13);
      (mockManager.save as jest.Mock).mockResolvedValue(mockMovie);
      (dataSource.transaction as jest.Mock).mockImplementation(async (fn) => fn(mockManager));

      const result = await service.bulkAddMovies(bulkCreateMovieDto);

      expect(result).toEqual([mockMovie]);
      expect(mockManager.save).toHaveBeenCalledWith(
        Movie,
        expect.objectContaining({
          name: 'Inception',
          ageRestriction: 13,
        })
      );
    });

    it('should throw a SessionAlreadyExistsError if the session already exists', async () => {
      const createSessionDto: CreateSessionDto = {
        date: '2024-01-01',
        timeSlot: '10:00-12:00' as TimeSlot,
        roomNumber: 1,
      };

      (sessionRepository.findOneByOptions as jest.Mock).mockResolvedValue(true);

      await expect(service.addSessionToMovie(
        new Movie('Inception', 13),
        createSessionDto
      )).rejects.toThrow(SessionAlreadyExistsError);
    });

    it('should create a movie with sessions', async () => {
      const createMovieDto: CreateMovieDto = {
        name: 'Movie Name',
        ageRestriction: 18,
        sessions: [
          {
            date: '2024-01-01',
            timeSlot: TimeSlot.SLOT_10_12,
            roomNumber: 1,
          },
          {
            date: '2024-01-02',
            timeSlot: TimeSlot.SLOT_12_14,
            roomNumber: 2,
          },
        ],
      };
      const movie = {
        id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c66',
        ...createMovieDto,
        sessions: [],
      };
      const savedMovie = {
        ...movie,
        sessions: [
          { id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c67' },
          { id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c68' },
        ],
      };

      jest.spyOn(movieRepository, 'save').mockResolvedValue(
        movie as unknown as Movie
      );
      jest.spyOn(sessionRepository, 'save').mockImplementation(
        (session: Session) => Promise.resolve(
          {
            ...session,
            id: `4a7962f8-18f2-4c43-bbf3-34c1e5147c6${session.roomNumber}`
          } as Session
        )
      );
      jest.spyOn(movieRepository, 'findOneWithRelations').mockResolvedValue(
        savedMovie as Movie
      );

      const result = await service.createMovie(createMovieDto);

      expect(result).toEqual(savedMovie);
      expect(sessionRepository.save).toHaveBeenCalledTimes(2);
    });
  });

  it('should throw an error if movie not found', async () => {
    jest.spyOn(movieRepository, 'findOneById').mockResolvedValueOnce(null);

    await expect(service.updateMovie(
      'invalidId',
      {} as UpdateMovieDto
    )).rejects.toThrow(MovieNotFoundError);
  });

  describe('updateMovie', () => {
    it('should update a movie and its sessions', async () => {
      const movieId = '1';
      const updateMovieDto: UpdateMovieDto = {
        name: 'Updated Movie',
        ageRestriction: 16,
        sessions: [
          {
            id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c67',
            date: '2024-01-02',
            timeSlot: TimeSlot.SLOT_14_16,
            roomNumber: 3
          },
        ],
      };

      const existingMovie = new Movie('Old Movie', 13);
      existingMovie.id = movieId;

      const updatedMovie = {
        ...existingMovie,
        ...updateMovieDto,
        sessions: [{
          id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c68',
          date: new Date('2024-01-02'),
          timeSlot: TimeSlot.SLOT_14_16,
          roomNumber: 3
        }]
      };
      (movieRepository.findOneById as jest.Mock).mockResolvedValue(existingMovie);
      (sessionRepository.findOne as jest.Mock).mockResolvedValue(
        {
          id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c67',
          date: new Date('2024-01-01'),
          timeSlot: TimeSlot.SLOT_10_12,
          roomNumber: 1
        }
      );
      (sessionRepository.save as jest.Mock).mockResolvedValue(updatedMovie.sessions[0]);
      (movieRepository.save as jest.Mock).mockResolvedValue(updatedMovie);
      (movieRepository.findOneWithRelations as jest.Mock).mockResolvedValue(updatedMovie);

      const result = await service.updateMovie(movieId, updateMovieDto);

      expect(result).toEqual(updatedMovie);
      expect(movieRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Movie',
          ageRestriction: 16
        }));
      expect(sessionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          date: new Date('2024-01-02'),
          timeSlot: TimeSlot.SLOT_14_16,
          roomNumber: 3
        }));
    });

    it('should throw MovieNotFoundError if movie does not exist', async () => {
      (movieRepository.findOneById as jest.Mock).mockResolvedValue(null);

      await expect(service.updateMovie('nonexistent', {} as UpdateMovieDto)).rejects.toThrow(MovieNotFoundError);
    });

    it('should throw SessionNotFoundError if session does not exist', async () => {
      const movieId = '1';
      const updateMovieDto: UpdateMovieDto = {
        name: 'Updated Movie',
        ageRestriction: 16,
        sessions: [{
          id: '4a7962f8-18f2-4c43-bbf3-34c1e5147c67',
          date: '2024-01-01',
          timeSlot: TimeSlot.SLOT_10_12,
          roomNumber: 1
        }],
      };

      (movieRepository.findOneById as jest.Mock).mockResolvedValue(new Movie('Movie', 13));
      (sessionRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.updateMovie(movieId, updateMovieDto)).rejects.toThrow(SessionNotFoundError);
    });
  });

  describe('deleteMovie', () => {
    it('should mark a movie as inactive', async () => {
      const movieId = '1';
      const inactiveMovie = new Movie('Movie', 13);
      inactiveMovie.id = movieId;
      inactiveMovie.isActive = false;

      (movieRepository.updateOne as jest.Mock).mockResolvedValue(inactiveMovie);

      const result = await service.deleteMovie(movieId);

      expect(result).toEqual(inactiveMovie);
      expect(movieRepository.updateOne).toHaveBeenCalledWith(movieId, { isActive: false });
    });
  });

  describe('getMovieWithSessions', () => {
    it('should return a movie with its sessions', async () => {
      const movieId = '4a7962f8-18f2-4c43-bbf3-34c1e5147c66';
      const movieWithSessions = new Movie('Movie', 13);
      movieWithSessions.id = movieId;
      movieWithSessions.sessions = [new Session(new Date(), TimeSlot.SLOT_10_12, 1, movieWithSessions)];

      (movieRepository.findOneWithRelations as jest.Mock).mockResolvedValue(movieWithSessions);

      const result = await service.getMovieWithSessions(movieId);

      expect(result).toEqual(movieWithSessions);
      expect(movieRepository.findOneWithRelations).toHaveBeenCalledWith({
        where: { id: movieId },
        relations: ['sessions']
      });
    });

    it('should throw MovieNotFoundError if movie does not exist', async () => {
      (movieRepository.findOneWithRelations as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getMovieWithSessions('4a7962f8-18f2-4c43-bbf3-34c1e5147c66'))
        .rejects.toThrow(MovieNotFoundError);
    });
  });

  describe('listActiveMovies', () => {
    it('should return a list of active movies', async () => {
      const activeMovies = [
        new Movie('Movie 1', 13),
        new Movie('Movie 2', 16),
      ];

      (movieRepository.findWithRelations as jest.Mock).mockResolvedValue(activeMovies);

      const result = await service.listActiveMovies('name', 'ASC', {});

      expect(result).toEqual(activeMovies);
      expect(movieRepository.findWithRelations).toHaveBeenCalledWith({
        relations: ['sessions'],
        order: { name: 'ASC' },
        where: { isActive: true }
      });
    });

    it('should throw ThereAreNoMoviesError if no active movies are found', async () => {
      (movieRepository.findWithRelations as jest.Mock).mockResolvedValue([]);

      await expect(service.listActiveMovies('name', 'ASC', {})).rejects.toThrow(ThereAreNoMoviesError);
    });
  });

  describe('bulkDeleteMovies', () => {
    it('should mark multiple movies as inactive', async () => {
      const movieIds = [
        '4a7962f8-18f2-4c43-bbf3-34c1e5147c66',
        '4a7962f8-18f2-4c43-bbf3-34c1e5147c67',
        '4a7962f8-18f2-4c43-bbf3-34c1e5147c68'
      ];
      const inactiveMovie = new Movie('Movie', 13);
      inactiveMovie.isActive = false;

      (movieRepository.updateOne as jest.Mock).mockResolvedValue(inactiveMovie);

      await service.bulkDeleteMovies(movieIds);

      expect(movieRepository.updateOne).toHaveBeenCalledTimes(3);
      movieIds.forEach(id => {
        expect(movieRepository.updateOne).toHaveBeenCalledWith(id, { isActive: false });
      });
    });
  });
});