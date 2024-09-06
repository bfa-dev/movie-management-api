import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class WatchMovieDto {
  @ApiProperty()
  @IsString()
  ticketId: string;
}