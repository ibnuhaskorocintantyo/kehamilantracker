import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fromZodError } from "zod-validation-error";
import {
  insertUserSchema,
  insertCycleSchema,
  insertFertilityDataSchema,
  insertAppointmentSchema,
  insertJournalEntrySchema,
  insertHealthDataSchema,
  insertResourceSchema,
  insertMedicalRecordSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // All routes are prefixed with /api
  
  // User routes
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const validationResult = insertUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error);
        return res.status(400).json({ error: errorMessage.message });
      }
      
      const user = await storage.createUser(req.body);
      return res.status(201).json(user);
    } catch (error) {
      return res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const user = await storage.updateUser(userId, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Cycle routes
  app.get("/api/users/:userId/cycles", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const cycles = await storage.getCycles(userId);
      return res.json(cycles);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch cycles" });
    }
  });

  app.post("/api/cycles", async (req: Request, res: Response) => {
    try {
      const validationResult = insertCycleSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error);
        return res.status(400).json({ error: errorMessage.message });
      }
      
      const cycle = await storage.createCycle(req.body);
      return res.status(201).json(cycle);
    } catch (error) {
      return res.status(500).json({ error: "Failed to create cycle" });
    }
  });

  app.get("/api/cycles/:id", async (req: Request, res: Response) => {
    try {
      const cycleId = parseInt(req.params.id);
      if (isNaN(cycleId)) {
        return res.status(400).json({ error: "Invalid cycle ID" });
      }
      
      const cycle = await storage.getCycle(cycleId);
      if (!cycle) {
        return res.status(404).json({ error: "Cycle not found" });
      }
      
      return res.json(cycle);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch cycle" });
    }
  });

  app.patch("/api/cycles/:id", async (req: Request, res: Response) => {
    try {
      const cycleId = parseInt(req.params.id);
      if (isNaN(cycleId)) {
        return res.status(400).json({ error: "Invalid cycle ID" });
      }
      
      const cycle = await storage.updateCycle(cycleId, req.body);
      if (!cycle) {
        return res.status(404).json({ error: "Cycle not found" });
      }
      
      return res.json(cycle);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update cycle" });
    }
  });

  app.delete("/api/cycles/:id", async (req: Request, res: Response) => {
    try {
      const cycleId = parseInt(req.params.id);
      if (isNaN(cycleId)) {
        return res.status(400).json({ error: "Invalid cycle ID" });
      }
      
      const success = await storage.deleteCycle(cycleId);
      if (!success) {
        return res.status(404).json({ error: "Cycle not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete cycle" });
    }
  });

  // Fertility data routes
  app.get("/api/users/:userId/fertility-data", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const data = await storage.getFertilityData(userId);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch fertility data" });
    }
  });

  app.post("/api/fertility-data", async (req: Request, res: Response) => {
    try {
      const validationResult = insertFertilityDataSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error);
        return res.status(400).json({ error: errorMessage.message });
      }
      
      const data = await storage.createFertilityData(req.body);
      return res.status(201).json(data);
    } catch (error) {
      return res.status(500).json({ error: "Failed to create fertility data" });
    }
  });

  // Appointment routes
  app.get("/api/users/:userId/appointments", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const appointments = await storage.getAppointments(userId);
      return res.json(appointments);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", async (req: Request, res: Response) => {
    try {
      const validationResult = insertAppointmentSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error);
        return res.status(400).json({ error: errorMessage.message });
      }
      
      const appointment = await storage.createAppointment(req.body);
      return res.status(201).json(appointment);
    } catch (error) {
      return res.status(500).json({ error: "Failed to create appointment" });
    }
  });

  app.patch("/api/appointments/:id", async (req: Request, res: Response) => {
    try {
      const appointmentId = parseInt(req.params.id);
      if (isNaN(appointmentId)) {
        return res.status(400).json({ error: "Invalid appointment ID" });
      }
      
      const appointment = await storage.updateAppointment(appointmentId, req.body);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      
      return res.json(appointment);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update appointment" });
    }
  });

  app.delete("/api/appointments/:id", async (req: Request, res: Response) => {
    try {
      const appointmentId = parseInt(req.params.id);
      if (isNaN(appointmentId)) {
        return res.status(400).json({ error: "Invalid appointment ID" });
      }
      
      const success = await storage.deleteAppointment(appointmentId);
      if (!success) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete appointment" });
    }
  });

  // Journal entry routes
  app.get("/api/users/:userId/journal-entries", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const entries = await storage.getJournalEntries(userId);
      return res.json(entries);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });

  app.post("/api/journal-entries", async (req: Request, res: Response) => {
    try {
      const validationResult = insertJournalEntrySchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error);
        return res.status(400).json({ error: errorMessage.message });
      }
      
      const entry = await storage.createJournalEntry(req.body);
      return res.status(201).json(entry);
    } catch (error) {
      return res.status(500).json({ error: "Failed to create journal entry" });
    }
  });

  app.patch("/api/journal-entries/:id", async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      if (isNaN(entryId)) {
        return res.status(400).json({ error: "Invalid journal entry ID" });
      }
      
      const entry = await storage.updateJournalEntry(entryId, req.body);
      if (!entry) {
        return res.status(404).json({ error: "Journal entry not found" });
      }
      
      return res.json(entry);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update journal entry" });
    }
  });

  app.delete("/api/journal-entries/:id", async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      if (isNaN(entryId)) {
        return res.status(400).json({ error: "Invalid journal entry ID" });
      }
      
      const success = await storage.deleteJournalEntry(entryId);
      if (!success) {
        return res.status(404).json({ error: "Journal entry not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete journal entry" });
    }
  });

  // Health data routes
  app.get("/api/users/:userId/health-data", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const data = await storage.getHealthData(userId);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch health data" });
    }
  });

  app.get("/api/users/:userId/health-data/:category", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const category = req.params.category;
      const data = await storage.getHealthDataByCategory(userId, category);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch health data" });
    }
  });

  app.post("/api/health-data", async (req: Request, res: Response) => {
    try {
      const validationResult = insertHealthDataSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error);
        return res.status(400).json({ error: errorMessage.message });
      }
      
      const data = await storage.createHealthData(req.body);
      return res.status(201).json(data);
    } catch (error) {
      return res.status(500).json({ error: "Failed to create health data" });
    }
  });

  // Resources routes
  app.get("/api/resources", async (_req: Request, res: Response) => {
    try {
      const resources = await storage.getResources();
      return res.json(resources);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch resources" });
    }
  });

  // Medical records routes
  app.get("/api/users/:userId/medical-records", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const records = await storage.getMedicalRecords(userId);
      return res.json(records);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch medical records" });
    }
  });

  app.post("/api/medical-records", async (req: Request, res: Response) => {
    try {
      const validationResult = insertMedicalRecordSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error);
        return res.status(400).json({ error: errorMessage.message });
      }
      
      const record = await storage.createMedicalRecord(req.body);
      return res.status(201).json(record);
    } catch (error) {
      return res.status(500).json({ error: "Failed to create medical record" });
    }
  });

  // Analyze document with OCR route
  app.post("/api/analyze-document", async (req: Request, res: Response) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Image data is required" });
      }
      
      // In a real implementation, this would use Tesseract.js to process the image
      // For demonstration, we'll return a simple success response
      return res.json({ 
        success: true, 
        text: "Extracted text would appear here in a real implementation" 
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to analyze document" });
    }
  });

  // Create the HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
