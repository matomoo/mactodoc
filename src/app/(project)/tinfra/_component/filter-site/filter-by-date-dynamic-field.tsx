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

// Interface for Kabupaten data
interface NopData {
  nama_nop: string;
  total_sites?: number;
  site_ids?: string[];
}

export function FilterBy_Date_DynamicField({ fieldToSearch }: { fieldToSearch: string }) {
  // Default date range values
  const defaultFrom = subDays(new Date(), 7);
  const defaultTo = subDays(new Date(), 1);
  const defaultRangeString = `${format(defaultFrom, "yyyy-MM-dd")}|${format(defaultTo, "yyyy-MM-dd")}`;

  // Use Zustand store
  const {
    dateRange2: storeDateRange,
    nop: storeNop,
    region: storeRegion,
    kabupaten: storeKabupaten,
    kecamatan: storeKecamatan,
    setDateRange2,
    setNop,
    setRegion,
    setKabupaten,
    setKecamatan,
  } = useFilterStore();

  // Get the correct store value based on fieldToSearch
  const storeFilteredData =
    fieldToSearch === "region"
      ? storeRegion
      : fieldToSearch === "kabupaten"
        ? storeKabupaten
        : fieldToSearch === "kecamatan"
          ? storeKecamatan
          : storeNop;

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
  const [tempDataFilter, setTempDataFilter] = useState<string[] | null>(storeFilteredData ? [storeFilteredData] : null);

  // Track if we're in the process of selecting a range
  const [isSelecting, setIsSelecting] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Fetch NOPs from API
  const {
    data: nops,
    isLoading,
    error,
  } = useQuery<NopData[]>({
    queryKey: ["ref-query-dynamic", fieldToSearch],
    queryFn: async () => {
      const response = await fetch(
        `/tinfra/api/meas-db-ti-sul/aggregate/ref-query-dynamic?fieldToSearch=${fieldToSearch}&nop=---`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Extract unique field names from response
      const rows = data?.rows || [];
      if (!Array.isArray(rows)) {
        return [];
      }
      const uniqueResults = Array.from(new Set(rows.map((item: Record<string, string>) => item[fieldToSearch]))).map(
        (name) => ({
          nama_nop: name as string,
        }),
      );

      return uniqueResults;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // console.log(
  //   "nops data:",
  //   nops,
  //   "type:",
  //   typeof nops,
  //   "isArray:",
  //   Array.isArray(nops),
  // );

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

  // Handler for Kabupaten filter change (temporary state)
  const handleNopFilterChange = (nops: string[] | null) => {
    setTempDataFilter(nops);
  };

  // Toggle Kabupaten selection (temporary state)
  const toggleNop = (nopName: string) => {
    // Handle case where tempDataFilter might be a string (old data) or array
    let currentNops: string[] = [];

    if (Array.isArray(tempDataFilter)) {
      currentNops = tempDataFilter;
    } else if (tempDataFilter && typeof tempDataFilter === "string") {
      // Convert old string format to array
      currentNops = [tempDataFilter];
    }

    if (currentNops.includes(nopName)) {
      // Remove Kabupaten if already selected
      const newNops = currentNops.filter((n) => n !== nopName);
      handleNopFilterChange(newNops.length > 0 ? newNops : null);
    } else {
      // Add Kabupaten if not selected
      handleNopFilterChange([...currentNops, nopName]);
    }
  };

  // Clear all NOPs (temporary state)
  const clearNops = () => {
    handleNopFilterChange(null);
  };

  // Process button handler - apply temporary filters to Zustand store
  const handleProcessFilters = () => {
    if (tempDateRange?.from && tempDateRange?.to) {
      const rangeString = `${format(tempDateRange.from, "yyyy-MM-dd")}|${format(tempDateRange.to, "yyyy-MM-dd")}`;
      setDateRange2(rangeString);
    } else {
      setDateRange2(null);
    }

    if (tempDataFilter && tempDataFilter.length > 0) {
      if (fieldToSearch === "kabupaten") {
        setKabupaten(tempDataFilter.join(","));
      } else if (fieldToSearch === "kecamatan") {
        setKecamatan(tempDataFilter.join(","));
      } else if (fieldToSearch === "region") {
        setRegion(tempDataFilter.join(","));
      } else if (fieldToSearch === "nop") {
        setNop(tempDataFilter.join(","));
      } else {
        setNop(tempDataFilter.join(","));
      }
    } else {
      if (fieldToSearch === "kabupaten") {
        setKabupaten(null);
      } else if (fieldToSearch === "kecamatan") {
        setKecamatan(null);
      } else if (fieldToSearch === "nop") {
        setNop(null);
      } else {
        setNop(null);
      }
    }
  };

  // Check if filters have changed from store values
  const hasChanges =
    tempDateRange?.from?.getTime() !== (storeDateRange ? parseDateRange(storeDateRange)?.from?.getTime() : undefined) ||
    tempDateRange?.to?.getTime() !== (storeDateRange ? parseDateRange(storeDateRange)?.to?.getTime() : undefined) ||
    JSON.stringify(tempDataFilter) !== JSON.stringify(storeFilteredData ? [storeFilteredData] : null);

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
      fieldToSearch === "kabupaten"
        ? storeKabupaten
        : fieldToSearch === "kecamatan"
          ? storeKecamatan
          : fieldToSearch === "region"
            ? storeRegion
            : storeNop;
    if (currentStoreData) {
      const dataArray = currentStoreData.split(",").filter((n) => n.trim() !== "");
      setTempDataFilter(dataArray.length > 0 ? dataArray : null);
    } else {
      setTempDataFilter(null);
    }
  }, [storeKabupaten, storeNop, storeKecamatan, fieldToSearch, storeRegion]);

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

        {/* Multi-Select Filter */}
        <div className="flex flex-col gap-2">
          <div className="font-medium text-sm">
            Filter By{" "}
            {fieldToSearch === "kabupaten"
              ? "Kabupaten"
              : fieldToSearch === "kecamatan"
                ? "Kecamatan"
                : fieldToSearch === "region"
                  ? "Region"
                  : "NOP"}
          </div>
          <div className="flex gap-2">
            {/* Select All Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (Array.isArray(nops) && nops.length > 0) {
                  const allNopNames = (nops || []).map((nop) => nop.nama_nop);
                  handleNopFilterChange(allNopNames);
                }
              }}
              className="text-xs"
            >
              Select All{" "}
              {fieldToSearch === "region"
                ? "Region"
                : fieldToSearch === "kabupaten"
                  ? "Kabupatens"
                  : fieldToSearch === "kecamatan"
                    ? "Kecamatans"
                    : "NOPs"}
            </Button>

            {/* Multi-Select Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-68 justify-start text-left" disabled={isLoading}>
                  {tempDataFilter && Array.isArray(tempDataFilter) && tempDataFilter.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {tempDataFilter.slice(0, 2).map((nop: string) => (
                        <Badge key={nop} variant="secondary" className="text-xs">
                          {nop}
                        </Badge>
                      ))}
                      {tempDataFilter.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{tempDataFilter.length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      {isLoading
                        ? `Loading ${
                            fieldToSearch === "kabupaten"
                              ? "Kabupatens"
                              : fieldToSearch === "kecamatan"
                                ? "Kecamatans"
                                : "NOPs"
                          }...`
                        : `Select ${
                            fieldToSearch === "region"
                              ? "Regions"
                              : fieldToSearch === "kabupaten"
                                ? "Kabupatens"
                                : fieldToSearch === "kecamatan"
                                  ? "Kecamatans"
                                  : "NOPs"
                          }`}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder={`Search ${
                      fieldToSearch === "region"
                        ? "Regions"
                        : fieldToSearch === "kabupaten"
                          ? "Kabupatens"
                          : fieldToSearch === "kecamatan"
                            ? "Kecamatans"
                            : "NOPs"
                    }...`}
                  />
                  <CommandList>
                    <CommandEmpty>
                      No{" "}
                      {fieldToSearch === "region"
                        ? "Regions"
                        : fieldToSearch === "kabupaten"
                          ? "Kabupatens"
                          : fieldToSearch === "kecamatan"
                            ? "Kecamatans"
                            : "NOPs"}{" "}
                      found.
                    </CommandEmpty>
                    <CommandGroup>
                      {isLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span className="text-sm">Loading...</span>
                        </div>
                      ) : error ? (
                        <div className="p-4 text-red-500 text-sm">
                          Error loading{" "}
                          {fieldToSearch === "region"
                            ? "Regions"
                            : fieldToSearch === "kabupaten"
                              ? "Kabupatens"
                              : fieldToSearch === "kecamatan"
                                ? "Kecamatans"
                                : "NOPs"}
                        </div>
                      ) : Array.isArray(nops) && nops.length > 0 ? (
                        (nops || []).map((nop) => {
                          const isSelected =
                            (Array.isArray(tempDataFilter)
                              ? tempDataFilter
                              : tempDataFilter
                                ? [tempDataFilter]
                                : []
                            )?.includes(nop.nama_nop) || false;
                          return (
                            <CommandItem
                              key={nop.nama_nop}
                              value={nop.nama_nop}
                              onSelect={() => toggleNop(nop.nama_nop)}
                              className="flex cursor-pointer gap-2"
                            >
                              <Checkbox checked={isSelected} className="pointer-events-none" />
                              <span className="flex-1">{nop.nama_nop}</span>
                            </CommandItem>
                          );
                        })
                      ) : (
                        <div className="p-4 text-gray-500 text-sm">
                          No{" "}
                          {fieldToSearch === "region"
                            ? "Regions"
                            : fieldToSearch === "kabupaten"
                              ? "Kabupatens"
                              : fieldToSearch === "kecamatan"
                                ? "Kecamatans"
                                : "NOPs"}{" "}
                          found
                        </div>
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
                {tempDataFilter && Array.isArray(tempDataFilter) && tempDataFilter.length > 0 && (
                  <div className="flex items-center justify-between border-t p-2">
                    <span className="text-muted-foreground text-xs">
                      {tempDataFilter.length}{" "}
                      {fieldToSearch === "region"
                        ? "Region"
                        : fieldToSearch === "kabupaten"
                          ? "Kabupaten"
                          : fieldToSearch === "kecamatan"
                            ? "Kecamatan"
                            : "NOP"}
                      {tempDataFilter.length > 1 ? "s" : ""} selected
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearNops}>
                      <X className="mr-1 h-3 w-3" />
                      Clear all
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

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

        {/* Active Filters Summary */}
        {storeFilteredData && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <span>Active filters: </span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">
              {/* {fieldToSearch === "region"
                ? "Region"
                : fieldToSearch === "kabupaten"
                  ? "Kabupaten"
                  : fieldToSearch === "kecamatan"
                    ? "Kecamatan"
                    : "NOP"} */}
              {storeFilteredData.toUpperCase()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => {
                if (fieldToSearch === "region") {
                  setRegion(null);
                } else if (fieldToSearch === "kabupaten") {
                  setKabupaten(null);
                } else if (fieldToSearch === "kecamatan") {
                  setKecamatan(null);
                } else {
                  setNop(null);
                }
              }}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
