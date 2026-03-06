import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  collection: 'game1_players',
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
export class Game1Player extends Document {
  @Prop({ required: true })
  session_id: string;

  @Prop({ required: true })
  full_name: string;

  @Prop({ default: '' })
  cccd: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: false })
  is_winner: boolean;
}

export const Game1PlayerSchema = SchemaFactory.createForClass(Game1Player);
Game1PlayerSchema.index({ session_id: 1 });
