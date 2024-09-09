import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { Public } from '@application/decorators/public.decorator';
import { GenericResponseDto } from '@api/shared/dto/generic-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get API health status' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  getHealth() {
    const health = this.healthService.getHealth();
    return new GenericResponseDto(health, 'API is healthy');
  }
}
