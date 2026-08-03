"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { Locale } from "react-day-picker";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const INDONESIAN_LOCALE = id;

interface DatePickerProps extends Omit<React.ComponentProps<"div">, "onSelect"> {
  id?: string;
  selected?: Date | null;
  onSelect?: (date: Date | undefined) => void;
  align?: "start" | "end" | "center";
  locale?: Locale;
  placeholder?: string;
}

export function DatePicker({
  id: pickerId,
  selected,
  onSelect,
  align = "start",
  locale,
  placeholder = "Pilih tanggal",
  className,
}: DatePickerProps) {
  const activeLocale = locale ?? INDONESIAN_LOCALE;

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={pickerId}
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selected && "text-muted-foreground",
            )}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selected ? (
              format(selected, "dd MMM yyyy", { locale: activeLocale })
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align} sideOffset={4}>
          <Calendar
            mode="single"
            selected={selected ?? undefined}
            onSelect={onSelect}
            initialFocus
            locale={activeLocale}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
