import { type User, type InsertUser, type OnboardingForm, type InsertForm, type FormSection, type InsertSection, type IStorage } from "./types";
import { createClient } from '@supabase/supabase-js';

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
    const { error } = await this.supabase
      .from('forms')
      .update({ data })
      .eq('id', id);

    if (error) throw error;
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
      .update({ data })
      .eq('id', id);

    if (error) throw error;
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
}

// Export the Supabase storage instance
export const storage = new SupabaseStorage();
