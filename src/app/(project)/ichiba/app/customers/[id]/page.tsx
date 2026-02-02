// biome-ignore assist/source/organizeImports: <none>
import { ArrowLeft, Phone, Mail, MapPin, User, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale/id";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { customersService } from "../../../lib/services/customers";

interface CustomerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;

  if (!id) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-2xl">ID Customer tidak ditemukan</h2>
          <Link href="/ichiba/app/customers">
            <Button>Kembali ke Daftar Customer</Button>
          </Link>
        </div>
      </div>
    );
  }

  try {
    const customer = await customersService.getById(id);

    if (!customer) {
      return (
        <div className="container mx-auto py-10">
          <div className="text-center">
            <h2 className="mb-4 font-bold text-2xl">Customer tidak ditemukan</h2>
            <Link href="/ichiba/app/customers">
              <Button>Kembali ke Daftar Customer</Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto py-10">
        <div className="mb-6">
          <Link
            href="/ichiba/app/customers"
            className="flex items-center text-muted-foreground text-sm hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Customer
          </Link>
        </div>

        <div className="grid gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-3xl">{customer.name}</h1>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  ID: {customer.id.slice(0, 8)}
                </Badge>
                <span className="text-muted-foreground text-sm">
                  Ditambahkan pada {format(new Date(customer.created_at), "dd MMMM yyyy", { locale: idLocale })}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/ichiba/app/customers/edit/${customer.id}`}>
                <Button variant="outline">Edit Customer</Button>
              </Link>
              <Link href={`/ichiba/app/customers/create?customerId=${customer.id}`}>
                <Button>Buat Customer Baru</Button>
              </Link>
            </div>
          </div>

          <Separator />

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
                {customer.contact_person && (
                  <div>
                    <p className="font-medium text-muted-foreground text-sm">Kontak Person</p>
                    <p className="text-lg">{customer.contact_person}</p>
                  </div>
                )}

                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-muted-foreground text-sm">Telepon</p>
                      <a href={`tel:${customer.phone}`} className="text-lg transition-colors hover:text-primary">
                        {customer.phone}
                      </a>
                    </div>
                  </div>
                )}

                {customer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-muted-foreground text-sm">Email</p>
                      <a href={`mailto:${customer.email}`} className="text-lg transition-colors hover:text-primary">
                        {customer.email}
                      </a>
                    </div>
                  </div>
                )}

                {customer.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-muted-foreground text-sm">Alamat</p>
                      <p className="whitespace-pre-line text-lg">{customer.address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Informasi Tambahan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-muted-foreground text-sm">Customer ID</p>
                  <p className="font-mono text-lg">{customer.id}</p>
                </div>

                <div>
                  <p className="font-medium text-muted-foreground text-sm">Tanggal Pendaftaran</p>
                  <p className="text-lg">
                    {format(new Date(customer.created_at), "dd MMMM yyyy, HH:mm", { locale: idLocale })}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-muted-foreground text-sm">Status</p>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aktif</Badge>
                </div>
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
          <p className="mb-4 text-gray-600">Terjadi kesalahan saat memuat data customer.</p>
          <Link href="/customers">
            <Button>Kembali ke Daftar Customer</Button>
          </Link>
        </div>
      </div>
    );
  }
}
