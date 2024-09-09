import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateSessionDto } from '../../sessions/dto/create-session.dto';

export class CreateMovieDto {
  @ApiProperty({ example: 'Truva' })
  @IsString()
  name: string;

  @ApiProperty({ example: 18 })
  @IsInt()
  ageRestriction: number;

  @ApiProperty({ type: [CreateSessionDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSessionDto)
  sessions: CreateSessionDto[];
}