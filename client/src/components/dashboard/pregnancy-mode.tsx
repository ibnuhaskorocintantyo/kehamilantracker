import { useState } from 'react';
import { Baby, Calendar, ArrowLeftCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Cycle } from '@shared/schema';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface PregnancyModeProps {
  previousCycles: Cycle[];
  onExitPregnancyMode: () => void;
}

export default function PregnancyMode({ previousCycles, onExitPregnancyMode }: PregnancyModeProps) {
  // No need for isExpanded state in this component
  
  return (
    <div className="card primary overflow-hidden">
      <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/10 p-6 relative">
        <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="hsl(var(--primary))" d="M44.2,-76.1C58.3,-69.9,71.3,-60.1,77.8,-46.7C84.3,-33.3,84.3,-16.7,83.2,-0.7C82.1,15.3,80,30.7,73.5,44.7C67,58.7,56.1,71.3,42.5,76.6C28.8,81.8,12.4,79.7,-1.9,82.9C-16.2,86.1,-28.3,94.6,-43.1,94.9C-57.9,95.3,-75.4,87.4,-85.5,73.4C-95.6,59.4,-98.3,39.3,-97.6,20.8C-96.8,2.3,-92.7,-14.7,-84.4,-28.1C-76.1,-41.5,-63.6,-51.4,-49.4,-57.9C-35.2,-64.5,-19.3,-67.7,-2.4,-64.2C14.5,-60.6,30.1,-82.4,44.2,-76.1Z" transform="translate(100 100)" />
          </svg>
        </div>
        
        <div className="flex items-center gap-4 mb-4 relative z-10">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Baby className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-lora font-semibold text-primary">Pregnancy Mode Active</h3>
        </div>
        
        <p className="text-neutral-dark mb-6 relative z-10">
          Your cycle tracking has been paused while you're pregnant. View your pregnancy journey on the home page.
        </p>
        
        <Accordion type="single" collapsible className="w-full relative z-10">
          <AccordionItem value="past-cycles" className="border border-primary/20 rounded-lg">
            <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-primary/5">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>View Past Cycle Data</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-2 bg-white/80">
              {previousCycles.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {previousCycles.map((cycle) => (
                    <div key={cycle.id} className="rounded-md bg-primary/5 p-3 flex justify-between">
                      <div>
                        <div className="text-sm font-medium text-primary">Period</div>
                        <div className="text-xs text-neutral-dark">
                          {formatDate(cycle.startDate)} {cycle.endDate ? `- ${formatDate(cycle.endDate)}` : '(ongoing)'}
                        </div>
                      </div>
                      <div className="text-xs text-neutral-medium">
                        {/* If cycle has a length, display it */}
                        {cycle.cycleLength && (
                          <div className="italic">{cycle.cycleLength} days</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-neutral-medium py-2">No previous cycle data available.</div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="mt-6 relative z-10">
          <Button 
            onClick={onExitPregnancyMode}
            variant="outline" 
            className="transition-all duration-300 border-primary/20 hover:border-primary/50 hover:bg-primary/5 text-primary"
          >
            <ArrowLeftCircle className="h-4 w-4 mr-2" />
            <span>Switch Back to Cycle Tracking</span>
          </Button>
        </div>
      </div>
    </div>
  );
}