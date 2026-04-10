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
import { X } from "lucide-react";
import { useSummaryStore } from "@/stores/summaryStore";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

// Interface for Kabupaten data
interface NopData {
  nama_nop: string;
  total_sites?: number;
  site_ids?: string[];
}

// Interface for week data
interface WeekData {
  year_week: string;
  [key: string]: string | number;
}

export function Filter_Summary() {
  // Default date range values
  const defaultFrom = subDays(new Date(), 7);
  const defaultTo = subDays(new Date(), 1);
  const defaultRangeString = `${format(defaultFrom, "yyyy-MM-dd")}|${format(defaultTo, "yyyy-MM-dd")}`;

  // Use Zustand store
  const {
    dateRange2: storeDateRange,
    yearweek: storeYearweek,
    nop: storeNop,
    region: storeRegion,
    kabupaten: storeKabupaten,
    kecamatan: storeKecamatan,
    setDateRange2,
    setYearweek,
    setNop,
    setRegion,
    setKabupaten,
    setKecamatan,
  } = useSummaryStore();

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
  const [tempDataFilter, setTempDataFilter] = useState<string | null>(null);

  // Track if we're in the process of selecting a range
  const [isSelecting, setIsSelecting] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [viewBy, setViewBy] = useState<string>("region");

  // Fetch NOPs from API
  const {
    data: nops,
    isLoading,
    error,
  } = useQuery<NopData[]>({
    queryKey: ["ref-query-dynamic", viewBy],
    queryFn: async () => {
      const response = await fetch(`/tinfra/api/meas-db-ti-sul/aggregate/ref-query-dynamic?fieldToSearch=${viewBy}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Extract unique field names from response
      const rows = data?.rows || [];
      if (!Array.isArray(rows)) {
        return [];
      }
      const uniqueResults = Array.from(new Set(rows.map((item: Record<string, string>) => item[viewBy]))).map(
        (name) => ({
          nama_nop: name as string,
        }),
      );

      return uniqueResults;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // API to fetch week range data
  const { data: weekData, isLoading: weekLoading } = useQuery({
    queryKey: ["week-range-data"],
    queryFn: async () => {
      const response = await fetch(`/tinfra/api/v2/summary/ref-year-week`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  console.log("debug", { weekData });

  // Extract the actual data from the response
  const weekList = weekData?.rows || weekData || [];

  // Ensure Zustand store is updated with default date range on first load
  useEffect(() => {
    if (isFirstLoad) {
      // If storeDateRange is not set in store, set it with default value
      if (!storeDateRange) {
        setDateRange2(defaultRangeString);
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

  // Handler for filter change (temporary state)
  const handleFilterChange = (value: string | null) => {
    setTempDataFilter(value);
  };

  // Select single item (temporary state)
  const selectItem = (itemName: string) => {
    handleFilterChange(itemName);
  };

  // Clear selection (temporary state)
  const clearSelection = () => {
    handleFilterChange(null);
  };

  // Process button handler - apply temporary filters to Zustand store
  const handleProcessFilters = () => {
    if (tempDateRange?.from && tempDateRange?.to) {
      const rangeString = `${format(tempDateRange.from, "yyyy-MM-dd")}|${format(tempDateRange.to, "yyyy-MM-dd")}`;
      setDateRange2(rangeString);
    } else {
      setDateRange2(null);
    }

    if (tempDataFilter) {
      if (viewBy === "kabupaten") {
        setKabupaten(tempDataFilter);
      } else if (viewBy === "kecamatan") {
        setKecamatan(tempDataFilter);
      } else if (viewBy === "region") {
        setRegion(tempDataFilter);
      } else if (viewBy === "nop") {
        setNop(tempDataFilter);
      } else {
        setNop(tempDataFilter);
      }
    } else {
      if (viewBy === "kabupaten") {
        setKabupaten(null);
      } else if (viewBy === "kecamatan") {
        setKecamatan(null);
      } else if (viewBy === "nop") {
        setNop(null);
      } else {
        setNop(null);
      }
    }
  };

  // Check if filters have changed from store values
  const currentStoreData =
    viewBy === "kabupaten"
      ? storeKabupaten
      : viewBy === "kecamatan"
        ? storeKecamatan
        : viewBy === "region"
          ? storeRegion
          : storeNop;

  const hasChanges =
    tempDateRange?.from?.getTime() !== (storeDateRange ? parseDateRange(storeDateRange)?.from?.getTime() : undefined) ||
    tempDateRange?.to?.getTime() !== (storeDateRange ? parseDateRange(storeDateRange)?.to?.getTime() : undefined) ||
    JSON.stringify(tempDataFilter) !== JSON.stringify(currentStoreData);

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

  // Update temporary filter if Zustand store changes externally
  useEffect(() => {
    const currentStoreData =
      viewBy === "kabupaten"
        ? storeKabupaten
        : viewBy === "kecamatan"
          ? storeKecamatan
          : viewBy === "region"
            ? storeRegion
            : storeNop;
    if (currentStoreData) {
      setTempDataFilter(currentStoreData);
    } else {
      setTempDataFilter(null);
    }
  }, [storeKabupaten, storeNop, storeKecamatan, viewBy, storeRegion]);

  // Set default week to last available week
  useEffect(() => {
    if (weekList && weekList.length > 0 && !storeYearweek) {
      const lastWeek = weekList[weekList.length - 1].year_week;
      setYearweek(lastWeek);
    }
  }, [weekList, storeYearweek, setYearweek]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
        {/* Week Range Select */}
        <div className="flex flex-col gap-2">
          <Select value={storeYearweek || ""} onValueChange={setYearweek}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Select Week" />
            </SelectTrigger>
            <SelectContent>
              {weekLoading ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading weeks...</span>
                </div>
              ) : weekList?.length > 0 ? (
                weekList.map((row: WeekData) => (
                  <SelectItem key={row.year_week} value={row.year_week}>
                    {row.year_week}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-gray-500 text-sm">No weeks available</div>
              )}
            </SelectContent>
          </Select>
        </div>
        {/* Date Range Picker */}
        <div className="flex flex-col gap-2">
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

        {/* Select ViewBy */}
        <div className="flex flex-col gap-2">
          <Select value={viewBy} onValueChange={setViewBy}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Select View By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="region">Region</SelectItem>
              <SelectItem value="nop">NOP</SelectItem>
              <SelectItem value="kabupaten">Kabupaten</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Single-Select Dropdown Region */}
        {viewBy === "region" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-68 justify-start text-left" disabled={isLoading}>
                {tempDataFilter ? (
                  <span>{tempDataFilter}</span>
                ) : (
                  <span className="text-muted-foreground">{isLoading ? "Loading Regions..." : "Select Region"}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search Regions..." />
                <CommandList>
                  <CommandEmpty>No Regions found.</CommandEmpty>
                  <CommandGroup>
                    {isLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : error ? (
                      <div className="p-4 text-red-500 text-sm">Error loading Regions</div>
                    ) : Array.isArray(nops) && nops.length > 0 ? (
                      (nops || []).map((nop) => {
                        return (
                          <CommandItem
                            key={nop.nama_nop}
                            value={nop.nama_nop}
                            onSelect={() => selectItem(nop.nama_nop)}
                            className="flex cursor-pointer"
                          >
                            <span className="flex-1">{nop.nama_nop}</span>
                          </CommandItem>
                        );
                      })
                    ) : (
                      <div className="p-4 text-gray-500 text-sm">No Regions found</div>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
              {tempDataFilter && (
                <div className="flex items-center justify-between border-t p-2">
                  <span className="text-muted-foreground text-xs">1 Region selected</span>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearSelection}>
                    <X className="mr-1 h-3 w-3" />
                    Clear
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}

        {/* Single-Select Dropdown NOP */}
        {viewBy === "nop" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-68 justify-start text-left" disabled={isLoading}>
                {tempDataFilter ? (
                  <span>{tempDataFilter}</span>
                ) : (
                  <span className="text-muted-foreground">{isLoading ? "Loading NOPs..." : "Select NOP"}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search NOPs..." />
                <CommandList>
                  <CommandEmpty>No NOPs found.</CommandEmpty>
                  <CommandGroup>
                    {isLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : error ? (
                      <div className="p-4 text-red-500 text-sm">Error loading NOPs</div>
                    ) : Array.isArray(nops) && nops.length > 0 ? (
                      (nops || []).map((nop) => {
                        return (
                          <CommandItem
                            key={nop.nama_nop}
                            value={nop.nama_nop}
                            onSelect={() => selectItem(nop.nama_nop)}
                            className="flex cursor-pointer"
                          >
                            <span className="flex-1">{nop.nama_nop}</span>
                          </CommandItem>
                        );
                      })
                    ) : (
                      <div className="p-4 text-gray-500 text-sm">No NOPs found</div>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
              {tempDataFilter && (
                <div className="flex items-center justify-between border-t p-2">
                  <span className="text-muted-foreground text-xs">1 NOP selected</span>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearSelection}>
                    <X className="mr-1 h-3 w-3" />
                    Clear
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}

        {/* Single-Select Dropdown Kabupaten */}
        {viewBy === "kabupaten" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-68 justify-start text-left" disabled={isLoading}>
                {tempDataFilter ? (
                  <span>{tempDataFilter}</span>
                ) : (
                  <span className="text-muted-foreground">
                    {isLoading ? "Loading Kabupatens..." : "Select Kabupaten"}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search Kabupatens..." />
                <CommandList>
                  <CommandEmpty>No Kabupatens found.</CommandEmpty>
                  <CommandGroup>
                    {isLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : error ? (
                      <div className="p-4 text-red-500 text-sm">Error loading Kabupatens</div>
                    ) : Array.isArray(nops) && nops.length > 0 ? (
                      (nops || []).map((nop) => {
                        return (
                          <CommandItem
                            key={nop.nama_nop}
                            value={nop.nama_nop}
                            onSelect={() => selectItem(nop.nama_nop)}
                            className="flex cursor-pointer"
                          >
                            <span className="flex-1">{nop.nama_nop}</span>
                          </CommandItem>
                        );
                      })
                    ) : (
                      <div className="p-4 text-gray-500 text-sm">No Kabupatens found</div>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
              {tempDataFilter && (
                <div className="flex items-center justify-between border-t p-2">
                  <span className="text-muted-foreground text-xs">1 Kabupaten selected</span>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearSelection}>
                    <X className="mr-1 h-3 w-3" />
                    Clear
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}

        {/* Process Button */}
        <div className="flex items-end justify-end">
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
