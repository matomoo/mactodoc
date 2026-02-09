"use client";

// biome-ignore assist/source/organizeImports: <none>
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { CatalogFormData } from "@/app/(project)/ichiba/lib/schemas";
import { Button } from "@/components/ui/button";
import { useCatalog, useUpdateCatalog } from "@/app/(project)/ichiba/hooks/useCatalogs";
import { CatalogForm } from "@/app/(project)/ichiba/components/catalogs/CatalogsForm";

interface EditCatalogPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditCatalogPage({ params }: EditCatalogPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: dataCatalog, isLoading } = useCatalog(id);
  const { mutate: updateCatalog } = useUpdateCatalog();

  if (!id) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-2xl">ID Catalog tidak ditemukan</h2>
          <Link href="/ichiba/app/catalogs">
            <Button>Kembali ke Daftar Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: CatalogFormData) => {
    updateCatalog(
      { id, data },
      {
        onSuccess: () => {
          router.push("/ichiba/app/catalogs");
        },
        onError: (error) => {
          console.error("Update failed:", error);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!dataCatalog) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-2xl">Catalog tidak ditemukan</h2>
          <Link href="/ichiba/app/catalogs">
            <Button>Kembali ke Daftar Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const initialData: CatalogFormData = {
    title: dataCatalog.title,
    category: dataCatalog.category || "",
    image_url: dataCatalog.image_url || "",
    brochure_url: dataCatalog.brochure_url || "",
    external_store_url: dataCatalog.external_store_url || "",
    description: dataCatalog.description || "",
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link
          href="/ichiba/app/catalogs"
          className="flex items-center text-muted-foreground text-sm hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar Catalog
        </Link>
      </div>
      <div className="mx-auto max-w-2xl">
        <CatalogForm initialData={initialData} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
