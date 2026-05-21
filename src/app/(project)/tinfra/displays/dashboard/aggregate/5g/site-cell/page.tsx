"use client";

import { FilterBy_Date_Multi_SiteId } from "@/app/(project)/tinfra/_component/filter-site/filter-by-date-multi-siteid";
import PageAggCustom5GDaily from "@/app/(project)/tinfra/_component/ui-v4/agg-custom-5g-daily-v1";
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
        <FilterBy_Date_Multi_SiteId />
      </div>
      <PageAggCustom5GDaily
        apiPath={"v3/v1-meas-5g"}
        apiPathPloss={"aggregate/plos-dy-site-5g"}
        aggregateBy="G5_SITEID_CELLID"
        filterLabel=""
        showViewModeState="metrics"
        aggMode="site-cell"
        isShowTa={true}
        fieldToAggregate="siteid_cellid"
        tech="5G"
        showExportPpt={false}
      />
    </div>
  );
}
