import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetByIdDto {
  @ApiProperty({
    description: 'The unique identifier of the movie',
    example: 'b5d2b68e-8a0d-4a2f-9a9b-13d762cfcc14',
  })
  @IsUUID()
  id: string;
}