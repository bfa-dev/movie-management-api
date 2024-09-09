import { Movie } from '../../../src/domain/movies/entities/movie.entity';
import { Session } from '../../../src/domain/sessions/entities/session.entity';
import { TimeSlot } from '../../../src/domain/sessions/enums/time.slot.enum';
import { Repository } from 'typeorm';

export async function createMovies(
  movieRepository: Repository<Movie>,
  moviesData: { name: string; ageRestriction: number }[]
): Promise<Movie[]> {
  const movies: Movie[] = [];

  for (let i = 0; i < moviesData.length; i++) {
    const movie = new Movie(
      moviesData[i].name,
      moviesData[i].ageRestriction
    );
    await movieRepository.save(movie);
    movies.push(movie);
  }
  return movies;
}

export async function createSessions(
  sessionRepository: Repository<Session>,
  sessionsData: { date: string; timeSlot: string; roomNumber: number }[],
  movies: Movie[]
): Promise<Session[]> {
  const sessions: Session[] = [];

  for (let i = 0; i < sessionsData.length; i++) {
    const session = new Session(
      new Date(sessionsData[i].date),
      sessionsData[i].timeSlot as TimeSlot,
      sessionsData[i].roomNumber,
      movies[i]
    );
    await sessionRepository.save(session);
    sessions.push(session);
  }
  return sessions;
}