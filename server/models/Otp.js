import mongoose from 'mongoose';
import { MemoryModel } from '../config/memoryStore.js';
import { createModelProxy } from './modelProxy.js';

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    otp: {
      type: String,
      required: true
    },
    purpose: {
      type: String,
      enum: ['login', 'register'],
      default: 'login'
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }
    }
  },
  { timestamps: true }
);

const MongooseOtp = mongoose.model('Otp', otpSchema);
const MemoryOtp = new MemoryModel('otps', otpSchema);

const Otp = createModelProxy(MongooseOtp, MemoryOtp);
export default Otp;
