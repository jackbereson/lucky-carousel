import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameSession } from '../schemas/game-session.schema';
import { Game2State } from '../schemas/game2-state.schema';

@Injectable()
export class GameSessionsService {
  constructor(
    @InjectModel(GameSession.name) private sessionModel: Model<GameSession>,
    @InjectModel(Game2State.name) private stateModel: Model<Game2State>,
  ) {}

  async create(dto: { game_type: number; title: string; status?: string }) {
    const session = await this.sessionModel.create({
      ...dto,
      status: dto.status || 'active',
    });
    const json = session.toJSON();

    // Auto-create game2_state for game type 2
    if (dto.game_type === 2) {
      await this.stateModel.create({
        session_id: json.id,
        phase: 'waiting',
        countdown_duration: 30,
      });
    }

    return json;
  }

  async findByGameType(gameType: number) {
    const sessions = await this.sessionModel
      .find({ game_type: gameType })
      .sort({ created_at: -1 });
    return sessions.map((s) => s.toJSON());
  }

  async findById(id: string) {
    try {
      const session = await this.sessionModel.findById(id);
      return session?.toJSON() || null;
    } catch {
      return null;
    }
  }

  async checkSession(id: string, status: string) {
    try {
      const session = await this.sessionModel.findOne({ _id: id, status });
      return session?.toJSON() || null;
    } catch {
      return null;
    }
  }
}
