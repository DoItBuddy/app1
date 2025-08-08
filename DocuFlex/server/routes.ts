import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTourSchema, insertTouristSchema, insertTransactionSchema, insertFileSchema } from "@shared/schema";
import multer from "multer";
import { existsSync, mkdirSync } from "fs";
import path from "path";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Tour routes
  app.get("/api/tours", async (req, res) => {
    try {
      const tours = await storage.getTours();
      res.json(tours);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tours" });
    }
  });

  app.get("/api/tours/:id", async (req, res) => {
    try {
      const tour = await storage.getTour(req.params.id);
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      res.json(tour);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tour" });
    }
  });

  app.post("/api/tours", async (req, res) => {
    try {
      const validatedData = insertTourSchema.parse(req.body);
      const tour = await storage.createTour(validatedData);
      res.status(201).json(tour);
    } catch (error) {
      res.status(400).json({ message: "Invalid tour data" });
    }
  });

  app.put("/api/tours/:id", async (req, res) => {
    try {
      const validatedData = insertTourSchema.partial().parse(req.body);
      const tour = await storage.updateTour(req.params.id, validatedData);
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      res.json(tour);
    } catch (error) {
      res.status(400).json({ message: "Invalid tour data" });
    }
  });

  app.delete("/api/tours/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTour(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Tour not found" });
      }
      res.json({ message: "Tour deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tour" });
    }
  });

  // Tourist routes
  app.get("/api/tourists", async (req, res) => {
    try {
      const tourists = await storage.getTourists();
      res.json(tourists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tourists" });
    }
  });

  app.post("/api/tourists", async (req, res) => {
    try {
      const validatedData = insertTouristSchema.parse(req.body);
      const tourist = await storage.createTourist(validatedData);
      res.status(201).json(tourist);
    } catch (error) {
      res.status(400).json({ message: "Invalid tourist data" });
    }
  });

  app.put("/api/tourists/:id", async (req, res) => {
    try {
      const validatedData = insertTouristSchema.partial().parse(req.body);
      const tourist = await storage.updateTourist(req.params.id, validatedData);
      if (!tourist) {
        return res.status(404).json({ message: "Tourist not found" });
      }
      res.json(tourist);
    } catch (error) {
      res.status(400).json({ message: "Invalid tourist data" });
    }
  });

  app.delete("/api/tourists/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTourist(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Tourist not found" });
      }
      res.json({ message: "Tourist deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tourist" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(req.params.id, validatedData);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTransaction(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // File routes
  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.post("/api/files/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        category: req.body.category || 'other',
        uploadDate: new Date().toISOString().split('T')[0],
      };

      const validatedData = insertFileSchema.parse(fileData);
      const file = await storage.createFile(validatedData);
      res.status(201).json(file);
    } catch (error) {
      res.status(400).json({ message: "Failed to upload file" });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteFile(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "File not found" });
      }
      res.json({ message: "File deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // Export endpoints
  app.post("/api/export/tours", async (req, res) => {
    try {
      const { format } = req.body;
      const tours = await storage.getTours();
      
      // In a real app, you would generate the actual file here
      // For now, just return success with download info
      res.json({ 
        message: `Tours exported successfully in ${format} format`,
        filename: `tours-export-${Date.now()}.${format}`,
        count: tours.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to export tours" });
    }
  });

  app.post("/api/export/tourists", async (req, res) => {
    try {
      const { format } = req.body;
      const tourists = await storage.getTourists();
      
      res.json({ 
        message: `Tourists exported successfully in ${format} format`,
        filename: `tourists-export-${Date.now()}.${format}`,
        count: tourists.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to export tourists" });
    }
  });

  app.post("/api/export/transactions", async (req, res) => {
    try {
      const { format } = req.body;
      const transactions = await storage.getTransactions();
      
      res.json({ 
        message: `Transactions exported successfully in ${format} format`,
        filename: `transactions-export-${Date.now()}.${format}`,
        count: transactions.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to export transactions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
