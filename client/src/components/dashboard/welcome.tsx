import { useQuery } from "@tanstack/react-query";
import { calculatePregnancyWeek } from "@/lib/utils";

export default function DashboardWelcome() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/users/1'],
  });
  
  if (isLoading) {
    return (
      <div className="mb-8 animate-pulse">
        <div className="h-8 w-40 bg-gray-200 rounded mb-2"></div>
        <div className="h-5 w-32 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="mb-8">
        <h2 className="font-lora text-2xl md:text-3xl font-semibold text-neutral-dark mb-2">Hello, Guest</h2>
        <p className="text-neutral-medium font-poppins">Welcome to Bloom</p>
      </div>
    );
  }
  
  const pregnancyWeek = user.pregnancyStatus && user.pregnancyWeek ? 
    user.pregnancyWeek : 
    (user.dueDate ? calculatePregnancyWeek(user.dueDate) : null);
  
  return (
    <div className="mb-8">
      <h2 className="font-lora text-2xl md:text-3xl font-semibold text-neutral-dark mb-2">
        Hello, {user.name}
      </h2>
      {pregnancyWeek ? (
        <p className="text-neutral-medium font-poppins">
          Week {pregnancyWeek} of your pregnancy journey
        </p>
      ) : (
        <p className="text-neutral-medium font-poppins">
          Welcome to your fertility journey
        </p>
      )}
    </div>
  );
}
