"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { CatalogFormData } from "../../../lib/schemas";
import { useCreateCatalog } from "../../../hooks/useCatalogs";
import { CatalogForm } from "../../../components/catalogs/CatalogsForm";

export default function CreateMedicalDevicePage() {
  const router = useRouter();
  const { mutate: createCatalog, isPending } = useCreateCatalog();

  const handleSubmit = async (data: CatalogFormData) => {
    createCatalog(data, {
      onSuccess: () => {
        router.push("/ichiba/app/catalogs");
      },
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link
          href="/ichiba/app/catalogs"
          className="flex items-center text-muted-foreground text-sm hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar Catalogs
        </Link>
      </div>
      <div className="mx-auto max-w-2xl">
        <CatalogForm onSubmit={handleSubmit} isLoading={isPending} />
      </div>
    </div>
  );
}
