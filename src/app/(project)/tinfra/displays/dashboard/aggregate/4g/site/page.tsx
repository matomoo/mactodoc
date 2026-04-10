"use client";

import { FilterBy_Date_Multi_SiteId } from "@/app/(project)/tinfra/_component/filter-site/filter-by-date-multi-siteid";
import PageAggCustom4GDaily from "@/app/(project)/tinfra/_component/ui-v1/agg-custom-4g-daily-v8";
import { useRequireAuth } from "@/hooks/use-require-auth";
// import GenerateButtonForPPT from "@/app/(project)/tinfra/_component/ui-v1/export-ppt";

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
      <PageAggCustom4GDaily
        apiPath={"aggregate/meas-dy-site-cell-4g"}
        apiPathPloss={"aggregate/plos-dy-site-4g"}
        aggregateBy="G4_SITEID"
        filterLabel=""
        showViewModeState="metrics"
        aggMode="site"
        isShowTa={false}
        isShowHqRhi={true}
        apiPathRhi={"aggregate/hq-rhi/by-region"}
        fieldToAggregate="site_id"
        tutelaLevel="Kabupaten"
        tutelaProvider="Telkomsel"
        rhiLevel="Kabupaten"
        rhiProvider="Telkomsel"
      />
    </div>
  );
}
