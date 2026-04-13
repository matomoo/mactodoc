"use client";

import SummaryCard from "./summary-card-tutela";

export default function SummaryLayout() {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-auto py-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SummaryCard cardTitle={"Tutela"} tutelaApiPath="/tinfra/api/v2/summary/hq-tutela" className="lg:col-span-2" />
        <SummaryCard cardTitle={"RHI"} rhiApiPath="/tinfra/api/v2/summary/hq-rhi" className="lg:col-span-1" />
        <SummaryCard cardTitle={"Ookla"} ooklaApiPath="/tinfra/api/v2/summary/hq-ookla" className="lg:col-span-2" />
      </div>
    </div>
  );
}
