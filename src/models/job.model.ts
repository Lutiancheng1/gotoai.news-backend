import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'intermediate' | 'senior' | 'expert';
  status: 'active' | 'closed';
  tags: string[];
  postedBy: mongoose.Types.ObjectId;
  applicationCount: number;
}

const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: [{
      type: String,
      required: true,
    }],
    salary: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'CNY',
      },
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'intermediate', 'senior', 'expert'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
    tags: [{
      type: String,
    }],
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IJob>('Job', jobSchema); 