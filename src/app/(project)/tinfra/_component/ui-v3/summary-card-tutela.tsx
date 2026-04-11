"use client";

// biome-ignore assist/source/organizeImports: <none>
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TutelaChartContent from "./tutela-chart-content";

interface IProps {
  cardTitle: string;
  className?: string;
  tutelaApiPath?: string;
  tutelaLevel?: string;
  tutelaLocation?: string;
}

export default function SummaryCard({
  cardTitle = "noTitel",
  tutelaApiPath = "noUrl",
  tutelaLevel = "noLevel",
  tutelaLocation = "noLocation",
  className = "",
}: IProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <TutelaChartContent tutelaApiPath={tutelaApiPath} tutelaLevel={tutelaLevel} tutelaLocation={tutelaLocation} />
      </CardContent>
    </Card>
  );
}
