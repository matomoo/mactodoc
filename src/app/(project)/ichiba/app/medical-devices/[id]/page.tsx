// biome-ignore assist/source/organizeImports: <none>
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { medicalDevicesService } from "../../../lib/services/medicalDevices";

interface MedicalDeviceDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MedicalDeviceDetailPage({ params }: MedicalDeviceDetailPageProps) {
  const { id } = await params;

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

  try {
    const medicalDevice = await medicalDevicesService.getById(id);

    if (!medicalDevice) {
      return (
        <div className="container mx-auto py-10">
          <div className="text-center">
            <h2 className="mb-4 font-bold text-2xl">Medical Device tidak ditemukan</h2>
            <Link href="/ichiba/app/medical-devices">
              <Button>Kembali ke Daftar Medical Devices</Button>
            </Link>
          </div>
        </div>
      );
    }

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

        <div className="grid gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-3xl">{medicalDevice.name}</h1>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  ID: {medicalDevice.id.slice(0, 8)}
                </Badge>
                <span className="text-muted-foreground text-sm">
                  {/* Ditambahkan pada {format(new Date(medicalDevice.created_at), "dd MMMM yyyy", { locale: idLocale })} */}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/ichiba/app/medical-devices/edit/${medicalDevice.id}`}>
                <Button variant="outline">Edit Medical Device</Button>
              </Link>
              <Link href={`/ichiba/app/medical-devices/create?customerId=${medicalDevice.id}`}>
                <Button>Buat Medical Device Baru</Button>
              </Link>
            </div>
          </div>

          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            {/* Medical Device Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Medical Device
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {medicalDevice.name && (
                  <div>
                    <p className="font-medium text-muted-foreground text-sm">Nama Medical Device</p>
                    <p className="text-lg">{medicalDevice.name}</p>
                  </div>
                )}

                {medicalDevice.description && (
                  <div className="flex items-start gap-3">
                    {/* <MapPin className="mt-1 h-4 w-4 text-muted-foreground" /> */}
                    <div>
                      <p className="font-medium text-muted-foreground text-sm">Deskripsi</p>
                      <p className="whitespace-pre-line text-lg">{medicalDevice.description}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching customer:", error);
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-2xl">Error Memuat Data</h2>
          <p className="mb-4 text-gray-600">Terjadi kesalahan saat memuat data Medical Device.</p>
          <Link href="/ichiba/app/medical-devices">
            <Button>Kembali ke Daftar Medical Device</Button>
          </Link>
        </div>
      </div>
    );
  }
}
