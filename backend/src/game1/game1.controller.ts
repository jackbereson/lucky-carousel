import { Controller, Get, Post, Patch, Param, Query, Body } from '@nestjs/common';
import { Game1Service } from './game1.service';

@Controller('game1')
export class Game1Controller {
  constructor(private service: Game1Service) {}

  @Get('players')
  getPlayers(
    @Query('session_id') sessionId: string,
    @Query('is_winner') isWinner?: string,
  ) {
    if (isWinner === 'true') return this.service.findWinners(sessionId);
    return this.service.findBySession(sessionId);
  }

  @Post('players')
  createPlayer(
    @Body()
    body: {
      session_id: string;
      full_name: string;
      cccd?: string;
      phone?: string;
    },
  ) {
    return this.service.create(body);
  }

  @Patch('players/:id')
  updatePlayer(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.service.update(id, body);
  }
}
