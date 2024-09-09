import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '@application/decorators/roles.decorator';
import { Role } from '@domain/auth/enums/role.enum';
import { GenericResponseDto } from '@api/shared/dto/generic-response.dto';
import { SessionsService } from '@application/sessions/sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { MoviesService } from '@application/movies/movies.service';
import { MovieNotFoundError } from '@domain/exceptions';

@ApiTags('sessions')
@Controller('sessions')
export class SessionsController {
  constructor(
    private sessionsService: SessionsService,
    private moviesService: MoviesService,
  ) { }

  @Post('/:movieId')
  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Add a new session to a movie' })
  @ApiResponse({ status: 201, description: 'The session has been successfully added.' })
  @ApiResponse({ status: 409, description: 'This room is already booked for the given date and time slot.' })
  async addSession(
    @Param('movieId') movieId: string,
    @Body() createSessionDto: CreateSessionDto
  ) {
    const movie = await this.moviesService.getMovieById(movieId);
    if (!movie) {
      throw new MovieNotFoundError();
    }
    const session = await this.sessionsService.addSession(
      createSessionDto,
      movie
    );
    return new GenericResponseDto(session, 'The session has been successfully added.');
  }

  @Delete('/:sessionId')
  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Delete a session by id' })
  @ApiResponse({ status: 200, description: 'The session has been successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Invalid session id.' })
  async deleteSession(@Param('movieId') movieId: string, @Param('sessionId') sessionId: string) {
    const movie = await this.moviesService.getMovieById(movieId);
    if (!movie) {
      throw new MovieNotFoundError();
    }

    const session = await this.sessionsService.deleteSession(sessionId);
    return new GenericResponseDto(session, 'The session has been successfully deleted.');
  }

  @Delete('/:movieId')
  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Delete all sessions of a movie' })
  @ApiResponse({ status: 200, description: 'The sessions have been successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Invalid movie id.' })
  async deleteAllSessions(@Param('movieId') movieId: string) {
    const sessions = await this.sessionsService.deleteAllSessions(movieId);
  }
}