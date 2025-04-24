import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import JournalForm from "@/components/forms/journal-form";

export default function JournalTimeline() {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/users/1'],
  });
  
  const { data: entries, isLoading: isEntriesLoading } = useQuery({
    queryKey: ['/api/users/1/journal-entries'],
    enabled: !!user,
  });
  
  const isLoading = isUserLoading || isEntriesLoading;
  
  if (isLoading) {
    return <Skeleton className="bg-white rounded-xl shadow-soft h-96 w-full mb-8" />;
  }
  
  const journalEntries = entries && entries.length > 0
    ? entries.slice(0, 3)
    : [];
  
  return (
    <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-lora text-xl font-medium text-neutral-dark">Pregnancy Journal</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center">
              <i className="ri-add-line mr-1"></i>
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Journal Entry</DialogTitle>
            </DialogHeader>
            <JournalForm 
              userId={user?.id} 
              pregnancyWeek={user?.pregnancyWeek}
              onSuccess={() => setDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {journalEntries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-medium">No journal entries yet</p>
            <p className="text-sm text-neutral-medium mt-2">Create your first entry to start documenting your journey</p>
          </div>
        ) : (
          journalEntries.map((entry, index) => (
            <div key={entry.id} className="timeline-item relative pl-12">
              <div className="timeline-dot absolute left-0 top-0">
                <i className={`ri-${entry.entryType === 'photo' ? 'camera-line' : 'quill-pen-line'} text-white`}></i>
              </div>
              <div className="bg-neutral-white rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">{entry.title}</h4>
                  <span className="text-xs text-neutral-medium">{formatDate(entry.date)}</span>
                </div>
                {entry.image && (
                  <div className="mb-3">
                    <img 
                      src={entry.image} 
                      alt={entry.title} 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                <p className="text-sm text-neutral-dark">{entry.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
      
      {journalEntries.length > 0 && (
        <div className="text-center mt-6">
          <Button variant="ghost" className="text-primary font-medium text-sm">
            View All Entries
            <i className="ri-arrow-right-s-line ml-1"></i>
          </Button>
        </div>
      )}
    </div>
  );
}
