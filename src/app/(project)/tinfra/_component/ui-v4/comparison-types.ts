import type { Data2G4GModel } from "@/types/schema";

export interface MetricConfig {
  name: string;
  tech: "2G" | "4G";
  calculate: (data: Data2G4GModel[]) => number;
  growthType?: "successRate100" | "successRate0" | "standard" | "inverse";
}

export interface UnifiedMetricConfig {
  id: string; // Unique identifier (matches metric_num)
  title: string; // Chart title
  tech: "5G" | "4G" | "2G" | "All"; // Technology type
  metric_num: string; // Numerator field
  metric_denum?: string; // Denominator field (optional)
  calculate?: (data: Data2G4GModel[]) => number; // Optional custom calculation
  unit?: string; // Unit for display
  growthType?: "successRate100" | "successRate0" | "standard" | "inverse";
}

export const METRIC_CONFIGS: UnifiedMetricConfig[] = [
  {
    id: "TOTAL_PAYLOAD_GB",
    title: "Total Payload (GB)",
    tech: "4G",
    metric_num: "TOTAL_PAYLOAD_GB",
    unit: "GB",
  },
];

export interface ComparisonResult {
  tech: "2G" | "4G" | "5G" | "All";
  metric: string;
  metric_num: string;
  before: number;
  after: number;
  delta: number;
  growth: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}
