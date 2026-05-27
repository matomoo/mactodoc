"use client";

import { motion } from "framer-motion";
import { FileText, FolderOpen, ListFilter, Plus, Search, Shield, Table2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRequireAuth } from "@/hooks/use-require-auth";

const features = [
  {
    icon: FileText,
    title: "SQAC Document",
    description: "Generate and manage SQAC documents online",
    color: "emerald",
  },
  {
    icon: Table2,
    title: "Data Tracker",
    description: "Track and monitor all SQAC entries",
    color: "blue",
  },
  {
    icon: Shield,
    title: "Audit Ready",
    description: "Prepare documents for compliance audits",
    color: "violet",
  },
  {
    icon: ListFilter,
    title: "Smart Filtering",
    description: "Filter by WID, site, band, and status",
    color: "amber",
  },
];

const recentDocuments = [
  { id: "SQAC-2024-001", site: "MAKASSAR-001", band: "2100 MHz", status: "Completed", date: "2024-01-15" },
  { id: "SQAC-2024-002", site: "MENADO-002", band: "1800 MHz", status: "In Progress", date: "2024-01-14" },
  { id: "SQAC-2024-003", site: "PALU-003", band: "900 MHz", status: "Pending", date: "2024-01-13" },
  { id: "SQAC-2024-004", site: "Kendari-004", band: "2600 MHz", status: "Completed", date: "2024-01-12" },
];

export default function MactodocLanding() {
  const { loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Subtle grid pattern */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="container relative mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">MACTODOC</h1>
                <p className="text-sm text-slate-500">Document Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Search className="h-4 w-4" />
                Search
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                <Plus className="h-4 w-4" />
                New SQAC
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-10 rounded-2xl border bg-white/60 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-slate-950/50"
        >
          <div className="flex flex-col items-center text-center lg:flex-row lg:text-left lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">
                Document Generation
              </Badge>
              <h2 className="mb-3 text-3xl font-bold text-slate-900 dark:text-slate-50">
                Generate SQAC Documents
                <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Online & Instantly
                </span>
              </h2>
              <p className="mx-auto max-w-lg text-slate-600 dark:text-slate-400 lg:mx-0">
                Create, manage, and track your SQAC documents with ease. Streamline your documentation workflow with our
                intuitive online tools.
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                <FileText className="h-5 w-5" />
                Create New
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                View All
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            const colors = {
              emerald:
                "border-emerald-200/50 bg-gradient-to-br from-emerald-50/50 to-transparent dark:border-emerald-900/50 dark:from-emerald-950/30",
              blue: "border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-transparent dark:border-blue-900/50 dark:from-blue-950/30",
              violet:
                "border-violet-200/50 bg-gradient-to-br from-violet-50/50 to-transparent dark:border-violet-900/50 dark:from-violet-950/30",
              amber:
                "border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-transparent dark:border-amber-900/50 dark:from-amber-950/30",
            };
            const iconColors = {
              emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
              blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
              violet: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
              amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
            };

            return (
              <motion.div key={feature.title} variants={itemVariants}>
                <Card
                  className={`group relative overflow-hidden border ${colors[feature.color as keyof typeof colors]} transition-all hover:shadow-lg`}
                >
                  <CardHeader className="pb-2">
                    <div
                      className={`mb-3 inline-flex rounded-xl p-3 ${iconColors[feature.color as keyof typeof iconColors]}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Recent Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-slate-200/50 dark:border-slate-800/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Recent SQAC Documents</CardTitle>
                  <CardDescription>Latest generated documents</CardDescription>
                </div>
                <Input placeholder="Search documents..." className="w-64" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">
                        Document ID
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">
                        Site
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">
                        Band
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">
                        Date
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-slate-600 dark:text-slate-400">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{doc.id}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{doc.site}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{doc.band}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              doc.status === "Completed"
                                ? "default"
                                : doc.status === "In Progress"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={
                              doc.status === "Completed"
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : doc.status === "In Progress"
                                  ? "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                                  : ""
                            }
                          >
                            {doc.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">{doc.date}</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-center text-sm text-slate-500 dark:text-slate-500"
        >
          <p>© 2026 MACTODOC. Document Management System for Network Operations.</p>
        </motion.div>
      </div>
    </div>
  );
}
