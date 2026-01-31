"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Phone, User, Mail, MapPin, FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { use } from "react";
import { useVisit } from "../../../hooks/useVisits";

interface VisitDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusIcons = {
  pending: Clock,
  completed: CheckCircle,
  cancelled: XCircle,
};

export default function VisitDetailPage({ params }: VisitDetailPageProps) {
  const { id } = use(params);

  const router = useRouter();
  const { data: visit, isLoading } = useVisit(id);

  if (isLoading) {
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
        <p>Visit tidak ditemukan</p>
      </div>
    );
  }

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

      <div className="grid gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl">Detail Visit</h1>
            <p className="text-muted-foreground">
              Visit #{visit.id.slice(0, 8)} • {visit.customer.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/visits/edit/${visit.id}`)}>
              Edit Visit
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold">{visit.customer.name}</p>
                <p className="text-muted-foreground text-sm">{visit.customer.contact_person}</p>
              </div>
              {visit.customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{visit.customer.phone}</span>
                </div>
              )}
              {visit.customer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{visit.customer.email}</span>
                </div>
              )}
              {visit.customer.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{visit.customer.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informasi Visit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold">Tanggal Visit</p>
                <p className="text-sm">{format(new Date(visit.tanggal), "dd MMMM yyyy", { locale: localeId })}</p>
              </div>
              {visit.sales && (
                <div>
                  <p className="font-semibold">Marketing</p>
                  <p className="text-sm">{visit.sales.full_name}</p>
                </div>
              )}
              {visit.notes && (
                <div>
                  <p className="font-semibold">Catatan</p>
                  <p className="text-sm">{visit.notes}</p>
                </div>
              )}
              <div>
                <p className="font-semibold">Dibuat pada</p>
                <p className="text-sm">
                  {format(new Date(visit.created_at), "dd MMM yyyy HH:mm", { locale: localeId })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Test Types */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Daftar Medical Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {visit.visit_medical_devices.map((visitTest) => {
                  const StatusIcon = statusIcons[visitTest.status as keyof typeof statusIcons] || Clock;
                  return (
                    <div key={visitTest.medical_device_id} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-semibold">{visitTest.medical_device.name}</p>
                        <Badge
                          className={statusColors[visitTest.status as keyof typeof statusColors]}
                          variant="secondary"
                        >
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {visitTest.status}
                        </Badge>
                      </div>
                      {visitTest.result && (
                        <div className="mt-2">
                          <p className="font-semibold text-sm">Foto:</p>
                          <p className="text-sm">{visitTest.result}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
