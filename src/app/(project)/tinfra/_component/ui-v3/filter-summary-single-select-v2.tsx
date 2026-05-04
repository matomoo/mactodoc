"use client";
// biome-ignore assist/source/organizeImports: <will fix later>
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { format, subDays } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { useSummaryStore } from "@/stores/summaryStore";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parseSingleDate } from "./filter-summary-single-select-v4";

// Interface for Kabupaten data
interface ReturnData {
  nama_item: string;
  total_sites?: number;
  site_ids?: string[];
}

// Interface for week data
interface WeekData {
  year_week: string;
  [key: string]: string | number;
}

export function Filter_Summary() {
  // API to fetch productivity latest date data
  const { data: dataProductivityLatestDate, isLoading: _isLoadingProductivityLatestDate } = useQuery({
    queryKey: ["ref-productivity-latest-date"],
    queryFn: async () => {
      const response = await fetch(`/tinfra/api/v2/summary/ref-productivity-latest-date`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Extract the actual data from the response
  const productivityLatestDateList = dataProductivityLatestDate || [];

  // Default date range values
  const latestDate = productivityLatestDateList[0]?.Date
    ? new Date(productivityLatestDateList[0].Date)
    : subDays(new Date(), 1);
  const defaultFrom = subDays(latestDate, 6);
  const defaultTo = latestDate;
  const defaultRangeString = `${format(defaultFrom, "yyyy-MM-dd")}|${format(defaultTo, "yyyy-MM-dd")}`;
  const defaultDateEndString = `${format(defaultTo, "yyyy-MM-dd")}`;

  // Use Zustand store
  const {
    yearweek: storeYearweek,
    nop: storeNop,
    region: storeRegion,
    kabupaten: storeKabupaten,
    viewBy: storeViewBy,
    setYearweek,
    setNop,
    setRegion,
    setKabupaten,
    setViewBy,
    dateEnd,
    setDateEnd,
  } = useSummaryStore();

  // Track popover open states
  const [regionPopoverOpen, setRegionPopoverOpen] = useState(false);
  const [nopPopoverOpen, setNopPopoverOpen] = useState(false);
  const [kabupatenPopoverOpen, setKabupatenPopoverOpen] = useState(false);

  // Fetch Region from API
  const {
    data: rawRegion,
    isLoading: isLoadingRegion,
    error: errorRegion,
  } = useQuery<ReturnData[]>({
    queryKey: ["ref-query-dynamic", "region"],
    queryFn: async () => {
      const response = await fetch(`/tinfra/api/meas-db-ti-sul/aggregate/ref-query-dynamic?fieldToSearch=region`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Extract unique field names from response
      const rows = data?.rows || [];
      if (!Array.isArray(rows)) {
        return [];
      }
      const uniqueResults = Array.from(
        new Set(rows.map((item: Record<string, string>) => item["region" as keyof Record<string, string>])),
      ).map((name) => ({
        nama_item: name as string,
      }));

      return uniqueResults;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch Nop from API
  const {
    data: rawNop,
    isLoading: isLoadingNop,
    error: isErrorNop,
  } = useQuery<ReturnData[]>({
    queryKey: ["ref-query-dynamic", "nop"],
    queryFn: async () => {
      const response = await fetch(`/tinfra/api/meas-db-ti-sul/aggregate/ref-query-dynamic?fieldToSearch=nop`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Extract unique field names from response
      const rows = data?.rows || [];
      if (!Array.isArray(rows)) {
        return [];
      }
      const uniqueResults = Array.from(
        new Set(rows.map((item: Record<string, string>) => item["nop" as keyof Record<string, string>])),
      ).map((name) => ({
        nama_item: name as string,
      }));

      return uniqueResults;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch Kabupaten from API
  const {
    data: rawKabupaten,
    isLoading: isLoadingKabupaten,
    error: isErrorKabupaten,
  } = useQuery<ReturnData[]>({
    queryKey: ["ref-query-dynamic", storeNop, "kabupaten"],
    queryFn: async () => {
      const response = await fetch(
        `/tinfra/api/meas-db-ti-sul/aggregate/ref-query-dynamic?fieldToSearch=kabupaten&nop=${storeNop}`,
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
      const uniqueResults = Array.from(
        new Set(rows.map((item: Record<string, string>) => item["kabupaten" as keyof Record<string, string>])),
      ).map((name) => ({
        nama_item: name as string,
      }));

      return uniqueResults;
    },
    enabled: !!storeNop,
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

  // Extract the actual data from the response
  const weekList = weekData?.rows || weekData || [];

  useEffect(() => {
    if (productivityLatestDateList.length !== 0) {
      setDateEnd(defaultDateEndString);
    }
  }, [setDateEnd, defaultDateEndString, productivityLatestDateList]);

  // Select handlers for each dropdown type
  const selectRegion = (itemName: string) => {
    setRegion(itemName);
    setRegionPopoverOpen(false); // Close popover after selection
  };

  const selectNop = (itemName: string) => {
    setNop(itemName);
    setNopPopoverOpen(false); // Close popover after selection
    setKabupaten(null);
  };

  const selectKabupaten = (itemName: string) => {
    setKabupaten(itemName);
    setKabupatenPopoverOpen(false); // Close popover after selection
  };

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
            <SelectTrigger className="w-24">
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

        {/* Date Picker */}
        <div className="flex flex-col gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-[180px] justify-start text-left font-normal", !dateEnd && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {(() => {
                  const parsedDate = parseSingleDate(dateEnd);
                  return parsedDate ? format(parsedDate, "LLL dd, y") : <span>Pick a date</span>;
                })()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={parseSingleDate(dateEnd)}
                onSelect={(date) => {
                  if (date) {
                    const dateString = format(date, "yyyy-MM-dd");
                    setDateEnd(dateString);
                  } else {
                    console.log("No date selected, setting to null");
                    setDateEnd(null);
                  }
                }}
                defaultMonth={parseSingleDate(dateEnd) || new Date()}
                numberOfMonths={1}
                disabled={{
                  after: new Date(productivityLatestDateList[0]?.Date || ""),
                }}
                modifiers={{
                  disabled: (date) => {
                    const latestDate = new Date(productivityLatestDateList[0]?.Date || "");
                    const isDisabled = date ? date > latestDate : false;
                    return isDisabled;
                  },
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Select ViewBy */}
        <div className="flex flex-col gap-2">
          <Select value={storeViewBy || ""} onValueChange={setViewBy}>
            <SelectTrigger className="w-32">
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
        <Popover open={regionPopoverOpen} onOpenChange={setRegionPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-28 justify-start text-left" disabled={isLoadingRegion}>
              {storeRegion ? (
                <span>{storeRegion}</span>
              ) : (
                <span className="text-muted-foreground">
                  {isLoadingRegion ? "Loading Regions..." : "Select Region"}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-28 p-0" align="start">
            <Command>
              <CommandList>
                <CommandEmpty>No Regions found.</CommandEmpty>
                <CommandGroup>
                  {isLoadingRegion ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  ) : errorRegion ? (
                    <div className="p-4 text-red-500 text-sm">Error loading Regions</div>
                  ) : Array.isArray(rawRegion) && rawRegion.length > 0 ? (
                    (rawRegion || []).map((select) => {
                      return (
                        <CommandItem
                          key={select.nama_item}
                          value={select.nama_item}
                          onSelect={() => selectRegion(select.nama_item)}
                          className="flex cursor-pointer"
                        >
                          <span className="flex-1">{select.nama_item}</span>
                        </CommandItem>
                      );
                    })
                  ) : (
                    <div className="p-4 text-gray-500 text-sm">No Regions found</div>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Single-Select Dropdown NOP */}
        {(storeViewBy === "nop" || storeViewBy === "kabupaten") && (
          <Popover open={nopPopoverOpen} onOpenChange={setNopPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-36 justify-start text-left" disabled={isLoadingNop}>
                {storeNop ? (
                  <span>{storeNop}</span>
                ) : (
                  <span className="text-muted-foreground">{isLoadingNop ? "Loading NOPs..." : "Select NOP"}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-36 p-0" align="start">
              <Command>
                <CommandList>
                  <CommandEmpty>No NOPs found.</CommandEmpty>
                  <CommandGroup>
                    {isLoadingNop ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : isErrorNop ? (
                      <div className="p-4 text-red-500 text-sm">Error loading NOPs</div>
                    ) : Array.isArray(rawNop) && rawNop.length > 0 ? (
                      (rawNop || []).map((nop) => {
                        return (
                          <CommandItem
                            key={nop.nama_item}
                            value={nop.nama_item}
                            onSelect={() => selectNop(nop.nama_item)}
                            className="flex cursor-pointer"
                          >
                            <span className="flex-1">{nop.nama_item}</span>
                          </CommandItem>
                        );
                      })
                    ) : (
                      <div className="p-4 text-gray-500 text-sm">No NOPs found</div>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}

        {/* Single-Select Dropdown Kabupaten */}
        {storeViewBy === "kabupaten" && (
          <Popover open={kabupatenPopoverOpen} onOpenChange={setKabupatenPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-68 justify-start text-left" disabled={isLoadingKabupaten}>
                {storeKabupaten ? (
                  <span>{storeKabupaten}</span>
                ) : (
                  <span className="text-muted-foreground">
                    {isLoadingKabupaten ? "Loading Kabupatens..." : "Select Kabupaten"}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <Command>
                <CommandList>
                  <CommandEmpty>No Kabupatens found.</CommandEmpty>
                  <CommandGroup>
                    {isLoadingKabupaten ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : isErrorKabupaten ? (
                      <div className="p-4 text-red-500 text-sm">Error loading Kabupatens</div>
                    ) : Array.isArray(rawKabupaten) && rawKabupaten.length > 0 ? (
                      (rawKabupaten || []).map((select) => {
                        return (
                          <CommandItem
                            key={select.nama_item}
                            value={select.nama_item}
                            onSelect={() => selectKabupaten(select.nama_item)}
                            className="flex cursor-pointer"
                          >
                            <span className="flex-1">{select.nama_item}</span>
                          </CommandItem>
                        );
                      })
                    ) : (
                      <div className="p-4 text-gray-500 text-sm">No Kabupatens found</div>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
