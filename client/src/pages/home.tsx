import Header from "@/components/layout/header";
import MobileNavigation from "@/components/layout/mobile-navigation";
import DashboardWelcome from "@/components/dashboard/welcome";
import PregnancyProgress from "@/components/dashboard/pregnancy-progress";
import CycleTracking from "@/components/dashboard/cycle-tracking";
import Appointments from "@/components/dashboard/appointments";
import JournalTimeline from "@/components/dashboard/journal-timeline";
import HealthInsights from "@/components/dashboard/health-insights";
import Resources from "@/components/dashboard/resources";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { user, isLoading } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-white">
      <Header />
      
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-6 mb-16 md:mb-0">
        <DashboardWelcome />
        
        {user?.pregnancyStatus && (
          <PregnancyProgress />
        )}
        
        <div className="dashboard-grid">
          {!user?.pregnancyStatus && (
            <CycleTracking />
          )}
          <Appointments />
        </div>
        
        <JournalTimeline />
        <HealthInsights />
        <Resources />
      </main>
      
      <MobileNavigation />
    </div>
  );
}
