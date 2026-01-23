"use client";

import { use, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  AlertCircle,
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Edit,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Printer,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useDeleteOrder, useOrder } from "../../../hooks/useOrders";

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  in_progress: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  completed: "bg-green-100 text-green-800 hover:bg-green-100",
  cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
  waiting_payment: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  waiting_sample: "bg-orange-100 text-orange-800 hover:bg-orange-100",
};

const statusIcons = {
  pending: Clock,
  in_progress: Clock,
  completed: CheckCircle,
  cancelled: XCircle,
  waiting_payment: AlertCircle,
  waiting_sample: AlertCircle,
};

const getStatusBadge = (status: string) => {
  const StatusIcon = statusIcons[status as keyof typeof statusIcons] || Clock;
  return (
    <Badge className={statusColors[status as keyof typeof statusColors]}>
      <StatusIcon className="mr-1 h-3 w-3" />
      {status.replace("_", " ").toUpperCase()}
    </Badge>
  );
};

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  // Unwrap the params promise using React.use()
  const { id } = use(params);
  const router = useRouter();
  const { data: order, isLoading } = useOrder(id);
  const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    deleteOrder(id, {
      onSuccess: () => {
        toast.success("Order berhasil dihapus");
        router.push("/ichiba/app/orders");
      },
      onError: (error) => {
        toast.error("Gagal menghapus order: " + error.message);
      },
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReport = () => {
    toast.info("Fitur download laporan akan segera tersedia");
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

  if (!order) {
    return (
      <div className="container mx-auto py-10">
        <div className="mb-6">
          <Link
            href="/ichiba/app/orders"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Order
          </Link>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Order tidak ditemukan</h3>
          <p className="mt-2 text-sm text-muted-foreground">Order dengan ID {id} tidak ditemukan atau telah dihapus.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/ichiba/app/orders")}>
            Kembali ke Daftar Order
          </Button>
        </div>
      </div>
    );
  }

  // Calculate order total if you have pricing information
  const orderTotal = order.order_tests.reduce((total, test) => {
    return total + 0;
  }, 0);

  return (
    <div className="container mx-auto py-6 md:py-10">
      {/* Header with actions */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/ichiba/app/orders"
            className="mb-2 flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Order
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Detail Order</h1>
            {getStatusBadge("pending")}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>ID: {order.id.slice(0, 8).toUpperCase()}</span>
            <span>•</span>
            <span>Dibuat: {format(new Date(order.created_at), "dd MMM yyyy HH:mm", { locale: localeId })}</span>
            {order.created_at && (
              <>
                <span>•</span>
                <span>Diperbarui: {format(new Date(order.created_at), "dd MMM yyyy HH:mm", { locale: localeId })}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Download Laporan
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/ichiba/app/orders/edit/${order.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2">
              <span className="text-sm font-medium text-red-700">Yakin hapus?</span>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ya"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Batal
              </Button>
            </div>
          ) : (
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tests">Jenis Tes</TabsTrigger>
          <TabsTrigger value="documents">Dokumen</TabsTrigger>
          <TabsTrigger value="history">Riwayat</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Customer Information Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building className="h-5 w-5" />
                  Informasi Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{order.customer?.name || "PT Macto"}</span>
                  </div>
                  {order.customer?.contact_person && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{order.customer.contact_person}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  {order.customer?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Telepon</p>
                        <p className="text-sm text-muted-foreground">{order.customer.phone || "01122"}</p>
                      </div>
                    </div>
                  )}

                  {order.customer?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                      </div>
                    </div>
                  )}

                  {order.customer?.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Alamat</p>
                        <p className="text-sm text-muted-foreground">{order.customer.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Information Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5" />
                  Informasi Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Tanggal Order</p>
                    <p className="text-sm">
                      {format(new Date(order.tanggal), "dd MMMM yyyy", { locale: localeId }) || "22 Jan 2026"}
                    </p>
                  </div>

                  {order.marketing && (
                    <div>
                      <p className="text-sm font-medium">Marketing</p>
                      <p className="text-sm">{order.marketing || "www"}</p>
                    </div>
                  )}

                  {/* {order.payment_status && (
                    <div>
                      <p className="text-sm font-medium">Status Pembayaran</p>
                      <Badge
                        className={
                          order.payment_status === "paid"
                            ? "bg-green-100 text-green-800"
                            : order.payment_status === "partial"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {order.payment_status === "paid"
                          ? "LUNAS"
                          : order.payment_status === "partial"
                          ? "SEBAGIAN"
                          : "BELUM BAYAR"}
                      </Badge>
                    </div>
                  )} */}

                  {orderTotal > 0 && (
                    <div>
                      <p className="text-sm font-medium">Total Order</p>
                      <p className="text-lg font-bold">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(orderTotal)}
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {order.notes && (
                  <div>
                    <p className="text-sm font-medium">Catatan</p>
                    <div className="mt-2 rounded-md bg-muted p-3">
                      <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Ringkasan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Tes</p>
                    <p className="text-2xl font-bold">{order.order_tests.length}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium text-muted-foreground">Selesai</p>
                    <p className="text-2xl font-bold">
                      {order.order_tests.filter((t) => t.status === "completed").length}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium text-muted-foreholder">Dalam Proses</p>
                    <p className="text-2xl font-bold">
                      {order.order_tests.filter((t) => t.status === "in_progress").length}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium text-muted-foreground">Menunggu</p>
                    <p className="text-2xl font-bold">
                      {order.order_tests.filter((t) => t.status === "pending").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Jenis Tes ({order.order_tests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_tests.length === 0 ? (
                  <div className="py-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Belum ada jenis tes untuk order ini</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {order.order_tests.map((orderTest) => {
                      const StatusIcon = statusIcons[orderTest.status as keyof typeof statusIcons] || Clock;
                      return (
                        <div key={orderTest.test_type_id} className="rounded-lg border p-4">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold">{orderTest.test_type.name}</p>
                            <Badge className={statusColors[orderTest.status as keyof typeof statusColors]}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {orderTest.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </div>

                          {orderTest.test_type.id && (
                            <p className="mt-1 text-sm text-muted-foreground">Kode: {orderTest.test_type.id}</p>
                          )}

                          {orderTest.test_type.description && (
                            <p className="mt-2 text-sm">{orderTest.test_type.description}</p>
                          )}

                          {orderTest.result && (
                            <div className="mt-3 rounded-md bg-muted p-3">
                              <p className="text-sm font-semibold">Hasil:</p>
                              <p className="text-sm">{orderTest.result}</p>
                            </div>
                          )}

                          {orderTest.status && (
                            <div className="mt-2">
                              <p className="text-sm font-semibold">Catatan:</p>
                              <p className="text-sm">{orderTest.status}</p>
                            </div>
                          )}

                          {/* {orderTest.completed_at && (
                            <div className="mt-2">
                              <p className="text-sm font-semibold">Selesai:</p>
                              <p className="text-sm">
                                {format(new Date(orderTest.completed_at), "dd MMM yyyy", { locale: localeId })}
                              </p>
                            </div>
                          )} */}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Dokumen & Laporan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Belum ada dokumen</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Dokumen dan laporan akan muncul di sini setelah proses testing selesai.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Aktivitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="relative border-l pb-8 pl-6">
                    <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full bg-primary" />
                    <time className="text-sm font-medium">
                      {format(new Date(order.created_at), "dd MMMM yyyy, HH:mm", { locale: localeId })}
                    </time>
                    <p className="mt-1 font-medium">Order dibuat</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Order #{order.id.slice(0, 8).toUpperCase()} telah dibuat
                    </p>
                  </div>

                  {order.created_at && (
                    <div className="relative border-l pb-8 pl-6">
                      <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full bg-blue-500" />
                      <time className="text-sm font-medium">
                        {format(new Date(order.created_at), "dd MMMM yyyy, HH:mm", { locale: localeId })}
                      </time>
                      <p className="mt-1 font-medium">Order diperbarui</p>
                      <p className="mt-1 text-sm text-muted-foreground">Informasi order telah diperbarui</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
