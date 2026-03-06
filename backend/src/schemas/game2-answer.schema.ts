import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  collection: 'game2_answers',
  toJSON: {
    virtuals: true,
    transform: (_: any, ret: any) => {
      ret.id = String(ret._id);
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Game2Answer extends Document {
  @Prop({ required: true })
  session_id: string;

  @Prop({ required: true })
  question_id: string;

  @Prop({ required: true })
  player_id: string;

  @Prop({ required: true })
  answer_text: string;

  @Prop({ required: true })
  is_correct: boolean;

  @Prop({ type: Date, default: Date.now })
  answered_at: Date;

  @Prop({ required: true })
  time_taken_ms: number;
}

export const Game2AnswerSchema = SchemaFactory.createForClass(Game2Answer);
Game2AnswerSchema.index({ question_id: 1, player_id: 1 }, { unique: true });
Game2AnswerSchema.index({ session_id: 1 });
Game2AnswerSchema.index({ question_id: 1 });
