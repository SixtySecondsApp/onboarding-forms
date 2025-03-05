import { supabase } from './supabase';
import { type BusinessDetails } from '@shared/schema';

export async function getFormData(formId: string) {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateFormData(formId: string, data: any) {
  const { error } = await supabase
    .from('forms')
    .update({ data })
    .eq('id', formId);

  if (error) throw error;
}

export async function getSectionData(sectionId: string) {
  const { data, error } = await supabase
    .from('form_sections')
    .select('*')
    .eq('share_id', sectionId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateSectionData(sectionId: string, data: BusinessDetails) {
  const { error } = await supabase
    .from('form_sections')
    .update({ data })
    .eq('share_id', sectionId);

  if (error) throw error;
} 