import { pgTable, text, serial, integer, date, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  pregnancyStatus: boolean("pregnancy_status").default(false),
  pregnancyWeek: integer("pregnancy_week"),
  dueDate: date("due_date"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  pregnancyStatus: true,
  pregnancyWeek: true,
  dueDate: true,
});

// Cycle model
export const cycles = pgTable("cycles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  cycleLength: integer("cycle_length"),
  periodLength: integer("period_length"),
});

export const insertCycleSchema = createInsertSchema(cycles).pick({
  userId: true,
  startDate: true,
  endDate: true,
  cycleLength: true,
  periodLength: true,
});

// Fertility data model
export const fertilityData = pgTable("fertility_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  basalBodyTemperature: text("basal_body_temperature"), // Store as text to preserve decimal precision
  cervicalMucus: text("cervical_mucus"), // e.g., dry, sticky, creamy, egg white
  ovulationTestResult: boolean("ovulation_test_result"),
  notes: text("notes"),
});

export const insertFertilityDataSchema = createInsertSchema(fertilityData).pick({
  userId: true,
  date: true,
  basalBodyTemperature: true,
  cervicalMucus: true,
  ovulationTestResult: true,
  notes: true,
});

// Appointments model
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  provider: text("provider"),
  date: date("date").notNull(),
  time: text("time").notNull(),
  location: text("location"),
  notes: text("notes"),
  completed: boolean("completed").default(false),
  type: text("type"), // e.g., OB-GYN, Ultrasound, Blood Test, Prenatal Yoga
  icon: text("icon").default("stethoscope-line"), // Default icon from Remix Icon
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  userId: true,
  title: true,
  provider: true,
  date: true,
  time: true,
  location: true,
  notes: true,
  completed: true,
  type: true,
  icon: true,
});

// Journal entries model
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  date: date("date").notNull(),
  image: text("image"), // Store image URL or path
  entryType: text("entry_type").default("note"), // note, photo, milestone, etc.
  pregnancyWeek: integer("pregnancy_week"),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  userId: true,
  title: true,
  content: true,
  date: true,
  image: true,
  entryType: true,
  pregnancyWeek: true,
});

// Health data model
export const healthData = pgTable("health_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  category: text("category").notNull(), // hydration, sleep, exercise, nutrition
  value: integer("value").notNull(), // percentage value
  notes: text("notes"),
});

export const insertHealthDataSchema = createInsertSchema(healthData).pick({
  userId: true,
  date: true,
  category: true,
  value: true,
  notes: true,
});

// Resources model
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // workshop, class, article, video
  duration: text("duration"),
  image: text("image"),
  link: text("link"),
  nextSession: text("next_session"),
});

export const insertResourceSchema = createInsertSchema(resources).pick({
  title: true,
  description: true,
  type: true,
  duration: true,
  image: true,
  link: true,
  nextSession: true,
});

// Medical records model
export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  date: date("date").notNull(),
  documentType: text("document_type").notNull(), // test result, ultrasound, prescription
  documentText: text("document_text"), // OCR extracted text
  documentImage: text("document_image"), // URL or path to the document image
  notes: text("notes"),
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).pick({
  userId: true,
  title: true,
  date: true,
  documentType: true,
  documentText: true,
  documentImage: true,
  notes: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Cycle = typeof cycles.$inferSelect;
export type InsertCycle = z.infer<typeof insertCycleSchema>;

export type FertilityData = typeof fertilityData.$inferSelect;
export type InsertFertilityData = z.infer<typeof insertFertilityDataSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;

export type HealthData = typeof healthData.$inferSelect;
export type InsertHealthData = z.infer<typeof insertHealthDataSchema>;

export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;

export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
