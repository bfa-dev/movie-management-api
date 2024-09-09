import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponseDto } from './base-response.dto';

export class GenericResponseDto extends BaseResponseDto {
  @ApiPropertyOptional()
  @IsOptional()
  data?: any;

  constructor(_data?: any, _message?: string) {
    super(_message);
    this.data = _data || null;
  }
}