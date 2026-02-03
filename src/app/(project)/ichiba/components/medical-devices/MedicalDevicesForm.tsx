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
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { type MedicalDeviceFormData, medicalDeviceSchema } from "../../lib/schemas";
import { useTestTypes } from "../../hooks/useTestTypes";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MedicalDeviceFormProps {
  initialData?: MedicalDeviceFormData & { id?: string };
  onSubmit: (data: MedicalDeviceFormData) => Promise<void>;
  isLoading?: boolean;
}

export function MedicalDeviceForm({ initialData, onSubmit, isLoading }: MedicalDeviceFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [testTypeSearchQuery, setTestTypeSearchQuery] = useState("");

  const { data: testTypes } = useTestTypes();

  const filteredTestTypes =
    testTypes?.filter((testTypes) => testTypes.name.toLowerCase().includes(testTypeSearchQuery.toLowerCase())) || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MedicalDeviceFormData>({
    resolver: zodResolver(medicalDeviceSchema),
    defaultValues: initialData,
  });

  const testTypeId = watch("test_types_id");

  const handleFormSubmit = async (data: MedicalDeviceFormData) => {
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

      setFormError(error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan data");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData?.id ? "Edit Medical Device" : "Buat Medical Device Baru"}</CardTitle>
      </CardHeader>
      <CardContent>
        {formError && <div className="mb-4 rounded bg-red-50 p-3 text-red-700">{formError}</div>}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Medical Device</Label>
            <Input id="name" {...register("name")} placeholder="Nama Medical Device" />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          {/* merk */}
          <div className="space-y-2">
            <Label htmlFor="merk">Merk</Label>
            <Input id="merk" {...register("merk")} placeholder="Mer" />
            {errors.merk && <p className="text-red-500 text-sm">{errors.merk.message}</p>}
          </div>

          {/* type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Input id="type" {...register("type")} placeholder="Mer" />
            {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
          </div>

          {/* series */}
          <div className="space-y-2">
            <Label htmlFor="series">Series</Label>
            <Input id="series" {...register("series")} placeholder="Mer" />
            {errors.series && <p className="text-red-500 text-sm">{errors.series.message}</p>}
          </div>

          {/* Select Salesperson */}
          <div className="space-y-2">
            <Label htmlFor="test_type_id">Test Type *</Label>
            <Select value={testTypeId} onValueChange={(value) => setValue("test_types_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Test Type" />
              </SelectTrigger>
              <SelectContent>
                {testTypes?.map((data) => (
                  <SelectItem key={data.id} value={data.id}>
                    {data.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.test_types_id && <p className="text-red-500 text-sm">{errors.test_types_id.message}</p>}
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" {...register("description")} placeholder="Catatan tambahan" rows={3} />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Data"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
