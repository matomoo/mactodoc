"use client";

import SummaryCardAchv from "./summary-card-achv";
import SummaryCard from "./summary-card-tutela";

export default function SummaryLayout() {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-auto py-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SummaryCard
          cardTitle={"Productivity Detail"}
          productivityApiPath="/tinfra/api/v2/summary/hq-productivity"
          className="lg:col-span-2"
        />
      </div>
    </div>
  );
}
