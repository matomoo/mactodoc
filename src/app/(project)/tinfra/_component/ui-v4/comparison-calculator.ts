// biome-ignore assist/source/organizeImports: <will fix later>
import type { Data2G4GModel } from "@/types/schema";
import type { MetricConfig, ComparisonResult, UnifiedMetricConfig } from "./comparison-types";
import { toZonedTime } from "date-fns-tz";
import { endOfDay, startOfDay } from "date-fns";
import {
  calculateSuccessRate0,
  calculateSuccessRate0Infra,
  calculateSuccessRate100,
  calculateSuccessRate100Infra,
} from "../../_function/helper";

// Unified growth calculation function
export const calculateGrowthForMetric = (
  before: number,
  after: number,
  growthType: UnifiedMetricConfig["growthType"] = "standard",
): { delta: number; growth: number } => {
  let delta = after - before;

  // For metrics that should decrease, invert the delta for display purposes
  if (growthType === "successRate0") {
    delta = -(after - before);
  }

  let growth = 0;

  if (before === 0) {
    return { delta, growth };
  }

  switch (growthType) {
    case "successRate100":
      growth = calculateSuccessRate100Infra(before, after);
      break;
    case "successRate0":
      growth = calculateSuccessRate0Infra(before, after);
      break;
    default:
      growth = Math.abs(((after - before) / before) * 100);
      break;
  }

  return { delta, growth };
};

// Main comparison calculation function
export const calculateComparisonData = (
  data: Data2G4GModel[],
  metricCalculators: UnifiedMetricConfig[],
  beforeRange: { startDate: string; endDate: string },
  afterRange: { startDate: string; endDate: string },
  timezone = "Asia/Makassar",
): ComparisonResult[] => {
  // Filter data by date range
  const filterByDateRange = (startDate: string, endDate: string): Data2G4GModel[] => {
    if (!startDate || !endDate) return [];

    // Convert ISO strings to dates and set to start/end of day in the target timezone
    const start = startOfDay(toZonedTime(new Date(startDate), timezone));
    const end = endOfDay(toZonedTime(new Date(endDate), timezone));

    return data.filter((item) => {
      const itemDate = toZonedTime(new Date(item.BEGIN_TIME), timezone);
      return itemDate >= start && itemDate <= end;
    });
  };

  const beforeData = filterByDateRange(beforeRange.startDate, beforeRange.endDate);
  const afterData = filterByDateRange(afterRange.startDate, afterRange.endDate);

  return metricCalculators.map(({ title, metric_num, calculate, growthType = "standard", tech }) => {
    // If calculate is not provided, use metric_num to calculate sum
    const calcFn =
      calculate ??
      ((data: Data2G4GModel[]) => {
        // Default behavior: sum up the metric_num values
        return data.reduce((sum, item) => {
          const value = item[title as keyof Data2G4GModel];
          return sum + (typeof value === "number" ? value : 0);
        }, 0);
      });

    const before = calcFn(beforeData);
    const after = calcFn(afterData);

    const { delta, growth } = calculateGrowthForMetric(before, after, growthType);

    return {
      metric: title,
      metric_num: metric_num,
      before,
      after,
      delta,
      growth,
      tech,
    };
  });
};
