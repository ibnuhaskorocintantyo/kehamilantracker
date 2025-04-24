import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, addDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to a readable string (e.g., "June 15, 2023")
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMMM d, yyyy");
}

// Format time to a readable string (e.g., "10:30 AM")
export function formatTime(time: string): string {
  // Handle different time formats
  if (time.includes(":")) {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
  }
  return time; // Return as is if already formatted
}

// Calculate fertile window based on cycle length
export function calculateFertileWindow(cycleStartDate: Date, cycleLength: number = 28): {
  fertileStart: Date;
  fertileEnd: Date;
  ovulationDay: Date;
} {
  // Fertile window typically starts 5 days before ovulation and ends on the day of ovulation
  // Ovulation typically occurs 14 days before the start of the next period
  const ovulationDay = addDays(cycleStartDate, cycleLength - 14);
  const fertileStart = addDays(ovulationDay, -5);
  const fertileEnd = ovulationDay;

  return {
    fertileStart,
    fertileEnd,
    ovulationDay,
  };
}

// Get calendar days for a month with their states (period, fertile, ovulation)
export function getCalendarDays(
  year: number,
  month: number, // 0-based (January is 0)
  periodStartDate?: Date,
  periodEndDate?: Date,
  cycleLength?: number
): {
  date: Date;
  isPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
}[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    let isPeriod = false;
    let isFertile = false;
    let isOvulation = false;

    // Check if the day is in the period
    if (periodStartDate && periodEndDate) {
      isPeriod =
        date >= new Date(periodStartDate.setHours(0, 0, 0, 0)) &&
        date <= new Date(periodEndDate.setHours(23, 59, 59, 999));
    }

    // Calculate fertility window if cycle length is provided
    if (periodStartDate && cycleLength) {
      const { fertileStart, fertileEnd, ovulationDay } = calculateFertileWindow(
        periodStartDate,
        cycleLength
      );
      
      isFertile =
        date >= new Date(fertileStart.setHours(0, 0, 0, 0)) &&
        date <= new Date(fertileEnd.setHours(23, 59, 59, 999));
      
      isOvulation = date.getDate() === ovulationDay.getDate() && 
                   date.getMonth() === ovulationDay.getMonth() && 
                   date.getFullYear() === ovulationDay.getFullYear();
    }

    days.push({
      date,
      isPeriod,
      isFertile,
      isOvulation,
    });
  }

  return days;
}

// File to base64 conversion for image uploads
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

// Calculate pregnancy week from due date
export function calculatePregnancyWeek(dueDate: Date | string | null): number | null {
  if (!dueDate) return null;
  
  const dueDateObj = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const today = new Date();
  
  // Pregnancy is approximately 40 weeks
  const pregnancyDuration = 40 * 7 * 24 * 60 * 60 * 1000; // 40 weeks in milliseconds
  
  // Calculate conception date (approximately 40 weeks before due date)
  const conceptionDate = new Date(dueDateObj.getTime() - pregnancyDuration);
  
  // Calculate the difference in milliseconds between today and conception date
  const diffTime = Math.abs(today.getTime() - conceptionDate.getTime());
  
  // Convert to weeks
  const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
  
  return Math.min(diffWeeks, 40); // Cap at 40 weeks
}

// Get baby size comparison based on pregnancy week
export function getBabySizeComparison(week: number): string {
  const sizeComparisons = [
    "a poppy seed", // Week 1
    "a sesame seed", // Week 2
    "a lentil", // Week 3
    "a blueberry", // Week 4
    "a raspberry", // Week 5
    "a pea", // Week 6
    "a coffee bean", // Week 7
    "a kidney bean", // Week 8
    "a grape", // Week 9
    "a kumquat", // Week 10
    "a fig", // Week 11
    "a lime", // Week 12
    "a lemon", // Week 13
    "a peach", // Week 14
    "an apple", // Week 15
    "an avocado", // Week 16
    "a pomegranate", // Week 17
    "a sweet potato", // Week 18
    "a mango", // Week 19
    "a banana", // Week 20
    "a carrot", // Week 21
    "a papaya", // Week 22
    "a grapefruit", // Week 23
    "a cantaloupe", // Week 24
    "a cauliflower", // Week 25
    "a lettuce", // Week 26
    "a cabbage", // Week 27
    "an eggplant", // Week 28
    "a butternut squash", // Week 29
    "a cucumber", // Week 30
    "a coconut", // Week 31
    "a jicama", // Week 32
    "a pineapple", // Week 33
    "a cantaloupe", // Week 34
    "a honeydew melon", // Week 35
    "a head of romaine lettuce", // Week 36
    "a bunch of Swiss chard", // Week 37
    "a leek", // Week 38
    "a mini watermelon", // Week 39
    "a small pumpkin" // Week 40
  ];

  // Adjust for 0-based index and limit to valid range
  const adjustedWeek = Math.max(0, Math.min(week - 1, sizeComparisons.length - 1));
  return sizeComparisons[adjustedWeek];
}

// Calculate trimester based on pregnancy week
export function getTrimester(week: number): number {
  if (week <= 0) return 0;
  if (week <= 13) return 1;
  if (week <= 26) return 2;
  return 3;
}

// Calculate trimester progress percentage
export function getTrimesterProgress(week: number): number {
  const trimester = getTrimester(week);
  
  if (trimester === 1) {
    return (week / 13) * 100;
  } else if (trimester === 2) {
    return ((week - 13) / 13) * 100;
  } else if (trimester === 3) {
    return ((week - 26) / 14) * 100;
  }
  
  return 0;
}

// Calculate overall pregnancy progress percentage
export function getPregnancyProgress(week: number): number {
  return Math.min(100, (week / 40) * 100);
}
