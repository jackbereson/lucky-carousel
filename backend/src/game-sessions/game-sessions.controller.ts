import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { GameSessionsService } from './game-sessions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('game-sessions')
export class GameSessionsController {
  constructor(private service: GameSessionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: { game_type: number; title: string; status?: string }) {
    return this.service.create(body);
  }

  @Get()
  findAll(@Query('game_type') gameType: string) {
    return this.service.findByGameType(parseInt(gameType));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('status') status?: string) {
    if (status) return this.service.checkSession(id, status);
    return this.service.findById(id);
  }
}
