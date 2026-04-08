"use client";

import { useState, useMemo } from "react";
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

  // Generate week options if not provided
  const weekOptions = useMemo(() => {
    if (availableWeeks) {
      return availableWeeks.sort((a, b) => a - b);
    }

    const options: number[] = [];
    for (let week = minWeek; week <= maxWeek; week++) {
      const year = Math.floor(week / 100);
      const weekNum = week % 100;
      if (weekNum >= 1 && weekNum <= 53) {
        options.push(week);
      }
    }
    return options;
  }, [availableWeeks, minWeek, maxWeek]);

  // Format week for display
  const formatWeekDisplay = (week: number) => {
    const year = Math.floor(week / 100);
    const weekNum = week % 100;
    return `${year}-W${weekNum.toString().padStart(2, "0")}`;
  };

  // Handle week changes
  const handleStartWeekChange = (value: string) => {
    const newStartWeek = parseInt(value);
    setStartWeek(newStartWeek);

    // Ensure end week is not before start week
    if (newStartWeek > endWeek) {
      setEndWeek(newStartWeek);
      onWeekRangeChange([newStartWeek, newStartWeek]);
    } else {
      onWeekRangeChange([newStartWeek, endWeek]);
    }
  };

  const handleEndWeekChange = (value: string) => {
    const newEndWeek = parseInt(value);
    setEndWeek(newEndWeek);

    // Ensure start week is not after end week
    if (newEndWeek < startWeek) {
      setStartWeek(newEndWeek);
      onWeekRangeChange([newEndWeek, newEndWeek]);
    } else {
      onWeekRangeChange([startWeek, newEndWeek]);
    }
  };

  // Filter end week options based on start week
  const endWeekOptions = weekOptions.filter((week) => week >= startWeek);

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
      <div className="p-3 bg-gray-50 rounded border">
        <div className="text-sm font-medium text-gray-700">Selected Range:</div>
        <div className="text-sm text-gray-600">
          {formatWeekDisplay(startWeek)} - {formatWeekDisplay(endWeek)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {endWeek - startWeek + 1} weeks selected
        </div>
      </div>
    </div>
  );
}
