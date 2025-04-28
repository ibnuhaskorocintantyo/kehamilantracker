
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog,
  DialogContent,
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import AppointmentForm from "@/components/forms/appointment-form";
import { apiRequest } from "@/lib/queryClient";
import type { Appointment } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Appointments() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: userData, isLoading: isUserLoading } = useQuery<{id: number}>({
    queryKey: ['/api/users/1'],
  });
  
  const { data: appointments, isLoading: isAppointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/users/1/appointments'],
    enabled: !!userData,
  });
  
  const completeAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      return await apiRequest("PATCH", `/api/appointments/${appointmentId}`, {
        completed: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/appointments'] });
      toast({
        title: "Appointment completed",
        description: "The appointment has been marked as completed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update appointment status.",
        variant: "destructive",
      });
    },
  });
  
  const isLoading = isAppointmentsLoading;
  
  if (isLoading) {
    return <Skeleton className="bg-white rounded-xl shadow-soft h-72 w-full mb-8" />;
  }
  
  const upcomingAppointments = appointments && appointments.length > 0
    ? appointments.filter(a => !a.completed).slice(0, 3)
    : [];
  
  const handleMarkComplete = (appointmentId: number) => {
    completeAppointmentMutation.mutate(appointmentId);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-lora text-xl font-medium text-neutral-dark">Upcoming Appointments</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              className="text-primary text-sm font-medium"
            >
              <i className="ri-add-line mr-1"></i>
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Appointment</DialogTitle>
            </DialogHeader>
            <AppointmentForm 
              userId={userData?.id} 
              onSuccess={() => setDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4">
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-medium">No upcoming appointments</p>
            <p className="text-sm text-neutral-medium mt-2">Click "Add New" to schedule an appointment</p>
          </div>
        ) : (
          upcomingAppointments.map(appointment => (
            <div key={appointment.id} className="border border-neutral-light rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className={`w-8 h-8 ${
                  appointment.type === 'Wellness' ? 'bg-secondary-light' : 'bg-primary-light'
                } rounded-full flex items-center justify-center mr-3`}>
                  <i className={`ri-${appointment.icon} text-primary-dark`}></i>
                </span>
                <div>
                  <h4 className="font-medium text-neutral-dark">{appointment.title}</h4>
                  <p className="text-xs text-neutral-medium">{appointment.provider}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto"
                  onClick={() => handleMarkComplete(appointment.id)}
                >
                  <i className="ri-check-line text-green-500"></i>
                </Button>
              </div>
              <div className="flex mt-2">
                <div className="flex items-center mr-4">
                  <i className="ri-calendar-line text-primary-dark mr-1 text-sm"></i>
                  <span className="text-xs">{formatDate(appointment.date)}</span>
                </div>
                <div className="flex items-center">
                  <i className="ri-time-line text-primary-dark mr-1 text-sm"></i>
                  <span className="text-xs">{appointment.time}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
