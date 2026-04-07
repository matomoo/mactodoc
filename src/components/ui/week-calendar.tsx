"use client";

import {
  format,
  getWeek,
  startOfWeek,
  addDays,
  isSameDay,
  isWithinInterval,
} from "date-fns";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WeekCalendarProps {
  initialWeekRange?: [number, number];
  onWeekRangeChange: (weekRange: [number, number]) => void;
  minWeek?: number;
  maxWeek?: number;
}

export function WeekCalendar({
  initialWeekRange = [202601, 202652],
  onWeekRangeChange,
  minWeek = 202501,
  maxWeek = 202653,
}: WeekCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)); // Start with Jan 2026
  const [selectedWeekRange, setSelectedWeekRange] =
    useState<[number, number]>(initialWeekRange);
  const [isSelecting, setIsSelecting] = useState(false);
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);

  // Convert week number to date range (Friday-Thursday)
  const weekToDateRange = (week: number) => {
    const year = Math.floor(week / 100);
    const weekNum = week % 100;

    // Find first Friday of the year
    const jan1 = new Date(year, 0, 1);
    const firstFriday = startOfWeek(jan1, { weekStartsOn: 5 }); // 5 = Friday
    if (firstFriday.getFullYear() !== year) {
      firstFriday.setDate(firstFriday.getDate() + 7);
    }

    // Add weeks to get the target Friday
    const targetFriday = addDays(firstFriday, (weekNum - 1) * 7);
    const targetThursday = addDays(targetFriday, 6); // Friday to Thursday

    return { start: targetFriday, end: targetThursday };
  };

  // Convert date to week number (Friday-Thursday)
  const dateToWeek = (date: Date) => {
    const friday = startOfWeek(date, { weekStartsOn: 5 });
    const year = friday.getFullYear();
    const week = getWeek(friday, { weekStartsOn: 5 });
    return year * 100 + week;
  };

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Start from the first Friday of the month
    const firstDay = new Date(year, month, 1);
    const firstFriday = startOfWeek(firstDay, { weekStartsOn: 5 });

    // Generate 6 weeks of days (Friday-Thursday weeks)
    const days = [];
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const date = addDays(firstFriday, week * 7 + day);
        weekDays.push(date);
      }
      days.push(weekDays);
    }

    return days;
  }, [currentMonth]);

  // Check if a date is in selected range
  const isDateInSelectedRange = (date: Date) => {
    const week = dateToWeek(date);
    return week >= selectedWeekRange[0] && week <= selectedWeekRange[1];
  };

  // Check if a date is in hovered range
  const isDateInHoveredRange = (date: Date) => {
    if (!isSelecting || hoveredWeek === null) return false;
    const week = dateToWeek(date);
    const startWeek = Math.min(selectedWeekRange[0], hoveredWeek);
    const endWeek = Math.max(selectedWeekRange[1], hoveredWeek);
    return week >= startWeek && week <= endWeek;
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    const week = dateToWeek(date);

    if (!isSelecting) {
      // Start selection
      setSelectedWeekRange([week, week]);
      setIsSelecting(true);
    } else {
      // End selection
      const startWeek = Math.min(selectedWeekRange[0], week);
      const endWeek = Math.max(selectedWeekRange[1], week);
      const finalRange = [startWeek, endWeek] as [number, number];
      setSelectedWeekRange(finalRange);
      setIsSelecting(false);
      onWeekRangeChange(finalRange);
    }
  };

  // Handle date hover
  const handleDateHover = (date: Date) => {
    if (isSelecting) {
      setHoveredWeek(dateToWeek(date));
    }
  };

  // Navigate months
  const navigateMonth = (direction: number) => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1),
    );
  };

  // Week day headers (Friday-Thursday)
  const weekDays = ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"];

  return (
    <div className="week-calendar p-3 border rounded bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
          <ChevronLeft className="h-3 w-3" />
        </Button>

        <h3 className="text-sm font-semibold">
          {format(currentMonth, "MMM yyyy")}
        </h3>

        <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 p-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="space-y-1">
        {calendarDays.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((date, dayIndex) => {
              const week = dateToWeek(date);
              const isSelected = isDateInSelectedRange(date);
              const isHovered = isDateInHoveredRange(date);
              const isCurrentMonth =
                date.getMonth() === currentMonth.getMonth();
              const weekNum = getWeek(startOfWeek(date, { weekStartsOn: 5 }), {
                weekStartsOn: 5,
              });

              return (
                <button
                  key={dayIndex}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => handleDateHover(date)}
                  className={cn(
                    "aspect-square p-0.5 text-xs rounded border transition-colors relative h-8 w-8",
                    "hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500",
                    !isCurrentMonth && "text-gray-400 bg-gray-50",
                    isSelected &&
                      "bg-blue-500 text-white hover:bg-blue-600 border-blue-500",
                    isHovered && !isSelected && "bg-blue-100 border-blue-300",
                    week < minWeek ||
                      (week > maxWeek && "opacity-50 cursor-not-allowed"),
                  )}
                  disabled={week < minWeek || week > maxWeek}>
                  <div className="text-center leading-tight">
                    <div className="text-xs">{format(date, "d")}</div>
                    {dayIndex === 0 && ( // Show week number on Friday
                      <div className="text-[10px] font-medium leading-none">
                        W{weekNum}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Selected range display */}
      <div className="mt-3 p-2 bg-gray-50 rounded border">
        <div className="text-xs font-medium text-gray-700">Selected:</div>
        <div className="text-xs text-gray-600">
          {Math.floor(selectedWeekRange[0] / 100)}-W
          {(selectedWeekRange[0] % 100).toString().padStart(2, "0")} -{" "}
          {Math.floor(selectedWeekRange[1] / 100)}-W
          {(selectedWeekRange[1] % 100).toString().padStart(2, "0")}
        </div>
      </div>

      {/* Instructions */}
      {isSelecting && (
        <div className="mt-2 p-1.5 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          Click another date to complete selection
        </div>
      )}
    </div>
  );
}
