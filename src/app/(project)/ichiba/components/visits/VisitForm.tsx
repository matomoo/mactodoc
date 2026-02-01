"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown, Loader2, Plus, Search, X } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { useCustomers } from "../../hooks/useCustomers";
import { useMedicalDevices } from "../../hooks/useMedicalDevices";
import { useProfiles } from "../../hooks/useProfiles";
import { type VisitFormData, visitSchema } from "../../lib/schemas";

interface VisitFormProps {
  initialData?: VisitFormData & { id?: string };
  onSubmit: (data: VisitFormData) => Promise<void>;
  isLoading?: boolean;
}

export function VisitForm({ initialData, onSubmit, isLoading }: VisitFormProps) {
  const [date, setDate] = useState<Date | undefined>(initialData?.tanggal ? new Date(initialData.tanggal) : new Date());
  const [selectedMedicalDevices, setSelectedMedicalDevices] = useState<string[]>(initialData?.medical_devices || []);
  const [formError, setFormError] = useState<string | null>(null);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);
  const [deviceSearchQuery, setDeviceSearchQuery] = useState("");

  const { data: customers } = useCustomers();
  const { data: profiles } = useProfiles();
  const { data: medicalDevices } = useMedicalDevices();

  const filteredCustomers =
    customers?.filter((customer) => customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase())) || [];

  const filteredMedicalDevices =
    medicalDevices?.filter((device) => device.name.toLowerCase().includes(deviceSearchQuery.toLowerCase())) || [];

  const selectedDeviceNames =
    medicalDevices?.filter((device) => selectedMedicalDevices.includes(device.id)).map((device) => device.name) || [];

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

  const toggleDeviceSelection = (deviceId: string) => {
    const newSelectedDevices = selectedMedicalDevices.includes(deviceId)
      ? selectedMedicalDevices.filter((id) => id !== deviceId)
      : [...selectedMedicalDevices, deviceId];

    setSelectedMedicalDevices(newSelectedDevices);
    setValue("medical_devices", newSelectedDevices);
  };

  const removeDevice = (deviceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelectedDevices = selectedMedicalDevices.filter((id) => id !== deviceId);
    setSelectedMedicalDevices(newSelectedDevices);
    setValue("medical_devices", newSelectedDevices);
  };

  const handleDeviceSelectorClose = () => {
    setShowDeviceSelector(false);
    setDeviceSearchQuery("");
  };

  const customerId = watch("customer_id");
  const profileId = watch("sales_id");

  const handleFormSubmit = async (data: VisitFormData) => {
    setFormError(null);
    try {
      await Promise.resolve(onSubmit(data));
    } catch (error: unknown) {
      console.error("Form submission error:", error);
      if (
        error &&
        typeof error === "object" &&
        "digest" in error &&
        typeof (error as Record<string, unknown>).digest === "string" &&
        (error as Record<string, string>).digest.startsWith("NEXT_REDIRECT")
      ) {
        return;
      }
      setFormError(error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan order");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{initialData?.id ? "Edit Visit" : "Buat Visit Baru"}</CardTitle>
        </CardHeader>
        <CardContent>
          {formError && <div className="mb-4 rounded bg-red-50 p-3 text-red-700">{formError}</div>}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Customer Selection with Search */}
            <div className="space-y-2">
              <Label htmlFor="customer_id">Customer *</Label>
              <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={customerOpen}
                    className="w-full justify-between"
                  >
                    {customerId ? customers?.find((customer) => customer.id === customerId)?.name : "Pilih customer..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="p-2">
                    <div className="relative">
                      <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari customer..."
                        className="pl-8"
                        value={customerSearchQuery}
                        onChange={(e) => setCustomerSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-75 overflow-y-auto">
                    {filteredCustomers.length === 0 ? (
                      <div className="py-6 text-center text-sm">
                        <div className="text-muted-foreground">Tidak ditemukan</div>
                      </div>
                    ) : (
                      <div className="p-1">
                        {filteredCustomers.map((customer) => (
                          <button
                            type="button"
                            key={customer.id}
                            className={cn(
                              "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                              customerId === customer.id && "bg-accent",
                            )}
                            onClick={() => {
                              setValue("customer_id", customer.id);
                              setCustomerOpen(false);
                              setCustomerSearchQuery("");
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", customerId === customer.id ? "opacity-100" : "opacity-0")}
                            />
                            {customer.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
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

            {/* Medical Devices Selection - IMPROVED */}
            <div className="space-y-2">
              <Label>Medical Devices *</Label>

              {/* Selected Devices Display */}
              <div className="mb-3">
                {selectedDeviceNames.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada devices yang dipilih</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedDeviceNames.map((deviceName, index) => {
                      const deviceId = selectedMedicalDevices[index];
                      return (
                        <div
                          key={deviceId}
                          className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                        >
                          {deviceName}
                          <button
                            type="button"
                            onClick={(e) => removeDevice(deviceId, e)}
                            className="ml-1 rounded-full p-0.5 hover:bg-blue-200"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add Button */}
              <Button type="button" variant="outline" className="w-full" onClick={() => setShowDeviceSelector(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Medical Device
              </Button>

              {errors.medical_devices && <p className="text-red-500 text-sm">{errors.medical_devices.message}</p>}
            </div>

            {/* Select Salesperson */}
            <div className="space-y-2">
              <Label htmlFor="sales_id">Sales *</Label>
              <Select value={profileId} onValueChange={(value) => setValue("sales_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Sales" />
                </SelectTrigger>
                <SelectContent>
                  {profiles?.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sales_id && <p className="text-red-500 text-sm">{errors.sales_id.message}</p>}
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

      {/* Medical Device Selector Modal/Bottom Sheet */}
      {showDeviceSelector && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="w-full max-w-md rounded-t-lg bg-white shadow-lg animate-in slide-in-from-bottom-full sm:rounded-lg sm:animate-in sm:slide-in-from-bottom-0">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-semibold">Pilih Medical Devices</h3>
              <Button variant="ghost" size="sm" onClick={handleDeviceSelectorClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Input */}
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari medical device..."
                  className="pl-9"
                  value={deviceSearchQuery}
                  onChange={(e) => setDeviceSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Device List */}
            <div className="max-h-64 overflow-y-auto p-4 pt-0">
              {filteredMedicalDevices.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="text-muted-foreground">Tidak ditemukan</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMedicalDevices.map((device) => {
                    const isSelected = selectedMedicalDevices.includes(device.id);
                    return (
                      <button
                        key={device.id}
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors",
                          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50",
                        )}
                        onClick={() => toggleDeviceSelection(device.id)}
                      >
                        <span className="font-medium">{device.name}</span>
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border">
                          {isSelected && <Check className="h-3 w-3 text-blue-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">{selectedMedicalDevices.length} device dipilih</div>
                <Button onClick={handleDeviceSelectorClose}>Selesai</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
