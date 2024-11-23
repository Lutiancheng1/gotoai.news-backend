import mongoose, { Document, Schema } from 'mongoose';

export interface ITalent extends Document {
  name: string;
  position: string;
  avatar: typeof avatarSchema;
  summary: string;
  skills: string[];
  status: 'available' | 'not-available';
  workExperience: string;
  education: string;
  contact: string;
  recommendedBy: mongoose.Types.ObjectId;
  featured: boolean;
}

const avatarSchema = new Schema({
  userId: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  path: { type: String, required: true },
  url: { type: String, required: true }
}, { timestamps: true });

const talentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
    },
    avatar: {
      type: avatarSchema,
    },
    summary: {
      type: String,
      required: true,
    },
    skills: [{
      type: String,
      required: true,
    }],
    workExperience: {
      type: String,
      required: true,
    },
    education: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'not-available'],
      default: 'available',
    },
    recommendedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITalent>('Talent', talentSchema); 