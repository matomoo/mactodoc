"use client";

import SummaryCard from "./summary-card-tutela";

interface IProps {
  mode?: "breakdown" | "chart";
}
export default function SummaryLayout({ mode = "breakdown" }: IProps) {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-auto py-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-2">
        {mode === "breakdown" && (
          <div>
            <SummaryCard
              cardTitle={"Productivity Detail - Payload"}
              productivityApiPath="/tinfra/api/v2/summary/hq-productivity"
              className="lg:col-span-1"
              productivityColumn="payload_growth"
            />
            <SummaryCard
              cardTitle={"Productivity Detail - Traffic"}
              productivityApiPath="/tinfra/api/v2/summary/hq-productivity"
              className="lg:col-span-1"
              productivityColumn="traffic_growth"
            />
          </div>
        )}
        {mode === "chart" && (
          <div>
            <SummaryCard
              cardTitle={"Productivity Detail Chart - Payload"}
              productivityApiPath="/tinfra/api/v2/summary/hq-productivity"
              className="lg:col-span-1"
              productivityColumn="payload_growth"
            />
          </div>
        )}
      </div>
    </div>
  );
}
