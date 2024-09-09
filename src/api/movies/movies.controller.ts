import { Controller, Post, Put, Delete, Body, Param, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MoviesService } from '../../application/movies/movies.service';
import { Roles } from '../../application/decorators/roles.decorator';
import { Role } from '../../domain/auth/enums/role.enum';
import { CreateMovieDto } from './dto/create-movie.dto';
import { BulkCreateMovieDto, BulkDeleteMovieDto } from './dto/bulk/bulk-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { ListMoviesDto } from './dto/list-movies.dto';
import { Public } from '@application/decorators/public.decorator';
import { GenericResponseDto } from '../shared/dto/generic-response.dto';

@ApiTags('movies')
@Controller('movies')
export class MoviesController {
  constructor(private moviesService: MoviesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all active movies' })
  @ApiResponse({ status: 200, description: 'Return all active movies.' })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'ageRestriction', required: false, type: Number })
  async listMovies(@Query() listMoviesDto: ListMoviesDto) {
    const movies = await this.moviesService.listActiveMovies(listMoviesDto);
    return new GenericResponseDto(movies, 'Return all active movies.');
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a movie by ID' })
  @ApiResponse({ status: 200, description: 'Return the movie with the specified ID.' })
  async getMovie(@Param('id') id: string) {
    const movie = await this.moviesService.getMovieWithSessions(id);
    return new GenericResponseDto(movie, 'Return the movie with the specified ID.');
  }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Create a new movie' })
  @ApiResponse({ status: 201, description: 'The movie has been successfully created.' })
  async createMovie(@Body() createMovieDto: CreateMovieDto) {
    const movie = await this.moviesService.createMovie(createMovieDto);
    return new GenericResponseDto(movie, 'The movie has been successfully created.');
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Update a movie' })
  @ApiResponse({ status: 200, description: 'The movie has been successfully updated.' })
  async updateMovie(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    const movie = await this.moviesService.updateMovie(id, updateMovieDto);
    return new GenericResponseDto(movie, 'The movie has been successfully updated.');
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Delete a movie' })
  @ApiResponse({ status: 200, description: 'The movie has been successfully deleted.' })
  async deleteMovie(@Param('id') id: string) {
    const movie = await this.moviesService.deleteMovie(id);
    return new GenericResponseDto(movie, 'The movie has been successfully deleted.');
  }

  @Post('bulk-add')
  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Bulk add movies' })
  @ApiResponse({ status: 201, description: 'The movies have been successfully created.' })
  async bulkAddMovies(@Body() bulkCreateMovieDto: BulkCreateMovieDto) {
    const movies = await this.moviesService.bulkAddMovies(bulkCreateMovieDto);
    return new GenericResponseDto(movies, 'The movies have been successfully created.');
  }

  @Post('bulk-delete')
  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Bulk delete movies' })
  @ApiResponse({ status: 200, description: 'The movies have been successfully deleted.' })
  async bulkDeleteMovies(@Body() bulkDeleteMovieDto: BulkDeleteMovieDto) {
    const movies = await this.moviesService.bulkDeleteMovies(bulkDeleteMovieDto.movieIds);
    return new GenericResponseDto(movies, 'The movies have been successfully deleted.');
  }
}
