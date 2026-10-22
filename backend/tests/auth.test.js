import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import { setupTestDB, createTestAdmin } from './setup.js';

describe('Auth API and Security', () => {
  setupTestDB();

  it('POST /api/auth/login should authenticate user with correct credentials', async () => {
    const admin = new User({
      name: 'Site Admin',
      email: 'admin@cinescope.com',
      password: 'AdminPassword123!',
      role: 'admin',
    });
    await admin.save();

    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@cinescope.com',
      password: 'AdminPassword123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('admin@cinescope.com');
    expect(res.body.user.role).toBe('admin');
  });

  it('POST /api/auth/login should reject incorrect password with 401', async () => {
    const user = new User({
      name: 'User One',
      email: 'user1@cinescope.com',
      password: 'CorrectPassword123!',
      role: 'user',
    });
    await user.save();

    const res = await request(app).post('/api/auth/login').send({
      email: 'user1@cinescope.com',
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me should return authenticated user profile', async () => {
    const { admin, token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(admin.email);
    expect(res.body.user.role).toBe('admin');
  });

  it('GET /api/auth/me should reject requests without token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
