import mongoose, { Document, Schema } from 'mongoose';

export interface INews extends Document {
  title: string;
  content: string;
  summary: string;
  cover: string;
  category: string;
  tags: string[];
  author: mongoose.Types.ObjectId;
  status: 'draft' | 'published';
  viewCount: number;
}

const newsSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    cover: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    tags: [{
      type: String,
    }],
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

export default mongoose.model<INews>('News', newsSchema); 