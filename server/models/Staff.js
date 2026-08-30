import mongoose from 'mongoose';
import { MemoryModel } from '../config/memoryStore.js';
import { createModelProxy } from './modelProxy.js';

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide staff name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide staff email'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Please assign a department']
    },
    designation: {
      type: String,
      required: [true, 'Please provide designation'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const MongooseStaff = mongoose.model('Staff', staffSchema);
const MemoryStaff = new MemoryModel('staffs', staffSchema);

const Staff = createModelProxy(MongooseStaff, MemoryStaff);
export default Staff;
