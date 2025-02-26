import { type User, type InsertUser, type OnboardingForm, type InsertForm, type FormSection, type InsertSection } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private forms: Map<number, OnboardingForm>;
  private sections: Map<number, FormSection>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.forms = new Map();
    this.sections = new Map();
    this.currentId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, createdAt: new Date(), isAdmin: false };
    this.users.set(id, user);
    return user;
  }

  // Form operations
  async createForm(insertForm: InsertForm): Promise<OnboardingForm> {
    const id = this.currentId++;
    const form: OnboardingForm = {
      ...insertForm,
      id,
      createdAt: new Date(),
      progress: 0,
      status: 'pending',
      data: {},
      lastReminder: null
    };
    this.forms.set(id, form);
    return form;
  }

  async getForm(id: number): Promise<OnboardingForm | undefined> {
    return this.forms.get(id);
  }

  async updateFormProgress(id: number, progress: number): Promise<void> {
    const form = this.forms.get(id);
    if (form) {
      this.forms.set(id, { ...form, progress });
    }
  }

  async updateFormData(id: number, data: any): Promise<void> {
    const form = this.forms.get(id);
    if (form) {
      this.forms.set(id, { ...form, data });
    }
  }

  async updateLastReminder(id: number): Promise<void> {
    const form = this.forms.get(id);
    if (form) {
      this.forms.set(id, { ...form, lastReminder: new Date() });
    }
  }

  async getForms(): Promise<OnboardingForm[]> {
    return Array.from(this.forms.values());
  }

  // Section operations
  async createSection(insertSection: InsertSection): Promise<FormSection> {
    const id = this.currentId++;
    const section: FormSection = {
      ...insertSection,
      id,
      updatedAt: new Date(),
      status: 'pending',
      data: {}
    };
    this.sections.set(id, section);
    return section;
  }

  async getSection(shareId: string): Promise<FormSection | undefined> {
    return Array.from(this.sections.values()).find(
      section => section.shareId === shareId
    );
  }

  async updateSectionData(id: number, data: any): Promise<void> {
    const section = this.sections.get(id);
    if (section) {
      this.sections.set(id, { ...section, data, updatedAt: new Date() });
    }
  }

  async getSections(formId: number): Promise<FormSection[]> {
    return Array.from(this.sections.values()).filter(
      section => section.formId === formId
    );
  }
}

export const storage = new MemStorage();
