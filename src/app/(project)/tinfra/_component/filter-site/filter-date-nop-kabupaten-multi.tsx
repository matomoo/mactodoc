/** biome-ignore-all lint/correctness/noUnusedVariables: <non> */
"use client";
// biome-ignore assist/source/organizeImports: <will fix later>
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { CalendarIcon, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useQuery } from "@tanstack/react-query";
import { useFilterStore } from "@/stores/filterStore";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

// Parse the single date parameter into a Date object
export const parseSingleDate = (dateString: string | null): Date | undefined => {
  if (!dateString) return undefined;

  try {
    const date = parseISO(dateString);

    if (!isValid(date)) {
      console.error("Invalid date parsed:", dateString);
      return undefined;
    }

    return date;
  } catch (e) {
    console.error("Error parsing date:", e);
    return undefined;
  }
};

// Interface for Kabupaten data
interface ReturnData {
  nama_item: string;
  total_sites?: number;
  site_ids?: string[];
}

interface IProps {
  mode?: "breakdown" | "chart";
  fieldToSearch: string;
}

export function Filter_Date_Nop_Kabupaten_Multi({ fieldToSearch }: IProps) {
  const {
    yearweek: storeYearweek,
    nop: storeNop,
    region: storeRegion,
    kabupaten: storeKabupaten,
    kecamatan: storeKecamatan,
    viewBy: storeViewBy,
    setYearweek,
    setNop,
    setRegion,
    setKabupaten,
    setKecamatan,
    dateEnd,
    dateStart,
    setDateEnd,
    setDateStart,
  } = useFilterStore();

  const storeFilteredData =
    fieldToSearch === "region"
      ? storeRegion
      : fieldToSearch === "kabupaten"
        ? storeKabupaten
        : fieldToSearch === "kecamatan"
          ? storeKecamatan
          : storeNop;

  const [tempDataFilter, setTempDataFilter] = useState<string[] | null>(
    storeFilteredData ? storeFilteredData.split(",") : null,
  );

  // Temporary state for dates (updated to store only when Process Filters is clicked)
  const [tempDateStart, setTempDateStart] = useState<string | null>(dateStart ?? null);
  const [tempDateEnd, setTempDateEnd] = useState<string | null>(dateEnd ?? null);

  // Button is disabled when no date or no filter selected
  const isButtonDisabled = !tempDateStart || !tempDateEnd || tempDataFilter === null || tempDataFilter.length === 0;

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
  const { data: weekData } = useQuery({
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

  // Select handlers for each dropdown type
  const selectRegion = (itemName: string) => {
    // Update temp state only - store will be updated when Process Filters is clicked
    setRegion(itemName);
    setTempDataFilter(null);
    setRegionPopoverOpen(false); // Close popover after selection
  };

  const selectNop = (itemName: string) => {
    setNop(itemName);
    setNopPopoverOpen(false); // Close popover after selection
    setKabupaten(null);
    setTempDataFilter(null);
  };

  // Set default week to last available week
  useEffect(() => {
    if (weekList && weekList.length > 0 && !storeYearweek) {
      const lastWeek = weekList[weekList.length - 1].year_week;
      setYearweek(lastWeek);
    }
  }, [weekList, storeYearweek, setYearweek]);

  // Handler for Kabupaten filter change (temporary state)
  const handleNopFilterChange = (nops: string[] | null) => {
    setTempDataFilter(nops);
  };

  const clearTempFilter = () => {
    // Clear temp state
    handleNopFilterChange(null);
    setTempDataFilter(null);

    // Clear store state
    if (fieldToSearch === "region") {
      setRegion(null);
    } else if (fieldToSearch === "kabupaten") {
      setKabupaten(null);
    } else if (fieldToSearch === "kecamatan") {
      setKecamatan(null);
    } else {
      setNop(null);
    }
  };

  const handleProcessFilters = () => {
    // Update dates to store
    setDateStart(tempDateStart);
    setDateEnd(tempDateEnd);

    // Update filter to store
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
        // setNop(tempDataFilter.join(","));
      }
    } else {
      if (fieldToSearch === "kabupaten") {
        setKabupaten(null);
      } else if (fieldToSearch === "kecamatan") {
        setKecamatan(null);
      } else if (fieldToSearch === "region") {
        setRegion(null);
      } else if (fieldToSearch === "nop") {
        setNop(null);
      } else {
        //
      }
    }
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Date Picker Start */}
        <div className="flex flex-row gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-[160px] justify-start text-left font-normal", !tempDateEnd && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {(() => {
                  const parsedDate = parseSingleDate(tempDateStart);
                  return parsedDate ? format(parsedDate, "LLL dd, y") : <span>Pick a date</span>;
                })()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={parseSingleDate(tempDateStart)}
                onSelect={(date) => {
                  if (date) {
                    const dateString = format(date, "yyyy-MM-dd");
                    setTempDateStart(dateString);
                  } else {
                    console.log("No date selected, setting to null");
                    setTempDateStart(null);
                  }
                }}
                defaultMonth={parseSingleDate(tempDateStart) || new Date()}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
          {"•"}
          {/* Date Picker End */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-[160px] justify-start text-left font-normal", !tempDateEnd && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {(() => {
                  const parsedDate = parseSingleDate(tempDateEnd);
                  return parsedDate ? format(parsedDate, "LLL dd, y") : <span>Pick a date</span>;
                })()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={parseSingleDate(tempDateEnd)}
                onSelect={(date) => {
                  if (date) {
                    const dateString = format(date, "yyyy-MM-dd");
                    setTempDateEnd(dateString);
                  } else {
                    console.log("No date selected, setting to null");
                    setTempDateEnd(null);
                  }
                }}
                defaultMonth={parseSingleDate(tempDateEnd) || new Date()}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Single-Select Dropdown Region */}
        {fieldToSearch === "region" && (
          <Popover open={regionPopoverOpen} onOpenChange={setRegionPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-28 justify-start text-left" disabled={isLoadingRegion}>
                {storeRegion ? (
                  <span>{storeRegion}</span>
                ) : tempDataFilter && tempDataFilter.length > 0 ? (
                  <span>{tempDataFilter[0]}</span>
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
        )}

        {/* fieldToSearch === "nop" */}
        {/* Multi-Select Dropdown Nop */}
        {fieldToSearch === "nop" && (
          <Popover>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  "flex w-90 cursor-pointer items-center justify-start rounded-lg border bg-background px-1 py-1 text-sm",
                  isLoadingNop && "cursor-wait opacity-50",
                )}
                tabIndex={0}
                role="combobox"
                aria-expanded={false}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                  }
                }}
              >
                {tempDataFilter && Array.isArray(tempDataFilter) && tempDataFilter.length > 0 ? (
                  <div className="flex flex-1 items-center gap-1">
                    <div className="flex flex-1 flex-wrap gap-1">
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
                    <button
                      type="button"
                      className="flex h-6 shrink-0 cursor-pointer items-center gap-1 rounded px-2 text-muted-foreground text-xs hover:bg-muted hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearTempFilter();
                      }}
                    >
                      <X className="mr-1 h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    {isLoadingNop ? `Loading ${"NOPs"}...` : `Select ${"NOPs"}...`}
                  </span>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <Command>
                <CommandInput placeholder={`Search ${"NOPs"}......`} />
                <CommandList>
                  <CommandEmpty>No {"NOPs"} found.</CommandEmpty>
                  <CommandGroup>
                    {isLoadingNop ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : isErrorNop ? (
                      <div className="p-4 text-red-500 text-sm">Error loading {"NOPs"}</div>
                    ) : Array.isArray(rawNop) && rawNop.length > 0 ? (
                      (rawNop || []).map((item) => {
                        const isSelected =
                          (Array.isArray(tempDataFilter)
                            ? tempDataFilter
                            : tempDataFilter
                              ? [tempDataFilter]
                              : []
                          )?.includes(item.nama_item) || false;
                        return (
                          <CommandItem
                            key={item.nama_item}
                            value={item.nama_item}
                            onSelect={() => toggleNop(item.nama_item)}
                            className="flex cursor-pointer gap-2"
                          >
                            <Checkbox checked={isSelected} className="pointer-events-none" />
                            <span className="flex-1">{item.nama_item}</span>
                          </CommandItem>
                        );
                      })
                    ) : (
                      <div className="p-4 text-gray-500 text-sm">No {"NOPs"} found</div>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
              {tempDataFilter && Array.isArray(tempDataFilter) && tempDataFilter.length > 0 && (
                <div className="flex items-center justify-between border-t p-2">
                  <span className="text-muted-foreground text-xs">
                    {tempDataFilter.length} {"NOP"}
                    {tempDataFilter.length > 1 ? "s" : ""} selected
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearTempFilter}>
                    <X className="mr-1 h-3 w-3" />
                    Clear all
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}

        {/* fieldToSearch === "kabupaten" */}
        {/* Single-Select Dropdown NOP */}
        {fieldToSearch === "kabupaten" && (
          <Popover open={nopPopoverOpen} onOpenChange={setNopPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-30 justify-start text-left" disabled={isLoadingNop}>
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
        {/* Multi-Select Dropdown Kabupaten */}
        {fieldToSearch === "kabupaten" && (
          <Popover>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  "flex w-90 cursor-pointer items-center justify-start rounded-lg border bg-background px-1 py-1 text-sm",
                  isLoadingKabupaten && "cursor-wait opacity-50",
                )}
                tabIndex={0}
                role="combobox"
                aria-expanded={false}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                  }
                }}
              >
                {tempDataFilter && Array.isArray(tempDataFilter) && tempDataFilter.length > 0 ? (
                  <div className="flex flex-1 items-center gap-1">
                    <div className="flex flex-1 flex-wrap gap-1">
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
                    <button
                      type="button"
                      className="flex h-6 shrink-0 cursor-pointer items-center gap-1 rounded px-2 text-muted-foreground text-xs hover:bg-muted hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearTempFilter();
                      }}
                    >
                      <X className="mr-1 h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    {isLoadingKabupaten
                      ? `Loading ${
                          fieldToSearch === "kabupaten"
                            ? "Kabupatens"
                            : fieldToSearch === "kecamatan"
                              ? "Kecamatans"
                              : "NOPs"
                        }...`
                      : `Select ${
                          fieldToSearch === "kabupaten"
                            ? "Kabupaten"
                            : fieldToSearch === "kecamatan"
                              ? "Kecamatans"
                              : "NOPs"
                        }`}
                  </span>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <Command>
                <CommandInput
                  placeholder={`Search ${
                    fieldToSearch === "kabupaten" ? "Kabupaten" : fieldToSearch === "kecamatan" ? "Kecamatans" : "NOPs"
                  }...`}
                />
                <CommandList>
                  <CommandEmpty>
                    No{" "}
                    {fieldToSearch === "kabupaten"
                      ? "Kabupatens"
                      : fieldToSearch === "kecamatan"
                        ? "Kecamatans"
                        : "NOPs"}{" "}
                    found.
                  </CommandEmpty>
                  <CommandGroup>
                    {isLoadingKabupaten ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : isErrorKabupaten ? (
                      <div className="p-4 text-red-500 text-sm">
                        Error loading{" "}
                        {fieldToSearch === "kabupaten"
                          ? "Kabupaten"
                          : fieldToSearch === "kecamatan"
                            ? "Kecamatans"
                            : "NOPs"}
                      </div>
                    ) : Array.isArray(rawKabupaten) && rawKabupaten.length > 0 ? (
                      (rawKabupaten || []).map((item) => {
                        const isSelected =
                          (Array.isArray(tempDataFilter)
                            ? tempDataFilter
                            : tempDataFilter
                              ? [tempDataFilter]
                              : []
                          )?.includes(item.nama_item) || false;
                        return (
                          <CommandItem
                            key={item.nama_item}
                            value={item.nama_item}
                            onSelect={() => toggleNop(item.nama_item)}
                            className="flex cursor-pointer gap-2"
                          >
                            <Checkbox checked={isSelected} className="pointer-events-none" />
                            <span className="flex-1">{item.nama_item}</span>
                          </CommandItem>
                        );
                      })
                    ) : (
                      <div className="p-4 text-gray-500 text-sm">
                        No{" "}
                        {fieldToSearch === "kabupaten"
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
                    {fieldToSearch === "kabupaten" ? "Kabupaten" : fieldToSearch === "kecamatan" ? "Kecamatan" : "NOP"}
                    {tempDataFilter.length > 1 ? "s" : ""} selected
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearTempFilter}>
                    <X className="mr-1 h-3 w-3" />
                    Clear all
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}

        {/* Process Button */}
        <div className="flex items-end justify-end">
          <Button onClick={handleProcessFilters} disabled={isButtonDisabled} className="px-6">
            Process Filters
          </Button>
        </div>

        {/* Active Filters Summary */}
        {(storeFilteredData || (tempDataFilter && tempDataFilter.length > 0)) && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <span>Active filters: </span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">
              {(storeFilteredData || (tempDataFilter?.join(",") ?? "")).toUpperCase()}
            </span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearTempFilter}>
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
