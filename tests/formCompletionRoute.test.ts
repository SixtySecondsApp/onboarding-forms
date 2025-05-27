import express from 'express';
import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerRoutes } from '../server/routes';
import { storage } from '../server/storage';

// Helper to create an express app with routes registered for each test
async function createTestApp() {
  const app = express();
  app.use(express.json());
  await registerRoutes(app);
  return app;
}

describe('POST /api/forms/:id/complete', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns success true when webhook sent', async () => {
    vi.spyOn(storage, 'sendFormCompletionWebhookNotification').mockResolvedValue(true);

    const app = await createTestApp();
    const res = await request(app)
      .post('/api/forms/1/complete')
      .expect(200);

    expect(res.body).toEqual({ success: true });
    expect(storage.sendFormCompletionWebhookNotification).toHaveBeenCalledWith(1);
  });

  it('returns success false when webhook not sent', async () => {
    vi.spyOn(storage, 'sendFormCompletionWebhookNotification').mockResolvedValue(false);

    const app = await createTestApp();
    const res = await request(app)
      .post('/api/forms/1/complete')
      .expect(200);

    expect(res.body).toEqual({ success: false, message: expect.any(String) });
  });

  it('returns 400 for invalid id', async () => {
    const app = await createTestApp();
    const res = await request(app)
      .post('/api/forms/not-a-number/complete')
      .expect(400);

    expect(res.body).toHaveProperty('error');
  });
}); 