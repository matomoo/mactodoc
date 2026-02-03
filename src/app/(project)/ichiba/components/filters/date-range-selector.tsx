"use client";

import React from "react";

import { Calendar, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDateFilterStore } from "@/stores/date-filter-store";

import { formatDateRange, getYears, months } from "../../utils/date-utils";

export function DateRangeSelector() {
  const {
    startMonth,
    startYear,
    endMonth,
    endYear,
    setStartMonth,
    setStartYear,
    setEndMonth,
    setEndYear,
    resetFilters,
  } = useDateFilterStore();

  const years = getYears(2023);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const quickPresets = [
    {
      label: "This Month",
      action: () => {
        setStartMonth(currentMonth);
        setStartYear(currentYear);
        setEndMonth(currentMonth);
        setEndYear(currentYear);
      },
    },
    {
      label: "Last 3 Months",
      action: () => {
        const endMonth = currentMonth;
        const endYear = currentYear;
        let startMonth = currentMonth - 2;
        let startYear = currentYear;

        if (startMonth < 1) {
          startMonth += 12;
          startYear -= 1;
        }

        setStartMonth(startMonth);
        setStartYear(startYear);
        setEndMonth(endMonth);
        setEndYear(endYear);
      },
    },
    {
      label: "This Year",
      action: () => {
        setStartMonth(1);
        setStartYear(currentYear);
        setEndMonth(currentMonth);
        setEndYear(currentYear);
      },
    },
    {
      label: "Last Year",
      action: () => {
        setStartMonth(1);
        setStartYear(currentYear - 1);
        setEndMonth(12);
        setEndYear(currentYear - 1);
      },
    },
    {
      label: "All Time",
      action: () => {
        setStartMonth(1);
        setStartYear(2023);
        setEndMonth(currentMonth);
        setEndYear(currentYear);
      },
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDateRange(startMonth, startYear, endMonth, endYear)}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4">
          <div className="mb-4">
            <h4 className="mb-2 font-medium">Quick Presets</h4>
            <div className="flex flex-wrap gap-2">
              {quickPresets.map((preset) => (
                <Button key={preset.label} variant="outline" size="sm" onClick={preset.action} className="text-xs">
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Start Date</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Select value={startMonth.toString()} onValueChange={(value) => setStartMonth(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={startYear.toString()} onValueChange={(value) => setStartYear(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.value} value={year.value.toString()}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>End Date</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Select value={endMonth.toString()} onValueChange={(value) => setEndMonth(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={endYear.toString()} onValueChange={(value) => setEndYear(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.value} value={year.value.toString()}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="flex-1"
              >
                Reset
              </Button>
              <Button size="sm" className="flex-1">
                Apply
              </Button>
            </div> */}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
