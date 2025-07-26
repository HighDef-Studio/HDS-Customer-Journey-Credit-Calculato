import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCalculationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all calculations
  app.get("/api/calculations", async (req, res) => {
    try {
      const calculations = await storage.getAllCalculations();
      res.json(calculations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calculations" });
    }
  });

  // Get a specific calculation
  app.get("/api/calculations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const calculation = await storage.getCalculation(id);
      
      if (!calculation) {
        return res.status(404).json({ message: "Calculation not found" });
      }
      
      res.json(calculation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calculation" });
    }
  });

  // Create a new calculation
  app.post("/api/calculations", async (req, res) => {
    try {
      const validatedData = insertCalculationSchema.parse(req.body);
      const calculation = await storage.createCalculation(validatedData);
      res.status(201).json(calculation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create calculation" });
      }
    }
  });

  // Delete a calculation
  app.delete("/api/calculations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCalculation(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Calculation not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete calculation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
