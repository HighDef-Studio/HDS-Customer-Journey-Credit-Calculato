import { type Calculation, type InsertCalculation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getCalculation(id: string): Promise<Calculation | undefined>;
  createCalculation(calculation: InsertCalculation): Promise<Calculation>;
  getAllCalculations(): Promise<Calculation[]>;
  deleteCalculation(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private calculations: Map<string, Calculation>;

  constructor() {
    this.calculations = new Map();
  }

  async getCalculation(id: string): Promise<Calculation | undefined> {
    return this.calculations.get(id);
  }

  async createCalculation(insertCalculation: InsertCalculation): Promise<Calculation> {
    const id = randomUUID();
    const calculation: Calculation = { ...insertCalculation, id };
    this.calculations.set(id, calculation);
    return calculation;
  }

  async getAllCalculations(): Promise<Calculation[]> {
    return Array.from(this.calculations.values());
  }

  async deleteCalculation(id: string): Promise<boolean> {
    return this.calculations.delete(id);
  }
}

export const storage = new MemStorage();
