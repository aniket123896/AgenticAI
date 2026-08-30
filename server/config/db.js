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
      serverSelectionTimeoutMS: 3000,
      retryWrites: true
    });
    inMemoryMode = false;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    console.error('🔐 Check your Atlas username/password, database user permissions, and allowlist IPs in MongoDB Atlas.');
    console.error(`📌 Current MONGO_URI: ${maskMongoUri(uri)}`);

    if (uri) {
      console.error('⚠️ A MongoDB URL was configured, so the app will stop instead of silently switching to memory mode.');
      throw new Error(`Database configuration is invalid: ${err.message}`);
    }

    console.log('⚡ Switching automatically to High-Performance In-Memory DB Mode...');
    inMemoryMode = true;
    return { connection: { host: 'localhost (in-memory fallback)' } };
  }
};

export const disconnectDB = async () => {
  if (!inMemoryMode) {
    await mongoose.disconnect();
  }
};
