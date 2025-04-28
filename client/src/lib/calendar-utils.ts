import { addDays, startOfMonth, endOfMonth, getDay, format, parseISO } from "date-fns";
import { Cycle, FertilityData } from "@shared/schema";

export type CalendarDay = {
  date: Date;
  isPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
};

// Create array of days for a month with empty cells for proper grid alignment
export function getCalendarDaysForMonth(year: number, month: number): Date[] {
  const firstDayOfMonth = startOfMonth(new Date(year, month));
  const lastDayOfMonth = endOfMonth(new Date(year, month));
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = getDay(firstDayOfMonth);
  
  const calendarDays: Date[] = [];
  
  // Add days from previous month to fill first row
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(addDays(firstDayOfMonth, -firstDayOfWeek + i));
  }
  
  // Add all days in the current month
  for (let i = 0; i < daysInMonth; i++) {
    calendarDays.push(addDays(firstDayOfMonth, i));
  }
  
  // Add days from next month to complete the grid (6 rows × 7 days = 42 total cells)
  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push(addDays(lastDayOfMonth, i));
  }
  
  return calendarDays;
}

// Calculate if a date is within the period
export function isPeriodDay(date: Date, cycles: Cycle[]): boolean {
  if (!cycles || cycles.length === 0) return false;
  
  const dateStr = format(date, 'yyyy-MM-dd');
  
  return cycles.some(cycle => {
    const startDate = parseISO(cycle.startDate.toString());
    const endDate = cycle.endDate ? parseISO(cycle.endDate.toString()) : null;
    
    if (!endDate) {
      // If no end date, assume period lasts for 5 days
      const estimatedEndDate = addDays(startDate, 5);
      return (
        dateStr >= format(startDate, 'yyyy-MM-dd') && 
        dateStr <= format(estimatedEndDate, 'yyyy-MM-dd')
      );
    }
    
    return (
      dateStr >= format(startDate, 'yyyy-MM-dd') && 
      dateStr <= format(endDate, 'yyyy-MM-dd')
    );
  });
}



// Calculate if a date is an ovulation day
export function isOvulationDay(date: Date, fertilityData: FertilityData[]): boolean {
  if (!fertilityData || fertilityData.length === 0) return false;
  
  const dateStr = format(date, 'yyyy-MM-dd');
  
  return fertilityData.some(data => {
    // Handling the date property appropriately
    const dataDate = typeof data.date === 'string' 
      ? parseISO(data.date) 
      : new Date(data.date); // Treat date as a Date if it's not a string
    
    return (
      format(dataDate, 'yyyy-MM-dd') === dateStr && 
      data.ovulationTestResult === true
    );
  });
}

// Calculate fertile window (typically 5 days before ovulation, ovulation day, and 1 day after)
export function calculateFertileWindow(cycles: Cycle[], fertilityData: FertilityData[]): {
  fertileStart: Date | null;
  fertileEnd: Date | null;
  ovulationDay: Date | null;
} {
  if (!cycles || cycles.length === 0) return { fertileStart: null, fertileEnd: null, ovulationDay: null };
  
  // Try to find ovulation day from fertility data first
  const ovulationData = fertilityData?.find(data => data.ovulationTestResult);
  
  if (ovulationData) {
    const ovulationDate = parseISO(ovulationData.date.toString());
    return {
      fertileStart: addDays(ovulationDate, -5),
      fertileEnd: addDays(ovulationDate, 1),
      ovulationDay: ovulationDate
    };
  }
  
  // If no ovulation data, estimate based on cycle length
  const sortedCycles = [...(cycles || [])].sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  
  if (sortedCycles.length === 0) return { fertileStart: null, fertileEnd: null, ovulationDay: null };
  
  const lastCycle = sortedCycles[0];
  const avgCycleLength = calculateAverageCycleLength(cycles);
  
  // Ovulation typically occurs 14 days before the next period
  const lastStartDate = parseISO(lastCycle.startDate.toString());
  const nextPeriodStart = addDays(lastStartDate, avgCycleLength);
  const estimatedOvulation = addDays(nextPeriodStart, -14);
  
  return {
    fertileStart: addDays(estimatedOvulation, -5),
    fertileEnd: addDays(estimatedOvulation, 1),
    ovulationDay: estimatedOvulation
  };
}

// Check if a date is in the fertile window
export function isFertileDay(date: Date, fertileStart: Date | null, fertileEnd: Date | null, isOvulation: boolean): boolean {
  if (!fertileStart || !fertileEnd || isOvulation) return false;
  
  const dateTime = date.getTime();
  return dateTime >= fertileStart.getTime() && dateTime <= fertileEnd.getTime();
}

// Calculate average cycle length
export function calculateAverageCycleLength(cycles: Cycle[]): number {
  if (!cycles || cycles.length < 2) return 28; // Default to 28 days
  
  const sortedCycles = [...cycles].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  
  let totalDays = 0;
  let countPeriods = 0;
  
  for (let i = 1; i < sortedCycles.length; i++) {
    const currentStartDate = new Date(sortedCycles[i].startDate);
    const prevStartDate = new Date(sortedCycles[i-1].startDate);
    
    const daysDiff = Math.round((currentStartDate.getTime() - prevStartDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 0 && daysDiff < 60) { // Filter out unrealistic cycle lengths
      totalDays += daysDiff;
      countPeriods++;
    }
  }
  
  return countPeriods > 0 ? Math.round(totalDays / countPeriods) : 28;
}

// Calculate average period length
export function calculateAveragePeriodLength(cycles: Cycle[]): number {
  if (!cycles || cycles.length === 0) return 5; // Default to 5 days
  
  let totalDays = 0;
  let countPeriods = 0;
  
  for (const cycle of cycles) {
    if (cycle.endDate) {
      const startDate = new Date(cycle.startDate);
      const endDate = new Date(cycle.endDate);
      
      const daysDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      if (daysDiff > 0 && daysDiff <= 10) { // Filter out unrealistic period lengths
        totalDays += daysDiff;
        countPeriods++;
      }
    }
  }
  
  return countPeriods > 0 ? Math.round(totalDays / countPeriods) : 5;
}

// Predict next period start date
export function predictNextPeriodStart(cycles: Cycle[]): Date | null {
  if (!cycles || cycles.length === 0) return null;
  
  const sortedCycles = [...cycles].sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  
  const lastCycle = sortedCycles[0];
  const avgCycleLength = calculateAverageCycleLength(cycles);
  
  const lastStartDate = new Date(lastCycle.startDate);
  return addDays(lastStartDate, avgCycleLength);
}
