"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCreateCustomer } from "../../../hooks/useCustomers";
import type { CustomerFormData } from "../../../lib/schemas";
import { CustomerForm } from "../../../components/customers/CustomerForm";

export default function CreateCustomerPage() {
  const router = useRouter();
  const { mutate: createCustomer, isPending } = useCreateCustomer();

  const handleSubmit = async (data: CustomerFormData) => {
    createCustomer(data, {
      onSuccess: () => {
        router.push("/ichiba/app/customers");
      },
    });
  };

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
      <div className="mx-auto max-w-2xl">
        <CustomerForm onSubmit={handleSubmit} isLoading={isPending} />
      </div>
    </div>
  );
}
