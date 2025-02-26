import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
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

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type OnboardingForm = typeof onboardingForms.$inferSelect;
export type InsertForm = z.infer<typeof insertFormSchema>;

export type FormSection = typeof formSections.$inferSelect;
export type InsertSection = z.infer<typeof insertSectionSchema>;

// Form validation schemas
export const businessDetailsSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  type: z.string().min(1, "Please select a business type"),
  website: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  phone: z.string().regex(/^(\+\d{1,3}\s?)?(\(\d{3}\)\s?\d{3}-\d{4}|\d{10})$/),
  location: z.string().min(3, "Location must be at least 3 characters"),
});

export type BusinessDetails = z.infer<typeof businessDetailsSchema>;
