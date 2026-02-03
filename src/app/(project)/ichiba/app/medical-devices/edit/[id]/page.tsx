"use client";

// biome-ignore assist/source/organizeImports: <none>
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { MedicalDeviceFormData } from "@/app/(project)/ichiba/lib/schemas";
import { Button } from "@/components/ui/button";
import { useMedicalDevice, useUpdateMedicalDevices } from "@/app/(project)/ichiba/hooks/useMedicalDevices";
import { MedicalDeviceForm } from "@/app/(project)/ichiba/components/medical-devices/MedicalDevicesForm";

interface EditMedicalDevicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditMedicalDevicePage({ params }: EditMedicalDevicePageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: dataMedicalDevice, isLoading } = useMedicalDevice(id);
  const { mutate: updateMedicalDevice } = useUpdateMedicalDevices();

  if (!id) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-2xl">ID Medical Device tidak ditemukan</h2>
          <Link href="/ichiba/app/medical-devices">
            <Button>Kembali ke Daftar Medical Device</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: MedicalDeviceFormData) => {
    updateMedicalDevice(
      { id, data },
      {
        onSuccess: () => {
          router.push("/ichiba/app/medical-devices");
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

  if (!dataMedicalDevice) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-2xl">Medical Device tidak ditemukan</h2>
          <Link href="/ichiba/app/medical-devices">
            <Button>Kembali ke Daftar Medical Device</Button>
          </Link>
        </div>
      </div>
    );
  }

  const initialData: MedicalDeviceFormData = {
    name: dataMedicalDevice.name,
    description: dataMedicalDevice.description || "",
    merk: dataMedicalDevice.merk || "",
    series: dataMedicalDevice.series || "",
    type: dataMedicalDevice.type || "",
    test_types_id: dataMedicalDevice.test_types_id || "",
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link
          href="/ichiba/app/medical-devices"
          className="flex items-center text-muted-foreground text-sm hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar Medical Device
        </Link>
      </div>
      <div className="mx-auto max-w-2xl">
        <MedicalDeviceForm initialData={initialData} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
