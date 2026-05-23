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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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
  fieldToSearch1: string;
  fieldToSearch2?: string;
}

export function Filter_Date_Nop_Kabupaten_Kecamatan_Site_Single({ fieldToSearch1, fieldToSearch2 }: IProps) {
  const {
    nop: storeNop,
    region: storeRegion,
    kabupaten: storeKabupaten,
    kecamatan: storeKecamatan,
    viewBy: storeViewBy,
    siteId,
    setSiteId,
    setNop,
    setRegion,
    setKabupaten,
    setKecamatan,
    setViewBy,
    dateEnd,
    setDateEnd,
    dateStart,
    setDateStart,
  } = useFilterStore();

  const storeFilteredData =
    fieldToSearch1 === "region"
      ? storeRegion
      : fieldToSearch1 === "kabupaten"
        ? storeKabupaten
        : fieldToSearch1 === "kecamatan"
          ? storeKecamatan
          : fieldToSearch1 === "nop"
            ? storeNop
            : fieldToSearch1 === "siteid"
              ? siteId
              : "--";

  const [tempDataFilter, setTempDataFilter] = useState<string[] | null>(
    storeFilteredData ? storeFilteredData.split(",") : null,
  );
  const [siteIdInput, setSiteIdInput] = useState("");
  const [tempSiteIdBadges, setTempSiteIdBadges] = useState<string[]>([]);
  const [siteIdBadges, setSiteIdBadges] = useState<string[]>([]);

  const isButtonDisabled = !dateStart || !dateEnd || tempDataFilter === null || tempDataFilter.length === 0;

  // Track popover open states
  const [regionPopoverOpen, setRegionPopoverOpen] = useState(false);
  const [nopPopoverOpen, setNopPopoverOpen] = useState(false);
  const [kabupatenPopoverOpen, setKabupatenPopoverOpen] = useState(false);
  const [isSitesExpanded, setIsSitesExpanded] = useState(false);

  const {
    data: rawNop,
    isLoading: isLoadingNop,
    error: isErrorNop,
  } = useQuery<ReturnData[]>({
    queryKey: ["ref-query-dynamic", storeNop, fieldToSearch1, "nop"],
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

  const { data: rawSites, isLoading: isLoadingSites } = useQuery<ReturnData[]>({
    queryKey: [
      "ref-query-dynamic-site",
      storeNop,
      storeKabupaten,
      fieldToSearch1,
      fieldToSearch2,
      storeFilteredData,
      "site",
    ],
    queryFn: async () => {
      // Use storeNop as the filter for sites
      const nopFilter = storeNop;

      const response = await fetch(
        `/tinfra/api/meas-db-ti-sul/aggregate/ref-query-dynamic-site?fieldToSearch1=siteid&fieldToSearch2=kabupaten&kabupaten=${storeKabupaten}&nop=${nopFilter}&storeFilteredData=${storeFilteredData}`,
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
        new Set(rows.map((item: Record<string, string>) => item["siteid" as keyof Record<string, string>])),
      ).map((name) => ({
        nama_item: name as string,
      }));

      return uniqueResults;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Select handlers for each dropdown type

  const selectNop = (itemName: string) => {
    setNop(itemName);
    setNopPopoverOpen(false); // Close popover after selection
    setKabupaten(null);
    setTempDataFilter(null);
    setSiteId(null);
  };

  const selectViewBy = (viewBy: string) => {
    setViewBy(viewBy);
    // Clear all filters when viewBy changes
    setKabupaten(null);
    setTempDataFilter(null);
    setSiteId(null);
  };

  const selectKabupaten = (itemName: string) => {
    setKabupaten(itemName);
    setKabupatenPopoverOpen(false); // Close popover after selection
    setTempDataFilter(null);
    setSiteId(null);
  };

  // Auto-populate tempDataFilter with all sites from rawSites when rawSites changes
  useEffect(() => {
    if (storeViewBy === "kabupaten" && storeKabupaten && rawSites && rawSites.length > 0) {
      const allSiteIds = rawSites.map((site) => site.nama_item);
      setTempDataFilter(allSiteIds);
    }
  }, [rawSites, storeViewBy, storeKabupaten]);

  // Handler for filter change (temporary state) - handles both NOP and Site selection
  const handleFilterChange = (values: string[] | null) => {
    setTempDataFilter(values);
    // Sync siteIdBadges when in site view
    if (storeViewBy === "site") {
      setSiteIdBadges(values || []);
    } else {
      setSiteId(null);
    }
  };

  const handleProcessFilters = () => {
    // When in site view, always use siteIdBadges directly
    if (storeViewBy === "site") {
      if (siteIdBadges.length > 0) {
        const siteIdString = siteIdBadges.join(",");
        setSiteId(siteIdString);
        setTempDataFilter(siteIdBadges);
      } else {
        setSiteId(null);
        setTempDataFilter(null);
      }
      return;
    }

    // Non-site view logic
    if (tempDataFilter && tempDataFilter.length > 0) {
      if (fieldToSearch1 === "kabupaten") {
        setKabupaten(tempDataFilter.join(","));
      } else if (fieldToSearch1 === "kecamatan") {
        setKecamatan(tempDataFilter.join(","));
      } else if (fieldToSearch1 === "region") {
        setRegion(tempDataFilter.join(","));
      } else if (fieldToSearch1 === "nop") {
        setNop(tempDataFilter.join(","));
      } else if (fieldToSearch1 === "siteid") {
        setSiteId(tempDataFilter.join(","));
      } else {
        //
      }
    } else {
      if (fieldToSearch1 === "kabupaten") {
        setKabupaten(null);
      } else if (fieldToSearch1 === "kecamatan") {
        setKecamatan(null);
      } else if (fieldToSearch1 === "nop") {
        setNop(null);
      } else if (fieldToSearch1 === "siteid") {
        setSiteId(null);
      } else {
        //
      }
    }
  };

  const processSiteIds = (input: string) => {
    // Split by common delimiters: new lines, tabs, commas, spaces
    const siteIds = input
      .split(/[\n\t, ]+/)
      .map((id) => id.trim())
      .filter((id) => id.length > 0); // Remove empty strings

    if (siteIds.length > 0) {
      setSiteIdBadges((prev) => {
        // Combine existing with new, remove duplicates
        const combined = [...prev, ...siteIds];
        return Array.from(new Set(combined));
      });
      setSiteIdInput(""); // Clear input after processing
    }
  };

  useEffect(() => {
    if (siteIdBadges.length > 0) {
      const siteIdString = siteIdBadges.join(",");
      setSiteId(siteIdString);
      setTempDataFilter(siteIdBadges);
    } else {
      setSiteId(null);
      setTempDataFilter(null);
    }
  }, [siteIdBadges, setSiteId]);

  // Function to handle input changes and process pasted content (temporary state)
  const handleSiteIdInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSiteIdInput(value);

    // If there are line breaks or tabs (typical from Excel), process them
    if (value.includes("\n") || value.includes("\t") || value.includes(",")) {
      processSiteIds(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSiteId();
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    handleAddSiteId();
  };

  // Function to handle manual addition (Enter key or blur) (temporary state)
  const handleAddSiteId = () => {
    if (siteIdInput.trim()) {
      const newIds = siteIdInput
        .trim()
        .split(/[\n\t, ]+/)
        .map((id) => id.trim())
        .filter((id) => id.length > 0);
      if (newIds.length > 0) {
        setSiteIdBadges((prev) => {
          const combined = [...prev, ...newIds];
          return Array.from(new Set(combined));
        });
        setSiteIdInput("");
      }
    }
  };

  console.log({ tempDataFilter });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Date Picker Start */}
        <div className="flex flex-row gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-[160px] justify-start text-left font-normal", !dateEnd && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {(() => {
                  const parsedDate = parseSingleDate(dateStart);
                  return parsedDate ? format(parsedDate, "LLL dd, y") : <span>Pick a date</span>;
                })()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={parseSingleDate(dateStart)}
                onSelect={(date) => {
                  if (date) {
                    const dateString = format(date, "yyyy-MM-dd");
                    setDateStart(dateString);
                  } else {
                    console.log("No date selected, setting to null");
                    setDateStart(null);
                  }
                }}
                defaultMonth={parseSingleDate(dateStart) || new Date()}
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
                className={cn("w-[160px] justify-start text-left font-normal", !dateEnd && "text-muted-foreground")}
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
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Select ViewBy */}
        <div className="flex flex-col gap-2">
          <Select value={storeViewBy || ""} onValueChange={selectViewBy}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select View By" />
            </SelectTrigger>
            <SelectContent>
              {/* <SelectItem value="nop">NOP</SelectItem> */}
              <SelectItem value="kabupaten">Kabupaten</SelectItem>
              {/* <SelectItem value="kecamatan">Kecamatan</SelectItem> */}
              <SelectItem defaultChecked={true} value="site">
                Site
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Single-Select Dropdown NOP */}
        {(storeViewBy === "nop" || storeViewBy === "kabupaten") && (
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

        {storeViewBy === "site" && (
          <div className="flex flex-col gap-2">
            <div className="space-y-2">
              <Input
                type="search"
                placeholder="Paste multiple Site IDs"
                value={siteIdInput}
                onChange={handleSiteIdInputChange}
                onKeyDown={handleKeyDown}
                onBlur={handleInputBlur}
                className="w-70"
              />
            </div>
          </div>
        )}

        {/* Process Button */}
        <div className="flex items-end justify-end">
          <Button onClick={handleProcessFilters} disabled={isButtonDisabled} className="px-6">
            Process Filters
          </Button>
        </div>

        {/* Active Filters Summary */}
        {tempDataFilter && tempDataFilter.length > 0 && (
          <div className="flex w-full flex-col items-start gap-2 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <span>
                {isLoadingSites ? (
                  <>
                    <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />
                    Loading sites...
                  </>
                ) : (
                  <>Selected sites: {tempDataFilter.length}</>
                )}
              </span>
              {tempDataFilter.length > 10 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setIsSitesExpanded(!isSitesExpanded)}
                >
                  {isSitesExpanded ? "Collapse" : "Expand"}
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => handleFilterChange(null)}>
                Clear all
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {(isSitesExpanded || tempDataFilter.length <= 10 ? tempDataFilter : tempDataFilter.slice(0, 10)).map(
                (siteId: string) => (
                  <Badge key={siteId} variant="secondary" className="flex items-center gap-1 pr-1 text-xs">
                    {siteId}
                    <button
                      type="button"
                      className="ml-1 rounded hover:bg-muted-foreground/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newFilter = tempDataFilter.filter((s) => s !== siteId);
                        handleFilterChange(newFilter.length > 0 ? newFilter : null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ),
              )}
              {!isSitesExpanded && tempDataFilter.length > 10 && (
                <Badge variant="secondary" className="flex items-center gap-1 pr-1 text-xs">
                  +{tempDataFilter.length - 10} more...
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
