import { type User, type InsertUser, type OnboardingForm, type InsertForm, type FormSection, type InsertSection, type FormSubmission, type InsertFormSubmission, type SystemSettings } from "@shared/schema";

export type { User, InsertUser, OnboardingForm, InsertForm, FormSection, InsertSection, FormSubmission, InsertFormSubmission, SystemSettings };

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Form operations  
  createForm(form: InsertForm): Promise<OnboardingForm>;
  getForm(id: number): Promise<OnboardingForm | undefined>;
  updateFormProgress(id: number, progress: number): Promise<void>;
  updateFormData(id: number, data: any): Promise<void>;
  updateLastReminder(id: number): Promise<void>;
  getForms(): Promise<OnboardingForm[]>;
  
  // Section operations
  createSection(section: InsertSection): Promise<FormSection>;
  getSection(shareId: string): Promise<FormSection | undefined>;
  updateSectionData(id: number, data: any): Promise<void>;
  getSections(formId: number): Promise<FormSection[]>;
  
  // Webhook operations - updated for system-wide settings
  getWebhookSettings(): Promise<SystemSettings>;
  updateWebhookSettings(settings: { 
    webhookUrl?: string, 
    webhookEnabled?: boolean, 
    webhookSecret?: string,
    notifyOnSectionCompletion?: boolean,
    notifyOnFormCompletion?: boolean
  }): Promise<void>;
  generateWebhookSecret(): Promise<string>;
  sendWebhookNotification(formId: number, data: any): Promise<boolean>;
  sendSubmissionWebhookNotification(formId: number, data: any): Promise<boolean>;
  sendSectionWebhookNotification(formId: number, sectionId: number, sectionData: any, sectionName: string): Promise<boolean>;
  sendFormCompletionWebhookNotification(formId: number): Promise<boolean>;
  sendFormUpdatedWebhookNotification(formId: number, newData: any, oldData: any): Promise<boolean>;
  
  // Form submission operations
  createSubmission(submission: InsertFormSubmission): Promise<FormSubmission>;
  getSubmissions(formId: number): Promise<FormSubmission[]>;
  getAllSubmissions(): Promise<FormSubmission[]>;
} 