"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Phone, User, Mail, MapPin, FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useOrder } from "../../../hooks/useOrders";

interface OrderDetailPageProps {
  params: {
    id: string;
  };
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

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const router = useRouter();
  const { data: order, isLoading } = useOrder(params.id);

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
        <p>Order tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/orders" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar Order
        </Link>
      </div>

      <div className="grid gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Detail Order</h1>
            <p className="text-muted-foreground">
              Order #{order.id.slice(0, 8)} • {order.customer.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/orders/edit/${order.id}`)}>
              Edit Order
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
                <p className="font-semibold">{order.customer.name}</p>
                <p className="text-sm text-muted-foreground">{order.customer.contact_person}</p>
              </div>
              {order.customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer.phone}</span>
                </div>
              )}
              {order.customer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer.email}</span>
                </div>
              )}
              {order.customer.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{order.customer.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informasi Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold">Tanggal Order</p>
                <p className="text-sm">{format(new Date(order.tanggal), "dd MMMM yyyy", { locale: id })}</p>
              </div>
              {order.marketing && (
                <div>
                  <p className="font-semibold">Marketing</p>
                  <p className="text-sm">{order.marketing}</p>
                </div>
              )}
              {order.notes && (
                <div>
                  <p className="font-semibold">Catatan</p>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}
              <div>
                <p className="font-semibold">Dibuat pada</p>
                <p className="text-sm">{format(new Date(order.created_at), "dd MMM yyyy HH:mm", { locale: id })}</p>
              </div>
            </CardContent>
          </Card>

          {/* Test Types */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Jenis Tes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {order.order_tests.map((orderTest) => {
                  const StatusIcon = statusIcons[orderTest.status as keyof typeof statusIcons] || Clock;
                  return (
                    <div key={orderTest.test_type_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">{orderTest.test_type.name}</p>
                        <Badge
                          className={statusColors[orderTest.status as keyof typeof statusColors]}
                          variant="secondary"
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {orderTest.status}
                        </Badge>
                      </div>
                      {orderTest.result && (
                        <div className="mt-2">
                          <p className="text-sm font-semibold">Hasil:</p>
                          <p className="text-sm">{orderTest.result}</p>
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
