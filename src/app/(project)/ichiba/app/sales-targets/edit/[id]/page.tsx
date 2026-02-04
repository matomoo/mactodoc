"use client";

// biome-ignore assist/source/organizeImports: <none>
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { SalesTargetFormData } from "@/app/(project)/ichiba/lib/schemas";
import { Button } from "@/components/ui/button";
import { useSalesTarget, useUpdateSalesTarget } from "@/app/(project)/ichiba/hooks/useSalesTargets";
import { SalesTargetForm } from "@/app/(project)/ichiba/components/sales-targets/SalesTargetsForm";

interface EditSalesTargetPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditSalesTargetPage({ params }: EditSalesTargetPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: dataSalesTarget, isLoading } = useSalesTarget(id);
  const { mutate: updateSalesTarget } = useUpdateSalesTarget();

  if (!id) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-2xl">ID SalesTarget tidak ditemukan</h2>
          <Link href="/ichiba/app/sales-targets">
            <Button>Kembali ke Daftar SalesTarget</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: SalesTargetFormData) => {
    updateSalesTarget(
      { id, data },
      {
        onSuccess: () => {
          router.push("/ichiba/app/sales-targets");
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

  if (!dataSalesTarget) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-2xl">SalesTarget tidak ditemukan</h2>
          <Link href="/ichiba/app/sales-targets">
            <Button>Kembali ke Daftar SalesTarget</Button>
          </Link>
        </div>
      </div>
    );
  }

  const initialData: SalesTargetFormData = {
    profiles_id: dataSalesTarget.profiles_id,
    target_amount: dataSalesTarget.target_amount || 0,
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link
          href="/ichiba/app/sales-targets"
          className="flex items-center text-muted-foreground text-sm hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar SalesTarget
        </Link>
      </div>
      <div className="mx-auto max-w-2xl">
        <SalesTargetForm initialData={initialData} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
