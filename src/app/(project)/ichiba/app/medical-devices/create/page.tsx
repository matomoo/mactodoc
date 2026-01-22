"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { MedicalDeviceFormData } from "../../../lib/schemas";
import { useCreateMedicalDevices } from "../../../hooks/useMedicalDevices";
import { MedicalDeviceForm } from "../../../components/medical-devices/MedicalDevicesForm";

export default function CreateMedicalDevicePage() {
  const router = useRouter();
  const { mutate: createMedicalDevice, isPending } = useCreateMedicalDevices();

  const handleSubmit = async (data: MedicalDeviceFormData) => {
    createMedicalDevice(data, {
      onSuccess: () => {
        router.push("/ichiba/app/medical-devices");
      },
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link
          href="/ichiba/app/medical-devices"
          className="flex items-center text-muted-foreground text-sm hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar Medical Devices
        </Link>
      </div>
      <div className="mx-auto max-w-2xl">
        <MedicalDeviceForm onSubmit={handleSubmit} isLoading={isPending} />
      </div>
    </div>
  );
}
