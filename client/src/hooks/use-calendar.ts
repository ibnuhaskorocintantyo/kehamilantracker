import { useState, useEffect } from "react";
import { Cycle, FertilityData } from "@shared/schema";
import { 
  getCalendarDaysForMonth, 
  isPeriodDay, 
  isOvulationDay, 
  isFertileDay,
  calculateFertileWindow
} from "@/lib/calendar-utils";

export function useCalendar(initialDate: Date = new Date(), cycles: Cycle[] = [], fertilityData: FertilityData[] = []) {
  const [selectedMonth, setSelectedMonth] = useState<number>(initialDate.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(initialDate.getFullYear());
  const [calendarDays, setCalendarDays] = useState<{
    date: Date;
    isPeriod: boolean;
    isFertile: boolean;
    isOvulation: boolean;
  }[]>([]);
  
  // Days of week headers
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  // Update calendar days when month, year, or cycle data changes
  useEffect(() => {
    const days = getCalendarDaysForMonth(selectedYear, selectedMonth);
    
    // Calculate fertile window
    const { fertileStart, fertileEnd, ovulationDay } = calculateFertileWindow(cycles, fertilityData);
    
    // Map days to include period and fertility information
    const daysWithStatus = days.map(date => {
      const isPeriod = isPeriodDay(date, cycles);
      const isOvulation = isOvulationDay(date, fertilityData);
      const isFertile = isFertileDay(date, fertileStart, fertileEnd, isOvulation);
      
      return {
        date,
        isPeriod,
        isFertile,
        isOvulation
      };
    });
    
    setCalendarDays(daysWithStatus);
  }, [selectedMonth, selectedYear, cycles, fertilityData]);
  
  // Navigate to previous month
  const previousMonth = () => {
    setSelectedMonth(prev => {
      if (prev === 0) {
        setSelectedYear(prevYear => prevYear - 1);
        return 11;
      }
      return prev - 1;
    });
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setSelectedMonth(prev => {
      if (prev === 11) {
        setSelectedYear(prevYear => prevYear + 1);
        return 0;
      }
      return prev + 1;
    });
  };
  
  return {
    selectedMonth,
    selectedYear,
    calendarDays,
    daysOfWeek,
    previousMonth,
    nextMonth,
    setSelectedMonth,
    setSelectedYear
  };
}
