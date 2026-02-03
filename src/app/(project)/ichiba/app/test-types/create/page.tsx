"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { TestTypeFormData } from "../../../lib/schemas";
import { useCreateTestType } from "../../../hooks/useTestTypes";
import { TestTypeForm } from "../../../components/test-types/TestTypesForm";

export default function TestTypeDevicePage() {
  const router = useRouter();
  const { mutate: createTestType, isPending } = useCreateTestType();

  const handleSubmit = async (data: TestTypeFormData) => {
    createTestType(data, {
      onSuccess: () => {
        router.push("/ichiba/app/test-types");
      },
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link
          href="/ichiba/app/test-types"
          className="flex items-center text-muted-foreground text-sm hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar TestTypes
        </Link>
      </div>
      <div className="mx-auto max-w-2xl">
        <TestTypeForm onSubmit={handleSubmit} isLoading={isPending} />
      </div>
    </div>
  );
}
