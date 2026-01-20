"use client";

import { use } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowLeft, Loader2 } from "lucide-react";

import { CustomerForm } from "@/app/(project)/ichiba/components/customers/CustomerForm";
import { OrderForm } from "@/app/(project)/ichiba/components/orders/OrderForm";
import { useCustomer, useUpdateCustomer } from "@/app/(project)/ichiba/hooks/useCustomers";
import { useOrder, useUpdateOrder } from "@/app/(project)/ichiba/hooks/useOrders";
import type { CustomerFormData, OrderFormData } from "@/app/(project)/ichiba/lib/schemas";
import { Button } from "@/components/ui/button";

interface EditOrderPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditOrderPage({ params }: EditOrderPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: order, isLoading: isOrderLoading } = useOrder(id);
  // const { data: customer, isLoading: isCustomerLoading } = useCustomer(order?.customer_id || "");
  const { mutate: updateOrder, isPending } = useUpdateOrder();

  if (!id) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-2xl">ID Order tidak ditemukan</h2>
          <Link href="/ichiba/app/orders">
            <Button>Kembali ke Daftar Order</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: OrderFormData) => {
    updateOrder(
      { id, data },
      {
        onSuccess: () => {
          router.push("/ichiba/app/orders");
        },
        onError: (error) => {
          console.error("Update failed:", error);
        },
      },
    );
  };

  if (isOrderLoading) {
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
        <div className="text-center">
          <h2 className="mb-4 font-bold text-2xl">Order tidak ditemukan</h2>
          <Link href="/ichiba/app/orders">
            <Button>Kembali ke Daftar Order</Button>
          </Link>
        </div>
      </div>
    );
  }

  const initialData: OrderFormData = {
    customer_id: order.customer_id,
    tanggal: order.tanggal,
    marketing: order.marketing || "",
    notes: order.notes || "",
    test_types: order.order_tests.map((ot) => ot.test_type.id),
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link
          href="/ichiba/app/orders"
          className="flex items-center text-muted-foreground text-sm hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar Order
        </Link>
      </div>
      <div className="mx-auto max-w-2xl">
        <OrderForm initialData={initialData} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
