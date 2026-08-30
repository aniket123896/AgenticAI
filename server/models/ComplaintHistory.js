import mongoose from 'mongoose';
import { MemoryModel } from '../config/memoryStore.js';
import { createModelProxy } from './modelProxy.js';

const complaintHistorySchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    previousValue: {
      type: String,
      default: ''
    },
    newValue: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

const MongooseHistory = mongoose.model('ComplaintHistory', complaintHistorySchema);
const MemoryHistory = new MemoryModel('complainthistories', complaintHistorySchema);

const ComplaintHistory = createModelProxy(MongooseHistory, MemoryHistory);
export default ComplaintHistory;
