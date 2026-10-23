import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let inMemoryMode = false;

const getMongoUri = () => {
  return process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL || '';
};

const maskMongoUri = (uri) => {
  if (!uri) return 'not configured';

  try {
    const parsed = new URL(uri);
    const username = parsed.username ? '***' : '';
    const password = parsed.password ? '***' : '';
    const masked = `${parsed.protocol}//${username}${password ? ':' + password : ''}${parsed.username || parsed.password ? '@' : ''}${parsed.host}${parsed.pathname}${parsed.search}`;
    return masked;
  } catch {
    return uri.replace(/(:\/\/)([^:@]+)(:)([^@]+)@/i, '$1$2:***@');
  }
};

export const isInMemoryMode = () => inMemoryMode;

export const connectDB = async () => {
  const uri = getMongoUri();

  if (!uri || uri === 'memory') {
    inMemoryMode = true;
    console.log('⚡ CCMS Database initialized in High-Performance In-Memory Mode (Zero external dependencies).');
    return { connection: { host: 'localhost (in-memory)' } };
  }

  try {
    console.log(`🔌 Connecting to MongoDB at ${maskMongoUri(uri)}...`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      family: 4,
      retryWrites: true
    });
    inMemoryMode = false;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`⚠️ First connection attempt failed (${err.message}). Retrying once...`);
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        family: 4,
        retryWrites: true
      });
      inMemoryMode = false;
      console.log(`✅ MongoDB Connected on retry: ${conn.connection.host}`);
      return conn;
    } catch (retryErr) {
      console.error(`❌ MongoDB connection failed: ${retryErr.message}`);
      console.error('🔐 Check your Atlas username/password, database user permissions, and allowlist IPs in MongoDB Atlas.');
      console.error(`📌 Current MONGO_URI: ${maskMongoUri(uri)}`);

      console.warn('⚠️ MongoDB Atlas could not be reached. Switching automatically to High-Performance In-Memory DB Mode...');
      inMemoryMode = true;
      return { connection: { host: 'localhost (in-memory fallback)' } };
    }
  }
};

export const disconnectDB = async () => {
  if (!inMemoryMode) {
    await mongoose.disconnect();
  }
};
