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
import { Loader2 } from "lucide-react";
import { type SalesTargetFormData, salesTargetSchema } from "../../lib/schemas";
import { useProfiles } from "../../hooks/useProfiles";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SalesTargetFormProps {
  initialData?: SalesTargetFormData & { id?: string };
  onSubmit: (data: SalesTargetFormData) => Promise<void>;
  isLoading?: boolean;
}

export function SalesTargetForm({ initialData, onSubmit, isLoading }: SalesTargetFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const { data: profiles } = useProfiles();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SalesTargetFormData>({
    resolver: zodResolver(salesTargetSchema),
    defaultValues: initialData,
  });

  const handleFormSubmit = async (data: SalesTargetFormData) => {
    setFormError(null);

    try {
      console.log(data);
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

      setFormError(error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan data");
    }
  };

  const profileId = watch("profiles_id");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData?.id ? "Edit SalesTarget" : "Buat SalesTarget Baru"}</CardTitle>
      </CardHeader>
      <CardContent>
        {formError && <div className="mb-4 rounded bg-red-50 p-3 text-red-700">{formError}</div>}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Select Salesperson */}
          <div className="space-y-2">
            <Label htmlFor="profiles_id">Sales *</Label>
            <Select value={profileId || ""} onValueChange={(value) => setValue("profiles_id", value)}>
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
            {/* {errors.id && <p className="text-red-500 text-sm">{errors.id.message}</p>} */}
          </div>

          {/* target_amount */}
          <div className="space-y-2">
            <Label htmlFor="target_amount">Target Amount</Label>
            <Input id="target_amount" {...register("target_amount")} placeholder="Target Amount" />
            {errors.target_amount && <p className="text-red-500 text-sm">{errors.target_amount.message}</p>}
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
