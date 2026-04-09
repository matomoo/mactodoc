"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WeekRangeSelectProps {
  initialWeekRange?: [number, number];
  onWeekRangeChange: (weekRange: [number, number]) => void;
  minWeek?: number;
  maxWeek?: number;
  availableWeeks?: number[];
}

export function WeekRangeSelect({
  initialWeekRange = [202601, 202652],
  onWeekRangeChange,
  minWeek = 202501,
  maxWeek = 202653,
  availableWeeks,
}: WeekRangeSelectProps) {
  const [startWeek, setStartWeek] = useState<number>(initialWeekRange[0]);
  const [endWeek, setEndWeek] = useState<number>(initialWeekRange[1]);

  // Sync with initialWeekRange when it changes (e.g., after cookies cleared)
  useEffect(() => {
    console.log(
      "WeekRangeSelect - initialWeekRange changed:",
      initialWeekRange,
    );
    setStartWeek(initialWeekRange[0]);
    setEndWeek(initialWeekRange[1]);
  }, [initialWeekRange]);

  // Generate week options if not provided
  const weekOptions = useMemo(() => {
    let options: number[] = [];

    if (availableWeeks) {
      // Remove duplicates from availableWeeks
      options = [...new Set(availableWeeks)].sort((a, b) => a - b);
    } else {
      // Generate range and ensure uniqueness
      const uniqueOptions = new Set<number>();
      for (let week = minWeek; week <= maxWeek; week++) {
        const year = Math.floor(week / 100);
        const weekNum = week % 100;
        if (weekNum >= 1 && weekNum <= 53) {
          uniqueOptions.add(week);
        }
      }
      options = Array.from(uniqueOptions).sort((a, b) => a - b);
    }

    return options;
  }, [availableWeeks, minWeek, maxWeek]);

  // Debug logging for state
  useEffect(() => {
    console.log("WeekRangeSelect - state updated:", {
      startWeek,
      endWeek,
      weekOptions: weekOptions.slice(0, 5), // Show first 5 options
      totalOptions: weekOptions.length,
    });
  }, [startWeek, endWeek, weekOptions]);

  // Format week for display
  const formatWeekDisplay = (week: number) => {
    const year = Math.floor(week / 100);
    const weekNum = week % 100;
    return `${year}-W${weekNum.toString().padStart(2, "0")}`;
  };

  // Handle week changes
  const handleStartWeekChange = (value: string) => {
    const newStartWeek = parseInt(value);
    console.log(
      `Start week changed from ${formatWeekDisplay(startWeek)} to ${formatWeekDisplay(newStartWeek)}`,
    );
    setStartWeek(newStartWeek);

    // Ensure end week is not before start week
    if (newStartWeek > endWeek) {
      setEndWeek(newStartWeek);
      onWeekRangeChange([newStartWeek, newStartWeek]);
      console.log(
        `End week auto-adjusted to ${formatWeekDisplay(newStartWeek)} to maintain valid range`,
      );
    } else {
      onWeekRangeChange([newStartWeek, endWeek]);
      console.log(
        `Range updated: ${formatWeekDisplay(newStartWeek)} - ${formatWeekDisplay(endWeek)}`,
      );
    }
  };

  const handleEndWeekChange = (value: string) => {
    const newEndWeek = parseInt(value);
    console.log(
      `End week changed from ${formatWeekDisplay(endWeek)} to ${formatWeekDisplay(newEndWeek)}`,
    );
    setEndWeek(newEndWeek);

    // Ensure start week is not after end week
    if (newEndWeek < startWeek) {
      setStartWeek(newEndWeek);
      onWeekRangeChange([newEndWeek, newEndWeek]);
      console.log(
        `Start week auto-adjusted to ${formatWeekDisplay(newEndWeek)} to maintain valid range`,
      );
    } else {
      onWeekRangeChange([startWeek, newEndWeek]);
      console.log(
        `Range updated: ${formatWeekDisplay(startWeek)} - ${formatWeekDisplay(newEndWeek)}`,
      );
    }
  };

  // Filter end week options based on start week
  const endWeekOptions = weekOptions.filter((week) => week >= startWeek);

  console.log("startWeek", startWeek);
  console.log("weekOptions", weekOptions);
  console.log("endWeekOptions", endWeekOptions);

  return (
    <div className="week-range-select space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Week Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">From Week</label>
          <Select
            value={startWeek.toString()}
            onValueChange={handleStartWeekChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select start week" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {weekOptions.map((week, index) => (
                <SelectItem key={`week-${index}`} value={week.toString()}>
                  {formatWeekDisplay(week)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* End Week Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">To Week</label>
          <Select
            value={endWeek.toString()}
            onValueChange={handleEndWeekChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select end week" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {endWeekOptions.map((week, index) => (
                <SelectItem key={`end-week-${index}`} value={week.toString()}>
                  {formatWeekDisplay(week)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selected Range Display */}
      {/* <div className="p-3 bg-gray-50 rounded border">
        <div className="text-sm font-medium text-gray-700">Selected Range:</div>
        <div className="text-sm text-gray-600">
          {formatWeekDisplay(startWeek)} - {formatWeekDisplay(endWeek)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {endWeek - startWeek + 1} weeks selected
        </div>
      </div> */}
    </div>
  );
}
