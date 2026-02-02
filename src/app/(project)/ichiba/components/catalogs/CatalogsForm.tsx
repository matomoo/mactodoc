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
import { type CatalogFormData, catalogSchema } from "../../lib/schemas";

interface CatalogFormProps {
  initialData?: CatalogFormData & { id?: string };
  onSubmit: (data: CatalogFormData) => Promise<void>;
  isLoading?: boolean;
}

export function CatalogForm({ initialData, onSubmit, isLoading }: CatalogFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CatalogFormData>({
    resolver: zodResolver(catalogSchema),
    defaultValues: initialData,
  });

  const handleFormSubmit = async (data: CatalogFormData) => {
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

      setFormError(error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan data");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData?.id ? "Edit Catalog" : "Buat Catalog Baru"}</CardTitle>
      </CardHeader>
      <CardContent>
        {formError && <div className="mb-4 rounded bg-red-50 p-3 text-red-700">{formError}</div>}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Nama Catalog</Label>
            <Input id="title" {...register("title")} placeholder="Nama Catalog" />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Input id="category" {...register("category")} placeholder="Kategori" />
            {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="image_url">Image</Label>
            <Input id="image_url" {...register("image_url")} placeholder="Image" />
            {errors.image_url && <p className="text-red-500 text-sm">{errors.image_url.message}</p>}
          </div>

          {/* External Store URL */}
          <div className="space-y-2">
            <Label htmlFor="external_store_url">External Store URL</Label>
            <Input id="external_store_url" {...register("external_store_url")} placeholder="External Store URL" />
            {errors.external_store_url && <p className="text-red-500 text-sm">{errors.external_store_url.message}</p>}
          </div>

          {/* Brochure URL */}
          <div className="space-y-2">
            <Label htmlFor="brochure_url">Brochure URL</Label>
            <Input id="brochure_url" {...register("brochure_url")} placeholder="Brochure URL" />
            {errors.brochure_url && <p className="text-red-500 text-sm">{errors.brochure_url.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Catatan tambahan"
              rows={30}
              className="min-h-150"
            />
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
