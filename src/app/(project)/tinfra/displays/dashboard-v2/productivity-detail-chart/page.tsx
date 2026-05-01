"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Filter_Summary } from "../../../_component/ui-v3/filter-summary-single-select-v3";
import SummaryLayout from "../../../_component/ui-v3/summary-productivity-detail";

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
      <div className="sticky top-2 z-50 ml-4">
        <Filter_Summary mode={"chart"} />
      </div>
      <SummaryLayout mode={"chart"} />
    </div>
  );
}
