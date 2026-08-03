"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { useSqacStore } from "@/stores/sqacStore";

interface DateRangeFilterProps {
  startLabel?: string;
  endLabel?: string;
}

export function DateRangeFilter({ startLabel = "Start Date:", endLabel = "End Date:" }: DateRangeFilterProps) {
  const { dateStart, dateEnd, setDateStart, setDateEnd } = useSqacStore();
  const [tempStart, setTempStart] = useState<Date | undefined>(dateStart ? new Date(dateStart) : undefined);
  const [tempEnd, setTempEnd] = useState<Date | undefined>(dateEnd ? new Date(dateEnd) : undefined);

  const handleSubmit = () => {
    setDateStart(tempStart ? tempStart.toISOString().split("T")[0] : null);
    setDateEnd(tempEnd ? tempEnd.toISOString().split("T")[0] : null);
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
