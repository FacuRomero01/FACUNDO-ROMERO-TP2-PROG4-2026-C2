import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
  ) {
    return this.publicacionesService.findAll({
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 10,
      sort,
    });
  }
}
