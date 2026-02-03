// biome-ignore assist/source/organizeImports: <none>
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { testTypesService } from "../../../lib/services/testTypes";

interface TestTypeDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TestTypeDetailPage({ params }: TestTypeDetailPageProps) {
  const { id } = await params;

  if (!id) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-2xl">ID Test Type tidak ditemukan</h2>
          <Link href="/ichiba/app/test-types">
            <Button>Kembali ke Daftar Test Type</Button>
          </Link>
        </div>
      </div>
    );
  }

  try {
    const testType = await testTypesService.getById(id);

    if (!testType) {
      return (
        <div className="container mx-auto py-10">
          <div className="text-center">
            <h2 className="mb-4 font-bold text-2xl">Test Type tidak ditemukan</h2>
            <Link href="/ichiba/app/test-types">
              <Button>Kembali ke Daftar Test Types</Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto py-10">
        <div className="mb-6">
          <Link
            href="/ichiba/app/test-types"
            className="flex items-center text-muted-foreground text-sm hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Test Types
          </Link>
        </div>

        <div className="grid gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-3xl">{testType.name}</h1>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  ID: {testType.id.slice(0, 8)}
                </Badge>
                <span className="text-muted-foreground text-sm"></span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/ichiba/app/test-types/edit/${testType.id}`}>
                <Button variant="outline">Edit Test Type</Button>
              </Link>
              <Link href={`/ichiba/app/test-types/create?customerId=${testType.id}`}>
                <Button>Buat Test Type Baru</Button>
              </Link>
            </div>
          </div>

          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            {/* Test Type Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Test Type
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {testType.name && (
                  <div>
                    <p className="font-medium text-muted-foreground text-sm">Nama Test Type</p>
                    <p className="text-lg">{testType.name}</p>
                  </div>
                )}

                {testType.description && (
                  <div className="flex items-start gap-3">
                    {/* <MapPin className="mt-1 h-4 w-4 text-muted-foreground" /> */}
                    <div>
                      <p className="font-medium text-muted-foreground text-sm">Deskripsi</p>
                      <p className="whitespace-pre-line text-lg">{testType.description}</p>
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
          <p className="mb-4 text-gray-600">Terjadi kesalahan saat memuat data Test Type.</p>
          <Link href="/ichiba/app/test-types">
            <Button>Kembali ke Daftar Test Type</Button>
          </Link>
        </div>
      </div>
    );
  }
}
