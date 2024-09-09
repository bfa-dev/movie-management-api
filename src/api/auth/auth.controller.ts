import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '@application/auth/auth.service';
import { Public } from '@application/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from '@api/auth/dto/login.dto';
import { CreateUserDto } from '@api/users/dto/create-user.dto';
import { CreateManagerDto } from '@api/users/dto/create-manager.dto';
import { Roles } from '@application/decorators/roles.decorator';
import { Role } from '@domain/auth/enums/role.enum';
import { GenericResponseDto } from '@api/shared/dto/generic-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Return JWT access token' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto) {
    const token = await this.authService.login(loginDto);
    return new GenericResponseDto(token, 'The user has been successfully logged in.');
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.register(createUserDto);
    return new GenericResponseDto(user, 'The user has been successfully created.');
  }

  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @Post('create-manager')
  @ApiOperation({ summary: 'Create a new manager' })
  @ApiResponse({ status: 201, description: 'The manager has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async createManager(@Body() createManagerDto: CreateManagerDto) {
    const manager = await this.authService.createManager(createManagerDto);
    return new GenericResponseDto(manager, 'The manager has been successfully created.');
  }
}