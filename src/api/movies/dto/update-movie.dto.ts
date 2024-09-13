import { ApiProperty } from '@nestjs/swagger';
import { UpdateSessionDto } from '../../sessions/dto/update-session-dto';
import { IsArray, IsBoolean, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMovieDto {
  @ApiProperty({ example: 'Truva' })
  @IsString()
  name: string;

  @ApiProperty({ example: 18 })
  @IsNumber()
  ageRestriction: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ type: [UpdateSessionDto] })
  @IsArray()
  @Type(() => UpdateSessionDto)
  sessions: UpdateSessionDto[];
}
