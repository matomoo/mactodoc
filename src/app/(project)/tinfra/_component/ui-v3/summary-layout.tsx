"use client";

import SummaryCardAchv from "./summary-card-achv";
import SummaryCard from "./summary-card-tutela";

export default function SummaryLayout() {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-auto py-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SummaryCard
          cardTitle={"Productivity"}
          productivityApiPath="/tinfra/api/v2/summary/hq-productivity"
          className="lg:col-span-1"
        />
        <SummaryCardAchv
          cardTitle={"Hq-Achv"}
          unbalanceApiPath="/tinfra/api/v2/summary/hq-rci-unb"
          rciApiPath="/tinfra/api/v2/summary/hq-rci-unb"
          rhiApiPath="/tinfra/api/v2/summary/hq-rhi-2"
          tutelaApiPath="/tinfra/api/v2/summary/hq-tutela-achv"
          ooklaApiPath="/tinfra/api/v2/summary/hq-ookla-achv"
          ceiApiPath="/tinfra/api/v2/summary/hq-cei-achv"
          redcovApiPath="/tinfra/api/v2/summary/hq-redcov-achv"
          className="lg:col-span-2"
        />
        <SummaryCard cardTitle={"RHI"} rhiApiPath="/tinfra/api/v2/summary/hq-rhi" className="lg:col-span-1" />
        <SummaryCard cardTitle={"RCI"} rciApiPath="/tinfra/api/v2/summary/hq-rci-unb" className="lg:col-span-1" />
        <SummaryCard
          cardTitle={"Unbalance"}
          unbalanceApiPath="/tinfra/api/v2/summary/hq-rci-unb"
          className="lg:col-span-1"
        />
        <SummaryCard cardTitle={"CEI"} ceiApiPath="/tinfra/api/v2/summary/hq-cei" className="lg:col-span-1" />
        <SummaryCard cardTitle={"ONX"} tutelaApiPath="/tinfra/api/v2/summary/hq-tutela" className="lg:col-span-3" />
        <SummaryCard cardTitle={"Ookla"} ooklaApiPath="/tinfra/api/v2/summary/hq-ookla" className="lg:col-span-3" />
      </div>
    </div>
  );
}
