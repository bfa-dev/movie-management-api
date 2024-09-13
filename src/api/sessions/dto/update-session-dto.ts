import { ApiProperty } from '@nestjs/swagger';
import { TimeSlot } from '@domain/sessions/enums/time.slot.enum';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class UpdateSessionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  id: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsString()
  date: string;

  @ApiProperty({ enum: TimeSlot })
  @IsString()
  timeSlot: TimeSlot;

  @ApiProperty({ example: 1 })
  @IsNumber()
  roomNumber: number;
}
