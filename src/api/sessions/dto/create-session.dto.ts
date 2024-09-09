import { ApiProperty } from '@nestjs/swagger';
import { TimeSlot } from '@domain/sessions/enums/time.slot.enum';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({
    description: 'Date of the session',
    type: String,
    example: '2024-01-01',
  })
  @IsString()
  date: string;

  @ApiProperty({
    description: 'Time slot of the session',
    enum: TimeSlot,
    example: TimeSlot.SLOT_10_12,
  })
  @IsEnum(TimeSlot)
  timeSlot: TimeSlot;

  @ApiProperty({
    description: 'Room number where the session will take place',
    type: Number,
    example: 1,
  })
  @IsNumber()
  roomNumber: number;
}
