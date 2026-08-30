import mongoose from 'mongoose';
import { MemoryModel } from '../config/memoryStore.js';
import { createModelProxy } from './modelProxy.js';

const commentSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: {
      type: String,
      required: [true, 'Please provide comment text'],
      trim: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

const MongooseComment = mongoose.model('Comment', commentSchema);
const MemoryComment = new MemoryModel('comments', commentSchema);

const Comment = createModelProxy(MongooseComment, MemoryComment);
export default Comment;
