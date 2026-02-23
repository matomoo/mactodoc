"use client";

import { motion } from "framer-motion";
import { Activity, ArrowRight, BarChart3, Network, Shield, Signal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function WelcomeScreen() {
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
      icon: Activity,
      title: "Real-time Analytics",
      description: "Monitor network performance with live data updates",
      color: "blue",
    },
    {
      icon: BarChart3,
      title: "Network Insights",
      description: "Comprehensive view of your infrastructure performance",
      color: "indigo",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security for your critical infrastructure",
      color: "purple",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-grid-slate-200 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] dark:bg-grid-slate-800/20" />

      {/* Animated gradient orbs */}
      <div className="absolute top-0 -left-4 h-96 w-96 animate-blob rounded-full bg-blue-200 opacity-30 mix-blend-multiply blur-3xl filter dark:bg-blue-900/30" />
      <div className="absolute top-0 -right-4 h-96 w-96 animate-blob animation-delay-2000 rounded-full bg-indigo-200 opacity-30 mix-blend-multiply blur-3xl filter dark:bg-indigo-900/30" />
      <div className="absolute -bottom-8 left-20 h-96 w-96 animate-blob animation-delay-4000 rounded-full bg-purple-200 opacity-30 mix-blend-multiply blur-3xl filter dark:bg-purple-900/30" />

      {/* Main Content */}
      <div className="relative container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Logo/Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400">
            <Signal className="h-4 w-4" />
            <span>Network Operations Center</span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-6xl lg:text-7xl">
            TELKOM INFRA
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              SULAWESI
            </span>
          </h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mx-auto mb-12 max-w-2xl text-lg text-slate-600 dark:text-slate-400"
          >
            Selamat datang di platform monitoring jaringan
            <span className="mt-2 block font-medium text-slate-900 dark:text-slate-200">
              Real-time network performance, simplified
            </span>
          </motion.p>

          {/* CTA Buttons */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button size="lg" className="group gap-2 px-8">
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="px-8">
              Learn More
            </Button>
          </motion.div> */}

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              const colors = {
                blue: "from-blue-500/10 via-blue-500/5 to-transparent border-blue-200/50 dark:border-blue-900/50",
                indigo:
                  "from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-200/50 dark:border-indigo-900/50",
                purple:
                  "from-purple-500/10 via-purple-500/5 to-transparent border-purple-200/50 dark:border-purple-900/50",
              };

              return (
                <motion.div key={feature.title} variants={itemVariants}>
                  <Card
                    className={`group relative overflow-hidden border bg-gradient-to-br ${colors[feature.color as keyof typeof colors]} backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-${feature.color}-500/10`}
                  >
                    <CardContent className="p-6">
                      <div
                        className={`mb-4 inline-flex rounded-xl bg-${feature.color}-100 p-3 text-${feature.color}-600 dark:bg-${feature.color}-900/30 dark:text-${feature.color}-400`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">{feature.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-16 text-sm text-slate-500 dark:text-slate-500"
          >
            <p>© 2026 Telkom Infra Sulawesi. All rights reserved.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
