import mongoose, { Document, Schema } from 'mongoose';

export interface ITalent extends Document {
  name: string;
  title: string;
  avatar: string;
  summary: string;
  skills: string[];
  experience: {
    company: string;
    position: string;
    duration: string;
    description: string;
  }[];
  education: {
    school: string;
    degree: string;
    field: string;
    year: string;
  }[];
  contact: {
    email: string;
    phone?: string;
    linkedin?: string;
  };
  status: 'available' | 'not-available';
  recommendedBy: mongoose.Types.ObjectId;
  featured: boolean;
}

const talentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    summary: {
      type: String,
      required: true,
    },
    skills: [{
      type: String,
      required: true,
    }],
    experience: [{
      company: {
        type: String,
        required: true,
      },
      position: {
        type: String,
        required: true,
      },
      duration: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    }],
    education: [{
      school: {
        type: String,
        required: true,
      },
      degree: {
        type: String,
        required: true,
      },
      field: {
        type: String,
        required: true,
      },
      year: {
        type: String,
        required: true,
      },
    }],
    contact: {
      email: {
        type: String,
        required: true,
      },
      phone: String,
      linkedin: String,
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