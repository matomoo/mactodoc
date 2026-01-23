"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { type VisitFormData, visitSchema } from "../../lib/schemas";
import { useCustomers } from "../../hooks/useCustomers";
import { useMedicalDevices } from "../../hooks/useMedicalDevices";

interface VisitFormProps {
  initialData?: VisitFormData & { id?: string };
  onSubmit: (data: VisitFormData) => Promise<void>;
  isLoading?: boolean;
}

export function VisitForm({ initialData, onSubmit, isLoading }: VisitFormProps) {
  const [date, setDate] = useState<Date | undefined>(initialData?.tanggal ? new Date(initialData.tanggal) : new Date());
  const [selectedMedicalDevices, setSelectedMedicalDevices] = useState<string[]>(initialData?.medical_devices || []);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: customers } = useCustomers();
  const { data: medicalDevices } = useMedicalDevices();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: initialData,
  });

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setValue("tanggal", format(selectedDate, "yyyy-MM-dd"));
    }
  };

  const handleTestToggle = (testId: string) => {
    const newselectedMedicalDevices = selectedMedicalDevices.includes(testId)
      ? selectedMedicalDevices.filter((id) => id !== testId)
      : [...selectedMedicalDevices, testId];

    setSelectedMedicalDevices(newselectedMedicalDevices);
    setValue("medical_devices", newselectedMedicalDevices);
  };

  const customerId = watch("customer_id");

  const handleFormSubmit = async (data: VisitFormData) => {
    setFormError(null);

    try {
      await Promise.resolve(onSubmit(data));
    } catch (error: unknown) {
      console.error("Form submission error:", error);

      // Check if it's a redirect error (if using server actions)
      if (
        error &&
        typeof error === "object" &&
        "digest" in error &&
        typeof (error as Record<string, unknown>).digest === "string" &&
        (error as Record<string, string>).digest.startsWith("NEXT_REDIRECT")
      ) {
        // This is a redirect, not an error
        return;
      }

      setFormError(error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan order");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData?.id ? "Edit Visit" : "Buat Visit Baru"}</CardTitle>
      </CardHeader>
      <CardContent>
        {formError && <div className="mb-4 rounded bg-red-50 p-3 text-red-700">{formError}</div>}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="customer_id">Customer *</Label>
            <Select value={customerId} onValueChange={(value) => setValue("customer_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih customer" />
              </SelectTrigger>
              <SelectContent>
                {customers?.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customer_id && <p className="text-red-500 text-sm">{errors.customer_id.message}</p>}
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Tanggal *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
              </PopoverContent>
            </Popover>
            <Input type="hidden" {...register("tanggal")} />
            {errors.tanggal && <p className="text-red-500 text-sm">{errors.tanggal.message}</p>}
          </div>

          {/* Test Types Selection */}
          <div className="space-y-2">
            <Label>Medical Devices *</Label>
            <div className="grid grid-cols-2 gap-2">
              {medicalDevices?.map((test) => (
                <div key={test.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`test-${test.id}`}
                    checked={selectedMedicalDevices.includes(test.id)}
                    onCheckedChange={() => handleTestToggle(test.id)}
                  />
                  <Label htmlFor={`test-${test.id}`} className="font-normal">
                    {test.name}
                  </Label>
                </div>
              ))}
            </div>
            {errors.medical_devices && <p className="text-red-500 text-sm">{errors.medical_devices.message}</p>}
          </div>

          {/* Marketing */}
          <div className="space-y-2">
            <Label htmlFor="marketing">Marketing</Label>
            <Input id="marketing" {...register("marketing")} placeholder="Nama marketing" />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Lainnya</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Catatan tambahan" rows={3} />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Visit"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
