import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Dialog,
  DialogContent,
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CycleForm from "@/components/forms/cycle-form";
import { Skeleton } from "@/components/ui/skeleton";
import PregnancyMode from "./pregnancy-mode";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Baby } from "lucide-react";
import { User, Cycle } from "@shared/schema";

export default function CycleTracking() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // User data query
  const { data: user, isLoading: isUserLoading } = useQuery<User>({
    queryKey: ['/api/users/1'],
  });
  
  // Cycles data query
  const { data: cycles, isLoading: isCyclesLoading } = useQuery<Cycle[]>({
    queryKey: ['/api/users/1/cycles'],
    enabled: !!user,
  });
  
  // Loading state
  const isLoading = isUserLoading || isCyclesLoading;
  
  // Simple calendar setup
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();
  
  const buildCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ date: null, isPeriod: false, isFertile: false, isOvulation: false });
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      
      // Check if the date is in the period
      const isPeriod = cycles?.some(cycle => {
        const startDate = new Date(cycle.startDate);
        const endDate = cycle.endDate ? new Date(cycle.endDate) : 
          new Date(new Date(cycle.startDate).setDate(new Date(cycle.startDate).getDate() + 5));
        
        return date >= startDate && date <= endDate;
      }) || false;
      
      // For simplicity, we'll mark estimated fertile days
      // (In a real app, this would use more sophisticated calculations)
      const isFertile = false;
      const isOvulation = false;
      
      days.push({ date, isPeriod, isFertile, isOvulation });
    }
    
    return days;
  };
  
  const calendarDays = buildCalendarDays();
  
  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // If data is still loading, show skeleton
  if (isLoading) {
    return <Skeleton className="bg-white rounded-xl shadow-soft h-72 w-full mb-8" />;
  }
  
  // Mutation for toggling pregnancy status
  const togglePregnancyMutation = useMutation({
    mutationFn: async () => {
      if (!user) return null;
      
      const updatedUser = {
        ...user,
        pregnancyStatus: !user.pregnancyStatus
      };
      await apiRequest('PATCH', `/api/users/${user.id}`, updatedUser);
      return updatedUser;
    },
    onSuccess: () => {
      if (!user) return;
      
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/1'] });
    },
  });
  
  // Show pregnancy mode if user is pregnant
  if (user?.pregnancyStatus) {
    return (
      <PregnancyMode 
        previousCycles={cycles as Cycle[] || []} 
        onExitPregnancyMode={() => togglePregnancyMutation.mutate()}
      />
    );
  }

  const handleDateClick = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setDialogOpen(true);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-lora text-xl font-medium text-neutral-dark">Calendar</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="text-primary text-sm font-medium hover:text-primary-dark"
            onClick={() => togglePregnancyMutation.mutate()}
          >
            <Baby className="h-4 w-4 mr-1" />
            Activate Pregnancy Mode
          </Button>
          <Button 
            variant="ghost" 
            className="text-primary text-sm font-medium"
          >
            <i className="ri-calendar-line mr-1"></i>
            View All
          </Button>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <button 
            className="text-neutral-dark" 
            onClick={previousMonth}
          >
            <i className="ri-arrow-left-s-line"></i>
          </button>
          <h4 className="font-medium">
            {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
              new Date(currentYear, currentMonth)
            )}
          </h4>
          <button 
            className="text-neutral-dark" 
            onClick={nextMonth}
          >
            <i className="ri-arrow-right-s-line"></i>
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {daysOfWeek.map(day => (
            <span key={day} className="text-xs text-neutral-medium">{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => (
            <div 
              key={i}
              className={`calendar-day text-sm cursor-pointer ${
                day.isPeriod ? 'period' : day.isOvulation ? 'ovulation' : day.isFertile ? 'fertile' : 'text-neutral-dark'
              } ${!day.date ? 'invisible' : ''}`}
              onClick={() => handleDateClick(day.date)}
            >
              {day.date?.getDate() || ''}
            </div>
          ))}
        </div>
      </div>
      <div className="flex space-x-4 mt-2">
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-accent mr-2"></span>
          <span className="text-xs text-neutral-medium">Period</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-primary mr-2"></span>
          <span className="text-xs text-neutral-medium">Fertile Window</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-primary-dark mr-2"></span>
          <span className="text-xs text-neutral-medium">Ovulation</span>
        </div>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate && new Intl.DateTimeFormat('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              }).format(selectedDate)}
            </DialogTitle>
          </DialogHeader>
          {selectedDate && (
            <CycleForm 
              date={selectedDate} 
              onSuccess={() => setDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}