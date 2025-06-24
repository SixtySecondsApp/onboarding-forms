import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFormSchema, insertSectionSchema, businessDetailsSchema, webhookSettingsSchema, insertFormSubmissionSchema, type SystemSettings } from "@shared/schema";
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
      const settings = await storage.getWebhookSettings(); // This now returns a full SystemSettings object or defaults
      
      // Return the webhook settings, ensuring url and secret are strings for the client
      res.json({
        webhookUrl: settings.webhookUrl || "",
        webhookEnabled: settings.webhookEnabled === null ? false : settings.webhookEnabled, // handle null from DB if not set by new defaults yet
        webhookSecret: settings.webhookSecret || "",
        notifyOnSectionCompletion: settings.notifyOnSectionCompletion === null ? false : settings.notifyOnSectionCompletion,
        notifyOnFormCompletion: settings.notifyOnFormCompletion === null ? true : settings.notifyOnFormCompletion,
      });
    } catch (error) {
      // The storage.getWebhookSettings should ideally not throw anymore if it returns defaults on error.
      // However, if it does due to an unexpected issue, this catch block will handle it.
      console.error("Error in /api/webhook-settings GET route:", error);
      res.status(500).json({ error: "Internal server error retrieving webhook settings" });
    }
  });

  app.post("/api/webhook-settings", async (req, res) => {
    try {
      // Validate incoming data. Schema allows optional webhookSecret.
      const validatedSettings = webhookSettingsSchema.parse(req.body);
      let finalSettings: Partial<Omit<SystemSettings, 'id' | 'createdAt' | 'updatedAt'>> = {
        webhookUrl: validatedSettings.webhookUrl,
        webhookEnabled: validatedSettings.webhookEnabled,
        // webhookSecret is optional, pass it if present, otherwise storage will handle default (null)
        notifyOnSectionCompletion: validatedSettings.notifyOnSectionCompletion,
        notifyOnFormCompletion: validatedSettings.notifyOnFormCompletion,
      };

      if (validatedSettings.webhookSecret !== undefined) {
        finalSettings.webhookSecret = validatedSettings.webhookSecret;
      }
      
      // Generate a new secret if requested, overriding any secret from body
      if (req.query.generateSecret === "true") {
        finalSettings.webhookSecret = await storage.generateWebhookSecret();
      }
      
      await storage.updateWebhookSettings(finalSettings);
      
      // Return the state as it should be in the DB (secret might be null)
      // The client expects strings, so convert nulls to empty strings for url/secret here.
      const currentSettings = await storage.getWebhookSettings();
      res.json({
        success: true,
        webhookUrl: currentSettings.webhookUrl || "",
        webhookEnabled: currentSettings.webhookEnabled || false,
        webhookSecret: currentSettings.webhookSecret || "",
        notifyOnSectionCompletion: currentSettings.notifyOnSectionCompletion || false,
        notifyOnFormCompletion: currentSettings.notifyOnFormCompletion === null ? true : currentSettings.notifyOnFormCompletion,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        console.error("Error in /api/webhook-settings POST route:", error);
        res.status(500).json({ error: "Internal server error updating webhook settings" });
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
      if (submissionData.formId) {
        await storage.sendWebhookNotification(submissionData.formId, submissionData.submissionData);
      }
      
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

  app.post("/api/forms/:id/complete", async (req, res) => {
    try {
      const formIdParam = req.params.id;
      // The existing storage implementation expects a number ID. If your IDs are UUIDs
      // you can remove the parseInt call below. For now we keep the original behaviour
      // for consistency with the rest of the codebase.
      const formId = parseInt(formIdParam, 10);

      if (Number.isNaN(formId)) {
        res.status(400).json({ error: "Invalid form id" });
        return;
      }

      const success = await storage.sendFormCompletionWebhookNotification(formId);

      if (!success) {
        // The webhook call can legitimately return false (e.g. disabled). We still
        // return 200 to the client but include the success flag for transparency.
        res.json({ success: false, message: "Webhook not sent (disabled or mis-configured)." });
        return;
      }

      res.json({ success: true });
    } catch (error) {
      console.error("/api/forms/:id/complete error", error);
      res.status(500).json({ error: "Failed to trigger completion webhook" });
    }
  });

  // Webhook testing endpoints
  app.post("/api/webhook/test", async (req, res) => {
    try {
      const settings = await storage.getWebhookSettings();
      
      if (!settings.webhookEnabled || !settings.webhookUrl) {
        res.status(400).json({ error: "Webhook not configured or disabled" });
        return;
      }

      // Create a test payload
      const testPayload = {
        event: 'webhook.test',
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook from your onboarding forms system',
          test_id: Math.random().toString(36).substring(7)
        }
      };

      // Generate signature if secret is available
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (settings.webhookSecret) {
        const crypto = require('crypto');
        const signature = crypto
          .createHmac('sha256', settings.webhookSecret)
          .update(JSON.stringify(testPayload))
          .digest('hex');
        
        headers['X-Webhook-Signature'] = signature;
      }

      // Send the test webhook
      const axios = require('axios');
      await axios.post(settings.webhookUrl, testPayload, { 
        headers,
        timeout: 10000 // 10 second timeout
      });

      res.json({ success: true, message: "Test webhook sent successfully" });
    } catch (error) {
      console.error("Webhook test error:", error);
      res.status(500).json({ 
        error: "Failed to send test webhook", 
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Test form.updated webhook
  app.post("/api/webhook/test-form-updated/:id", async (req, res) => {
    try {
      const formId = parseInt(req.params.id, 10);
      
      if (Number.isNaN(formId)) {
        res.status(400).json({ error: "Invalid form id" });
        return;
      }

      const form = await storage.getForm(formId);
      if (!form) {
        res.status(404).json({ error: "Form not found" });
        return;
      }

      // Create mock old and new data for testing
      const oldData = form.data || {};
      const newData = {
        ...oldData,
        testUpdate: {
          timestamp: new Date().toISOString(),
          message: "This is a test form.updated webhook"
        }
      };

      const success = await storage.sendFormUpdatedWebhookNotification(formId, newData, oldData);

      if (!success) {
        res.json({ success: false, message: "Webhook not sent (disabled or mis-configured)." });
        return;
      }

      res.json({ success: true, message: "Test form.updated webhook sent successfully" });
    } catch (error) {
      console.error("Form updated webhook test error:", error);
      res.status(500).json({ 
        error: "Failed to send test form.updated webhook", 
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update form data endpoint with webhook trigger
  app.patch("/api/forms/:id/data", async (req, res) => {
    try {
      const formId = parseInt(req.params.id, 10);
      
      if (Number.isNaN(formId)) {
        res.status(400).json({ error: "Invalid form id" });
        return;
      }

      const data = req.body;
      await storage.updateFormData(formId, data);
      
      res.json({ success: true, message: "Form data updated successfully" });
    } catch (error) {
      console.error("Form data update error:", error);
      res.status(500).json({ 
        error: "Failed to update form data", 
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
