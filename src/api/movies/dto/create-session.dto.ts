import { ApiProperty } from '@nestjs/swagger';
import { TimeSlot } from '@domain/movies/entities/session.entity';

export class CreateSessionDto {
  @ApiProperty()
  date: string;

  @ApiProperty({ enum: TimeSlot })
  timeSlot: TimeSlot;

  @ApiProperty()
  roomNumber: number;
}