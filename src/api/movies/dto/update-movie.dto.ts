import { ApiProperty } from '@nestjs/swagger';

export class UpdateMovieDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  ageRestriction: number;
}