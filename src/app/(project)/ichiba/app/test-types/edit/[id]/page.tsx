"use client";

// biome-ignore assist/source/organizeImports: <none>
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { TestTypeFormData } from "@/app/(project)/ichiba/lib/schemas";
import { Button } from "@/components/ui/button";
import { useTestType, useUpdateTestType } from "@/app/(project)/ichiba/hooks/useTestTypes";
import { TestTypeForm } from "@/app/(project)/ichiba/components/test-types/TestTypesForm";

interface EditTestTypePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditTestTypePage({ params }: EditTestTypePageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: dataTestType, isLoading } = useTestType(id);
  const { mutate: updateTestType } = useUpdateTestType();

  if (!id) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-2xl">ID TestType tidak ditemukan</h2>
          <Link href="/ichiba/app/test-types">
            <Button>Kembali ke Daftar TestType</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: TestTypeFormData) => {
    updateTestType(
      { id, data },
      {
        onSuccess: () => {
          router.push("/ichiba/app/test-types");
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

  if (!dataTestType) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-2xl">TestType tidak ditemukan</h2>
          <Link href="/ichiba/app/test-types">
            <Button>Kembali ke Daftar TestType</Button>
          </Link>
        </div>
      </div>
    );
  }

  const initialData: TestTypeFormData = {
    name: dataTestType.name,
    description: dataTestType.description || "",
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link
          href="/ichiba/app/test-types"
          className="flex items-center text-muted-foreground text-sm hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar TestType
        </Link>
      </div>
      <div className="mx-auto max-w-2xl">
        <TestTypeForm initialData={initialData} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
