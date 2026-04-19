"use client";

// biome-ignore assist/source/organizeImports: <none>
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TutelaChartContent from "./tutela-chart-content";
import RhiChartContent from "./rhi-chart-content";
import OoklaChartContent from "./ookla-chart-content";
import RciChartContent from "./rci-chart-content";
import UnbalanceChartContent from "./unbalance-chart-content";
import ProductivityChartContent from "./productivity-chart-content";
import HqAchvDynamicChartContent from "./hq-achv-dynamic-chart-content";
import HqAchvDynamicChartContent2 from "./hq-achv-dynamic-chart-content-2";
import HqAchvDynamicChartContent3 from "./hq-achv-dynamic-chart-content-3";
import HqAchvDynamicChartContentTutOok from "./hq-achv-dynamic-chart-content-tut-ook";

interface IProps {
  cardTitle: string;
  className?: string;
  tutelaApiPath?: string;
  tutelaLevel?: string;
  tutelaLocation?: string;
  rhiApiPath?: string;
  rhiLevel?: string;
  rhiLocation?: string;
  ooklaApiPath?: string;
  ooklaLevel?: string;
  ooklaLocation?: string;
  rciApiPath?: string;
  rciLevel?: string;
  rciLocation?: string;
  unbalanceApiPath?: string;
  unbalanceLevel?: string;
  unbalanceLocation?: string;
  productivityApiPath?: string;
  chartMaxValue?: number;
  targetValue?: number;
  annotationLabel?: string;
  kpiColumnValue?: string;
}

export default function SummaryCardAchv({
  cardTitle = "noTitel",
  tutelaApiPath = "noUrl",
  tutelaLevel = "noLevel",
  tutelaLocation = "noLocation",
  rhiApiPath = "noUrl",
  rhiLevel = "noLevel",
  rhiLocation = "noLocation",
  ooklaApiPath = "noUrl",
  ooklaLevel = "noLevel",
  ooklaLocation = "noLocation",
  rciApiPath = "noUrl",
  rciLevel = "noLevel",
  rciLocation = "noLocation",
  unbalanceApiPath = "noUrl",
  unbalanceLevel = "noLevel",
  unbalanceLocation = "noLocation",
  productivityApiPath = "noUrl",
  className = "",
  chartMaxValue,
  targetValue,
  annotationLabel,
  kpiColumnValue,
}: IProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row flex-wrap gap-4">
          <HqAchvDynamicChartContent3
            apiPath={unbalanceApiPath}
            chartMaxValue={3}
            targetValue={2}
            annotationLabel="Unbalance"
            kpiColumnValue="pct_achv_unbalance_p1"
          />
          <HqAchvDynamicChartContent3
            apiPath={rciApiPath}
            chartMaxValue={1.3}
            targetValue={1}
            annotationLabel="RCI"
            kpiColumnValue="pct_achv_rci"
          />
          <HqAchvDynamicChartContent2
            apiPath={rhiApiPath}
            chartMaxValue={100}
            targetValue={95.25}
            annotationLabel="RHI"
            kpiColumnValue="percent_rhi_all"
          />
          <HqAchvDynamicChartContentTutOok
            apiPath={tutelaApiPath}
            chartMaxValue={16}
            targetValue={11}
            annotationLabel="Tutela"
            kpiColumnValue="Win"
          />
        </div>
      </CardContent>
    </Card>
  );
}
