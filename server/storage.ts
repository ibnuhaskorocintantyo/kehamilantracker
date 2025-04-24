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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cycles: Map<number, Cycle>;
  private fertilityData: Map<number, FertilityData>;
  private appointments: Map<number, Appointment>;
  private journalEntries: Map<number, JournalEntry>;
  private healthData: Map<number, HealthData>;
  private resources: Map<number, Resource>;
  private medicalRecords: Map<number, MedicalRecord>;
  
  private currentUserId: number = 1;
  private currentCycleId: number = 1;
  private currentFertilityDataId: number = 1;
  private currentAppointmentId: number = 1;
  private currentJournalEntryId: number = 1;
  private currentHealthDataId: number = 1;
  private currentResourceId: number = 1;
  private currentMedicalRecordId: number = 1;

  constructor() {
    this.users = new Map();
    this.cycles = new Map();
    this.fertilityData = new Map();
    this.appointments = new Map();
    this.journalEntries = new Map();
    this.healthData = new Map();
    this.resources = new Map();
    this.medicalRecords = new Map();
    
    // Initialize with demo resources
    this.initializeResources();
  }

  private initializeResources() {
    const demoResources: InsertResource[] = [
      {
        title: "Prenatal Yoga Basics",
        description: "Online class • 60 minutes",
        type: "class",
        duration: "60 minutes",
        image: "https://images.unsplash.com/photo-1616878024898-81f95a2a563e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
        link: "#",
        nextSession: "Tomorrow, 9AM"
      },
      {
        title: "Second Trimester Nutrition",
        description: "Workshop • 90 minutes",
        type: "workshop",
        duration: "90 minutes",
        image: "https://images.unsplash.com/photo-1609220136736-443140cffec6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
        link: "#",
        nextSession: "Sat, 11AM"
      },
      {
        title: "Birthing Preparation",
        description: "In-person class • 2 hours",
        type: "class",
        duration: "2 hours",
        image: "https://images.unsplash.com/photo-1614836981822-0ae892f4c528?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
        link: "#",
        nextSession: "Wed, 6PM"
      }
    ];

    for (const resource of demoResources) {
      this.createResource(resource);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Cycle operations
  async getCycles(userId: number): Promise<Cycle[]> {
    return Array.from(this.cycles.values()).filter(cycle => cycle.userId === userId);
  }

  async getCycle(id: number): Promise<Cycle | undefined> {
    return this.cycles.get(id);
  }

  async createCycle(cycle: InsertCycle): Promise<Cycle> {
    const id = this.currentCycleId++;
    const newCycle: Cycle = { ...cycle, id };
    this.cycles.set(id, newCycle);
    return newCycle;
  }

  async updateCycle(id: number, cycleData: Partial<InsertCycle>): Promise<Cycle | undefined> {
    const cycle = this.cycles.get(id);
    if (!cycle) return undefined;
    
    const updatedCycle = { ...cycle, ...cycleData };
    this.cycles.set(id, updatedCycle);
    return updatedCycle;
  }

  async deleteCycle(id: number): Promise<boolean> {
    return this.cycles.delete(id);
  }

  // Fertility data operations
  async getFertilityData(userId: number): Promise<FertilityData[]> {
    return Array.from(this.fertilityData.values()).filter(data => data.userId === userId);
  }

  async getFertilityDataByDate(userId: number, date: Date): Promise<FertilityData | undefined> {
    const dateString = date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
    return Array.from(this.fertilityData.values()).find(
      data => data.userId === userId && data.date.toISOString().split('T')[0] === dateString
    );
  }

  async createFertilityData(data: InsertFertilityData): Promise<FertilityData> {
    const id = this.currentFertilityDataId++;
    const newData: FertilityData = { ...data, id };
    this.fertilityData.set(id, newData);
    return newData;
  }

  async updateFertilityData(id: number, data: Partial<InsertFertilityData>): Promise<FertilityData | undefined> {
    const existingData = this.fertilityData.get(id);
    if (!existingData) return undefined;
    
    const updatedData = { ...existingData, ...data };
    this.fertilityData.set(id, updatedData);
    return updatedData;
  }

  async deleteFertilityData(id: number): Promise<boolean> {
    return this.fertilityData.delete(id);
  }

  // Appointment operations
  async getAppointments(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.userId === userId)
      .sort((a, b) => {
        // Sort by date first
        const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        
        // If same date, sort by time
        return a.time.localeCompare(b.time);
      });
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const newAppointment: Appointment = { ...appointment, id };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, appointmentData: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...appointmentData };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }

  // Journal entry operations
  async getJournalEntries(userId: number): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending
  }

  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.currentJournalEntryId++;
    const newEntry: JournalEntry = { ...entry, id };
    this.journalEntries.set(id, newEntry);
    return newEntry;
  }

  async updateJournalEntry(id: number, entryData: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const entry = this.journalEntries.get(id);
    if (!entry) return undefined;
    
    const updatedEntry = { ...entry, ...entryData };
    this.journalEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteJournalEntry(id: number): Promise<boolean> {
    return this.journalEntries.delete(id);
  }

  // Health data operations
  async getHealthData(userId: number): Promise<HealthData[]> {
    return Array.from(this.healthData.values()).filter(data => data.userId === userId);
  }

  async getHealthDataByCategory(userId: number, category: string): Promise<HealthData[]> {
    return Array.from(this.healthData.values())
      .filter(data => data.userId === userId && data.category === category)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending
  }

  async createHealthData(data: InsertHealthData): Promise<HealthData> {
    const id = this.currentHealthDataId++;
    const newData: HealthData = { ...data, id };
    this.healthData.set(id, newData);
    return newData;
  }

  async updateHealthData(id: number, data: Partial<InsertHealthData>): Promise<HealthData | undefined> {
    const existingData = this.healthData.get(id);
    if (!existingData) return undefined;
    
    const updatedData = { ...existingData, ...data };
    this.healthData.set(id, updatedData);
    return updatedData;
  }

  async deleteHealthData(id: number): Promise<boolean> {
    return this.healthData.delete(id);
  }

  // Resources operations
  async getResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }

  async getResource(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const id = this.currentResourceId++;
    const newResource: Resource = { ...resource, id };
    this.resources.set(id, newResource);
    return newResource;
  }

  async updateResource(id: number, resourceData: Partial<InsertResource>): Promise<Resource | undefined> {
    const resource = this.resources.get(id);
    if (!resource) return undefined;
    
    const updatedResource = { ...resource, ...resourceData };
    this.resources.set(id, updatedResource);
    return updatedResource;
  }

  async deleteResource(id: number): Promise<boolean> {
    return this.resources.delete(id);
  }

  // Medical records operations
  async getMedicalRecords(userId: number): Promise<MedicalRecord[]> {
    return Array.from(this.medicalRecords.values())
      .filter(record => record.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending
  }

  async getMedicalRecord(id: number): Promise<MedicalRecord | undefined> {
    return this.medicalRecords.get(id);
  }

  async createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord> {
    const id = this.currentMedicalRecordId++;
    const newRecord: MedicalRecord = { ...record, id };
    this.medicalRecords.set(id, newRecord);
    return newRecord;
  }

  async updateMedicalRecord(id: number, recordData: Partial<InsertMedicalRecord>): Promise<MedicalRecord | undefined> {
    const record = this.medicalRecords.get(id);
    if (!record) return undefined;
    
    const updatedRecord = { ...record, ...recordData };
    this.medicalRecords.set(id, updatedRecord);
    return updatedRecord;
  }

  async deleteMedicalRecord(id: number): Promise<boolean> {
    return this.medicalRecords.delete(id);
  }
}

export const storage = new MemStorage();
