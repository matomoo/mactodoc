"use client";

// biome-ignore assist/source/organizeImports: <none>
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { VisitFormData } from "@/app/(project)/ichiba/lib/schemas";
import { Button } from "@/components/ui/button";
import { useUpdateVisit, useVisit } from "@/app/(project)/ichiba/hooks/useVisits";
import { VisitForm } from "@/app/(project)/ichiba/components/visits/VisitForm";

interface EditVisitPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditVisitPage({ params }: EditVisitPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: visit, isLoading: isVisitLoading } = useVisit(id);
  const { mutate: updateVisit } = useUpdateVisit();

  if (!id) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-2xl">ID Visit tidak ditemukan</h2>
          <Link href="/ichiba/app/visits">
            <Button>Kembali ke Daftar Visit</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: VisitFormData) => {
    updateVisit(
      { id, data },
      {
        onSuccess: () => {
          router.push("/ichiba/app/visits");
        },
        onError: (error) => {
          console.error("Update failed:", error);
        },
      },
    );
  };

  if (isVisitLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-2xl">Visit tidak ditemukan</h2>
          <Link href="/ichiba/app/visits">
            <Button>Kembali ke Daftar Visit</Button>
          </Link>
        </div>
      </div>
    );
  }

  const initialData: VisitFormData = {
    customer_id: visit.customer_id,
    tanggal: visit.tanggal,
    marketing: visit.marketing || "",
    notes: visit.notes || "",
    medical_devices: visit.visit_medical_devices.map((ot) => ot.medical_device.id),
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
      <div className="mx-auto max-w-2xl">
        <VisitForm initialData={initialData} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
