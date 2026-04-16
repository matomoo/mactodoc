"use client";

// biome-ignore assist/source/organizeImports: <none>
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TutelaChartContent from "./tutela-chart-content";
import RhiChartContent from "./rhi-chart-content";
import OoklaChartContent from "./ookla-chart-content";
import RciChartContent from "./rci-chart-content";
import UnbalanceChartContent from "./unbalance-chart-content";
import ProductivityChartContent from "./productivity-chart-content";

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
}

export default function SummaryCard({
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
}: IProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        {cardTitle === "Tutela" ? (
          <TutelaChartContent tutelaApiPath={tutelaApiPath} tutelaLevel={tutelaLevel} tutelaLocation={tutelaLocation} />
        ) : cardTitle === "RHI" ? (
          <RhiChartContent rhiApiPath={rhiApiPath} rhiLevel={rhiLevel} rhiLocation={rhiLocation} />
        ) : cardTitle === "Ookla" ? (
          <OoklaChartContent ooklaApiPath={ooklaApiPath} ooklaLevel={ooklaLevel} ooklaLocation={ooklaLocation} />
        ) : cardTitle === "RCI" ? (
          <RciChartContent rciApiPath={rciApiPath} rciLevel={rciLevel} rciLocation={rciLocation} />
        ) : cardTitle === "Unbalance" ? (
          <UnbalanceChartContent
            unbalanceApiPath={unbalanceApiPath}
            unbalanceLevel={unbalanceLevel}
            unbalanceLocation={unbalanceLocation}
          />
        ) : cardTitle === "Productivity" ? (
          <ProductivityChartContent
            productivityApiPath={productivityApiPath}
            productivityLevel="noLevel"
            productivityLocation="noLocation"
          />
        ) : (
          <div>TODO: On Progress</div>
        )}
      </CardContent>
    </Card>
  );
}
