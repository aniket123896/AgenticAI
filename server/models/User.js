import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { MemoryModel } from '../config/memoryStore.js';
import { createModelProxy } from './modelProxy.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    studentId: {
      type: String,
      trim: true,
      sparse: true
    },
    phone: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    year: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    },
    profileImage: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const MongooseUser = mongoose.model('User', userSchema);
const MemoryUser = new MemoryModel('users', userSchema);

const User = createModelProxy(MongooseUser, MemoryUser);
export default User;
