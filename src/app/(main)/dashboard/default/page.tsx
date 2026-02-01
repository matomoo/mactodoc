"use client";

// app/page.tsx
// biome-ignore assist/source/organizeImports: <will be handled by the formatter>
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  Code,
  Palette,
  Smartphone,
  Zap,
  LayoutDashboard,
  Shield,
  Database,
  BarChart3,
  Cpu,
  Server,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { VisitsChart } from "@/app/(project)/ichiba/components/visits/VisitsChart";
import { SalesTransactionsChart } from "@/app/(project)/ichiba/components/sales-transactions/SalesTransactionsChart";

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
        {/* <section id="features" className="bg-gray-50 py-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-bold text-gray-900 text-lg tracking-tight sm:text-xl">Summary</h2>
            </div>
          </div>
        </section> */}
        <SalesTransactionsChart />
      </div>

      <div className="container mx-auto mb-10 px-4 sm:px-6 lg:px-8">
        <section id="features" className="bg-gray-50 py-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-bold text-gray-900 text-lg tracking-tight sm:text-xl">
                Monitoring performance kunjungan
              </h2>
            </div>
          </div>
        </section>
        <VisitsChart />
      </div>
    </div>
  );
}
