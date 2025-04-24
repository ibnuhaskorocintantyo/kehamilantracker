import { useState, useEffect, useMemo } from "react";
import { Cycle, FertilityData } from "@shared/schema";
import { 
  calculateAverageCycleLength, 
  calculateAveragePeriodLength,
  predictNextPeriodStart,
  calculateFertileWindow
} from "@/lib/calendar-utils";
import { useCalendar } from "@/hooks/use-calendar";

export function useCycle(cycles: Cycle[] = [], fertilityData: FertilityData[] = []) {
  const [predictedCycleLength, setPredictedCycleLength] = useState<number>(28);
  const [averagePeriodLength, setAveragePeriodLength] = useState<number>(5);
  const [predictedPeriodStart, setPredictedPeriodStart] = useState<Date | null>(null);
  const [predictedFertileStart, setPredictedFertileStart] = useState<Date | null>(null);
  const [predictedFertileEnd, setPredictedFertileEnd] = useState<Date | null>(null);
  const [predictedOvulationDay, setPredictedOvulationDay] = useState<Date | null>(null);
  
  const calendar = useCalendar(new Date(), cycles, fertilityData);
  
  // Calculate cycle predictions when data changes
  useEffect(() => {
    if (cycles && cycles.length > 0) {
      // Calculate average cycle and period lengths
      const avgCycleLength = calculateAverageCycleLength(cycles);
      const avgPeriodLength = calculateAveragePeriodLength(cycles);
      
      // Update state
      setPredictedCycleLength(avgCycleLength);
      setAveragePeriodLength(avgPeriodLength);
      
      // Predict next period
      const nextPeriod = predictNextPeriodStart(cycles);
      setPredictedPeriodStart(nextPeriod);
      
      // Calculate fertile window
      const { fertileStart, fertileEnd, ovulationDay } = calculateFertileWindow(cycles, fertilityData);
      setPredictedFertileStart(fertileStart);
      setPredictedFertileEnd(fertileEnd);
      setPredictedOvulationDay(ovulationDay);
    }
  }, [cycles, fertilityData]);
  
  return {
    ...calendar,
    predictedCycleLength,
    averagePeriodLength,
    predictedPeriodStart,
    predictedFertileStart,
    predictedFertileEnd,
    predictedOvulationDay
  };
}
