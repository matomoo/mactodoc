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
import CeiChartContent from "./cei-chart-content";
import RedcovChartContent from "./redcov-chart-content";
import ProductivityDetailContent from "./productivity-detail-content";
import ProductivityDetailChartContent from "./productivity-detail-chart-content";

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
  ceiApiPath?: string;
  redcovApiPath?: string;
  productivityColumn?: string;
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
  ceiApiPath = "noUrl",
  redcovApiPath = "noUrl",
  className = "",
  chartMaxValue,
  targetValue,
  annotationLabel,
  kpiColumnValue,
  productivityColumn,
}: IProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          {cardTitle === "Productivity Detail Chart - Payload"
            ? null
            : cardTitle === "Productivity Detail - Payload"
              ? "Payload"
              : cardTitle === "Productivity Detail - Traffic"
                ? "Traffic"
                : cardTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cardTitle === "ONX" ? (
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
        ) : cardTitle === "Productivity Detail - Payload" ? (
          <ProductivityDetailContent
            productivityApiPath={productivityApiPath}
            productivityLevel="noLevel"
            productivityLocation="noLocation"
            productivityColumn={productivityColumn}
            title="Payload"
          />
        ) : cardTitle === "Productivity Detail - Traffic" ? (
          <ProductivityDetailContent
            productivityApiPath={productivityApiPath}
            productivityLevel="noLevel"
            productivityLocation="noLocation"
            productivityColumn={productivityColumn}
            title="Traffic"
          />
        ) : cardTitle === "Productivity Detail Chart - Payload" ? (
          <ProductivityDetailChartContent
            productivityApiPath={productivityApiPath}
            productivityLevel="noLevel"
            productivityLocation="noLocation"
            // productivityColumn={productivityColumn}
            title={cardTitle}
          />
        ) : cardTitle === "Hq-Achv" ? (
          <HqAchvDynamicChartContent
            apiPath={unbalanceApiPath}
            chartMaxValue={chartMaxValue}
            targetValue={targetValue}
            annotationLabel={annotationLabel}
            kpiColumnValue={kpiColumnValue}
          />
        ) : cardTitle === "CEI" ? (
          <CeiChartContent ceiApiPath={ceiApiPath} ceiLevel="noLevel" ceiLocation="noLocation" />
        ) : cardTitle === "Redcov" ? (
          <RedcovChartContent redcovApiPath={redcovApiPath} redcovLevel="noLevel" redcovLocation="noLocation" />
        ) : (
          <div>TODO: On Progress</div>
        )}
      </CardContent>
    </Card>
  );
}
