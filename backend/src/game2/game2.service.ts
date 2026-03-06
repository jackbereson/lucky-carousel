import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game2Player } from '../schemas/game2-player.schema';
import { Game2State } from '../schemas/game2-state.schema';
import { Game2Answer } from '../schemas/game2-answer.schema';
import { Question } from '../schemas/question.schema';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class Game2Service {
  constructor(
    @InjectModel(Game2Player.name) private playerModel: Model<Game2Player>,
    @InjectModel(Game2State.name) private stateModel: Model<Game2State>,
    @InjectModel(Game2Answer.name) private answerModel: Model<Game2Answer>,
    @InjectModel(Question.name) private questionModel: Model<Question>,
    private events: EventsGateway,
  ) {}

  // ===== Players =====

  async getPlayers(sessionId: string) {
    const players = await this.playerModel
      .find({ session_id: sessionId })
      .sort({ created_at: 1 });
    return players.map((p) => p.toJSON());
  }

  async getPlayer(id: string) {
    try {
      const player = await this.playerModel.findById(id);
      return player?.toJSON() || null;
    } catch {
      return null;
    }
  }

  async createPlayer(dto: {
    session_id: string;
    name: string;
    phone?: string;
    avatar_color?: string;
  }) {
    const player = await this.playerModel.create(dto);
    const json = player.toJSON();
    this.events.emitToSession(dto.session_id, 'game2:player_added', json);
    return json;
  }

  // ===== State =====

  async getState(sessionId: string) {
    const state = await this.stateModel.findOne({ session_id: sessionId });
    return state?.toJSON() || null;
  }

  async updateState(sessionId: string, dto: Record<string, any>) {
    const state = await this.stateModel.findOneAndUpdate(
      { session_id: sessionId },
      { ...dto, updated_at: new Date() },
      { new: true },
    );
    if (state) {
      const json = state.toJSON();
      this.events.emitToSession(sessionId, 'game2:state_updated', json);
      return json;
    }
    return null;
  }

  // ===== Questions =====

  async getQuestions(sessionId: string) {
    const questions = await this.questionModel
      .find({ session_id: sessionId })
      .sort({ sort_order: 1 });
    return questions.map((q) => q.toJSON());
  }

  async createQuestion(dto: any) {
    const question = await this.questionModel.create(dto);
    const json = question.toJSON();
    this.events.emitToSession(dto.session_id, 'game2:question_changed', json);
    return json;
  }

  async createQuestionsBulk(questions: any[]) {
    const created = await this.questionModel.insertMany(questions);
    const jsons = created.map((q) => (q as any).toJSON());
    if (questions.length > 0) {
      this.events.emitToSession(
        questions[0].session_id,
        'game2:question_changed',
        jsons,
      );
    }
    return jsons;
  }

  async updateQuestion(id: string, dto: any) {
    try {
      const question = await this.questionModel.findByIdAndUpdate(id, dto, {
        new: true,
      });
      if (question) {
        const json = question.toJSON();
        this.events.emitToSession(
          json.session_id,
          'game2:question_changed',
          json,
        );
        return json;
      }
      return null;
    } catch {
      return null;
    }
  }

  async deleteQuestion(id: string) {
    try {
      const question = await this.questionModel.findByIdAndDelete(id);
      if (question) {
        const json = question.toJSON();
        this.events.emitToSession(
          json.session_id,
          'game2:question_deleted',
          { id: json.id },
        );
        return json;
      }
      return null;
    } catch {
      return null;
    }
  }

  // ===== Answers =====

  async getAnswers(query: {
    question_id?: string;
    session_id?: string;
    player_id?: string;
  }) {
    const filter: any = {};
    if (query.question_id) filter.question_id = query.question_id;
    if (query.session_id) filter.session_id = query.session_id;
    if (query.player_id) filter.player_id = query.player_id;
    const answers = await this.answerModel.find(filter);
    return answers.map((a) => a.toJSON());
  }

  async checkAnswer(questionId: string, playerId: string) {
    const answer = await this.answerModel.findOne({
      question_id: questionId,
      player_id: playerId,
    });
    return answer?.toJSON() || null;
  }

  async getLeaderboard(sessionId: string) {
    // Get total questions count
    const totalQuestions = await this.questionModel.countDocuments({
      session_id: sessionId,
    });

    // Aggregate: group answers by player, count correct, sum time
    // Only return players who got ALL questions correct, sorted by fastest
    const results = await this.answerModel.aggregate([
      { $match: { session_id: sessionId, is_correct: true } },
      {
        $group: {
          _id: '$player_id',
          correct_count: { $sum: 1 },
          total_time_ms: { $sum: '$time_taken_ms' },
        },
      },
      { $match: { correct_count: totalQuestions } },
      { $sort: { total_time_ms: 1 } },
      { $limit: 5 },
    ]);

    // Fetch player names
    const playerIds = results.map((r) => r._id);
    const players = await this.playerModel.find({ _id: { $in: playerIds } });
    const playerMap = new Map(
      players.map((p) => [String(p._id), p.toJSON()]),
    );

    return {
      total_questions: totalQuestions,
      leaderboard: results.map((r) => ({
        player_id: String(r._id),
        player_name: playerMap.get(String(r._id))?.name || 'Unknown',
        avatar_color: playerMap.get(String(r._id))?.avatar_color || '#666',
        correct_count: r.correct_count,
        total_time_ms: r.total_time_ms,
      })),
    };
  }

  async createAnswer(dto: any) {
    try {
      const answer = await this.answerModel.create(dto);
      const json = answer.toJSON();
      this.events.emitToSession(dto.session_id, 'game2:answer_added', json);
      return json;
    } catch (err: any) {
      // Duplicate answer (unique constraint on question_id + player_id)
      if (err.code === 11000) {
        const existing = await this.answerModel.findOne({
          question_id: dto.question_id,
          player_id: dto.player_id,
        });
        return existing?.toJSON() || null;
      }
      throw err;
    }
  }
}
