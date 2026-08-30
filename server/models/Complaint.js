import mongoose from 'mongoose';
import { MemoryModel } from '../config/memoryStore.js';
import { createModelProxy } from './modelProxy.js';

export const COMPLAINT_CATEGORIES = [
  'Classroom',
  'Laboratory',
  'Hostel',
  'Wi-Fi / Internet',
  'Infrastructure',
  'Transportation',
  'Cleanliness',
  'Library',
  'Electricity',
  'Water Supply',
  'Security',
  'Other'
];

export const COMPLAINT_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const COMPLAINT_STATUSES = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed'
];

const attachmentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  path: { type: String, required: true },
  url: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true }
});

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a complaint title'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a complaint description'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters']
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: COMPLAINT_CATEGORIES
    },
    location: {
      type: String,
      required: [true, 'Please specify the location'],
      trim: true
    },
    priority: {
      type: String,
      enum: COMPLAINT_PRIORITIES,
      default: 'Medium'
    },
    status: {
      type: String,
      enum: COMPLAINT_STATUSES,
      default: 'Submitted',
      index: true
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    assignedDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      default: null
    },
    attachments: [attachmentSchema],
    resolutionDetails: {
      text: { type: String, default: '' },
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      resolvedAt: { type: Date, default: null }
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    closedAt: {
      type: Date,
      default: null
    },
    feedback: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feedback',
      default: null
    }
  },
  {
    timestamps: true
  }
);

complaintSchema.index({ title: 'text', description: 'text', location: 'text' });
complaintSchema.index({ status: 1, category: 1, priority: 1, createdAt: -1 });

const MongooseComplaint = mongoose.model('Complaint', complaintSchema);
const MemoryComplaint = new MemoryModel('complaints', complaintSchema);

const Complaint = createModelProxy(MongooseComplaint, MemoryComplaint);
export default Complaint;
