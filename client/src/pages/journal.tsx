import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import JournalForm from "@/components/forms/journal-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export default function Journal() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/users/1'],
  });
  
  const { data: entries, isLoading: isEntriesLoading } = useQuery({
    queryKey: ['/api/users/1/journal-entries'],
    enabled: !!user,
  });
  
  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: number) => {
      return await apiRequest("DELETE", `/api/journal-entries/${entryId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/journal-entries'] });
      toast({
        title: "Entry deleted",
        description: "Journal entry has been removed.",
      });
      setSelectedEntry(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete journal entry. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const isLoading = isUserLoading || isEntriesLoading;
  
  const filteredEntries = entries && searchTerm 
    ? entries.filter(entry => 
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        entry.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : entries;
  
  const groupEntriesByMonth = (entries: any[]) => {
    if (!entries || entries.length === 0) return {};
    
    return entries.reduce((acc, entry) => {
      const date = new Date(entry.date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      
      acc[monthYear].push(entry);
      return acc;
    }, {});
  };
  
  const groupedEntries = groupEntriesByMonth(filteredEntries || []);
  
  const handleNewEntry = () => {
    setDialogOpen(true);
  };
  
  const handleViewEntry = (entryId: number) => {
    setSelectedEntry(entryId);
  };
  
  const handleDeleteEntry = (entryId: number) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      deleteEntryMutation.mutate(entryId);
    }
  };
  
  const selectedEntryDetails = selectedEntry 
    ? entries?.find(entry => entry.id === selectedEntry) 
    : null;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-white">
        <Header />
        
        <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-6 mb-16 md:mb-0">
          <Skeleton className="h-12 w-60 mb-4" />
          <Skeleton className="h-6 w-40 mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-96 md:col-span-1" />
            <Skeleton className="h-96 md:col-span-2" />
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
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="font-lora text-2xl md:text-3xl font-semibold text-neutral-dark mb-2">Pregnancy Journal</h2>
            <p className="text-neutral-medium font-poppins">Document your journey with notes and photos</p>
          </div>
          
          <Button 
            onClick={handleNewEntry}
            className="bg-primary text-primary-foreground hover:bg-primary-dark py-2 px-4 rounded-lg text-sm font-medium flex items-center w-full md:w-auto justify-center"
          >
            <i className="ri-add-line mr-1"></i>
            New Entry
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Journal Timeline */}
          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle>Your Entries</CardTitle>
              <div className="mt-2">
                <Input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </CardHeader>
            <CardContent>
              {Object.keys(groupedEntries).length > 0 ? (
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                  {Object.entries(groupedEntries).map(([monthYear, monthEntries]) => (
                    <div key={monthYear}>
                      <h3 className="font-medium text-sm bg-neutral-white py-2 sticky top-0 z-10">
                        {monthYear}
                      </h3>
                      <div className="space-y-3 mt-2">
                        {monthEntries.map((entry: any) => (
                          <div
                            key={entry.id}
                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                              selectedEntry === entry.id ? 'border-primary bg-primary-light/30' : 'hover:border-primary'
                            }`}
                            onClick={() => handleViewEntry(entry.id)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{entry.title}</span>
                              <span className="text-xs text-neutral-medium">
                                {formatDate(entry.date)}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-medium line-clamp-2">
                              {entry.content}
                            </p>
                            {entry.entryType === 'photo' && (
                              <div className="flex items-center mt-2 text-xs text-primary-foreground">
                                <i className="ri-image-line mr-1"></i>
                                <span>Has photo</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-neutral-medium mb-2">
                    {searchTerm ? "No matching entries found" : "No journal entries yet"}
                  </p>
                  <p className="text-sm">
                    {searchTerm ? "Try a different search term" : "Create your first entry to start documenting your journey"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Entry Details */}
          <Card className="shadow-soft md:col-span-2">
            {selectedEntryDetails ? (
              <>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>{selectedEntryDetails.title}</CardTitle>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-neutral-medium hover:text-destructive"
                        onClick={() => handleDeleteEntry(selectedEntryDetails.id)}
                      >
                        <i className="ri-delete-bin-line"></i>
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-neutral-medium mt-1">
                    <span>{formatDate(selectedEntryDetails.date)}</span>
                    {selectedEntryDetails.pregnancyWeek && (
                      <span className="ml-3 bg-primary-light px-2 py-0.5 rounded-full text-xs">
                        Week {selectedEntryDetails.pregnancyWeek}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedEntryDetails.image && (
                    <div className="mb-4">
                      <img 
                        src={selectedEntryDetails.image} 
                        alt={selectedEntryDetails.title} 
                        className="w-full max-h-96 object-contain rounded-lg"
                      />
                    </div>
                  )}
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line">{selectedEntryDetails.content}</p>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-full py-20">
                <div className="text-center">
                  <div className="bg-primary-light w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-book-2-line text-2xl text-primary-dark"></i>
                  </div>
                  <h3 className="font-medium mb-2">Select an entry</h3>
                  <p className="text-sm text-neutral-medium max-w-md">
                    Select a journal entry from the sidebar or create a new one to view it here
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
      </main>
      
      <MobileNavigation />
    </div>
  );
}
