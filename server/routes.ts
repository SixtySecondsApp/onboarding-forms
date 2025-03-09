import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFormSchema, insertSectionSchema, businessDetailsSchema, webhookSettingsSchema, insertFormSubmissionSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Form routes
  app.post("/api/forms", async (req, res) => {
    try {
      const formData = insertFormSchema.parse(req.body);
      const form = await storage.createForm(formData);
      res.json(form);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.get("/api/forms", async (req, res) => {
    try {
      const forms = await storage.getForms();
      res.json(forms);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/forms/:id", async (req, res) => {
    try {
      const form = await storage.getForm(parseInt(req.params.id));
      if (!form) {
        res.status(404).json({ error: "Form not found" });
        return;
      }
      res.json(form);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/forms/:id/progress", async (req, res) => {
    try {
      const progress = z.number().min(0).max(100).parse(req.body.progress);
      await storage.updateFormProgress(parseInt(req.params.id), progress);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Section routes
  app.post("/api/sections", async (req, res) => {
    try {
      const sectionData = insertSectionSchema.parse(req.body);
      const section = await storage.createSection(sectionData);
      res.json(section);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.get("/api/sections/:shareId", async (req, res) => {
    try {
      const section = await storage.getSection(req.params.shareId);
      if (!section) {
        res.status(404).json({ error: "Section not found" });
        return;
      }
      res.json(section);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/sections/:id/data", async (req, res) => {
    try {
      const data = businessDetailsSchema.parse(req.body);
      await storage.updateSectionData(parseInt(req.params.id), data);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.post("/api/forms/:id/reminder", async (req, res) => {
    try {
      await storage.updateLastReminder(parseInt(req.params.id));
      // Here we would integrate with an email service
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Webhook settings routes - updated for system-wide settings
  app.get("/api/webhook-settings", async (req, res) => {
    try {
      const settings = await storage.getWebhookSettings();
      
      // Return the webhook settings
      res.json({
        webhookUrl: settings.webhookUrl || "",
        webhookEnabled: settings.webhookEnabled || false,
        webhookSecret: settings.webhookSecret || ""
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/webhook-settings", async (req, res) => {
    try {
      const settings = webhookSettingsSchema.parse(req.body);
      
      // Generate a new secret if requested
      if (req.query.generateSecret === "true") {
        settings.webhookSecret = await storage.generateWebhookSecret();
      }
      
      await storage.updateWebhookSettings(settings);
      res.json({ success: true, ...settings });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Form submission routes
  app.post("/api/submissions", async (req, res) => {
    try {
      // Get client IP and user agent
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      
      // Parse and validate the submission data
      const submissionData = insertFormSubmissionSchema.parse({
        ...req.body,
        clientIp: clientIp?.toString(),
        userAgent
      });
      
      // Create the submission record
      const submission = await storage.createSubmission(submissionData);
      
      // Send webhook notification if enabled
      await storage.sendWebhookNotification(submissionData.formId, submissionData.submissionData);
      
      res.json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.get("/api/forms/:id/submissions", async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      const submissions = await storage.getSubmissions(formId);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // New endpoint to get all submissions across all forms
  app.get("/api/submissions", async (req, res) => {
    try {
      const submissions = await storage.getAllSubmissions();
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
