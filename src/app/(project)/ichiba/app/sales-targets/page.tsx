"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useAuthStore } from "@/stores/auth-store";
import { SalesTargetsTable } from "../../components/sales-targets/SalesTargetsTable";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function SalesTargetsPage() {
  const { user } = useAuthStore();
  const { loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.role !== "Admin") {
    return <div>You are not authorized to view this page</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Master Data SalesTargets</h1>
        <p className="text-muted-foreground">Kelola data sales targets</p>
      </div>
      <SalesTargetsTable />
    </div>
  );
}
