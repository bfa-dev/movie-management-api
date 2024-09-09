import { ApiProperty } from '@nestjs/swagger';
import { TimeSlot } from '@domain/sessions/enums/time.slot.enum';

export class CreateSessionDto {
  @ApiProperty({ example: '2024-01-01' })
  date: string;

  @ApiProperty({ enum: TimeSlot })
  timeSlot: TimeSlot;

  @ApiProperty({ example: 1 })
  roomNumber: number;
}