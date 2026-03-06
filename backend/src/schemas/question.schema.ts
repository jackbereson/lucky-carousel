import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  collection: 'questions',
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
export class Question extends Document {
  @Prop({ required: true })
  session_id: string;

  @Prop({ required: true })
  question_text: string;

  @Prop({ default: 'multiple_choice' })
  question_type: string;

  @Prop({ type: [String], default: [] })
  options: string[];

  @Prop({ default: '' })
  correct_answer: string;

  @Prop({ default: 30 })
  time_limit_seconds: number;

  @Prop({ default: 0 })
  sort_order: number;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
QuestionSchema.index({ session_id: 1 });
