"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { useSqacStore } from "@/stores/sqacStore";

interface SqacTrackerRow {
  date_start?: string | null;
  date_end?: string | null;
  [key: string]: unknown;
}

interface DateRangeFilterProps {
  startLabel?: string;
  endLabel?: string;
  dataSqacTracker?: SqacTrackerRow[];
}

function getDefaultDates() {
  const today = new Date();
  const dateEnd = new Date(today);
  dateEnd.setDate(today.getDate() - 1);

  const dateStart = new Date(today);
  dateStart.setDate(today.getDate() - 30);

  return { dateStart, dateEnd };
}

function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function DateRangeFilter({
  startLabel = "Start Date:",
  endLabel = "End Date:",
  dataSqacTracker,
}: DateRangeFilterProps) {
  const { dateStart, dateEnd, setDateStart, setDateEnd } = useSqacStore();
  const [tempStart, setTempStart] = useState<Date | undefined>(undefined);
  const [tempEnd, setTempEnd] = useState<Date | undefined>(undefined);

  // Initialize dates on first load (when store values are null)
  useEffect(() => {
    if (dateStart === null && dateEnd === null) {
      if (dataSqacTracker && dataSqacTracker.length > 0) {
        const firstRow = dataSqacTracker[0];
        const dateStartVal = firstRow.date_start;
        const dateEndVal = firstRow.date_end;

        if (dateStartVal && dateEndVal) {
          // Use values from dataSqacTracker
          setTempStart(new Date(dateStartVal));
          setTempEnd(new Date(dateEndVal));
        } else {
          // No date values in data, use defaults
          const defaults = getDefaultDates();
          setTempStart(defaults.dateStart);
          setTempEnd(defaults.dateEnd);
        }
      } else {
        // No data, use defaults
        const defaults = getDefaultDates();
        setTempStart(defaults.dateStart);
        setTempEnd(defaults.dateEnd);
      }
    } else {
      // Restore from store
      setTempStart(dateStart ? new Date(dateStart) : undefined);
      setTempEnd(dateEnd ? new Date(dateEnd) : undefined);
    }
  }, [dataSqacTracker, dateStart, dateEnd]);

  const handleSubmit = () => {
    setDateStart(tempStart ? formatDateString(tempStart) : null);
    setDateEnd(tempEnd ? formatDateString(tempEnd) : null);
  };

  return (
    <div className="flex items-center gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="dateStart">
          {startLabel}
        </label>
        <DatePicker id="dateStart" selected={tempStart} onSelect={setTempStart} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="dateEnd">
          {endLabel}
        </label>
        <DatePicker id="dateEnd" selected={tempEnd} onSelect={setTempEnd} />
      </div>
      <Button onClick={handleSubmit} className="mt-5">
        Submit
      </Button>
    </div>
  );
}
