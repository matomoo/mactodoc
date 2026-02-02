// components/ui/date-range-picker.tsx
"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { DateRange, Locale } from "react-day-picker";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps extends React.ComponentProps<"div"> {
  initialDateFrom?: Date;
  initialDateTo?: Date;
  onUpdate?: (values: { range: DateRange }) => void;
  align?: "start" | "end" | "center";
  locale?: Locale;
  showCompare?: boolean;
}

export function DateRangePicker({
  initialDateFrom,
  initialDateTo,
  onUpdate,
  align = "end",
  locale = id,
  className,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: initialDateFrom,
    to: initialDateTo,
  });

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd MMM yyyy", { locale })} -{" "}
                  {format(date.to, "dd MMM yyyy", { locale })}
                </>
              ) : (
                format(date.from, "dd MMM yyyy", { locale })
              )
            ) : (
              <span>Pilih rentang tanggal</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(range) => {
              setDate(range);
              if (onUpdate && range?.from && range?.to) {
                onUpdate({ range });
              }
            }}
            numberOfMonths={2}
            locale={locale}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}