import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Cycle from "@/pages/cycle";
import Insights from "@/pages/insights";
import Journal from "@/pages/journal";
import Resources from "@/pages/resources";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";

function Router() {
  // For demo purposes, we'll create a mock user with pregnancy data
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Check if we have a current user
        const response = await fetch('/api/users/1');
        
        // If no user found, create a demo user
        if (response.status === 404) {
          const today = new Date();
          const dueDate = new Date();
          dueDate.setDate(today.getDate() + 16 * 7); // 16 weeks from now (24 weeks pregnant)
          
          await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: 'sarah',
              password: 'securepassword',
              name: 'Sarah',
              email: 'sarah@example.com',
              pregnancyStatus: true,
              pregnancyWeek: 24,
              dueDate: dueDate.toISOString().split('T')[0],
            }),
          });
          
          // Add some initial health data
          const categories = ['hydration', 'sleep', 'exercise', 'nutrition'];
          const values = [65, 80, 45, 70];
          
          for (let i = 0; i < categories.length; i++) {
            await fetch('/api/health-data', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: 1,
                date: new Date().toISOString().split('T')[0],
                category: categories[i],
                value: values[i],
                notes: '',
              }),
            });
          }
          
          // Add initial appointments
          const appointments = [
            {
              userId: 1,
              title: 'OB-GYN Checkup',
              provider: 'Dr. Emily Chen',
              date: new Date(new Date().setDate(today.getDate() + 5)).toISOString().split('T')[0],
              time: '10:30',
              location: 'Women\'s Health Clinic',
              notes: 'Regular checkup',
              completed: false,
              type: 'Medical',
              icon: 'stethoscope-line',
            },
            {
              userId: 1,
              title: 'Prenatal Yoga Class',
              provider: 'Wellness Center',
              date: new Date(new Date().setDate(today.getDate() + 8)).toISOString().split('T')[0],
              time: '09:00',
              location: 'Community Center',
              notes: 'Bring yoga mat',
              completed: false,
              type: 'Wellness',
              icon: 'mental-health-line',
            }
          ];
          
          for (const appointment of appointments) {
            await fetch('/api/appointments', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(appointment),
            });
          }
          
          // Add initial journal entries
          const journalEntries = [
            {
              userId: 1,
              title: '20 Week Scan',
              content: 'We found out we\'re having a girl! The ultrasound technician showed us all her little fingers and toes. Everything is developing perfectly according to the doctor.',
              date: new Date(new Date().setDate(today.getDate() - 30)).toISOString().split('T')[0],
              image: 'https://images.unsplash.com/photo-1577640905050-83665af216b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=700&q=80',
              entryType: 'photo',
              pregnancyWeek: 20,
            },
            {
              userId: 1,
              title: 'First Kick!',
              content: 'I felt the baby kick for the first time today! It was during my morning meditation. Just a small flutter at first, and then a definite little kick. It felt like a tiny bubble popping inside.',
              date: new Date(new Date().setDate(today.getDate() - 45)).toISOString().split('T')[0],
              image: '',
              entryType: 'note',
              pregnancyWeek: 18,
            }
          ];
          
          for (const entry of journalEntries) {
            await fetch('/api/journal-entries', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(entry),
            });
          }
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeUser();
  }, []);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cycle" component={Cycle} />
      <Route path="/insights" component={Insights} />
      <Route path="/journal" component={Journal} />
      <Route path="/resources" component={Resources} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
