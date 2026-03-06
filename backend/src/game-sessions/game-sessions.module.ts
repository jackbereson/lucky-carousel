import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameSession, GameSessionSchema } from '../schemas/game-session.schema';
import { Game2State, Game2StateSchema } from '../schemas/game2-state.schema';
import { GameSessionsController } from './game-sessions.controller';
import { GameSessionsService } from './game-sessions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GameSession.name, schema: GameSessionSchema },
      { name: Game2State.name, schema: Game2StateSchema },
    ]),
  ],
  controllers: [GameSessionsController],
  providers: [GameSessionsService],
})
export class GameSessionsModule {}
