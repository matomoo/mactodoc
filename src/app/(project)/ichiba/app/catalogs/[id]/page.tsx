// app/catalog/[id]/page.tsx

import Image from "next/image";
import Link from "next/link";

import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Image as ImageIcon,
  Share2,
  Tag,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

    const formattedDate = catalog.created_at
      ? format(new Date(catalog.created_at), "dd MMMM yyyy", { locale: localeId })
      : "N/A";

    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
        {/* Header Navigation */}
        <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <Link
                href="/ichiba/app/catalogs"
                className="flex items-center gap-2 font-medium text-gray-600 text-sm transition-colors hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Catalogs
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <Link href={`/ichiba/app/catalogs/edit/${catalog.id}`}>Edit</Link>
              </Button>
              <Button size="sm" className="gap-2" asChild>
                <Link href={`/ichiba/app/catalogs/create?catalogId=${catalog.id}`}>Buat Baru</Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          {/* Hero Section */}
          <div className="mb-8 rounded-2xl bg-linear-to-r from-blue-50 to-indigo-50 p-8">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <Badge variant="secondary" className="gap-1 text-sm">
                    <Tag className="h-3 w-3" />
                    {catalog.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    ID: {catalog.id.slice(0, 8)}...
                  </Badge>
                </div>
                <h1 className="mb-2 font-bold text-4xl text-gray-900">{catalog.title}</h1>
                <p className="text-gray-600 text-lg">{catalog.category || "Tidak ada category tersedia"}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="gap-2" asChild>
                  <a href={catalog.external_store_url || "#"} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4" />
                    Kunjungi Toko
                  </a>
                </Button>
                <Button className="gap-2" asChild>
                  <a href={catalog.brochure_url || "#"} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                    Unduh Brosur
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Main Content */}
            <div className="space-y-8 lg:col-span-2">
              {/* Image Preview */}
              <Card className="overflow-hidden border-0 shadow-lg">
                <CardHeader className="bg-linear-to-r from-gray-50 to-white">
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Gambar Catalog
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {catalog.image_url ? (
                    <div className="relative h-auto w-full">
                      <div className="relative aspect-video w-full">
                        {" "}
                        {/* Maintain 16:9 ratio */}
                        <Image
                          src={catalog.image_url}
                          alt={catalog.title}
                          fill
                          className="object-contain" // Changed from object-cover
                          sizes="(max-width: 768px) 100vw, 66vw"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-75 items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                      <div className="text-center">
                        <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <p className="text-gray-500">Tidak ada gambar tersedia</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Description */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-linear-to-r from-gray-50 to-white">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Deskripsi Lengkap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-lg max-w-none">
                    {catalog.description ? (
                      <p className="whitespace-pre-line text-gray-700">{catalog.description}</p>
                    ) : (
                      <div className="rounded-lg bg-gray-50 p-6 text-center">
                        <p className="text-gray-500">Tidak ada deskripsi tersedia untuk catalog ini.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="text-lg">Informasi Catalog</CardTitle>
                  <CardDescription>Detail lengkap catalog ini</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <p className="mb-1 font-medium text-gray-500 text-sm">Kategori</p>
                      <Badge variant="secondary" className="text-sm">
                        {catalog.category}
                      </Badge>
                    </div>

                    <div>
                      <p className="mb-1 font-medium text-gray-500 text-sm">Tanggal Dibuat</p>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="h-4 w-4" />
                        {formattedDate}
                      </div>
                    </div>

                    <Separator />

                    {/* Quick Actions */}
                    <div className="space-y-3">
                      <p className="font-medium text-gray-500 text-sm">Aksi Cepat</p>
                      <div className="grid gap-2">
                        <Button variant="outline" className="justify-start gap-2" asChild>
                          <a href={catalog.external_store_url || "#"} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            Kunjungi Toko Eksternal
                          </a>
                        </Button>
                        <Button className="justify-start gap-2" asChild>
                          <a href={catalog.brochure_url || "#"} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                            Unduh Brosur PDF
                          </a>
                        </Button>
                        <Button variant="ghost" className="justify-start gap-2">
                          <Share2 className="h-4 w-4" />
                          Bagikan
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              {/* <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="text-lg">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Status Aktif</span>
                      <Badge variant={catalog.is_active ? "default" : "secondary"} className="gap-1">
                        {catalog.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Featured</span>
                      <Badge variant={catalog.featured ? "default" : "outline"} className="gap-1">
                        {catalog.featured ? "Ditampilkan" : "Biasa"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card> */}

              {/* Tags */}
              {/* {catalog.tags && catalog.tags.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardTitle className="text-lg">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {catalog.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )} */}
            </div>
          </div>

          {/* CTA Section */}
          {/* <div className="mt-12 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div>
                <h3 className="mb-2 font-bold text-2xl">Butuh bantuan dengan catalog ini?</h3>
                <p className="text-gray-300">
                  Hubungi tim support kami untuk informasi lebih lanjut tentang produk ini.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link href={`/ichiba/app/catalogs/edit/${catalog.id}`}>Edit Catalog</Link>
                </Button>
                <Button className="bg-white text-gray-900 hover:bg-gray-100" asChild>
                  <Link href={`/ichiba/app/catalogs/create?catalogId=${catalog.id}`}>Buat Catalog Baru</Link>
                </Button>
              </div>
            </div>
          </div> */}
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error fetching catalog:", error);
    return (
      <div className="container mx-auto py-20">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <title>Error</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mb-3 font-bold text-2xl">Error Memuat Data</h2>
          <p className="mb-6 text-gray-600">Terjadi kesalahan saat memuat data Catalog.</p>
          <Link href="/ichiba/app/catalogs">
            <Button>Kembali ke Daftar Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }
}
