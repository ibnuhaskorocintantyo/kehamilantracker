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
import { useCalendar } from "@/hooks/use-calendar";
import PregnancyMode from "./pregnancy-mode";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Baby } from "lucide-react";
import { User, Cycle } from "@shared/schema";

export default function CycleTracking() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { data: user, isLoading: isUserLoading } = useQuery<User>({
    queryKey: ['/api/users/1'],
  });
  
  const { data: cycles, isLoading: isCyclesLoading } = useQuery<Cycle[]>({
    queryKey: ['/api/users/1/cycles'],
    enabled: !!user,
  });
  
  const currentDate = new Date();
  const { 
    selectedMonth, 
    selectedYear, 
    calendarDays, 
    daysOfWeek, 
    previousMonth, 
    nextMonth 
  } = useCalendar(currentDate, cycles as Cycle[] | undefined);
  
  const isLoading = isUserLoading || isCyclesLoading;
  
  if (isLoading) {
    return <Skeleton className="bg-white rounded-xl shadow-soft h-72 w-full mb-8" />;
  }
  // Add mutation for toggling pregnancy status
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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setDialogOpen(true);
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
              new Date(selectedYear, selectedMonth)
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
              }`}
              onClick={() => handleDateClick(day.date)}
            >
              {day.date.getDate()}
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
