import { DeepPartial, FindManyOptions, FindOneOptions } from 'typeorm';
import { Movie } from '../entities/movie.entity';

export interface IMovieRepository {
  save(movie: DeepPartial<Movie>): Promise<Movie>;
  saveMany(movies: DeepPartial<Movie[]>): Promise<Movie[]>;
  findOneById(id: string): Promise<Movie | null>;
  updateOne(id: string, partialMovie: DeepPartial<Movie>): Promise<Movie>;
  findOneWithRelations(relations: FindOneOptions<Movie>): Promise<Movie | null>;
  findWithRelations(relations: FindManyOptions<Movie>): Promise<Movie[]>;
  findActiveMovies(
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
    name?: string,
    ageRestriction?: number,
    ageRestrictionCondition?: 'greaterOrEqual' | 'lesser',
  ): Promise<Movie[]>;
}
