import {
  users, type User, type InsertUser,
  cycles, type Cycle, type InsertCycle,
  fertilityData, type FertilityData, type InsertFertilityData,
  appointments, type Appointment, type InsertAppointment,
  journalEntries, type JournalEntry, type InsertJournalEntry,
  healthData, type HealthData, type InsertHealthData,
  resources, type Resource, type InsertResource,
  medicalRecords, type MedicalRecord, type InsertMedicalRecord
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Cycle operations
  getCycles(userId: number): Promise<Cycle[]>;
  getCycle(id: number): Promise<Cycle | undefined>;
  createCycle(cycle: InsertCycle): Promise<Cycle>;
  updateCycle(id: number, cycle: Partial<InsertCycle>): Promise<Cycle | undefined>;
  deleteCycle(id: number): Promise<boolean>;

  // Fertility data operations
  getFertilityData(userId: number): Promise<FertilityData[]>;
  getFertilityDataByDate(userId: number, date: Date): Promise<FertilityData | undefined>;
  createFertilityData(data: InsertFertilityData): Promise<FertilityData>;
  updateFertilityData(id: number, data: Partial<InsertFertilityData>): Promise<FertilityData | undefined>;
  deleteFertilityData(id: number): Promise<boolean>;

  // Appointment operations
  getAppointments(userId: number): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;

  // Journal entry operations
  getJournalEntries(userId: number): Promise<JournalEntry[]>;
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: number): Promise<boolean>;

  // Health data operations
  getHealthData(userId: number): Promise<HealthData[]>;
  getHealthDataByCategory(userId: number, category: string): Promise<HealthData[]>;
  createHealthData(data: InsertHealthData): Promise<HealthData>;
  updateHealthData(id: number, data: Partial<InsertHealthData>): Promise<HealthData | undefined>;
  deleteHealthData(id: number): Promise<boolean>;

  // Resources operations
  getResources(): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resource: Partial<InsertResource>): Promise<Resource | undefined>;
  deleteResource(id: number): Promise<boolean>;

  // Medical records operations
  getMedicalRecords(userId: number): Promise<MedicalRecord[]>;
  getMedicalRecord(id: number): Promise<MedicalRecord | undefined>;
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  updateMedicalRecord(id: number, record: Partial<InsertMedicalRecord>): Promise<MedicalRecord | undefined>;
  deleteMedicalRecord(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeResources();
  }

  private async initializeResources() {
    const existingResources = await db.select().from(resources);
    
    if (existingResources.length === 0) {
      const defaultResources = [
        {
          title: "Prenatal Yoga Basics",
          description: "Learn the foundations of prenatal yoga to improve flexibility and reduce stress during pregnancy.",
          type: "workshop",
          link: "https://example.com/prenatal-yoga",
          image: "yoga.jpg"
        },
        {
          title: "Fertility Diet Guidelines",
          description: "Discover the foods that can naturally boost your fertility and improve reproductive health.",
          type: "article",
          link: "https://example.com/fertility-diet",
          image: "healthy-food.jpg"
        },
        {
          title: "Understanding Your Cycle",
          description: "A comprehensive guide to tracking and understanding your menstrual cycle for better fertility awareness.",
          type: "article",
          link: "https://example.com/cycle-guide",
          image: "calendar.jpg"
        },
        {
          title: "Pregnancy Milestone Checklist",
          description: "Keep track of important pregnancy milestones and preparation steps with this handy checklist.",
          type: "checklist",
          link: "https://example.com/pregnancy-checklist",
          image: "checklist.jpg"
        }
      ];
      
      for (const resource of defaultResources) {
        await this.createResource(resource);
      }
    }
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async getCycles(userId: number): Promise<Cycle[]> {
    return db.select().from(cycles).where(eq(cycles.userId, userId));
  }
  
  async getCycle(id: number): Promise<Cycle | undefined> {
    const [cycle] = await db.select().from(cycles).where(eq(cycles.id, id));
    return cycle;
  }
  
  async createCycle(cycle: InsertCycle): Promise<Cycle> {
    const [newCycle] = await db.insert(cycles).values(cycle).returning();
    return newCycle;
  }
  
  async updateCycle(id: number, cycleData: Partial<InsertCycle>): Promise<Cycle | undefined> {
    const [updatedCycle] = await db
      .update(cycles)
      .set(cycleData)
      .where(eq(cycles.id, id))
      .returning();
    return updatedCycle;
  }
  
  async deleteCycle(id: number): Promise<boolean> {
    const result = await db.delete(cycles).where(eq(cycles.id, id)).returning();
    return result.length > 0;
  }
  
  async getFertilityData(userId: number): Promise<FertilityData[]> {
    return db.select().from(fertilityData).where(eq(fertilityData.userId, userId));
  }
  
  async getFertilityDataByDate(userId: number, date: Date): Promise<FertilityData | undefined> {
    const dateStr = date.toISOString().split('T')[0];
    const [data] = await db.select()
      .from(fertilityData)
      .where(
        and(
          eq(fertilityData.userId, userId),
          eq(fertilityData.date, dateStr)
        )
      );
    return data;
  }
  
  async createFertilityData(data: InsertFertilityData): Promise<FertilityData> {
    const [newData] = await db.insert(fertilityData).values(data).returning();
    return newData;
  }
  
  async updateFertilityData(id: number, data: Partial<InsertFertilityData>): Promise<FertilityData | undefined> {
    const [updatedData] = await db
      .update(fertilityData)
      .set(data)
      .where(eq(fertilityData.id, id))
      .returning();
    return updatedData;
  }
  
  async deleteFertilityData(id: number): Promise<boolean> {
    const result = await db.delete(fertilityData).where(eq(fertilityData.id, id)).returning();
    return result.length > 0;
  }
  
  async getAppointments(userId: number): Promise<Appointment[]> {
    return db.select().from(appointments).where(eq(appointments.userId, userId));
  }
  
  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }
  
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }
  
  async updateAppointment(id: number, appointmentData: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [updatedAppointment] = await db
      .update(appointments)
      .set(appointmentData)
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment;
  }
  
  async deleteAppointment(id: number): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id)).returning();
    return result.length > 0;
  }
  
  async getJournalEntries(userId: number): Promise<JournalEntry[]> {
    return db.select().from(journalEntries).where(eq(journalEntries.userId, userId));
  }
  
  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry;
  }
  
  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [newEntry] = await db.insert(journalEntries).values(entry).returning();
    return newEntry;
  }
  
  async updateJournalEntry(id: number, entryData: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const [updatedEntry] = await db
      .update(journalEntries)
      .set(entryData)
      .where(eq(journalEntries.id, id))
      .returning();
    return updatedEntry;
  }
  
  async deleteJournalEntry(id: number): Promise<boolean> {
    const result = await db.delete(journalEntries).where(eq(journalEntries.id, id)).returning();
    return result.length > 0;
  }
  
  async getHealthData(userId: number): Promise<HealthData[]> {
    return db.select().from(healthData).where(eq(healthData.userId, userId));
  }
  
  async getHealthDataByCategory(userId: number, category: string): Promise<HealthData[]> {
    return db.select()
      .from(healthData)
      .where(
        and(
          eq(healthData.userId, userId),
          eq(healthData.category, category)
        )
      );
  }
  
  async createHealthData(data: InsertHealthData): Promise<HealthData> {
    const [newData] = await db.insert(healthData).values(data).returning();
    return newData;
  }
  
  async updateHealthData(id: number, data: Partial<InsertHealthData>): Promise<HealthData | undefined> {
    const [updatedData] = await db
      .update(healthData)
      .set(data)
      .where(eq(healthData.id, id))
      .returning();
    return updatedData;
  }
  
  async deleteHealthData(id: number): Promise<boolean> {
    const result = await db.delete(healthData).where(eq(healthData.id, id)).returning();
    return result.length > 0;
  }
  
  async getResources(): Promise<Resource[]> {
    return db.select().from(resources);
  }
  
  async getResource(id: number): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource;
  }
  
  async createResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = await db.insert(resources).values(resource).returning();
    return newResource;
  }
  
  async updateResource(id: number, resourceData: Partial<InsertResource>): Promise<Resource | undefined> {
    const [updatedResource] = await db
      .update(resources)
      .set(resourceData)
      .where(eq(resources.id, id))
      .returning();
    return updatedResource;
  }
  
  async deleteResource(id: number): Promise<boolean> {
    const result = await db.delete(resources).where(eq(resources.id, id)).returning();
    return result.length > 0;
  }
  
  async getMedicalRecords(userId: number): Promise<MedicalRecord[]> {
    return db.select().from(medicalRecords).where(eq(medicalRecords.userId, userId));
  }
  
  async getMedicalRecord(id: number): Promise<MedicalRecord | undefined> {
    const [record] = await db.select().from(medicalRecords).where(eq(medicalRecords.id, id));
    return record;
  }
  
  async createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord> {
    const [newRecord] = await db.insert(medicalRecords).values(record).returning();
    return newRecord;
  }
  
  async updateMedicalRecord(id: number, recordData: Partial<InsertMedicalRecord>): Promise<MedicalRecord | undefined> {
    const [updatedRecord] = await db
      .update(medicalRecords)
      .set(recordData)
      .where(eq(medicalRecords.id, id))
      .returning();
    return updatedRecord;
  }
  
  async deleteMedicalRecord(id: number): Promise<boolean> {
    const result = await db.delete(medicalRecords).where(eq(medicalRecords.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();