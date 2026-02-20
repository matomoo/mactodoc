"use client";

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

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div className="container mx-auto mb-10 p-4 sm:px-6 lg:px-4">NURA HUB</div>
    </div>
  );
}
