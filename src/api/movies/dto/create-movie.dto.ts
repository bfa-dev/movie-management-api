import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

export class CreateMovieDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  ageRestriction: number;
}


export class CreateMovieMultipleDto {
  @ApiProperty()
  @IsArray()
  @ValidateNested()
  @Type(() => CreateMovieDto)
  movies: CreateMovieDto[];
}