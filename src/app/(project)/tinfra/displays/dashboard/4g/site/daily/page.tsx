"use client";

import { FilterBy_Date_SiteId } from "@/app/(project)/tinfra/_component/filter-site/filter-by-date-siteid";
import { TwH3 } from "@/app/(project)/tinfra/_component/typography/typography";
import PageAggCustom4GDaily from "@/app/(project)/tinfra/_component/ui-v1/agg-custom-4g-daily-v5";
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
      {/* <TwH3 text="4G Site Level Daily" /> */}
      <div className="grid grid-cols-2 justify-between md:grid-cols-1">
        <FilterBy_Date_SiteId />
      </div>
      <PageAggCustom4GDaily apiPath={"meas-dy-site-4g"} aggregateBy="CELL_NAME" filterLabel="Cell Name" />
    </div>
  );
}
