import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateMovieDto } from '../create-movie.dto';

export class BulkCreateMovieDto {
  @ApiProperty({ type: [CreateMovieDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMovieDto)
  movies: CreateMovieDto[];
}

export class BulkDeleteMovieDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  movieIds: string[];
}