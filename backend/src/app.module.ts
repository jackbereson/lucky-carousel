import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GameSessionsModule } from './game-sessions/game-sessions.module';
import { Game1Module } from './game1/game1.module';
import { Game2Module } from './game2/game2.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/houze-lucky-wheel',
    ),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*'],
    }),
    AuthModule,
    GameSessionsModule,
    Game1Module,
    Game2Module,
    EventsModule,
  ],
})
export class AppModule {}
