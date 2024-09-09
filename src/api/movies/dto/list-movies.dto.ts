import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ListMoviesDto {
  @ApiPropertyOptional({
    description: 'Field to sort by',
    type: String,
    example: 'name',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Order to sort the results by (ASC or DESC)',
    enum: ['ASC', 'DESC'],
    example: 'ASC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    description: 'Filter by movie name',
    type: String,
    example: 'Truva',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by age restriction',
    type: Number,
    example: 13,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  ageRestriction?: number;

  @ApiPropertyOptional({
    description: 'Condition for age restriction filtering (greaterOrEqual or lesser)',
    enum: ['greaterOrEqual', 'lesser'],
    example: 'greaterOrEqual',
  })
  @IsOptional()
  @IsEnum(['greaterOrEqual', 'lesser'])
  ageRestrictionCondition?: 'greaterOrEqual' | 'lesser';
}
