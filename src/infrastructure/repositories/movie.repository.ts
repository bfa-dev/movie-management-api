import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Movie } from '@domain/movies/entities/movie.entity';
import { IMovieRepository } from '@domain/movies/repositories/movie-repository.interface';
import { MovieNotFoundError } from '@domain/exceptions';

@Injectable()
export class MovieRepository implements IMovieRepository {
  constructor(
    @InjectRepository(Movie)
    private readonly repository: Repository<Movie>,
  ) { }

  async save(movie: DeepPartial<Movie>): Promise<Movie> {
    return this.repository.save(movie);
  }

  async saveMany(movies: DeepPartial<Movie[]>): Promise<Movie[]> {
    return this.repository.save(movies);
  }

  async findOneById(id: string): Promise<Movie | null> {
    const options: FindOneOptions<Movie> = { where: { id } };
    return this.repository.findOne(options);
  }

  async updateOne(id: string, partialMovie: DeepPartial<Movie>): Promise<Movie> {
    const movie = await this.repository.findOne({ where: { id } });
    if (!movie) {
      throw new MovieNotFoundError();
    }
    return this.repository.save({ ...movie, ...partialMovie });
  }

  async findOneWithRelations(relations: FindOneOptions<Movie>): Promise<Movie | null> {
    return this.repository.findOne(relations);
  }

  async findWithRelations(relations: FindManyOptions<Movie>): Promise<Movie[]> {
    return this.repository.find(relations);
  }

  async findActiveMovies(options?: FindManyOptions<Movie>): Promise<Movie[]> {
    return this.repository.find({ where: { isActive: true }, ...options });
  }
}