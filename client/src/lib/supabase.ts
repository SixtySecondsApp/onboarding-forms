import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Remove any trailing slashes from the URL
const cleanUrl = supabaseUrl.replace(/\/$/, '');

export const supabase = createClient(cleanUrl, supabaseAnonKey);

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

// Helper function to create a new form
export const createForm = async (formData: any) => {
  const { data, error } = await supabase
    .from('forms')
    .insert(formData)
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
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .single();

  if (error) throw error;
  return data;
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
  const { data, error } = await supabase
    .from('form_sections')
    .select('*')
    .eq('id', sectionId)
    .single();

  if (error) throw error;
  return data;
};