import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const onboardingForms = pgTable("onboarding_forms", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  status: text("status").default("pending"),
  progress: integer("progress").default(0),
  data: jsonb("data"),
  createdAt: timestamp("created_at").defaultNow(),
  lastReminder: timestamp("last_reminder"),
  createdBy: integer("created_by").references(() => users.id),
});

export const formSections = pgTable("form_sections", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").references(() => onboardingForms.id),
  section: text("section").notNull(),
  shareId: text("share_id").notNull().unique(),
  status: text("status").default("pending"),
  data: jsonb("data"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const formSubmissions = pgTable("form_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id").references(() => onboardingForms.id),
  sectionId: uuid("section_id").references(() => formSections.id),
  clientIp: text("client_ip"),
  userAgent: text("user_agent"),
  submissionData: jsonb("submission_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  webhookUrl: text("webhook_url"),
  webhookEnabled: boolean("webhook_enabled").default(false),
  webhookSecret: text("webhook_secret"),
  notifyOnSectionCompletion: boolean("notify_on_section_completion").default(false),
  notifyOnFormCompletion: boolean("notify_on_form_completion").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertFormSchema = createInsertSchema(onboardingForms).omit({
  id: true,
  createdAt: true,
  lastReminder: true,
  progress: true,
  data: true
});

export const insertSectionSchema = createInsertSchema(formSections).omit({
  id: true,
  updatedAt: true
});

export const insertFormSubmissionSchema = createInsertSchema(formSubmissions).omit({
  id: true,
  createdAt: true
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type OnboardingForm = typeof onboardingForms.$inferSelect;
export type InsertForm = z.infer<typeof insertFormSchema>;

export type FormSection = typeof formSections.$inferSelect;
export type InsertSection = z.infer<typeof insertSectionSchema>;

export type FormSubmission = typeof formSubmissions.$inferSelect;
export type InsertFormSubmission = z.infer<typeof insertFormSubmissionSchema>;

export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;

// Form validation schemas
export const businessDetailsSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  type: z.string().min(1, "Please select a business type"),
  website: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  phone: z.string().regex(/^(\+\d{1,3}\s?)?(\(\d{3}\)\s?\d{3}-\d{4}|\d{10})$/),
  location: z.string().min(3, "Location must be at least 3 characters"),
});

export const targetAudienceSchema = z.object({
  jobTitles: z.array(z.string()),
  industries: z.array(z.string()),
  companySizes: z.array(z.string()),
  locations: z.array(z.string()),
});

export const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  objective: z.string().min(1, "Campaign objective is required"),
  startDate: z.string(),
  endDate: z.string(),
  keyMessages: z.array(z.string()),
  callToAction: z.string(),
});


export const typographySchema = z.object({
  mainTitleFont: z.string(),
  subtitleFont: z.string(),
  bodyTextFont: z.string(),
});

export const brandAssetsSchema = z.object({
  brandName: z.string(),
  logoUrl: z.string().optional(),
  mainColor: z.string(),
  secondaryColor: z.string(),
  highlightColor: z.string(),
});

export const systemIntegrationSchema = z.object({
  crmSystem: z.string(),
  crmInstance: z.string().optional(),
  crmAccess: z.string().optional(),
  calendarSystem: z.string().optional(),
  calendarTool: z.string().optional(),
  leadCaptureProcess: z.string().optional(),
  statusChanges: z.string().optional(),
  notifications: z.string().optional(),
  otherFeatures: z.string().optional(),
});

export type BusinessDetails = z.infer<typeof businessDetailsSchema>;
export type TargetAudience = z.infer<typeof targetAudienceSchema>;
export type Campaign = z.infer<typeof campaignSchema>;
export type Typography = z.infer<typeof typographySchema>;
export type BrandAssets = z.infer<typeof brandAssetsSchema>;
export type SystemIntegration = z.infer<typeof systemIntegrationSchema>;

// Webhook settings validation schema
export const webhookSettingsSchema = z.object({
  webhookUrl: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  webhookEnabled: z.boolean().default(false),
  webhookSecret: z.string().optional().or(z.literal('')),
  notifyOnSectionCompletion: z.boolean().default(false),
  notifyOnFormCompletion: z.boolean().default(true),
});

export type WebhookSettings = z.infer<typeof webhookSettingsSchema>;