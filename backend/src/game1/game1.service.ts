import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game1Player } from '../schemas/game1-player.schema';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class Game1Service {
  constructor(
    @InjectModel(Game1Player.name) private playerModel: Model<Game1Player>,
    private events: EventsGateway,
  ) {}

  async findBySession(sessionId: string) {
    const players = await this.playerModel
      .find({ session_id: sessionId })
      .sort({ created_at: 1 });
    return players.map((p) => p.toJSON());
  }

  async findWinners(sessionId: string) {
    const players = await this.playerModel
      .find({ session_id: sessionId, is_winner: true })
      .sort({ created_at: 1 });
    return players.map((p) => p.toJSON());
  }

  async create(dto: {
    session_id: string;
    full_name: string;
    cccd?: string;
    phone?: string;
  }) {
    const player = await this.playerModel.create(dto);
    const json = player.toJSON();
    this.events.emitToSession(dto.session_id, 'game1:player_added', json);
    return json;
  }

  async update(id: string, dto: Record<string, any>) {
    try {
      const player = await this.playerModel.findByIdAndUpdate(id, dto, {
        new: true,
      });
      if (player) {
        const json = player.toJSON();
        this.events.emitToSession(
          json.session_id,
          'game1:player_updated',
          json,
        );
        return json;
      }
      return null;
    } catch {
      return null;
    }
  }
}
