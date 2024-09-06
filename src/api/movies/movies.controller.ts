import { Controller, Post, Put, Delete, Body, Param, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MoviesService } from '../../application/movies/movies.service';
import { Roles } from '../../application/decorators/roles.decorator';
import { Role } from '../../domain/auth/role.enum';
import { CreateMovieDto } from './dto/create-movie.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { BuyTicketDto } from './dto/buy-ticket.dto';
import { WatchMovieDto } from './dto/watch-movie.dto';
import { BulkCreateMovieDto, BulkDeleteMovieDto } from './dto/bulk/bulk-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { CurrentUser } from '@application/decorators/current-user.decorator';

@ApiTags('movies')
@ApiBearerAuth()
@Controller('movies')
@Roles(Role.MANAGER)
export class MoviesController {
  constructor(private moviesService: MoviesService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new movie' })
  @ApiResponse({ status: 201, description: 'The movie has been successfully created.' })
  async createMovie(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.createMovie(createMovieDto.name, createMovieDto.ageRestriction);
  }

  @Put(':id')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Update a movie' })
  @ApiResponse({ status: 200, description: 'The movie has been successfully updated.' })
  async updateMovie(
    @Param('id') id: string,
    @Body() movieData: UpdateMovieDto
  ) {
    return this.moviesService.updateMovie(id, movieData.name, movieData.ageRestriction);
  }

  @Delete(':id')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Delete a movie' })
  @ApiResponse({ status: 200, description: 'The movie has been successfully deleted.' })
  async deleteMovie(@Param('id') id: string) {
    return this.moviesService.deleteMovie(id);
  }

  @Post(':id/sessions')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Add a new session to a movie' })
  @ApiResponse({ status: 201, description: 'The session has been successfully added.' })
  @ApiResponse({ status: 409, description: 'This room is already booked for the given date and time slot.' })
  async addSession(
    @Param('id') movieId: string,
    @Body() createSessionDto: CreateSessionDto
  ) {
    return this.moviesService.addSession(
      movieId,
      new Date(createSessionDto.date),
      createSessionDto.timeSlot,
      createSessionDto.roomNumber
    );
  }

  @Get()
  @Roles(Role.CUSTOMER, Role.MANAGER)
  @ApiOperation({ summary: 'List all movies' })
  @ApiResponse({ status: 200, description: 'Return all movies.' })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'ageRestriction', required: false, type: Number })
  async listMovies(
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('name') name?: string,
    @Query('ageRestriction') ageRestriction?: number
  ) {
    const filter: any = {};
    if (name) filter.name = name;
    if (ageRestriction) filter.ageRestriction = ageRestriction;

    return this.moviesService.listMovies(sortBy, sortOrder, filter);
  }

  @Post('buy-ticket')
  @Roles(Role.CUSTOMER, Role.MANAGER)
  @ApiOperation({ summary: 'Buy a ticket for a movie session' })
  @ApiResponse({ status: 201, description: 'The ticket has been successfully purchased.' })
  async buyTicket(@CurrentUser() user: { sub: string }, @Body() buyTicketDto: BuyTicketDto) {
    const userId = user.sub;
    return this.moviesService.buyTicket(userId, buyTicketDto.sessionId);
  }

  @Post('watch')
  @Roles(Role.CUSTOMER, Role.MANAGER)
  @ApiOperation({ summary: 'Watch a movie' })
  @ApiResponse({ status: 200, description: 'The movie has been marked as watched.' })
  async watchMovie(@CurrentUser() user: { sub: string }, @Body() watchMovieDto: WatchMovieDto) {
    const userId = user.sub;
    return this.moviesService.watchMovie(userId, watchMovieDto.ticketId);
  }

  @Get('watch-history')
  @Roles(Role.CUSTOMER, Role.MANAGER)
  @ApiOperation({ summary: 'Get user\'s watch history' })
  @ApiResponse({ status: 200, description: 'Return the user\'s watch history.' })
  async getWatchHistory(@Request() req) {
    return this.moviesService.getWatchHistory(req.user.userId);
  }

  @Get(':id')
  @Roles(Role.CUSTOMER, Role.MANAGER)
  async getMovie(@Param('id') id: string) {
    return this.moviesService.getMovie(id);
  }

  @Post('bulk-add')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Bulk add movies' })
  @ApiResponse({ status: 201, description: 'The movies have been successfully created.' })
  async bulkAddMovies(@Body() bulkCreateMovieDto: BulkCreateMovieDto) {
    return this.moviesService.bulkAddMovies(bulkCreateMovieDto.movies);
  }

  @Post('bulk-delete')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Bulk delete movies' })
  @ApiResponse({ status: 200, description: 'The movies have been successfully deleted.' })
  async bulkDeleteMovies(@Body() bulkDeleteMovieDto: BulkDeleteMovieDto) {
    return this.moviesService.bulkDeleteMovies(bulkDeleteMovieDto.movieIds);
  }
}