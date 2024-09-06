import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '@application/auth/auth.service';
import { Public } from '@application/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from '@api/auth/dto/login.dto';
import { CreateUserDto } from '@api/users/dto/create-user.dto';
import { CreateManagerDto } from '@api/users/dto/create-manager.dto';
import { Roles } from '@application/decorators/roles.decorator';
import { Role } from '@domain/auth/role.enum';

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
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @Post('create-manager')
  @ApiOperation({ summary: 'Create a new manager' })
  @ApiResponse({ status: 201, description: 'The manager has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async createManager(@Body() createManagerDto: CreateManagerDto) {
    return this.authService.createManager(createManagerDto);
  }
}