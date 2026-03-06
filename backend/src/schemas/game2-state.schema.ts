import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  collection: 'game2_state',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
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
export class Game2State extends Document {
  @Prop({ required: true, unique: true })
  session_id: string;

  @Prop({ type: String, default: null })
  active_question_id: string | null;

  @Prop({ default: 'waiting' })
  phase: string;

  @Prop({ type: Date, default: null })
  countdown_start: Date | null;

  @Prop({ default: 30 })
  countdown_duration: number;
}

export const Game2StateSchema = SchemaFactory.createForClass(Game2State);
