// biome-ignore assist/source/organizeImports: <will fix later>
import type { Data2G4GModel } from "@/types/schema";
import type React from "react";
import { useState, useEffect } from "react";
import { subDays, format, differenceInDays, addDays } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

// Import utilities
import type { DateRange } from "./comparison-types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useComparisonCalculation } from "./use-comparison-data";
import { formatDateForDisplay } from "../../_function/helper";
import { get2G4GMetricConfigs } from "./metric-configs";

const TableComparison2G4GDaily: React.FC<{
  data: Data2G4GModel[];
  tech: string;
  selectedKPIs: string[];
  onSelectedKPIsChange: (selected: string[]) => void;
  onFilteredComparisonDataChange?: (data: any[]) => void;
}> = ({ data, tech, selectedKPIs, onSelectedKPIsChange, onFilteredComparisonDataChange }) => {
  const timezone = "Asia/Makassar";

  const dateStrings = data.map((item) => item.BEGIN_TIME);
  dateStrings.sort((a, b) => Date.parse(a) - Date.parse(b));

  const createDateInTimezone = (date: Date) => {
    const zonedDate = toZonedTime(date, timezone);
    return fromZonedTime(zonedDate, timezone);
  };

  const firstDateString = dateStrings[0];
  const lastDateString = dateStrings[dateStrings.length - 1];
  const diffInDays = differenceInDays(lastDateString, firstDateString);

  const [afterRange, setAfterRange] = useState<DateRange>({
    startDate: createDateInTimezone(subDays(lastDateString, diffInDays < 7 ? 1 : 2)).toISOString(),
    endDate: createDateInTimezone(subDays(lastDateString, diffInDays < 7 ? 0 : 0)).toISOString(),
  });

  const [beforeRange, setBeforeRange] = useState<DateRange>({
    startDate: createDateInTimezone(addDays(firstDateString, diffInDays < 7 ? 0 : 0)).toISOString(),
    endDate: createDateInTimezone(addDays(firstDateString, diffInDays < 7 ? 1 : 2)).toISOString(),
  });

  // Pass date ranges to the hook so it can recalculate when they change
  const { comparisonData } = useComparisonCalculation(data, tech, beforeRange, afterRange);

  const DateRangePicker = ({
    title,
    range,
    setRange,
  }: {
    title: string;
    range: DateRange;
    setRange: React.Dispatch<React.SetStateAction<DateRange>>;
  }) => {
    const formatWithTimezone = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const zonedDate = toZonedTime(date, timezone);
      return format(zonedDate, "yyyy-MM-dd");
    };

    const handleDateSelect = (date: Date | undefined, field: "startDate" | "endDate") => {
      if (!date) return;

      // Convert the selected date to the target timezone and store as ISO string
      const zonedDate = toZonedTime(date, timezone);
      setRange((prev) => ({
        ...prev,
        [field]: zonedDate.toISOString(),
      }));
    };

    const getSelectedDate = (dateString: string) => {
      if (!dateString) return undefined;
      return toZonedTime(new Date(dateString), timezone);
    };

    const visibleCharts = get2G4GMetricConfigs().filter(
      (chart) => chart.tech === "4G" && selectedKPIs.includes(chart.metric_num),
    );

    const toggleKPI = (metricNum: string) => {
      if (selectedKPIs.includes(metricNum)) {
        onSelectedKPIsChange(selectedKPIs.filter((id) => id !== metricNum));
      } else {
        onSelectedKPIsChange([...selectedKPIs, metricNum]);
      }
    };

    const selectAll = () => {
      onSelectedKPIsChange(
        get2G4GMetricConfigs()
          .filter((a) => a.tech === "4G")
          .map((config) => config.metric_num),
      );
    };

    const deselectAll = () => {
      onSelectedKPIsChange([]);
    };

    return (
      <div className="date-range-group">
        <h3 className="font-semibold">{title}</h3>
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!range.startDate}
                className="justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
              >
                <CalendarIcon />
                {range.startDate ? formatWithTimezone(range.startDate) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={getSelectedDate(range.startDate)}
                onSelect={(date) => handleDateSelect(date, "startDate")}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!range.endDate}
                className="justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
              >
                <CalendarIcon />
                {range.endDate ? formatWithTimezone(range.endDate) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={getSelectedDate(range.endDate)}
                onSelect={(date) => handleDateSelect(date, "endDate")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  };

  const filteredComparisonData = comparisonData.filter((row) => selectedKPIs.includes(row.metric_num));

  console.log({ filteredComparisonData });

  // Call the callback when filteredComparisonData changes
  useEffect(() => {
    if (onFilteredComparisonDataChange) {
      onFilteredComparisonDataChange(filteredComparisonData);
    }
  }, [filteredComparisonData, onFilteredComparisonDataChange]);

  return (
    <div className="w-full">
      <div className="w-full px-0 sm:px-0 md:px-0">
        <div className="grid grid-cols-1 gap-6 rounded-lg bg-white p-2 shadow lg:grid-cols-1">
          <div className="col-span-2 space-y-6">
            <div className="grid gap-4 rounded-2xl bg-slate-200 p-4 text-sm">
              <DateRangePicker title="Before Period" range={beforeRange} setRange={setBeforeRange} />
              <DateRangePicker title="After Period" range={afterRange} setRange={setAfterRange} />
            </div>
          </div>

          <div className="comparison-table col-span-4">
            <h3 className="mb-2 font-semibold text-lg">Comparison Results</h3>
            <div className="text-sm">
              Date Before Range: {formatDateForDisplay(beforeRange.startDate, 2)} to{" "}
              {formatDateForDisplay(beforeRange.endDate, 2)}
            </div>
            <div className="mb-2 text-sm">
              Date After Range: {formatDateForDisplay(afterRange.startDate, 2)} to{" "}
              {formatDateForDisplay(afterRange.endDate, 2)}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 p-3 text-left font-medium">Metric</th>
                    <th className="border border-gray-200 p-3 text-left font-medium">Before</th>
                    <th className="border border-gray-200 p-3 text-left font-medium">After</th>
                    <th className="border border-gray-200 p-3 text-left font-medium">Delta</th>
                    <th className="border border-gray-200 p-3 text-left font-medium">Growth (%)</th>
                    <th className="border border-gray-200 p-3 text-left font-medium">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComparisonData.map((row, _index) => (
                    <tr key={row.metric} className="hover:bg-gray-50">
                      <td className="border border-gray-200 p-3 font-medium">{row.metric}</td>
                      <td className="border border-gray-200 p-3 text-right">{row.before.toFixed(2)}</td>
                      <td className="border border-gray-200 p-3 text-right">{row.after.toFixed(2)}</td>
                      <td
                        className={`border border-gray-200 p-3 text-right ${
                          row.growth > 2 && row.delta > 0
                            ? "text-green-600"
                            : row.growth > 2 && row.delta < 0
                              ? "text-red-600"
                              : "text-yellow-600"
                        }`}
                      >
                        {row.delta.toFixed(2)}
                      </td>
                      <td
                        className={`border border-gray-200 p-3 text-right ${
                          row.growth > 2 && row.delta > 0
                            ? "text-green-600"
                            : row.growth > 2 && row.delta < 0
                              ? "text-red-600"
                              : "text-yellow-600"
                        }`}
                      >
                        {row.growth.toFixed(2)}%
                      </td>
                      <td
                        className={`border border-gray-200 p-3 text-center ${
                          row.growth > 2 && row.delta > 0
                            ? "text-green-600"
                            : row.growth > 2 && row.delta < 0
                              ? "text-red-600"
                              : "text-yellow-600"
                        }`}
                      >
                        {row.growth > 2 && row.delta > 0
                          ? "Improve"
                          : row.growth > 2 && row.delta < 0
                            ? "Degrade"
                            : "Maintain"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Optional: Show a message when no KPIs are selected */}
              {filteredComparisonData.length === 0 && (
                <div className="py-4 text-center text-gray-500">
                  No metrics selected. Please select KPIs to display.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableComparison2G4GDaily;
