"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Filter_Summary } from "../../../_component/ui-v3/filter-summary-single-select";

export default function Page() {
  const { loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 rounded-2xl bg-linear-to-br from-purple-50 via-white to-blue-50 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="grid grid-cols-2 justify-between md:grid-cols-1">
        <Filter_Summary />
      </div>
    </div>
  );
}
