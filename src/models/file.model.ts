import mongoose from 'mongoose';

export interface IFile extends mongoose.Document {
  userId: string;
  originalName: string;
  size: number;
  mimeType: string;
  path: string;
  url: string;
  fileId: string;
  extension: string;
  source: {
    type: 'user_upload' | 'news_cover' | 'talent_avatar' | 'news_content';
    newsId?: string;
    talentId?: string;
    title?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  path: { type: String, required: true },
  url: { type: String, required: true },
  fileId: { type: String, required: true },
  extension: { type: String, required: true },
  source: {
    type: {
      type: String,
      enum: ['user_upload', 'news_cover', 'talent_avatar', 'news_content'],
      required: true,
      default: 'user_upload'
    },
    newsId: { type: mongoose.Schema.Types.ObjectId, ref: 'News' },
    talentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Talent' },
    title: { type: String }
  }
}, { timestamps: true });

export default mongoose.model<IFile>('File', fileSchema); 
