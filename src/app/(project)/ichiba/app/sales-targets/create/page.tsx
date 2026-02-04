"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { SalesTargetFormData } from "../../../lib/schemas";
import { useCreateSalesTarget } from "../../../hooks/useSalesTargets";
import { SalesTargetForm } from "../../../components/sales-targets/SalesTargetsForm";

export default function SalesTargetDevicePage() {
  const router = useRouter();
  const { mutate: createSalesTarget, isPending } = useCreateSalesTarget();

  const handleSubmit = async (data: SalesTargetFormData) => {
    createSalesTarget(data, {
      onSuccess: () => {
        router.push("/ichiba/app/sales-targets");
      },
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link
          href="/ichiba/app/sales-targets"
          className="flex items-center text-muted-foreground text-sm hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar SalesTargets
        </Link>
      </div>
      <div className="mx-auto max-w-2xl">
        <SalesTargetForm onSubmit={handleSubmit} isLoading={isPending} />
      </div>
    </div>
  );
}
