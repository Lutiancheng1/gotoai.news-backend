import mongoose, { Document, Schema } from 'mongoose';

export interface INews extends Document {
  title: string;
  content: string;
  summary: string;
  cover: typeof coverSchema;
  category: string;
  author: mongoose.Types.ObjectId;
  status: 'draft' | 'published';
  viewCount: number;
}
const coverSchema =  new Schema({
  userId: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  path: { type: String, required: true },
  url: { type: String, required: true }
}, { timestamps: true }); 

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
    cover: coverSchema,
    summary: String,
    category: {
      type: String,
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

export default mongoose.model<INews>('News', newsSchema); 