import { Movie } from '../entities/movie.entity';

export interface IMovieRepository {
  create(movie: Partial<Movie>): Movie;
  save(movie: Movie): Promise<Movie>;
  findOne(id: string): Promise<Movie | null>;
  find(options?: any): Promise<Movie[]>;
  update(id: string, partialMovie: Partial<Movie>): Promise<void>;
  delete(id: string): Promise<void>;
}