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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
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

export function FilterBy_Date_CustomCluster() {
  // Default date range values
  const defaultFrom = subDays(new Date(), 7);
  const defaultTo = subDays(new Date(), 1);
  const defaultRangeString = `${format(defaultFrom, "yyyy-MM-dd")}|${format(defaultTo, "yyyy-MM-dd")}`;

  // Use Zustand store
  const {
    dateRange2: storeDateRange,
    nop: storeNop,
    clusterFilter: storeClusterFilter,
    setDateRange2,
    setNop,
    setClusterFilter,
  } = useFilterStore();

  // Local state for temporary filters (not yet applied to store)
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(() => {
    if (storeDateRange) {
      const parsed = parseDateRange(storeDateRange);
      if (parsed) return parsed;
    }
    return {
      from: defaultFrom,
      to: defaultTo,
    };
  });
  const [tempClusterFilter, setTempClusterFilter] = useState<string[] | null>(storeClusterFilter);

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
      // If storeDateRange is not set in store, set it with default value
      if (!storeDateRange) {
        setDateRange2(defaultRangeString);
        // console.log("Setting default date range in store:", defaultRangeString);
      }

      setIsFirstLoad(false);
    }
  }, [isFirstLoad, storeDateRange, setDateRange2, defaultRangeString]);

  // Handler to update temporary date range state (not yet applied to store)
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (!range) {
      setTempDateRange(undefined);
      setIsSelecting(false);
      return;
    }

    // If both dates are selected
    if (range.from && range.to) {
      setTempDateRange(range);
      setIsSelecting(false);
    }
    // If only from date is selected
    else if (range.from && !range.to) {
      setTempDateRange({ from: range.from, to: undefined });
      setIsSelecting(true);
    }
  };

  // Handler for NOP change - update Zustand store only
  const handleNopChange = (value: string) => {
    setNop(value || null);
  };

  // Handler for Cluster filter change (temporary state)
  const handleClusterChange = (clusters: string[] | null) => {
    setTempClusterFilter(clusters);
  };

  // Toggle cluster selection (temporary state)
  const toggleCluster = (clusterName: string) => {
    // Handle case where clusterFilter might be a string (old data) or array
    let currentClusters: string[] = [];

    if (Array.isArray(tempClusterFilter)) {
      currentClusters = tempClusterFilter;
    } else if (tempClusterFilter && typeof tempClusterFilter === "string") {
      // Convert old string format to array
      currentClusters = [tempClusterFilter];
    }

    if (currentClusters.includes(clusterName)) {
      // Remove cluster if already selected
      const newClusters = currentClusters.filter((c) => c !== clusterName);
      handleClusterChange(newClusters.length > 0 ? newClusters : null);
    } else {
      // Add cluster if not selected
      handleClusterChange([...currentClusters, clusterName]);
    }
  };

  // Clear all clusters (temporary state)
  const clearClusters = () => {
    handleClusterChange(null);
  };

  // Process button handler - apply temporary filters to Zustand store
  const handleProcessFilters = () => {
    if (tempDateRange?.from && tempDateRange?.to) {
      const rangeString = `${format(tempDateRange.from, "yyyy-MM-dd")}|${format(tempDateRange.to, "yyyy-MM-dd")}`;
      setDateRange2(rangeString);
    } else {
      setDateRange2(null);
    }

    setClusterFilter(tempClusterFilter);
  };

  // Check if filters have changed from store values
  const hasChanges =
    tempDateRange?.from?.getTime() !== (storeDateRange ? parseDateRange(storeDateRange)?.from?.getTime() : undefined) ||
    tempDateRange?.to?.getTime() !== (storeDateRange ? parseDateRange(storeDateRange)?.to?.getTime() : undefined) ||
    JSON.stringify(tempClusterFilter) !== JSON.stringify(storeClusterFilter);

  // Update temporary date range if Zustand store changes externally
  useEffect(() => {
    if (storeDateRange) {
      const parsedRange = parseDateRange(storeDateRange);
      if (parsedRange) {
        setTempDateRange(parsedRange);
      }
    } else {
      setTempDateRange(undefined);
    }
  }, [storeDateRange]);

  // Update temporary cluster filter if Zustand store changes externally
  useEffect(() => {
    setTempClusterFilter(storeClusterFilter);
  }, [storeClusterFilter]);

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
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !tempDateRange && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {tempDateRange?.from ? (
                  tempDateRange.to ? (
                    <>
                      {format(tempDateRange.from, "LLL dd, y")} - {format(tempDateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(tempDateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={tempDateRange}
                onSelect={handleDateRangeChange}
                defaultMonth={tempDateRange?.from || new Date()}
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

        {/* Multi-Select Cluster Filter */}
        <div className="flex flex-col gap-2">
          <div className="font-medium text-sm">Filter By Cluster</div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-400 justify-start text-left" disabled={isLoading}>
                {tempClusterFilter && Array.isArray(tempClusterFilter) && tempClusterFilter.length > 0 ? (
                  <div className="flex gap-1 flex-wrap">
                    {tempClusterFilter.slice(0, 2).map((cluster: string) => (
                      <Badge key={cluster} variant="secondary" className="text-xs">
                        {cluster}
                      </Badge>
                    ))}
                    {tempClusterFilter.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{tempClusterFilter.length - 2}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">{isLoading ? "Loading clusters..." : "Select clusters"}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search clusters..." />
                <CommandList>
                  <CommandEmpty>No clusters found.</CommandEmpty>
                  <CommandGroup>
                    {isLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : error ? (
                      <div className="p-4 text-sm text-red-500">Error loading clusters</div>
                    ) : clusters && clusters.length > 0 ? (
                      clusters.map((cluster) => {
                        const isSelected =
                          (Array.isArray(tempClusterFilter)
                            ? tempClusterFilter
                            : tempClusterFilter
                              ? [tempClusterFilter]
                              : []
                          )?.includes(cluster.nama_cluster) || false;
                        return (
                          <CommandItem
                            key={cluster.nama_cluster}
                            value={cluster.nama_cluster}
                            onSelect={() => toggleCluster(cluster.nama_cluster)}
                            className="flex gap-2 cursor-pointer"
                          >
                            <Checkbox checked={isSelected} className="pointer-events-none" />
                            <span className="flex-1">{cluster.nama_cluster}</span>
                          </CommandItem>
                        );
                      })
                    ) : (
                      <div className="p-4 text-sm text-gray-500">No clusters found</div>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
              {tempClusterFilter && Array.isArray(tempClusterFilter) && tempClusterFilter.length > 0 && (
                <div className="border-t p-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {tempClusterFilter.length} cluster
                    {tempClusterFilter.length > 1 ? "s" : ""} selected
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearClusters}>
                    <X className="h-3 w-3 mr-1" />
                    Clear all
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
        {/* Process Button */}
        <div className="flex justify-end items-end">
          <Button
            onClick={handleProcessFilters}
            disabled={!hasChanges || !tempDateRange?.from || !tempDateRange?.to}
            className="px-6"
          >
            Process Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
