import mongoose from 'mongoose';
import { MemoryModel } from '../config/memoryStore.js';
import { createModelProxy } from './modelProxy.js';

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide department name'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const MongooseDept = mongoose.model('Department', departmentSchema);
const MemoryDept = new MemoryModel('departments', departmentSchema);

const Department = createModelProxy(MongooseDept, MemoryDept);
export default Department;
