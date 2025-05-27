import { type User, type InsertUser, type OnboardingForm, type InsertForm, type FormSection, type InsertSection, type FormSubmission, type InsertFormSubmission, type SystemSettings, type IStorage } from "./types";
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import crypto from 'crypto';

export class SupabaseStorage implements IStorage {
  private supabase;

  constructor() {
    console.log('Initializing SupabaseStorage...');
    console.log('Environment variables:', {
      SUPABASE_URL: process.env.SUPABASE_URL ? 'present' : 'missing',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing'
    });

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables:', {
        SUPABASE_URL: !!supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceKey
      });
      throw new Error('Missing required Supabase environment variables. Please check your .env file.');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase client initialized successfully');
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert(user)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Form operations
  async createForm(form: InsertForm): Promise<OnboardingForm> {
    const { data, error } = await this.supabase
      .from('forms')
      .insert({
        ...form,
        progress: 0,
        status: 'pending',
        data: {},
        last_reminder: null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getForm(id: number): Promise<OnboardingForm | undefined> {
    const { data, error } = await this.supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateFormProgress(id: number, progress: number): Promise<void> {
    const { error } = await this.supabase
      .from('forms')
      .update({ progress })
      .eq('id', id);

    if (error) throw error;
  }

  async updateFormData(id: number, data: any): Promise<void> {
    // Get the current form data before updating
    const currentForm = await this.getForm(id);
    
    const { error } = await this.supabase
      .from('forms')
      .update({ data })
      .eq('id', id);

    if (error) throw error;
    
    // After updating form data, check if we should send a webhook notification
    try {
      const settings = await this.getWebhookSettings();
      
      // If webhook is enabled and form.updated notifications are enabled, send the webhook
      if (settings.webhookEnabled && settings.webhookUrl) {
        await this.sendFormUpdatedWebhookNotification(id, data, currentForm?.data || {});
      }
    } catch (webhookError) {
      console.error('Error sending form.updated webhook notification:', webhookError);
      // Don't throw the error to avoid breaking the form update
    }
  }

  async updateLastReminder(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('forms')
      .update({ last_reminder: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  async getForms(): Promise<OnboardingForm[]> {
    const { data, error } = await this.supabase
      .from('forms')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Section operations
  async createSection(section: InsertSection): Promise<FormSection> {
    const { data, error } = await this.supabase
      .from('form_sections')
      .insert({
        ...section,
        is_completed: false,
        data: {}
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSection(shareId: string): Promise<FormSection | undefined> {
    const { data, error } = await this.supabase
      .from('form_sections')
      .select('*')
      .eq('share_id', shareId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateSectionData(id: number, data: any): Promise<void> {
    const { error } = await this.supabase
      .from('form_sections')
      .update({ 
        data,
        status: 'completed' // Mark section as completed when data is updated
      })
      .eq('id', id);

    if (error) throw error;
    
    // After updating section data, check if we should send a webhook notification
    try {
      const { data: section } = await this.supabase
        .from('form_sections')
        .select('form_id, section')
        .eq('id', id)
        .single();
      
      if (section) {
        // Get webhook settings
        const settings = await this.getWebhookSettings();
        
        // If section notifications are enabled, send the webhook
        if (settings.webhookEnabled && settings.notifyOnSectionCompletion) {
          await this.sendSectionWebhookNotification(section.form_id, id, data, section.section);
        }
        
        // Check if this was the last section to be completed
        const { data: sections } = await this.supabase
          .from('form_sections')
          .select('status')
          .eq('form_id', section.form_id);
        
        const allSectionsCompleted = sections && sections.every(s => s.status === 'completed');
        
        // If all sections are completed, update the form status and send a form completion webhook if enabled
        if (allSectionsCompleted) {
          // Update form status to completed
          await this.supabase
            .from('forms')
            .update({ 
              status: 'completed',
              progress: 100
            })
            .eq('id', section.form_id);
          
          // Send form completion webhook if enabled
          if (settings.webhookEnabled && settings.notifyOnFormCompletion) {
            await this.sendFormCompletionWebhookNotification(section.form_id);
          }
        }
      }
    } catch (error) {
      console.error('Error handling section completion:', error);
      // Don't throw the error here, as we don't want to fail the section update
    }
  }

  async getSections(formId: number): Promise<FormSection[]> {
    const { data, error } = await this.supabase
      .from('form_sections')
      .select('*')
      .eq('form_id', formId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Webhook operations - updated for system-wide settings
  async getWebhookSettings(): Promise<SystemSettings> {
    // Always get the first record (we only have one)
    const { data, error } = await this.supabase
      .from('system_settings')
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle(); // Use maybeSingle() to handle no-row case gracefully

    // If there's an error (and it's not a PostgREST error for no rows, though maybeSingle handles that)
    if (error) {
      console.error("Error fetching webhook settings:", error);
      // Fallback to default settings on error to prevent downstream issues
      return {
        id: 0, // Or handle ID appropriately if it needs to be valid/non-default
        webhookUrl: null, // Or ""
        webhookEnabled: false,
        webhookSecret: null, // Or ""
        notifyOnSectionCompletion: false,
        notifyOnFormCompletion: true, // Default as per schema
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // If no data is returned (e.g., table is empty), return default settings
    if (!data) {
      return {
        id: 0, // Or handle ID appropriately
        webhookUrl: null,
        webhookEnabled: false,
        webhookSecret: null,
        notifyOnSectionCompletion: false,
        notifyOnFormCompletion: true,
        createdAt: new Date(), // These might not be strictly necessary for GET but good for consistency
        updatedAt: new Date(),
      };
    }

    return data;
  }

  async updateWebhookSettings(settings: Partial<Omit<SystemSettings, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const { data: existingSettings, error: fetchError } = await this.supabase
      .from('system_settings')
      .select('id')
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching existing settings for update:", fetchError);
      throw fetchError; // Propagate error if fetching fails
    }

    const dataToUpsert = {
      webhookUrl: settings.webhookUrl === undefined ? null : settings.webhookUrl,
      webhookEnabled: settings.webhookEnabled === undefined ? false : settings.webhookEnabled,
      webhookSecret: settings.webhookSecret === undefined ? null : settings.webhookSecret,
      notifyOnSectionCompletion: settings.notifyOnSectionCompletion === undefined ? false : settings.notifyOnSectionCompletion,
      notifyOnFormCompletion: settings.notifyOnFormCompletion === undefined ? true : settings.notifyOnFormCompletion,
      updated_at: new Date().toISOString(),
    };

    if (!existingSettings) {
      // If no settings exist, create a new record with all fields, applying defaults
      const { error: insertError } = await this.supabase
        .from('system_settings')
        .insert({
          ...dataToUpsert,
          // Default values for fields not in settings, if any, can be added here
          // or rely on database defaults if defined in schema
        });

      if (insertError) {
        console.error("Error inserting new webhook settings:", insertError);
        throw insertError;
      }
    } else {
      // Update the existing record, only setting fields that are explicitly passed in settings
      // However, our dataToUpsert is now complete with defaults for undefined optional fields
      const { error: updateError } = await this.supabase
        .from('system_settings')
        .update(dataToUpsert) // Use the prepared object
        .eq('id', existingSettings.id);

      if (updateError) {
        console.error("Error updating webhook settings:", updateError);
        throw updateError;
      }
    }
  }

  async generateWebhookSecret(): Promise<string> {
    return crypto.randomBytes(32).toString('hex');
  }

  async sendWebhookNotification(formId: number, data: any): Promise<boolean> {
    return this.sendSubmissionWebhookNotification(formId, data);
  }

  // Send webhook notification for section completion
  async sendSectionWebhookNotification(formId: number, sectionId: number, sectionData: any, sectionName: string): Promise<boolean> {
    try {
      // Get the global webhook settings
      const { data: settings, error } = await this.supabase
        .from('system_settings')
        .select('webhook_url, webhook_enabled, webhook_secret, notify_on_section_completion')
        .order('id', { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;
      
      // If webhook is not enabled or URL is not set or section notifications are disabled, skip
      if (!settings.webhook_enabled || !settings.webhook_url || !settings.notify_on_section_completion) {
        return false;
      }

      // Get form details to include in the payload
      const form = await this.getForm(formId);
      
      // Prepare the payload
      const payload = {
        event: 'section_completion',
        form_id: formId,
        form_name: form?.clientName || 'Unknown',
        client_email: form?.clientEmail || 'Unknown',
        section_id: sectionId,
        section_name: sectionName,
        data: sectionData,
        timestamp: new Date().toISOString()
      };

      // Generate signature if secret is available
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (settings.webhook_secret) {
        const signature = crypto
          .createHmac('sha256', settings.webhook_secret)
          .update(JSON.stringify(payload))
          .digest('hex');
        
        headers['X-Webhook-Signature'] = signature;
      }

      // Send the webhook
      await axios.post(settings.webhook_url, payload, { headers });
      return true;
    } catch (error) {
      console.error('Error sending section webhook notification:', error);
      return false;
    }
  }

  // Send webhook notification for form completion with all sections
  async sendFormCompletionWebhookNotification(formId: number): Promise<boolean> {
    try {
      // Get the global webhook settings
      const { data: settings, error } = await this.supabase
        .from('system_settings')
        .select('webhook_url, webhook_enabled, webhook_secret, notify_on_form_completion')
        .order('id', { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;
      
      // If webhook is not enabled or URL is not set or form notifications are disabled, skip
      if (!settings.webhook_enabled || !settings.webhook_url || !settings.notify_on_form_completion) {
        return false;
      }

      // Get form details
      const form = await this.getForm(formId);
      if (!form) return false;
      
      // Get all sections for this form
      const sections = await this.getSections(formId);
      
      // Prepare the payload with all section data
      const payload = {
        event: 'form_completion',
        form_id: formId,
        form_name: form.clientName,
        client_email: form.clientEmail,
        form_data: form.data || {},
        sections: sections.map(section => ({
          section_id: section.id,
          section_name: section.section,
          data: section.data || {}
        })),
        timestamp: new Date().toISOString()
      };

      // Generate signature if secret is available
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (settings.webhook_secret) {
        const signature = crypto
          .createHmac('sha256', settings.webhook_secret)
          .update(JSON.stringify(payload))
          .digest('hex');
        
        headers['X-Webhook-Signature'] = signature;
      }

      // Send the webhook
      await axios.post(settings.webhook_url, payload, { headers });
      return true;
    } catch (error) {
      console.error('Error sending form completion webhook notification:', error);
      return false;
    }
  }

  // Original sendWebhookNotification renamed to sendSubmissionWebhookNotification for clarity
  async sendSubmissionWebhookNotification(formId: number, data: any): Promise<boolean> {
    try {
      // Get the global webhook settings
      const { data: settings, error } = await this.supabase
        .from('system_settings')
        .select('webhook_url, webhook_enabled, webhook_secret')
        .order('id', { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;
      
      // If webhook is not enabled or URL is not set, skip
      if (!settings.webhook_enabled || !settings.webhook_url) {
        return false;
      }

      // Get form details to include in the payload
      const form = await this.getForm(formId);
      
      // Prepare the payload
      const payload = {
        event: 'form_submission',
        form_id: formId,
        form_name: form?.clientName || 'Unknown',
        client_email: form?.clientEmail || 'Unknown',
        data,
        timestamp: new Date().toISOString()
      };

      // Generate signature if secret is available
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (settings.webhook_secret) {
        const signature = crypto
          .createHmac('sha256', settings.webhook_secret)
          .update(JSON.stringify(payload))
          .digest('hex');
        
        headers['X-Webhook-Signature'] = signature;
      }

      // Send the webhook
      await axios.post(settings.webhook_url, payload, { headers });
      return true;
    } catch (error) {
      console.error('Error sending submission webhook notification:', error);
      return false;
    }
  }

  // Form submission operations
  async createSubmission(submission: InsertFormSubmission): Promise<FormSubmission> {
    const { data, error } = await this.supabase
      .from('form_submissions')
      .insert(submission)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSubmissions(formId: number): Promise<FormSubmission[]> {
    const { data, error } = await this.supabase
      .from('form_submissions')
      .select('*')
      .eq('form_id', formId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getAllSubmissions(): Promise<FormSubmission[]> {
    const { data, error } = await this.supabase
      .from('form_submissions')
      .select('*, forms(client_name, client_email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // New method to send form.updated webhook notifications
  async sendFormUpdatedWebhookNotification(formId: number, newData: any, oldData: any): Promise<boolean> {
    try {
      // Get the global webhook settings
      const { data: settings, error } = await this.supabase
        .from('system_settings')
        .select('webhook_url, webhook_enabled, webhook_secret')
        .order('id', { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;
      
      // If webhook is not enabled or URL is not set, skip
      if (!settings.webhook_enabled || !settings.webhook_url) {
        return false;
      }

      // Prepare the payload
      const payload = {
        event: 'form_updated',
        form_id: formId,
        new_data: newData,
        old_data: oldData,
        timestamp: new Date().toISOString()
      };

      // Generate signature if secret is available
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (settings.webhook_secret) {
        const signature = crypto
          .createHmac('sha256', settings.webhook_secret)
          .update(JSON.stringify(payload))
          .digest('hex');
        
        headers['X-Webhook-Signature'] = signature;
      }

      // Send the webhook
      await axios.post(settings.webhook_url, payload, { headers });
      return true;
    } catch (error) {
      console.error('Error sending form.updated webhook notification:', error);
      return false;
    }
  }
}

// Export the Supabase storage instance
export const storage = new SupabaseStorage();
