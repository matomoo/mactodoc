// biome-ignore assist/source/organizeImports: <none>
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { catalogsService } from "../../../lib/services/catalogs";

interface CatalogDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CatalogDetailPage({ params }: CatalogDetailPageProps) {
  const { id } = await params;

  if (!id) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-2xl">ID Catalog tidak ditemukan</h2>
          <Link href="/ichiba/app/catalogs">
            <Button>Kembali ke Daftar Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  try {
    const catalog = await catalogsService.getById(id);

    if (!catalog) {
      return (
        <div className="container mx-auto py-10">
          <div className="text-center">
            <h2 className="mb-4 font-bold text-2xl">Catalog tidak ditemukan</h2>
            <Link href="/ichiba/app/catalogs">
              <Button>Kembali ke Daftar Catalogs</Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto py-10">
        <div className="mb-6">
          <Link
            href="/ichiba/app/catalogs"
            className="flex items-center text-muted-foreground text-sm hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Catalogs
          </Link>
        </div>

        <div className="grid gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-3xl">{catalog.title}</h1>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  ID: {catalog.id.slice(0, 8)}
                </Badge>
                <span className="text-muted-foreground text-sm">
                  {/* Ditambahkan pada {format(new Date(catalog.created_at), "dd MMMM yyyy", { locale: idLocale })} */}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/ichiba/app/catalogs/edit/${catalog.id}`}>
                <Button variant="outline">Edit Catalog</Button>
              </Link>
              <Link href={`/ichiba/app/catalogs/create?catalogId=${catalog.id}`}>
                <Button>Buat Catalog Baru</Button>
              </Link>
            </div>
          </div>

          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            {/* Catalog Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Catalog
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {catalog.title && (
                  <div>
                    <p className="font-medium text-muted-foreground text-sm">Nama Catalog</p>
                    <p className="text-lg">{catalog.title}</p>
                  </div>
                )}

                {catalog.category && (
                  <div>
                    <p className="font-medium text-muted-foreground text-sm">Category</p>
                    <p className="text-lg">{catalog.category}</p>
                  </div>
                )}

                {catalog.description && (
                  <div className="flex items-start gap-3">
                    {/* <MapPin className="mt-1 h-4 w-4 text-muted-foreground" /> */}
                    <div>
                      <p className="font-medium text-muted-foreground text-sm">Deskripsi</p>
                      <p className="whitespace-pre-line text-lg">{catalog.description}</p>
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
    console.error("Error fetching catalog:", error);
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-2xl">Error Memuat Data</h2>
          <p className="mb-4 text-gray-600">Terjadi kesalahan saat memuat data Catalog.</p>
          <Link href="/ichiba/app/catalogs">
            <Button>Kembali ke Daftar Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }
}
