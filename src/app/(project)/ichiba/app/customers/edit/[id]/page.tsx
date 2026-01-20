"use client";

import { use } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowLeft, Loader2 } from "lucide-react";

import { CustomerForm } from "@/app/(project)/ichiba/components/customers/CustomerForm";
import { useCustomer, useUpdateCustomer } from "@/app/(project)/ichiba/hooks/useCustomers";
import type { CustomerFormData } from "@/app/(project)/ichiba/lib/schemas";
import { Button } from "@/components/ui/button";

interface EditCustomerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditCustomerPage({ params }: EditCustomerPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: customer, isLoading } = useCustomer(id);
  const { mutate: updateCustomer, isPending } = useUpdateCustomer();

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

  const handleSubmit = async (data: CustomerFormData) => {
    updateCustomer(
      { id, data },
      {
        onSuccess: () => {
          router.push("/ichiba/app/customers");
        },
        onError: (error) => {
          console.error("Update failed:", error);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

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

  const initialData: CustomerFormData = {
    name: customer.name,
    contact_person: customer.contact_person || "",
    phone: customer.phone || "",
    email: customer.email || "",
    address: customer.address || "",
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link
          href="/ichiba/app/customers"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar Customer
        </Link>
      </div>
      <div className="max-w-2xl mx-auto">
        <CustomerForm initialData={initialData} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
