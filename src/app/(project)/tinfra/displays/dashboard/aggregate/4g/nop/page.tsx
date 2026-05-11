"use client";

import { FilterBy_Date_DynamicField } from "@/app/(project)/tinfra/_component/filter-site/filter-by-date-dynamic-field";
import PageAggCustom4GDaily from "@/app/(project)/tinfra/_component/ui-v4/agg-custom-4g-daily-v9";
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
        <FilterBy_Date_DynamicField fieldToSearch="nop" />
      </div>
      <PageAggCustom4GDaily
        apiPath={"v2/mv-meas-dynamic-4g"}
        apiPathPloss={"aggregate/plos-dy-nop-4g"}
        aggregateBy="G4_AGGRBY"
        filterLabel=""
        showViewModeState="metrics"
        aggMode="nop"
        isShowTa={false}
        fieldToAggregate="nop"
      />
    </div>
  );
}
