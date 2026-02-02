"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { VisitFormData } from "../../../lib/schemas";
import { toast } from "sonner";
import { useState } from "react";
import { useCreateVisit } from "../../../hooks/useVisits";
import { VisitForm } from "../../../components/visits/VisitForm";

export default function CreateVisitPage() {
  const router = useRouter();
  const { mutate: createVisit, isPending } = useCreateVisit();
  const [formError] = useState<string | null>(null);

  const handleSubmit = async (data: VisitFormData) => {
    createVisit(data, {
      onSuccess: () => {
        toast.success("Visit berhasil dibuat");
        router.push("/ichiba/app/visits");
      },
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link
          href="/ichiba/app/visits"
          className="flex items-center text-muted-foreground text-sm hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar Visit
        </Link>
      </div>
      {formError && (
        <div className="mb-4 rounded bg-red-50 p-4 text-red-700">
          <p className="font-semibold">Error:</p>
          <p>{formError}</p>
        </div>
      )}
      <div className="mx-auto max-w-2xl">
        <VisitForm onSubmit={handleSubmit} isLoading={isPending} />
      </div>
    </div>
  );
}
