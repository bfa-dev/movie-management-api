import { ApiProperty } from '@nestjs/swagger';

export class BuyTicketDto {
  @ApiProperty()
  sessionId: string;
}