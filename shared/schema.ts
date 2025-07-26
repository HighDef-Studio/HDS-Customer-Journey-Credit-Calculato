import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const calculations = pgTable("calculations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  creditRates: jsonb("credit_rates").notNull(),
  selectedStages: jsonb("selected_stages").notNull(),
  messageTypes: jsonb("message_types").notNull(),
  totalCredits: jsonb("total_credits").notNull(),
});

export const insertCalculationSchema = createInsertSchema(calculations).omit({
  id: true,
});

export type InsertCalculation = z.infer<typeof insertCalculationSchema>;
export type Calculation = typeof calculations.$inferSelect;

// Journey Stage types
export const journeyStageSchema = z.object({
  id: z.string(),
  name: z.string(),
  selected: z.boolean().default(false),
});

export const messageTypeSchema = z.object({
  id: z.string(),
  journeyStageId: z.string(),
  type: z.string(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
  selected: z.boolean().default(false),
  channels: z.object({
    sms: z.object({
      enabled: z.boolean().default(false),
      audienceSize: z.number().min(0).default(0),
    }),
    email: z.object({
      enabled: z.boolean().default(false),
      audienceSize: z.number().min(0).default(0),
    }),
    push: z.object({
      enabled: z.boolean().default(false),
      audienceSize: z.number().min(0).default(0),
    }),
  }),
  credits: z.object({
    sms: z.number().min(0),
    email: z.number().min(0),
    push: z.number().min(0),
  }),
});

export const creditRatesSchema = z.object({
  sms: z.number().min(0),
  email: z.number().min(0),
  push: z.number().min(0),
});

export type JourneyStage = z.infer<typeof journeyStageSchema>;
export type MessageType = z.infer<typeof messageTypeSchema>;
export type CreditRates = z.infer<typeof creditRatesSchema>;
