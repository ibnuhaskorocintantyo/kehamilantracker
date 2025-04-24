import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

type HealthCategory = {
  id: string;
  title: string;
  description: string;
  icon: string;
  background: string;
  value: number;
};

export default function HealthInsights() {
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/users/1'],
  });
  
  const { data: healthData, isLoading: isHealthDataLoading } = useQuery({
    queryKey: ['/api/users/1/health-data'],
    enabled: !!user,
  });
  
  const isLoading = isUserLoading || isHealthDataLoading;
  
  if (isLoading) {
    return <Skeleton className="bg-white rounded-xl shadow-soft h-72 w-full mb-8" />;
  }
  
  // Format health data into categories with descriptions
  const categories: HealthCategory[] = [
    {
      id: 'hydration',
      title: 'Hydration',
      description: 'Aim for 10-12 glasses of water daily. Staying hydrated helps maintain amniotic fluid levels.',
      icon: 'water-flash-line',
      background: 'bg-primary-light',
      value: 0
    },
    {
      id: 'sleep',
      title: 'Sleep',
      description: 'Try sleeping on your left side to improve circulation to your baby.',
      icon: 'rest-time-line',
      background: 'bg-secondary-light',
      value: 0
    },
    {
      id: 'exercise',
      title: 'Exercise',
      description: 'Gentle activities like prenatal yoga and walking are beneficial during the second trimester.',
      icon: 'heart-pulse-line',
      background: 'bg-accent-light',
      value: 0
    },
    {
      id: 'nutrition',
      title: 'Nutrition',
      description: 'Focus on iron-rich foods this week to support your baby\'s growing needs.',
      icon: 'nutrition-line',
      background: 'bg-status-success',
      value: 0
    }
  ];
  
  // Update values from health data if available
  if (healthData && healthData.length > 0) {
    // Group by category and get latest entry for each
    const latestByCategory = healthData.reduce((acc, item) => {
      if (!acc[item.category] || new Date(item.date) > new Date(acc[item.category].date)) {
        acc[item.category] = item;
      }
      return acc;
    }, {});
    
    // Update category values
    categories.forEach(category => {
      if (latestByCategory[category.id]) {
        category.value = latestByCategory[category.id].value;
      }
    });
  }
  
  return (
    <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-lora text-xl font-medium text-neutral-dark">Health Insights & Recommendations</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {categories.map(category => (
          <div key={category.id} className={`${category.background} p-5 rounded-lg`}>
            <div className="flex items-start">
              <div className="bg-white p-2 rounded-full mr-3">
                <i className={`ri-${category.icon} text-primary-dark text-lg`}></i>
              </div>
              <div>
                <h4 className="font-medium mb-1">{category.title}</h4>
                <p className="text-sm">{category.description}</p>
                <div className="mt-3 flex items-center">
                  <div className="progress-bar w-full h-2 mr-2">
                    <div className="progress-value" style={{ width: `${category.value}%` }}></div>
                  </div>
                  <span className="text-xs font-medium">{category.value}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
