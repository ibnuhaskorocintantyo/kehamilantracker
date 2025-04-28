import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertFertilityDataSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

// Define the extended schema for the form
const formSchema = insertFertilityDataSchema.extend({
  basalBodyTemperature: z.string()
    .optional()
    .refine(val => !val || (parseFloat(val) >= 35.5 && parseFloat(val) <= 38.5), {
      message: "Temperature should be between 35.5°C and 38.5°C",
    }),
  cervicalMucus: z.string().optional(),
  ovulationTestResult: z.boolean().optional(),
  notes: z.string().optional(),
});

type FertilityFormValues = z.infer<typeof formSchema>;
interface FertilityData {
  id: number;
  userId: number;
  date: string;
  basalBodyTemperature?: string;
  cervicalMucus?: string;
  ovulationTestResult?: boolean;
  notes?: string;
}

interface CycleFormProps {
  userId: number;
  date: Date;
  onSuccess?: () => void;
}

export default function CycleForm({ userId, date, onSuccess }: CycleFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: user } = useQuery({
    queryKey: ['/api/users/1'],
  });
  
  const formattedDate = date.toISOString().split('T')[0];
  const { data: fertilityDataList } = useQuery<FertilityData[]>({
    queryKey: ['/api/users/1/fertility-data'],
    enabled: !!user,
  });

  const existingData = fertilityDataList?.find(
    (data) => data.date.split('T')[0] === formattedDate
  );

  const form = useForm<FertilityFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: userId|| 1,
      date: formattedDate,
      basalBodyTemperature: existingData?.basalBodyTemperature || "",
      cervicalMucus: existingData?.cervicalMucus || "",
      ovulationTestResult: existingData?.ovulationTestResult || false,
      notes: existingData?.notes || "",
    },
  });
  
  const mutation = useMutation({
    mutationFn: async (values: FertilityFormValues) => {
      const requestUrl = existingData
        ? `/api/fertility-data/${existingData.id}`
        : "/api/fertility-data"; 
      return apiRequest(existingData ? "PATCH" : "POST", requestUrl, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/fertility-data'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/cycles'] });
      toast({
        title: "Success",
        description: existingData
          ? "Fertility data has been updated."
          : "Fertility data has been saved.",
      });
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save fertility data. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(values: FertilityFormValues) {
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="basalBodyTemperature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Basal Body Temperature (°C)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="36.5"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Measure immediately upon waking before any activity
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="cervicalMucus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cervical Mucus</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="dry">Dry</SelectItem>
                  <SelectItem value="sticky">Sticky</SelectItem>
                  <SelectItem value="creamy">Creamy</SelectItem>
                  <SelectItem value="eggwhite">Egg White</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Egg white consistency indicates high fertility
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="ovulationTestResult"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Positive Ovulation Test</FormLabel>
                <FormDescription>
                  Did your ovulation test show a positive result?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional observations here..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Saving...
            </>
          ) : existingData ? "Update" : "Save"}
        </Button>
      </form>
    </Form>
  );
}