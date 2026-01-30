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

export default function LandingPage() {
  const { loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const features = [
    {
      icon: <LayoutDashboard className="h-6 w-6" />,
      title: "Modern Dashboard",
      description: "Beautifully designed dashboard with Chart.js for data visualization",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Authentication Ready",
      description: "Complete auth flows with login, register, and password recovery",
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Fully Responsive",
      description: "Works perfectly on all devices from mobile to desktop",
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Shadcn UI",
      description: "Built with accessible and customizable UI components",
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "TypeScript",
      description: "Full type safety and better developer experience",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Next.js 16",
      description: "Latest App Router for optimal performance",
    },
  ];

  const techStack = [
    { name: "Next.js 16", description: "App Router, Server Components", icon: <Zap className="h-5 w-5" /> },
    { name: "TypeScript", description: "Full type safety", icon: <Code className="h-5 w-5" /> },
    { name: "Tailwind CSS v4", description: "Utility-first styling", icon: <Palette className="h-5 w-5" /> },
    { name: "Shadcn UI", description: "Accessible components", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Zod", description: "Schema validation", icon: <Shield className="h-5 w-5" /> },
    { name: "React Hook Form", description: "Form management", icon: <Database className="h-5 w-5" /> },
    { name: "Zustand", description: "State management", icon: <Server className="h-5 w-5" /> },
    { name: "TanStack Table", description: "Data tables", icon: <BarChart3 className="h-5 w-5" /> },
    { name: "Biome", description: "Formatting & linting", icon: <Cpu className="h-5 w-5" /> },
    { name: "Husky", description: "Git hooks", icon: <CheckCircle className="h-5 w-5" /> },
  ];

  const screens = {
    available: [
      { name: "Default Home Dashboard", description: "Main dashboard with site performance metrics" },
      { name: "Ichiba Project", description: "Sample project displaying data visits" },
      { name: "Customer", description: "Displaying CRUD of customers" },
      { name: "Visit", description: "Displaying CRUD of visits" },
    ],
    comingSoon: [{ name: "Data analitics for marketing", description: "Displaying data analytics for marketing" }],
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-xl">Dashboard</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-bold text-3xl text-gray-900 tracking-tight sm:text-4xl">
              Monitoring performance kunjungan
            </h2>
            <p className="mt-4 text-gray-600 text-lg">
              Note: Tambahkan chart jumlah kunjungan per hari/minggu/bulan di sini untuk visualisasi data yang lebih
              baik.
            </p>
          </div>
        </div>
      </section>

      <div>
        <VisitsChart />
      </div>
    </div>
  );
}
