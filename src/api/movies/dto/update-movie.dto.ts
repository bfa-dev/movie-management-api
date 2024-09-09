import { ApiProperty } from '@nestjs/swagger';
import { UpdateSessionDto } from '../../sessions/dto/update-session-dto'

export class UpdateMovieDto {
  @ApiProperty({ example: 'Truva' })
  name: string;

  @ApiProperty({ example: 18 })
  ageRestriction: number;

  @ApiProperty({ type: [UpdateSessionDto] })
  sessions: UpdateSessionDto[];
}