"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Plus, Search, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useMedicalDevices } from "../../hooks/useMedicalDevices";
import { type CustomerFormData, customerSchema } from "../../lib/schemas";

interface CustomerFormProps {
  initialData?: CustomerFormData;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  isLoading?: boolean;
}

export function CustomerForm({ initialData, onSubmit, isLoading }: CustomerFormProps) {
  const [selectedMedicalDevices, setSelectedMedicalDevices] = useState<string[]>(initialData?.medical_devices || []);
  const [formError, setFormError] = useState<string | null>(null);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);
  const [deviceSearchQuery, setDeviceSearchQuery] = useState("");

  const { data: medicalDevices } = useMedicalDevices();

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
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData,
  });

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

  const handleFormSubmit = async (data: CustomerFormData) => {
    setFormError(null);

    try {
      await onSubmit(data);
      // Success toast will be shown by the mutation onSuccess
    } catch (error) {
      console.error("Form submission error:", error);
      setFormError(error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan");
      toast.error("Gagal menyimpan data customer");
    }
  };

  const jenisValue = watch("jenis");
  const bpjsValue = watch("bpjs");
  const kerjasamaValue = watch("kerjasama");

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{initialData ? "Edit Customer" : "Tambah Customer Baru"}</CardTitle>
        </CardHeader>
        <CardContent>
          {formError && <div className="mb-4 rounded bg-red-50 p-3 text-red-700">{formError}</div>}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Customer *</Label>
              <Input id="name" {...register("name")} placeholder="Masukkan nama customer" />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">Kontak Person</Label>
              <Input id="contact_person" {...register("contact_person")} placeholder="Nama kontak person" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telepon</Label>
              <Input id="phone" {...register("phone")} placeholder="Nomor telepon" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="alamat@email.com" />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Input id="address" {...register("address")} placeholder="Alamat lengkap" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Wilayah</Label>
              <Input id="wilayah" {...register("wilayah")} placeholder="Wilayah" />
            </div>

            {/* Select Jenis */}
            <div className="space-y-2">
              <Label htmlFor="test_type_id">Jenis *</Label>
              <Select
                value={jenisValue || ""}
                onValueChange={(value) => setValue("jenis", value as "klinik" | "rs" | "rsud")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="klinik">Klinik</SelectItem>
                  <SelectItem value="rs">RS (Rumah Sakit)</SelectItem>
                  <SelectItem value="rsud">RSUD</SelectItem>
                </SelectContent>
              </Select>
              {errors.jenis && <p className="text-red-500 text-sm">{errors.jenis.message}</p>}
            </div>

            {/* Select BPJS */}
            <div className="space-y-2">
              <Label htmlFor="test_type_id">BPJS *</Label>
              <Select value={bpjsValue || ""} onValueChange={(value) => setValue("bpjs", value as "ya" | "tidak")}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih BPJS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ya">Ya</SelectItem>
                  <SelectItem value="tidak">Tidak</SelectItem>
                </SelectContent>
              </Select>
              {errors.bpjs && <p className="text-red-500 text-sm">{errors.bpjs.message}</p>}
            </div>

            {/* Select Kerjsama */}
            <div className="space-y-2">
              <Label htmlFor="test_type_id">Kersajama *</Label>
              <Select
                value={kerjasamaValue || ""}
                onValueChange={(value) => setValue("kerjasama", value as "ya" | "belum")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kerjasama" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ya">Ya</SelectItem>
                  <SelectItem value="belum">Belum</SelectItem>
                </SelectContent>
              </Select>
              {errors.kerjasama && <p className="text-red-500 text-sm">{errors.kerjasama.message}</p>}
            </div>

            {/* Medical Devices Selection - IMPROVED */}
            {/* <div className="space-y-2">
              <Label>Medical Devices *</Label>

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

              <Button type="button" variant="outline" className="w-full" onClick={() => setShowDeviceSelector(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Medical Device
              </Button>

              {errors.medical_devices && <p className="text-red-500 text-sm">{errors.medical_devices.message}</p>}
            </div> */}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
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
