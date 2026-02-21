// hooks/useComparisonCalculation.ts
// biome-ignore assist/source/organizeImports: <will fix later>
import { useMemo } from "react";
import { subDays, differenceInDays, addDays, format } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import type { Data2G4GModel } from "@/types/schema";
import type { ComparisonResult, DateRange } from "./comparison-types";
import { get2G4GMetricConfigs } from "./metric-configs";
import { calculateComparisonData } from "./comparison-calculator";

export function useComparisonCalculation(
  data: Data2G4GModel[],
  tech: string,
  beforeRange?: DateRange, // Make optional
  afterRange?: DateRange, // Make optional
  timezone = "Asia/Makassar",
) {
  // Calculate effective date ranges (use provided or calculate defaults)
  const { effectiveBeforeRange, effectiveAfterRange } = useMemo(() => {
    // If both ranges are provided and valid, use them
    if (beforeRange?.startDate && beforeRange?.endDate && afterRange?.startDate && afterRange?.endDate) {
      return {
        effectiveBeforeRange: beforeRange,
        effectiveAfterRange: afterRange,
      };
    }

    // Otherwise, calculate default ranges
    if (!data || data.length === 0) {
      return {
        effectiveBeforeRange: { startDate: "", endDate: "" } as DateRange,
        effectiveAfterRange: { startDate: "", endDate: "" } as DateRange,
      };
    }

    const dateStrings = data.map((item) => item.BEGIN_TIME);
    dateStrings.sort((a, b) => Date.parse(a) - Date.parse(b));

    const createDateInTimezone = (date: Date) => {
      const zonedDate = toZonedTime(date, timezone);
      return fromZonedTime(zonedDate, timezone);
    };

    const firstDateString = dateStrings[0];
    const lastDateString = dateStrings[dateStrings.length - 1];
    const diffInDays = differenceInDays(new Date(lastDateString), new Date(firstDateString));

    const afterRangeDefault: DateRange = {
      startDate: createDateInTimezone(subDays(new Date(lastDateString), diffInDays < 7 ? 1 : 2)).toISOString(),
      endDate: createDateInTimezone(subDays(new Date(lastDateString), diffInDays < 7 ? 0 : 0)).toISOString(),
    };

    const beforeRangeDefault: DateRange = {
      startDate: createDateInTimezone(addDays(new Date(firstDateString), diffInDays < 7 ? 0 : 0)).toISOString(),
      endDate: createDateInTimezone(addDays(new Date(firstDateString), diffInDays < 7 ? 1 : 2)).toISOString(),
    };

    return {
      effectiveBeforeRange: beforeRangeDefault,
      effectiveAfterRange: afterRangeDefault,
    };
  }, [data, timezone, beforeRange, afterRange]);

  // Get metric configurations
  const metricCalculators = useMemo(() => get2G4GMetricConfigs().filter((config) => config.tech === tech), [tech]);

  // Calculate comparison data based on effective date ranges
  const comparisonData = useMemo((): ComparisonResult[] => {
    if (!data || data.length === 0) return [];

    // Check if we have valid date ranges
    if (
      !effectiveBeforeRange.startDate ||
      !effectiveBeforeRange.endDate ||
      !effectiveAfterRange.startDate ||
      !effectiveAfterRange.endDate
    ) {
      return [];
    }

    return calculateComparisonData(data, metricCalculators, effectiveBeforeRange, effectiveAfterRange, timezone);
  }, [data, metricCalculators, effectiveBeforeRange, effectiveAfterRange, timezone]);

  // Filter for specific metrics
  const productivityMetrics = useMemo(
    () =>
      comparisonData.filter(
        (row) =>
          row.metric === "TCH Traffic (Erl)" ||
          row.metric === "Total Payload (MB)" ||
          row.metric === "Total Payload (GB)" ||
          row.metric === "Traffic VoLTE (KErl)",
      ),
    [comparisonData],
  );

  return {
    beforeRange: effectiveBeforeRange,
    afterRange: effectiveAfterRange,
    comparisonData,
    productivityMetrics,
    getMetric: (metricName: string) => comparisonData.find((item) => item.metric === metricName),
  };
}
