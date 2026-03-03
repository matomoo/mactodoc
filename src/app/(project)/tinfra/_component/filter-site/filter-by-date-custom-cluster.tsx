"use client";
// biome-ignore assist/source/organizeImports: <will fix later>
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { format, subDays, parseISO, isValid } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFilterStore } from "@/stores/filterStore";
import { useQuery } from "@tanstack/react-query";

// Parse the date range parameter into a DateRange object
const parseDateRange = (rangeString: string | null): DateRange | undefined => {
  if (!rangeString) return undefined;

  const [fromStr, toStr] = rangeString.split("|");
  if (!fromStr || !toStr) return undefined;

  try {
    const fromDate = parseISO(fromStr);
    const toDate = parseISO(toStr);

    if (!isValid(fromDate) || !isValid(toDate)) {
      console.error("Invalid date parsed:", fromStr, toStr);
      return undefined;
    }

    return {
      from: fromDate,
      to: toDate,
    };
  } catch (e) {
    console.error("Error parsing date range:", e);
    return undefined;
  }
};

// Interface for cluster data
interface ClusterData {
  nama_cluster: string;
  total_sites?: number;
  site_ids?: string[];
}

export function FilterBy_Date_Nop() {
  // Default date range values
  const defaultFrom = subDays(new Date(), 7);
  const defaultTo = subDays(new Date(), 1);
  const defaultRangeString = `${format(defaultFrom, "yyyy-MM-dd")}|${format(defaultTo, "yyyy-MM-dd")}`;

  // Use Zustand store
  const { dateRange2, nop, clusterFilter, setDateRange2, setNop, setClusterFilter } = useFilterStore();

  // Initialize dateRange state from Zustand store or defaults
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (dateRange2) {
      const parsed = parseDateRange(dateRange2);
      if (parsed) return parsed;
    }
    return {
      from: defaultFrom,
      to: defaultTo,
    };
  });

  // Track if we're in the process of selecting a range
  const [isSelecting, setIsSelecting] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Fetch clusters from API
  const {
    data: clusters,
    isLoading,
    error,
  } = useQuery<ClusterData[]>({
    queryKey: ["ref-query-cluster-clusters"],
    queryFn: async () => {
      const response = await fetch("/tinfra/api/meas-db-ti-sul/ref-query-cluster");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Extract unique cluster names from the response
      const rows = Array.isArray(data) ? data : data?.rows || [];
      const uniqueClusters = Array.from(new Set(rows.map((item: any) => item.nama_cluster))).map((name) => ({
        nama_cluster: name as string,
      }));

      return uniqueClusters;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Ensure Zustand store is updated with default date range on first load
  useEffect(() => {
    if (isFirstLoad) {
      // If dateRange2 is not set in store, set it with default value
      if (!dateRange2) {
        setDateRange2(defaultRangeString);
        // console.log("Setting default date range in store:", defaultRangeString);
      }

      setIsFirstLoad(false);
    }
  }, [isFirstLoad, dateRange2, setDateRange2, defaultRangeString]);

  // Handler to update dateRange state and Zustand store
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (!range) {
      setDateRange(undefined);
      setIsSelecting(false);
      setDateRange2(null);
      return;
    }

    // If both dates are selected
    if (range.from && range.to) {
      setDateRange(range);
      const rangeString = `${format(range.from, "yyyy-MM-dd")}|${format(range.to, "yyyy-MM-dd")}`;
      setDateRange2(rangeString);
      setIsSelecting(false);
    }
    // If only from date is selected
    else if (range.from && !range.to) {
      setDateRange({ from: range.from, to: undefined });
      setIsSelecting(true);
    }
  };

  // Handler for NOP change - update Zustand store only
  const handleNopChange = (value: string) => {
    setNop(value || null);
  };

  // Handler for Cluster filter change
  const handleClusterChange = (value: string) => {
    setClusterFilter(value || null);
  };

  // Update dateRange if Zustand store changes externally
  useEffect(() => {
    if (dateRange2) {
      const parsedRange = parseDateRange(dateRange2);
      if (parsedRange) {
        setDateRange(parsedRange);
      }
    } else {
      setDateRange(undefined);
    }
  }, [dateRange2]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
        {/* Date Range Picker */}
        <div className="flex flex-col gap-2">
          <div className="font-medium text-sm">Date Range</div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-[280px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleDateRangeChange}
                defaultMonth={dateRange?.from || new Date()}
                numberOfMonths={2}
              />
              {isSelecting && (
                <div className="border-t p-2 text-center text-muted-foreground text-xs">
                  Select end date to complete range selection
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* NOP Filter */}
        <div className="flex flex-col gap-2">
          <div className="font-medium text-sm">Filter By NOP</div>
          <Select value={nop ?? undefined} onValueChange={handleNopChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select NOP" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ALL</SelectItem>
              <SelectItem value="kendari">KENDARI</SelectItem>
              <SelectItem value="makassar">MAKASSAR</SelectItem>
              <SelectItem value="manado">MANADO</SelectItem>
              <SelectItem value="palu">PALU</SelectItem>
              <SelectItem value="pare-pare">PARE-PARE</SelectItem>
              <SelectItem value="ternate">TERNATE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cluster Filter */}
        <div className="flex flex-col gap-2">
          <div className="font-medium text-sm">Filter By Cluster</div>
          <Select value={clusterFilter ?? undefined} onValueChange={handleClusterChange} disabled={isLoading}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={isLoading ? "Loading clusters..." : "Select cluster"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ALL CLUSTERS</SelectItem>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Loading...</span>
                </div>
              ) : error ? (
                <div className="p-4 text-sm text-red-500">Error loading clusters</div>
              ) : clusters && clusters.length > 0 ? (
                clusters.map((cluster) => (
                  <SelectItem key={cluster.nama_cluster} value={cluster.nama_cluster}>
                    {cluster.nama_cluster}
                  </SelectItem>
                ))
              ) : (
                <div className="p-4 text-sm text-gray-500">No clusters found</div>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(nop || clusterFilter) && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Active filters:</span>
          {nop && <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">NOP: {nop.toUpperCase()}</span>}
          {clusterFilter && (
            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Cluster: {clusterFilter}</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => {
              setNop(null);
              setClusterFilter(null);
            }}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
