import { type User, type InsertUser, type OnboardingForm, type InsertForm, type FormSection, type InsertSection } from "@shared/schema";

export type { User, InsertUser, OnboardingForm, InsertForm, FormSection, InsertSection };

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
} 