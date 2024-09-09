import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindManyOptions, FindOneOptions, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { Movie } from '@domain/movies/entities/movie.entity';
import { IMovieRepository } from '@domain/movies/repositories/movie-repository.interface';
import { MovieNotFoundError } from '@domain/exceptions';

@Injectable()
export class MovieRepository implements IMovieRepository {
  constructor(
    @InjectRepository(Movie)
    private readonly repository: Repository<Movie>,
  ) {}

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

  async findActiveMovies(
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
    name?: string,
    ageRestriction?: number,
    ageRestrictionCondition?: 'greaterOrEqual' | 'lesser',
  ): Promise<Movie[]> {
    const filter: any = {};

    if (name) {
      filter.name = name;
    }

    if (ageRestriction) {
      if (ageRestrictionCondition === 'greaterOrEqual') {
        filter.ageRestriction = MoreThanOrEqual(ageRestriction);
      } else if (ageRestrictionCondition === 'lesser') {
        filter.ageRestriction = LessThan(ageRestriction);
      } else {
        filter.ageRestriction = ageRestriction;
      }
    }

    const sortField = sortBy || 'name';
    const sortDirection = sortOrder || 'ASC';
    const order: any = {};
    order[sortField] = sortDirection;

    const options: FindManyOptions<Movie> = {
      relations: ['sessions'],
      order,
      where: { isActive: true, ...filter },
    };

    return this.repository.find(options);
  }
}
