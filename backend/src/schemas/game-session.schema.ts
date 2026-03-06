import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  collection: 'game_sessions',
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
export class GameSession extends Document {
  @Prop({ required: true })
  game_type: number;

  @Prop({ default: '' })
  title: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop({ type: Object, default: {} })
  config: Record<string, unknown>;
}

export const GameSessionSchema = SchemaFactory.createForClass(GameSession);
