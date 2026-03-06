import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Game2Player, Game2PlayerSchema } from '../schemas/game2-player.schema';
import { Game2State, Game2StateSchema } from '../schemas/game2-state.schema';
import {
  Game2Answer,
  Game2AnswerSchema,
} from '../schemas/game2-answer.schema';
import { Question, QuestionSchema } from '../schemas/question.schema';
import { Game2Controller } from './game2.controller';
import { Game2Service } from './game2.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Game2Player.name, schema: Game2PlayerSchema },
      { name: Game2State.name, schema: Game2StateSchema },
      { name: Game2Answer.name, schema: Game2AnswerSchema },
      { name: Question.name, schema: QuestionSchema },
    ]),
    EventsModule,
  ],
  controllers: [Game2Controller],
  providers: [Game2Service],
})
export class Game2Module {}
