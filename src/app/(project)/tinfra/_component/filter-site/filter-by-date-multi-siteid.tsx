"use client";
// biome-ignore assist/source/organizeImports: <will fix later>
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { format, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFilterStore } from "@/stores/filterStore";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { parseDateRange } from "../../_function/helper";

export function FilterBy_Date_Multi_SiteId() {
  // Default date range values
  const defaultFrom = subDays(new Date(), 7);
  const defaultTo = subDays(new Date(), 1);
  const defaultRangeString = `${format(defaultFrom, "yyyy-MM-dd")}|${format(defaultTo, "yyyy-MM-dd")}`;

  // Use Zustand store
  const { dateRange2, siteId, setDateRange2, setSiteId } = useFilterStore();

  // State for badge items and input
  const [siteIdInput, setSiteIdInput] = useState("");
  const [siteIdBadges, setSiteIdBadges] = useState<string[]>([]);

  // Temporary state for filters (not yet applied to store)
  const [tempSiteIdBadges, setTempSiteIdBadges] = useState<string[]>([]);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>();

  // Parse the date range parameter into a DateRange object

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

  // Ensure Zustand store is updated with default date range on first load
  useEffect(() => {
    if (isFirstLoad) {
      // If dateRange2 is not set in store, set it with default value
      if (!dateRange2) {
        setDateRange2(defaultRangeString);
        console.log("Setting default date range in store:", defaultRangeString);
      }

      setIsFirstLoad(false);
    }
  }, [isFirstLoad, dateRange2, setDateRange2, defaultRangeString]);

  // Initialize siteIdBadges from store on first load
  useEffect(() => {
    if (siteId) {
      // Parse existing siteId from store (could be comma-separated)
      const existingSiteIds = siteId
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0);
      setSiteIdBadges(existingSiteIds);
      setTempSiteIdBadges(existingSiteIds);
    }
  }, [siteId]);

  // Check if filters have changed from store values
  const hasChanges =
    tempDateRange?.from !== dateRange?.from ||
    tempDateRange?.to !== dateRange?.to ||
    tempSiteIdBadges.length !== siteIdBadges.length ||
    !tempSiteIdBadges.every((id) => siteIdBadges.includes(id));

  // Handler to process and apply filters to store
  const handleProcessFilters = () => {
    if (tempDateRange?.from && tempDateRange?.to) {
      const rangeString = `${format(tempDateRange.from, "yyyy-MM-dd")}|${format(tempDateRange.to, "yyyy-MM-dd")}`;
      setDateRange2(rangeString);
      setDateRange(tempDateRange);
    }

    setSiteIdBadges(tempSiteIdBadges);
    if (tempSiteIdBadges.length > 0) {
      const siteIdString = tempSiteIdBadges.join(",");
      setSiteId(siteIdString);
    } else {
      setSiteId(null);
    }
  };

  // Update store when siteIdBadges changes
  useEffect(() => {
    if (siteIdBadges.length > 0) {
      const siteIdString = siteIdBadges.join(",");
      setSiteId(siteIdString);
    } else {
      setSiteId(null);
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

  // Function to process and extract Site IDs from pasted content (temporary state)
  const processSiteIds = (input: string) => {
    // Split by common delimiters: new lines, tabs, commas, spaces
    const siteIds = input
      .split(/[\n\t, ]+/)
      .map((id) => id.trim())
      .filter((id) => id.length > 0); // Remove empty strings

    if (siteIds.length > 0) {
      setTempSiteIdBadges((prev) => {
        // Combine existing with new, remove duplicates
        const combined = [...prev, ...siteIds];
        return Array.from(new Set(combined));
      });
      setSiteIdInput(""); // Clear input after processing
    }
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
        setTempSiteIdBadges((prev) => {
          const combined = [...prev, ...newIds];
          return Array.from(new Set(combined));
        });
        setSiteIdInput("");
      }
    }
  };

  // Function to remove a Site ID badge (temporary state)
  const removeSiteId = (siteIdToRemove: string) => {
    setTempSiteIdBadges((prev) => prev.filter((id) => id !== siteIdToRemove));
  };

  // Function to clear all Site ID badges (temporary state)
  const clearAllSiteIds = () => {
    setTempSiteIdBadges([]);
    setSiteIdInput("");
  };

  // Handle Enter key press in input
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

  // Handler to update dateRange state and Zustand store (temporary state)
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

  // Update dateRange if Zustand store changes externally
  useEffect(() => {
    if (dateRange2) {
      const parsedRange = parseDateRange(dateRange2);
      if (parsedRange) {
        setDateRange(parsedRange);
        setTempDateRange(parsedRange);
      }
    } else {
      setDateRange(undefined);
      setTempDateRange(undefined);
    }
  }, [dateRange2]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex flex-col gap-2">
          <div className="font-medium text-sm">Date Range</div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-70 justify-start text-left font-normal", !tempDateRange && "text-muted-foreground")}
              >
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
                <CalendarIcon className="ml-auto h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={tempDateRange?.from}
                selected={tempDateRange}
                onSelect={handleDateRangeChange}
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

        <div className="flex flex-col gap-2">
          <div className="font-medium text-sm">Site IDs</div>
          <div className="space-y-2">
            {/* Input */}
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

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="font-medium text-sm">Selected Site IDs</div>
          {tempSiteIdBadges.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllSiteIds}
              className="h-6 px-2 text-muted-foreground text-xs hover:text-destructive"
            >
              Clear All
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {/* Badges Display */}
          {tempSiteIdBadges.length > 0 && (
            <div className="flex min-h-10 max-w-full flex-wrap gap-1 rounded-md border bg-gray-50 p-2">
              {tempSiteIdBadges.length <= 10 ? (
                tempSiteIdBadges.map((siteIdItem) => (
                  <Badge
                    key={siteIdItem}
                    variant="secondary"
                    className="flex items-center gap-1 py-1 pr-1 pl-2 text-xs"
                  >
                    {siteIdItem}
                    <button
                      type="button"
                      onClick={() => removeSiteId(siteIdItem)}
                      className="ml-0.5 rounded-full p-0.5 hover:text-destructive focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <>
                  {tempSiteIdBadges.slice(0, 2).map((siteIdItem) => (
                    <Badge
                      key={siteIdItem}
                      variant="secondary"
                      className="flex items-center gap-1 py-1 pr-1 pl-2 text-xs"
                    >
                      {siteIdItem}
                      <button
                        type="button"
                        onClick={() => removeSiteId(siteIdItem)}
                        className="ml-0.5 rounded-full p-0.5 hover:text-destructive focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <Badge variant="secondary" className="flex items-center gap-1 py-1 pr-1 pl-2 text-xs">
                    +{tempSiteIdBadges.length - 2}
                  </Badge>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
