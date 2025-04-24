import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCycle } from "@/hooks/use-cycle";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CycleForm from "@/components/forms/cycle-form";

export default function Cycle() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/users/1'],
  });

  const { data: cycles, isLoading: isCycleLoading } = useQuery({
    queryKey: ['/api/users/1/cycles'],
    enabled: !!user,
  });

  const { data: fertilityData, isLoading: isFertilityDataLoading } = useQuery({
    queryKey: ['/api/users/1/fertility-data'],
    enabled: !!user,
  });

  const { 
    calendarDays, 
    selectedMonth, 
    selectedYear, 
    previousMonth, 
    nextMonth,
    predictedPeriodStart,
    predictedPeriodEnd,
    predictedFertileStart,
    predictedFertileEnd,
    predictedOvulationDay,
    predictedCycleLength,
    averagePeriodLength
  } = useCycle(cycles, fertilityData);

  const isLoading = isUserLoading || isCycleLoading || isFertilityDataLoading;

  // Don't show cycle tracking if user is pregnant
  if (!isLoading && user?.pregnancyStatus) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-white">
        <Header />
        
        <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-6 mb-16 md:mb-0">
          <div className="mb-8">
            <h2 className="font-lora text-2xl md:text-3xl font-semibold text-neutral-dark mb-2">Cycle Tracking</h2>
            <p className="text-neutral-medium font-poppins">Cycle tracking is paused during your pregnancy</p>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pregnancy Mode Active</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Your cycle tracking has been paused while you're pregnant. You can access your pregnancy journey information on the home page.
              </p>
              <p className="text-sm text-neutral-medium">
                Cycle tracking will resume after your pregnancy. You can still view your past cycle data below.
              </p>
            </CardContent>
          </Card>
        </main>
        
        <MobileNavigation />
      </div>
    );
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setDialogOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-white">
        <Header />
        
        <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-6 mb-16 md:mb-0">
          <Skeleton className="h-12 w-60 mb-4" />
          <Skeleton className="h-6 w-40 mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </main>
        
        <MobileNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-white">
      <Header />
      
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-6 mb-16 md:mb-0">
        <div className="mb-8">
          <h2 className="font-lora text-2xl md:text-3xl font-semibold text-neutral-dark mb-2">Cycle Tracking</h2>
          <p className="text-neutral-medium font-poppins">Track and understand your menstrual cycle</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Calendar</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={previousMonth}>
                    <i className="ri-arrow-left-s-line"></i>
                  </Button>
                  <h4 className="px-2 py-1">
                    {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
                      new Date(selectedYear, selectedMonth)
                    )}
                  </h4>
                  <Button variant="outline" size="sm" onClick={nextMonth}>
                    <i className="ri-arrow-right-s-line"></i>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
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
                    onClick={() => handleDateSelect(day.date)}
                  >
                    {day.date.getDate()}
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap space-x-4 mt-4">
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
              
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium mb-4">Cycle Information</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-medium">Average Cycle Length:</span>
                    <span className="font-medium">{predictedCycleLength} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-medium">Average Period Length:</span>
                    <span className="font-medium">{averagePeriodLength} days</span>
                  </div>
                  {predictedPeriodStart && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-medium">Next Period Prediction:</span>
                      <span className="font-medium">{format(predictedPeriodStart, 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  {predictedOvulationDay && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-medium">Next Ovulation Day:</span>
                      <span className="font-medium">{format(predictedOvulationDay, 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Fertility Data */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Fertility Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="data">
                <TabsList className="mb-4">
                  <TabsTrigger value="data">Enter Data</TabsTrigger>
                  <TabsTrigger value="patterns">Patterns</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="data">
                  <div className="space-y-4">
                    <div>
                      <Label>Select Date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate || undefined}
                        onSelect={(date) => date && setSelectedDate(date)}
                        className="border rounded-md p-2"
                      />
                    </div>
                    
                    <Button 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary-dark"
                      onClick={() => selectedDate && handleDateSelect(selectedDate)}
                    >
                      Enter Fertility Data for {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Selected Date'}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="patterns">
                  <div className="space-y-6">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-3">Fertile Window</h3>
                      <p className="text-sm mb-4">
                        Your fertile window is the time when you're most likely to conceive if you have unprotected sex.
                      </p>
                      {predictedFertileStart && predictedFertileEnd ? (
                        <div className="bg-primary-light p-3 rounded-md text-sm">
                          <p>Your next fertile window is predicted to be from:</p>
                          <p className="font-medium mt-1">
                            {format(predictedFertileStart, 'MMM d')} to {format(predictedFertileEnd, 'MMM d, yyyy')}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-neutral-medium">
                          Continue tracking your cycle to get accurate predictions.
                        </p>
                      )}
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-3">Cycle Regularity</h3>
                      <p className="text-sm mb-4">
                        Regular cycles indicate balanced hormones and overall reproductive health.
                      </p>
                      <div className="bg-secondary-light p-3 rounded-md text-sm">
                        {cycles && cycles.length > 1 ? (
                          <p>
                            Your cycles have been approximately {predictedCycleLength} days apart, which is
                            {predictedCycleLength >= 24 && predictedCycleLength <= 35 
                              ? " within the typical range." 
                              : " outside the typical 24-35 day range."}
                          </p>
                        ) : (
                          <p>Continue tracking to analyze your cycle regularity.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="history">
                  {fertilityData && fertilityData.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {fertilityData.sort((a, b) => 
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                      ).map(entry => (
                        <div key={entry.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{format(new Date(entry.date), 'MMM d, yyyy')}</span>
                            {entry.ovulationTestResult && (
                              <span className="bg-primary-dark text-white text-xs px-2 py-1 rounded-full">
                                Ovulation +
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {entry.basalBodyTemperature && (
                              <div>
                                <span className="text-neutral-medium">BBT: </span>
                                <span>{entry.basalBodyTemperature}°C</span>
                              </div>
                            )}
                            {entry.cervicalMucus && (
                              <div>
                                <span className="text-neutral-medium">CM: </span>
                                <span className="capitalize">{entry.cervicalMucus}</span>
                              </div>
                            )}
                          </div>
                          {entry.notes && (
                            <p className="text-xs mt-2 text-neutral-medium">{entry.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-neutral-medium mb-2">No fertility data recorded yet</p>
                      <p className="text-sm">Start tracking to build your fertility history</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
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
      </main>
      
      <MobileNavigation />
    </div>
  );
}
