"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCreateOrder } from "../../../hooks/useOrders";
import type { OrderFormData } from "../../../lib/schemas";
import { OrderForm } from "../../../components/orders/OrderForm";
import { toast } from "sonner";
import { useState } from "react";

export default function CreateOrderPage() {
  const router = useRouter();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const [formError] = useState<string | null>(null);

  const handleSubmit = async (data: OrderFormData) => {
    createOrder(data, {
      onSuccess: () => {
        toast.success("Order berhasil dibuat");
        router.push("/ichiba/app/orders");
      },
    });
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
      {formError && (
        <div className="mb-4 rounded bg-red-50 p-4 text-red-700">
          <p className="font-semibold">Error:</p>
          <p>{formError}</p>
        </div>
      )}
      <div className="mx-auto max-w-2xl">
        <OrderForm onSubmit={handleSubmit} isLoading={isPending} />
      </div>
    </div>
  );
}
