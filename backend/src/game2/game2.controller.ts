import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { Game2Service } from './game2.service';

@Controller('game2')
export class Game2Controller {
  constructor(private service: Game2Service) {}

  // ===== Players =====

  @Get('players')
  getPlayers(@Query('session_id') sessionId: string) {
    return this.service.getPlayers(sessionId);
  }

  @Get('players/:id')
  getPlayer(@Param('id') id: string) {
    return this.service.getPlayer(id);
  }

  @Post('players')
  createPlayer(@Body() body: any) {
    return this.service.createPlayer(body);
  }

  // ===== State =====

  @Get('state/:sessionId')
  getState(@Param('sessionId') sessionId: string) {
    return this.service.getState(sessionId);
  }

  @Patch('state/:sessionId')
  updateState(@Param('sessionId') sessionId: string, @Body() body: any) {
    return this.service.updateState(sessionId, body);
  }

  // ===== Questions =====

  @Get('questions')
  getQuestions(@Query('session_id') sessionId: string) {
    return this.service.getQuestions(sessionId);
  }

  @Post('questions')
  createQuestion(@Body() body: any) {
    return this.service.createQuestion(body);
  }

  @Post('questions/bulk')
  createQuestionsBulk(@Body() body: any[]) {
    return this.service.createQuestionsBulk(body);
  }

  @Put('questions/:id')
  updateQuestion(@Param('id') id: string, @Body() body: any) {
    return this.service.updateQuestion(id, body);
  }

  @Delete('questions/:id')
  deleteQuestion(@Param('id') id: string) {
    return this.service.deleteQuestion(id);
  }

  // ===== Reset =====

  @Post('reset/:sessionId')
  resetSession(@Param('sessionId') sessionId: string) {
    return this.service.resetSession(sessionId);
  }

  // ===== Answers =====

  @Get('answers')
  getAnswers(
    @Query('question_id') questionId?: string,
    @Query('session_id') sessionId?: string,
    @Query('player_id') playerId?: string,
  ) {
    return this.service.getAnswers({
      question_id: questionId,
      session_id: sessionId,
      player_id: playerId,
    });
  }

  @Get('leaderboard/:sessionId')
  getLeaderboard(@Param('sessionId') sessionId: string) {
    return this.service.getLeaderboard(sessionId);
  }

  @Get('answers/check')
  checkAnswer(
    @Query('question_id') questionId: string,
    @Query('player_id') playerId: string,
  ) {
    return this.service.checkAnswer(questionId, playerId);
  }

  @Post('answers')
  createAnswer(@Body() body: any) {
    return this.service.createAnswer(body);
  }
}
