"use client";

// app/page.tsx
// biome-ignore assist/source/organizeImports: <will be handled by the formatter>
import { useRequireAuth } from "@/hooks/use-require-auth";
import { VisitsChart } from "@/app/(project)/ichiba/components/visits/VisitsChart";
import { SalesTransactionsChart } from "@/app/(project)/ichiba/components/sales-transactions/SalesTransactionsChart";
import FiltersPage from "./_filters";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  const { loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div className="container mx-auto mb-10 p-4 sm:px-6 lg:px-4">
        <FiltersPage />
        <SalesTransactionsChart />
      </div>

      <div className="container mx-auto mb-10  sm:px-6 lg:px-4 ">
        <div className="container mx-auto mb-10 sm:p-6 lg:p-8 border rounded-2xl">
          <section id="features" className=" py-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h3 className="font-bold text-gray-900 text-lg tracking-tight sm:text-xl">
                  Monitoring performance kunjungan
                </h3>
              </div>
            </div>
          </section>
          <VisitsChart />
        </div>
      </div>
    </div>
  );
}
