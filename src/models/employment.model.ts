import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployment extends Document {
  title: string;
  content: string;
  summary: string;
  cover: typeof coverSchema;
  category: 'employment_news' | 'employment_policy';
  tag: 'important' | 'job' | 'startup' | 'national_policy' | 'local_policy';
  author: mongoose.Types.ObjectId;
  status: 'draft' | 'published';
  viewCount: number;
  source: string;
}

const coverSchema = new Schema({
  userId: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  path: { type: String, required: true },
  url: { type: String, required: true }
}, { timestamps: true });

const employmentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    source: {
      type: String,
      required: true,
      trim: true
    },
    cover: coverSchema,
    summary: String,
    category: {
      type: String,
      enum: ['employment_news', 'employment_policy'],
      required: true,
    },
    tag: {
      type: String,
      enum: ['important', 'job', 'startup', 'national_policy', 'local_policy'],
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IEmployment>('Employment', employmentSchema); 