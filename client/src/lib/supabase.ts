import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { generateUniqueSlug } from './utils';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export type Form = {
  id: string;
  client_name: string;
  client_email: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed';
  data: Record<string, any>;
  last_reminder: string | null;
  created_at: string;
  updated_at: string;
  slug: string;
  created_by?: string;
}

export type InsertForm = Omit<Form, 'id' | 'created_at' | 'updated_at'>;

// Test user creation helper
export const createTestUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
};

// Helper functions for file storage
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) throw error;
  return data;
};

export const getFileUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
};

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper function to create a form
export const createForm = async (formData: Partial<InsertForm>) => {
  console.log('Creating form with data:', formData); // Debug log

  // Generate a unique slug from the client name
  const slug = formData.client_name 
    ? generateUniqueSlug(formData.client_name)
    : generateUniqueSlug('client');

  const { data, error } = await supabase
    .from('forms')
    .insert({
      client_name: formData.client_name,
      client_email: formData.client_email,
      progress: 0,
      status: 'pending',
      data: {},
      last_reminder: null,
      slug
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error); // Debug log
    throw error;
  }

  return data;
};

// Helper function to get all forms
export const getForms = async () => {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Helper function to update form
export const updateForm = async (id: string, formData: Partial<Form>) => {
  const { data, error } = await supabase
    .from('forms')
    .update(formData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};


// Helper function to update form data
export const updateFormData = async (formId: string, data: any) => {
  const { error } = await supabase
    .from('forms')
    .update({ data })
    .eq('id', formId);

  if (error) throw error;
};

// Helper function to get form data
export const getFormData = async (formId: string) => {
  try {
    console.log("getFormData called with ID:", formId);
    
    // First, try to get the form without using .single()
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId);

    if (error) {
      console.error("Error fetching form data:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error("No form found with ID:", formId);
      throw new Error("Form not found");
    }

    // If multiple rows are returned, use the first one
    console.log("Form data found:", data[0]);
    return data[0];
  } catch (error) {
    console.error("Error in getFormData:", error);
    throw error;
  }
};

// Helper function to create a form section
export const createFormSection = async (sectionData: any) => {
  const { data, error } = await supabase
    .from('form_sections')
    .insert(sectionData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Helper function to update section data
export const updateSectionData = async (sectionId: string, data: any) => {
  const { error } = await supabase
    .from('form_sections')
    .update({ data })
    .eq('id', sectionId);

  if (error) throw error;
};

// Helper function to get section data
export const getSectionData = async (sectionId: string) => {
  try {
    console.log("Fetching section data for ID:", sectionId);
    
    // First, try to get the section without using .single()
    const { data, error } = await supabase
      .from('form_sections')
      .select('*')
      .eq('id', sectionId);

    if (error) {
      console.error("Error fetching section data:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error("No section found with ID:", sectionId);
      throw new Error("Section not found");
    }

    // If multiple rows are returned, use the first one
    console.log("Section data found:", data[0]);
    return data[0];
  } catch (error) {
    console.error("Error in getSectionData:", error);
    throw error;
  }
};

// Helper function to get form by slug
export const getFormBySlug = async (slug: string) => {
  try {
    console.log("getFormBySlug called with slug:", slug);
    
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('slug', slug);

    if (error) {
      console.error("Error fetching form data by slug:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error("No form found with slug:", slug);
      throw new Error("Form not found");
    }

    // If multiple rows are returned, use the first one
    console.log("Form data found by slug:", data[0]);
    return data[0];
  } catch (error) {
    console.error("Error in getFormBySlug:", error);
    throw error;
  }
};