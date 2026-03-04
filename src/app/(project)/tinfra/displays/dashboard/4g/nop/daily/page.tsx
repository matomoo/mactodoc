"use client";

import { FilterBy_Date_Nop } from "@/app/(project)/tinfra/_component/filter-site/filter-by-date-nop";
import PageAggCustom4GDaily from "@/app/(project)/tinfra/_component/ui-v1/agg-custom-4g-daily-v6";
import { useRequireAuth } from "@/hooks/use-require-auth";

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
        <FilterBy_Date_Nop />
      </div>
      <PageAggCustom4GDaily
        apiPath={"meas-dy-nop-4g"}
        aggregateBy="G4_KABUPATEN"
        filterLabel=""
        showViewModeState="aggregated"
        aggMode="nop"
      />
    </div>
  );
}
