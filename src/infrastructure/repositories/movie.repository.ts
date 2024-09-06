import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '@domain/movies/entities/movie.entity';
import { IMovieRepository } from '@domain/movies/repositories/movie-repository.interface';

@Injectable()
export class MovieRepository implements IMovieRepository {
  constructor(
    @InjectRepository(Movie)
    private readonly repository: Repository<Movie>,
  ) { }

  create(movie: Partial<Movie>): Movie {
    return this.repository.create(movie);
  }

  async save(movie: Movie): Promise<Movie> {
    return this.repository.save(movie);
  }

  async findOne(id: string): Promise<Movie | null> {
    return this.repository.findOne({ where: { id }, relations: ['sessions'] });
  }

  async find(options?: any): Promise<Movie[]> {
    return this.repository.find(options);
  }

  async update(id: string, partialMovie: Partial<Movie>): Promise<void> {
    await this.repository.update(id, partialMovie);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}