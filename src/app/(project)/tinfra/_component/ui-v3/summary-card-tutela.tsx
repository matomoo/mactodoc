"use client";

// biome-ignore assist/source/organizeImports: <none>
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TutelaChartContent from "./tutela-chart-content";
import RhiChartContent from "./rhi-chart-content";

interface IProps {
  cardTitle: string;
  className?: string;
  tutelaApiPath?: string;
  tutelaLevel?: string;
  tutelaLocation?: string;
  rhiApiPath?: string;
}

export default function SummaryCard({
  cardTitle = "noTitel",
  tutelaApiPath = "noUrl",
  tutelaLevel = "noLevel",
  tutelaLocation = "noLocation",
  rhiApiPath = "noUrl",
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
          <RhiChartContent rhiApiPath={rhiApiPath} rhiLevel={tutelaLevel} rhiLocation={tutelaLocation} />
        ) : (
          <div>TODO: On Progress</div>
        )}
      </CardContent>
    </Card>
  );
}
