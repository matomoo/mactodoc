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
              <span className="font-bold text-gray-900 text-xl">Macto Ichiba</span>
              <Badge className="ml-2 border-0 bg-linear-to-r from-blue-100 to-indigo-100 text-blue-800">v1.0</Badge>
            </div>

            <div className="flex items-center gap-4">
              <Link href="#features">
                <Button variant="ghost" className="hidden sm:flex">
                  Features
                </Button>
              </Link>
              <Link href="#tech-stack">
                <Button variant="ghost" className="hidden sm:flex">
                  Tech Stack
                </Button>
              </Link>
              <Link href="#screens">
                <Button variant="ghost" className="hidden sm:flex">
                  Screens
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-10 sm:py-12 lg:py-16">
        <div className="mask-[linear-gradient(0deg,white,rgba(255,255,255,0.6))] absolute inset-0 bg-grid-slate-100" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-bold text-4xl text-gray-900 tracking-tight sm:text-5xl lg:text-6xl">
              Modern Dashboard with{" "}
              <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TypeScript
              </span>{" "}
              &{" "}
              <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Shadcn UI
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-gray-600 text-xl">
              Includes authentication layouts, page of sample project using chartjs displaying site performance.
            </p>

            <div className="mt-12 flex items-center justify-center gap-8 text-gray-500 text-sm">
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Production Ready
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Regular Updates
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Lifetime Support
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-bold text-3xl text-gray-900 tracking-tight sm:text-4xl">
              Everything You Need for Modern Dashboards
            </h2>
            <p className="mt-4 text-gray-600 text-lg">
              A complete admin template built with the latest technologies and best practices.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group border-gray-200 transition-all hover:border-blue-300 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-4 inline-flex gap-2 rounded-lg bg-linear-to-br from-blue-50 to-indigo-50 p-3">
                    <div className="text-blue-400">{feature.icon}</div>
                    <div className="text-blue-600">{feature.title}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech-stack" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-bold text-3xl text-gray-900 tracking-tight sm:text-4xl">
              Built with Modern Tech Stack
            </h2>
            <p className="mt-4 text-gray-600 text-lg">
              Carefully selected technologies for optimal performance and developer experience.
            </p>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="group rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-gray-100 p-2 transition-colors group-hover:bg-blue-50">
                    <div className="text-gray-600 group-hover:text-blue-600">{tech.icon}</div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{tech.name}</h3>
                    <p className="text-gray-500 text-sm">{tech.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screens Section */}
      <section id="screens" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <h2 className="font-bold text-3xl text-gray-900 tracking-tight sm:text-4xl">
                Available Screens & Features
              </h2>
              <p className="mt-4 text-gray-600 text-lg">
                Prebuilt dashboards and monitoring screens ready for customization.
              </p>
            </div>

            <Tabs defaultValue="available" className="mt-16">
              <TabsList className="grid h-16 w-full grid-cols-2">
                <TabsTrigger
                  value="available"
                  className="text-lg data-[state=active]:bg-linear-to-r data-[state=active]:from-green-200 data-[state=active]:to-indigo-300"
                >
                  Available Now
                </TabsTrigger>
                <TabsTrigger
                  value="coming-soon"
                  className="text-lg data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-200 data-[state=active]:to-indigo-300"
                >
                  Coming Soon
                </TabsTrigger>
              </TabsList>

              <TabsContent value="available" className="space-y-6">
                <div className="grid gap-3 md:grid-cols-2">
                  {screens.available.map((screen) => (
                    <Card key={screen.name} className="border-green-200">
                      <CardHeader className="bg-linear-to-r from-green-50 to-emerald-50">
                        <CardTitle className="flex items-center pt-2">
                          <CheckCircle className="mr-2 h-10 w-5 text-green-600" />
                          {screen.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <p className="text-gray-600">{screen.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="coming-soon" className="space-y-2">
                <div className="grid gap-6 md:grid-cols-2">
                  {screens.comingSoon.map((screen) => (
                    <Card key={screen.name} className="border-blue-200">
                      <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50">
                        <CardTitle className="flex items-center pt-2">
                          <Clock className="mr-2 h-10 w-5 text-blue-600" />
                          {screen.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <p className="text-gray-600">{screen.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-xl">Macto Ichiba</span>
            </div>

            <div className="text-center md:text-right">
              <p className="text-gray-600">Built with Next.js 16, TypeScript, Tailwind CSS v4, and Shadcn UI</p>
              <p className="mt-2 text-gray-500 text-sm">
                © {new Date().getFullYear()} Macto Ichiba. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
