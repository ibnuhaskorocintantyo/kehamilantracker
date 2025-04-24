import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Resources() {
  const { data: resources, isLoading } = useQuery({
    queryKey: ['/api/resources'],
  });
  
  if (isLoading) {
    return <Skeleton className="bg-white rounded-xl shadow-soft h-72 w-full mb-8" />;
  }
  
  const resourcesList = resources && resources.length > 0
    ? resources.slice(0, 3)
    : [];
  
  return (
    <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-lora text-xl font-medium text-neutral-dark">Resources & Classes</h3>
        <Button variant="ghost" className="text-primary text-sm font-medium">
          View All
          <i className="ri-arrow-right-s-line ml-1"></i>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {resourcesList.length === 0 ? (
          <div className="col-span-3 text-center py-8">
            <p className="text-neutral-medium">No resources available</p>
          </div>
        ) : (
          resourcesList.map(resource => (
            <div key={resource.id} className="border border-neutral-light rounded-lg overflow-hidden">
              {resource.image && (
                <img 
                  src={resource.image} 
                  alt={resource.title} 
                  className="w-full h-32 object-cover"
                />
              )}
              <div className="p-4">
                <h4 className="font-medium mb-1">{resource.title}</h4>
                <p className="text-xs text-neutral-medium mb-2">{resource.description}</p>
                <div className="flex items-center text-xs text-primary-dark">
                  <i className="ri-time-line mr-1"></i>
                  <span>Next session: {resource.nextSession}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
