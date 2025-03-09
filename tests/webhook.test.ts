import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseStorage } from '../server/storage';
import axios from 'axios';
import crypto from 'crypto';

// Mock axios and crypto
vi.mock('axios');
vi.mock('crypto', () => ({
  randomBytes: vi.fn().mockReturnValue({
    toString: vi.fn().mockReturnValue('mock-secret')
  }),
  createHmac: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnValue({
      digest: vi.fn().mockReturnValue('mock-signature')
    })
  })
}));

// Mock Supabase client
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnValue({
    data: {
      id: 1,
      webhook_url: 'https://example.com/webhook',
      webhook_enabled: true,
      webhook_secret: 'test-secret',
      notify_on_section_completion: true,
      notify_on_form_completion: true
    },
    error: null
  })
};

describe('System-wide Webhook Functionality', () => {
  let storage: SupabaseStorage;

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore - we're mocking the implementation
    storage = new SupabaseStorage();
    // @ts-ignore - replace the supabase client with our mock
    storage.supabase = mockSupabase;
    
    // Mock getForm to return form details
    storage.getForm = vi.fn().mockResolvedValue({
      id: 1,
      clientName: 'Test Client',
      clientEmail: 'test@example.com'
    });
    
    // Mock getSections to return sections
    storage.getSections = vi.fn().mockResolvedValue([
      { id: 101, section: 'Business Details', data: { name: 'Test Business' } },
      { id: 102, section: 'Target Audience', data: { audience: 'Everyone' } }
    ]);
    
    // Mock axios.post to resolve successfully
    (axios.post as any).mockResolvedValue({ status: 200 });
  });

  it('should generate a webhook secret', async () => {
    const secret = await storage.generateWebhookSecret();
    expect(secret).toBe('mock-secret');
    expect(crypto.randomBytes).toHaveBeenCalledWith(32);
  });

  it('should get webhook settings with notification options', async () => {
    const settings = await storage.getWebhookSettings();
    
    expect(settings).toEqual({
      id: 1,
      webhook_url: 'https://example.com/webhook',
      webhook_enabled: true,
      webhook_secret: 'test-secret',
      notify_on_section_completion: true,
      notify_on_form_completion: true
    });
    
    expect(mockSupabase.from).toHaveBeenCalledWith('system_settings');
    expect(mockSupabase.select).toHaveBeenCalledWith('*');
    expect(mockSupabase.order).toHaveBeenCalledWith('id', { ascending: true });
    expect(mockSupabase.limit).toHaveBeenCalledWith(1);
  });

  it('should update webhook settings with notification options', async () => {
    const settings = {
      webhookUrl: 'https://example.com/webhook',
      webhookEnabled: true,
      webhookSecret: 'test-secret',
      notifyOnSectionCompletion: true,
      notifyOnFormCompletion: false
    };

    await storage.updateWebhookSettings(settings);

    expect(mockSupabase.from).toHaveBeenCalledWith('system_settings');
    expect(mockSupabase.select).toHaveBeenCalledWith('id');
    expect(mockSupabase.update).toHaveBeenCalledWith({
      ...settings,
      updated_at: expect.any(String)
    });
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', 1);
  });

  it('should send section completion webhook notification', async () => {
    const sectionData = { name: 'Test Business' };
    const result = await storage.sendSectionWebhookNotification(1, 101, sectionData, 'Business Details');

    expect(result).toBe(true);
    expect(mockSupabase.from).toHaveBeenCalledWith('system_settings');
    expect(mockSupabase.select).toHaveBeenCalledWith('webhook_url, webhook_enabled, webhook_secret, notify_on_section_completion');
    
    // Check that axios.post was called with the right arguments
    expect(axios.post).toHaveBeenCalledWith(
      'https://example.com/webhook',
      expect.objectContaining({
        event: 'section_completion',
        form_id: 1,
        form_name: 'Test Client',
        client_email: 'test@example.com',
        section_id: 101,
        section_name: 'Business Details',
        data: { name: 'Test Business' }
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-Webhook-Signature': 'mock-signature'
        })
      })
    );
  });

  it('should not send section webhook if section notifications are disabled', async () => {
    // Override the mock to return disabled section notifications
    mockSupabase.single.mockReturnValueOnce({
      data: {
        webhook_url: 'https://example.com/webhook',
        webhook_enabled: true,
        webhook_secret: 'test-secret',
        notify_on_section_completion: false,
        notify_on_form_completion: true
      },
      error: null
    });

    const sectionData = { name: 'Test Business' };
    const result = await storage.sendSectionWebhookNotification(1, 101, sectionData, 'Business Details');

    expect(result).toBe(false);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('should send form completion webhook notification with all sections', async () => {
    const result = await storage.sendFormCompletionWebhookNotification(1);

    expect(result).toBe(true);
    expect(mockSupabase.from).toHaveBeenCalledWith('system_settings');
    expect(mockSupabase.select).toHaveBeenCalledWith('webhook_url, webhook_enabled, webhook_secret, notify_on_form_completion');
    
    // Check that axios.post was called with the right arguments
    expect(axios.post).toHaveBeenCalledWith(
      'https://example.com/webhook',
      expect.objectContaining({
        event: 'form_completion',
        form_id: 1,
        form_name: 'Test Client',
        client_email: 'test@example.com',
        sections: expect.arrayContaining([
          expect.objectContaining({
            section_id: 101,
            section_name: 'Business Details',
            data: { name: 'Test Business' }
          }),
          expect.objectContaining({
            section_id: 102,
            section_name: 'Target Audience',
            data: { audience: 'Everyone' }
          })
        ])
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-Webhook-Signature': 'mock-signature'
        })
      })
    );
  });

  it('should not send form completion webhook if form notifications are disabled', async () => {
    // Override the mock to return disabled form notifications
    mockSupabase.single.mockReturnValueOnce({
      data: {
        webhook_url: 'https://example.com/webhook',
        webhook_enabled: true,
        webhook_secret: 'test-secret',
        notify_on_section_completion: true,
        notify_on_form_completion: false
      },
      error: null
    });

    const result = await storage.sendFormCompletionWebhookNotification(1);

    expect(result).toBe(false);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('should send submission webhook notification', async () => {
    const data = { test: 'data' };
    const result = await storage.sendSubmissionWebhookNotification(1, data);

    expect(result).toBe(true);
    expect(mockSupabase.from).toHaveBeenCalledWith('system_settings');
    expect(mockSupabase.select).toHaveBeenCalledWith('webhook_url, webhook_enabled, webhook_secret');
    
    // Check that axios.post was called with the right arguments
    expect(axios.post).toHaveBeenCalledWith(
      'https://example.com/webhook',
      expect.objectContaining({
        event: 'form_submission',
        form_id: 1,
        form_name: 'Test Client',
        client_email: 'test@example.com',
        data: { test: 'data' }
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-Webhook-Signature': 'mock-signature'
        })
      })
    );
  });

  it('should not send webhook if disabled', async () => {
    // Override the mock to return disabled webhook
    mockSupabase.single.mockReturnValueOnce({
      data: {
        webhook_url: 'https://example.com/webhook',
        webhook_enabled: false,
        webhook_secret: 'test-secret',
        notify_on_section_completion: true,
        notify_on_form_completion: true
      },
      error: null
    });

    const data = { test: 'data' };
    const result = await storage.sendSubmissionWebhookNotification(1, data);

    expect(result).toBe(false);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('should not send webhook if URL is missing', async () => {
    // Override the mock to return webhook without URL
    mockSupabase.single.mockReturnValueOnce({
      data: {
        webhook_url: '',
        webhook_enabled: true,
        webhook_secret: 'test-secret',
        notify_on_section_completion: true,
        notify_on_form_completion: true
      },
      error: null
    });

    const data = { test: 'data' };
    const result = await storage.sendSubmissionWebhookNotification(1, data);

    expect(result).toBe(false);
    expect(axios.post).not.toHaveBeenCalled();
  });
}); 