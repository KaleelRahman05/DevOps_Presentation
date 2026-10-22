import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../src/models/User.js';

let mongoServer;

export const setupTestDB = () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  }, 120000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });
};

export const createTestAdmin = async () => {
  const admin = new User({
    name: 'Test Administrator',
    email: 'admin.test@cinescope.com',
    password: 'Password123!',
    role: 'admin',
  });
  await admin.save();

  const token = jwt.sign(
    { id: admin._id },
    process.env.JWT_SECRET || 'cinescope_development_secret_key_change_in_production_2026',
    { expiresIn: '1h' }
  );

  return { admin, token };
};

export const createTestUser = async () => {
  const user = new User({
    name: 'Regular Cinephile',
    email: 'user.test@cinescope.com',
    password: 'Password123!',
    role: 'user',
  });
  await user.save();

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || 'cinescope_development_secret_key_change_in_production_2026',
    { expiresIn: '1h' }
  );

  return { user, token };
};
