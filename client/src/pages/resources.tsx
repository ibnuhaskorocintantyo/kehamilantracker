import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { processMedicalDocument } from "@/lib/tesseract";

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResource, setSelectedResource] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocText, setUploadedDocText] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const { toast } = useToast();
  
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/users/1'],
  });
  
  const { data: resources, isLoading: isResourcesLoading } = useQuery({
    queryKey: ['/api/resources'],
  });
  
  const { data: medicalRecords, isLoading: isMedicalRecordsLoading } = useQuery({
    queryKey: ['/api/users/1/medical-records'],
    enabled: !!user,
  });
  
  const isLoading = isUserLoading || isResourcesLoading || isMedicalRecordsLoading;
  
  const filteredResources = resources && searchTerm 
    ? resources.filter(resource => 
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        resource.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : resources;
  
  const handleSelectResource = (resourceId: number) => {
    setSelectedResource(resourceId);
  };
  
  const selectedResourceDetails = selectedResource 
    ? resources?.find(resource => resource.id === selectedResource) 
    : resources?.[0];
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setDocumentFile(file);
    setIsUploading(true);
    setUploadedDocText("");
    
    try {
      const extractedText = await processMedicalDocument(file);
      setUploadedDocText(extractedText);
      
      toast({
        title: "Document processed",
        description: "Text has been extracted from your document.",
      });
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "Could not extract text from document. Please try again with a clearer image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-white">
        <Header />
        
        <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-6 mb-16 md:mb-0">
          <Skeleton className="h-12 w-60 mb-4" />
          <Skeleton className="h-6 w-40 mb-8" />
          
          <Tabs defaultValue="resources">
            <TabsList className="mb-6">
              <TabsTrigger value="resources">
                <Skeleton className="h-4 w-24" />
              </TabsTrigger>
              <TabsTrigger value="medical">
                <Skeleton className="h-4 w-24" />
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="resources">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-72" />
                <Skeleton className="h-72" />
                <Skeleton className="h-72" />
              </div>
            </TabsContent>
          </Tabs>
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
          <h2 className="font-lora text-2xl md:text-3xl font-semibold text-neutral-dark mb-2">Resources</h2>
          <p className="text-neutral-medium font-poppins">Classes, workshops, and medical document management</p>
        </div>
        
        <Tabs defaultValue="resources">
          <TabsList className="mb-6">
            <TabsTrigger value="resources">Workshops & Classes</TabsTrigger>
            <TabsTrigger value="medical">Medical Records</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resources">
            <div className="mb-6">
              <Input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            {filteredResources && filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredResources.map(resource => (
                  <div 
                    key={resource.id}
                    className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                      selectedResource === resource.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleSelectResource(resource.id)}
                  >
                    {resource.image && (
                      <img 
                        src={resource.image} 
                        alt={resource.title} 
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-medium mb-1">{resource.title}</h3>
                      <p className="text-xs text-neutral-medium mb-2">{resource.description}</p>
                      <div className="flex items-center text-xs text-primary-dark">
                        <i className="ri-time-line mr-1"></i>
                        <span>Next session: {resource.nextSession}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border rounded-lg">
                <p className="text-neutral-medium mb-2">
                  {searchTerm ? "No matching resources found" : "No resources available"}
                </p>
                <p className="text-sm">
                  {searchTerm ? "Try a different search term" : "Check back later for new resources"}
                </p>
              </div>
            )}
            
            {selectedResourceDetails && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-6">View Details</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{selectedResourceDetails.title}</DialogTitle>
                  </DialogHeader>
                  <div>
                    {selectedResourceDetails.image && (
                      <img 
                        src={selectedResourceDetails.image} 
                        alt={selectedResourceDetails.title} 
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="border rounded-lg p-3">
                        <p className="text-sm font-medium">Type</p>
                        <p className="text-sm capitalize">{selectedResourceDetails.type}</p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <p className="text-sm font-medium">Duration</p>
                        <p className="text-sm">{selectedResourceDetails.duration}</p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <p className="text-sm font-medium">Next Session</p>
                        <p className="text-sm">{selectedResourceDetails.nextSession}</p>
                      </div>
                    </div>
                    <p className="text-sm mb-4">{selectedResourceDetails.description}</p>
                    <Button className="w-full">Register</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>
          
          <TabsContent value="medical">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Document Upload */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Upload Medical Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    Upload and analyze your medical documents. Our system will extract text to help you organize information.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-neutral-light rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="document-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <label 
                        htmlFor="document-upload"
                        className="cursor-pointer block"
                      >
                        <div className="bg-primary-light w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="ri-upload-2-line text-xl text-primary-dark"></i>
                        </div>
                        <p className="font-medium mb-1">Upload Document</p>
                        <p className="text-xs text-neutral-medium mb-2">
                          Click to select a document image (PDF, JPG, PNG)
                        </p>
                        {documentFile && (
                          <p className="text-sm text-primary-foreground">
                            Selected: {documentFile.name}
                          </p>
                        )}
                      </label>
                    </div>
                    
                    {isUploading ? (
                      <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
                        <p>Processing document...</p>
                      </div>
                    ) : uploadedDocText ? (
                      <div>
                        <h4 className="font-medium mb-2">Extracted Text</h4>
                        <div className="border rounded-lg p-3 max-h-60 overflow-y-auto bg-white">
                          <p className="text-sm whitespace-pre-line">{uploadedDocText}</p>
                        </div>
                        <div className="mt-4 space-y-3">
                          <label className="text-sm font-medium">Document Title</label>
                          <Input placeholder="Enter a title for this document" />
                          <Button className="w-full">Save to Medical Records</Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
              
              {/* Medical Records List */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Your Medical Records</CardTitle>
                </CardHeader>
                <CardContent>
                  {medicalRecords && medicalRecords.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {medicalRecords.map(record => (
                        <div key={record.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{record.title}</h4>
                            <span className="text-xs rounded-full bg-neutral-light px-2 py-0.5">
                              {record.documentType}
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-neutral-medium mb-2">
                            <i className="ri-calendar-line mr-1"></i>
                            <span>{new Date(record.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <p className="text-xs line-clamp-2">
                            {record.notes || record.documentText?.substring(0, 100) + '...'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-neutral-medium mb-2">No medical records saved</p>
                      <p className="text-sm">Upload your first document to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <MobileNavigation />
    </div>
  );
}
