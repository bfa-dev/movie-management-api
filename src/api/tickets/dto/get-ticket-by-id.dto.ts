import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetTicketByIdDto {
  @ApiProperty({
    description: 'The ID of the ticket to retrieve',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  ticketId: string;
}
