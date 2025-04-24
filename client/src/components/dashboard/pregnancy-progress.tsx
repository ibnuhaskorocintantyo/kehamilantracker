import { useQuery } from "@tanstack/react-query";
import { 
  getPregnancyProgress, 
  formatDate, 
  getBabySizeComparison 
} from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function PregnancyProgress() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/users/1'],
  });
  
  if (isLoading) {
    return <Skeleton className="bg-white rounded-xl shadow-soft h-56 w-full mb-8" />;
  }
  
  // If there's no user or user is not pregnant, don't render this component
  if (!user || !user.pregnancyStatus || !user.pregnancyWeek) {
    return null;
  }
  
  const progressPercentage = getPregnancyProgress(user.pregnancyWeek);
  const babySize = getBabySizeComparison(user.pregnancyWeek);
  const dueDate = user.dueDate ? formatDate(user.dueDate) : 'Calculating...';
  
  return (
    <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-lora text-xl font-medium text-neutral-dark">Your Pregnancy Journey</h3>
        <span className="text-accent font-medium">{user.pregnancyWeek} weeks</span>
      </div>
      <div className="progress-bar mb-3">
        <div className="progress-value" style={{ width: `${progressPercentage}%` }}></div>
      </div>
      <div className="grid grid-cols-3 text-center">
        <div>
          <p className={`text-xs ${user.pregnancyWeek <= 13 ? 'font-medium' : ''} text-neutral-medium`}>
            First Trimester
          </p>
        </div>
        <div>
          <p className={`text-xs ${user.pregnancyWeek > 13 && user.pregnancyWeek <= 26 ? 'font-medium' : ''} text-neutral-medium`}>
            Second Trimester
          </p>
        </div>
        <div>
          <p className={`text-xs ${user.pregnancyWeek > 26 ? 'font-medium' : ''} text-neutral-medium`}>
            Third Trimester
          </p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-primary-light p-4 rounded-lg">
          <span className="text-primary-dark text-xl">
            <i className="ri-heart-pulse-line"></i>
          </span>
          <p className="text-sm mt-1 font-medium">Baby is the size of {babySize}</p>
        </div>
        <div className="bg-secondary-light p-4 rounded-lg">
          <span className="text-primary-dark text-xl">
            <i className="ri-calendar-event-line"></i>
          </span>
          <p className="text-sm mt-1 font-medium">Due date: {dueDate}</p>
        </div>
      </div>
    </div>
  );
}
