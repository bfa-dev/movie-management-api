import { ApiProperty } from '@nestjs/swagger';
import { TimeSlot } from '@domain/sessions/enums/time.slot.enum';

export class UpdateSessionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '2024-01-01' })
  date: string;

  @ApiProperty({ enum: TimeSlot })
  timeSlot: TimeSlot;

  @ApiProperty({ example: 1 })
  roomNumber: number;
}