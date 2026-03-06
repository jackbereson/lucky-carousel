import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Game1Player, Game1PlayerSchema } from '../schemas/game1-player.schema';
import { Game1Controller } from './game1.controller';
import { Game1Service } from './game1.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Game1Player.name, schema: Game1PlayerSchema },
    ]),
    EventsModule,
  ],
  controllers: [Game1Controller],
  providers: [Game1Service],
})
export class Game1Module {}
