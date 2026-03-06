import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  collection: 'game2_players',
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
export class Game2Player extends Document {
  @Prop({ required: true })
  session_id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  avatar_color: string;
}

export const Game2PlayerSchema = SchemaFactory.createForClass(Game2Player);
Game2PlayerSchema.index({ session_id: 1 });
