import { type Tour, type InsertTour, type Tourist, type InsertTourist, type Transaction, type InsertTransaction, type File, type InsertFile } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Tour methods
  getTours(): Promise<Tour[]>;
  getTour(id: string): Promise<Tour | undefined>;
  createTour(tour: InsertTour): Promise<Tour>;
  updateTour(id: string, tour: Partial<InsertTour>): Promise<Tour | undefined>;
  deleteTour(id: string): Promise<boolean>;

  // Tourist methods
  getTourists(): Promise<Tourist[]>;
  getTourist(id: string): Promise<Tourist | undefined>;
  createTourist(tourist: InsertTourist): Promise<Tourist>;
  updateTourist(id: string, tourist: Partial<InsertTourist>): Promise<Tourist | undefined>;
  deleteTourist(id: string): Promise<boolean>;

  // Transaction methods
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<boolean>;

  // File methods
  getFiles(): Promise<File[]>;
  getFile(id: string): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  deleteFile(id: string): Promise<boolean>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    activeTours: number;
    totalTourists: number;
    totalRevenue: number;
    netProfit: number;
  }>;
}

export class MemStorage implements IStorage {
  private tours: Map<string, Tour>;
  private tourists: Map<string, Tourist>;
  private transactions: Map<string, Transaction>;
  private files: Map<string, File>;

  constructor() {
    this.tours = new Map();
    this.tourists = new Map();
    this.transactions = new Map();
    this.files = new Map();
  }

  // Tour methods
  async getTours(): Promise<Tour[]> {
    return Array.from(this.tours.values());
  }

  async getTour(id: string): Promise<Tour | undefined> {
    return this.tours.get(id);
  }

  async createTour(insertTour: InsertTour): Promise<Tour> {
    const id = randomUUID();
    const tour: Tour = {
      ...insertTour,
      id,
      createdAt: new Date(),
    };
    this.tours.set(id, tour);
    return tour;
  }

  async updateTour(id: string, tourUpdate: Partial<InsertTour>): Promise<Tour | undefined> {
    const existingTour = this.tours.get(id);
    if (!existingTour) return undefined;

    const updatedTour = { ...existingTour, ...tourUpdate };
    this.tours.set(id, updatedTour);
    return updatedTour;
  }

  async deleteTour(id: string): Promise<boolean> {
    return this.tours.delete(id);
  }

  // Tourist methods
  async getTourists(): Promise<Tourist[]> {
    return Array.from(this.tourists.values());
  }

  async getTourist(id: string): Promise<Tourist | undefined> {
    return this.tourists.get(id);
  }

  async createTourist(insertTourist: InsertTourist): Promise<Tourist> {
    const id = randomUUID();
    const tourist: Tourist = {
      ...insertTourist,
      id,
      createdAt: new Date(),
    };
    this.tourists.set(id, tourist);
    return tourist;
  }

  async updateTourist(id: string, touristUpdate: Partial<InsertTourist>): Promise<Tourist | undefined> {
    const existingTourist = this.tourists.get(id);
    if (!existingTourist) return undefined;

    const updatedTourist = { ...existingTourist, ...touristUpdate };
    this.tourists.set(id, updatedTourist);
    return updatedTourist;
  }

  async deleteTourist(id: string): Promise<boolean> {
    return this.tourists.delete(id);
  }

  // Transaction methods
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, transactionUpdate: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const existingTransaction = this.transactions.get(id);
    if (!existingTransaction) return undefined;

    const updatedTransaction = { ...existingTransaction, ...transactionUpdate };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return this.transactions.delete(id);
  }

  // File methods
  async getFiles(): Promise<File[]> {
    return Array.from(this.files.values());
  }

  async getFile(id: string): Promise<File | undefined> {
    return this.files.get(id);
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = randomUUID();
    const file: File = {
      ...insertFile,
      id,
      createdAt: new Date(),
    };
    this.files.set(id, file);
    return file;
  }

  async deleteFile(id: string): Promise<boolean> {
    return this.files.delete(id);
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    activeTours: number;
    totalTourists: number;
    totalRevenue: number;
    netProfit: number;
  }> {
    const tours = await this.getTours();
    const tourists = await this.getTourists();
    const transactions = await this.getTransactions();

    const activeTours = tours.filter(tour => tour.status === 'active').length;
    const totalTourists = tourists.length;
    
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount as string), 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount as string), 0);

    return {
      activeTours,
      totalTourists,
      totalRevenue: income,
      netProfit: income - expenses,
    };
  }
}

export const storage = new MemStorage();
