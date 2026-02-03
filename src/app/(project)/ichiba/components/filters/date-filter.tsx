"use client";

// biome-ignore assist/source/organizeImports: <none>
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Calendar } from "lucide-react";
import { useDateFilterStore } from "@/stores/date-filter-store";
import { formatDateRange, getYears, isValidDateRange, months } from "../../utils/date-utils";

export function DateFilter() {
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

  const years = getYears(2020);
  const isValid = isValidDateRange(startMonth, startYear, endMonth, endYear);

  const handleStartMonthChange = (value: string) => {
    const month = parseInt(value);
    setStartMonth(month);

    // Auto-adjust end month if start is after end
    if (startYear === endYear && month > endMonth) {
      setEndMonth(month);
    }
  };

  const handleStartYearChange = (value: string) => {
    const year = parseInt(value);
    setStartYear(year);

    // Auto-adjust end year if start year is after end year
    if (year > endYear) {
      setEndYear(year);
      // Also adjust month if needed
      if (startMonth > endMonth) {
        setEndMonth(startMonth);
      }
    }
  };

  const handleEndMonthChange = (value: string) => {
    setEndMonth(parseInt(value));
  };

  const handleEndYearChange = (value: string) => {
    setEndYear(parseInt(value));
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Date Range Filter
        </CardTitle>
        <CardDescription>Select start and end dates to filter your data</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Selection Display */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-1">Selected Range:</p>
          <p className={`text-lg font-semibold ${!isValid ? "text-destructive" : "text-primary"}`}>
            {formatDateRange(startMonth, startYear, endMonth, endYear)}
          </p>
        </div>

        {/* Error Alert */}
        {!isValid && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              End date cannot be earlier than start date. Please adjust your selection.
            </AlertDescription>
          </Alert>
        )}

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Date Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="start-month" className="text-base font-medium">
                Start Month
              </Label>
              <Select value={startMonth.toString()} onValueChange={handleStartMonthChange}>
                <SelectTrigger id="start-month">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-year" className="text-base font-medium">
                Start Year
              </Label>
              <Select value={startYear.toString()} onValueChange={handleStartYearChange}>
                <SelectTrigger id="start-year">
                  <SelectValue placeholder="Select year" />
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

          {/* End Date Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="end-month" className="text-base font-medium">
                End Month
              </Label>
              <Select value={endMonth.toString()} onValueChange={handleEndMonthChange}>
                <SelectTrigger id="end-month">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-year" className="text-base font-medium">
                End Year
              </Label>
              <Select value={endYear.toString()} onValueChange={handleEndYearChange}>
                <SelectTrigger id="end-year">
                  <SelectValue placeholder="Select year" />
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
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button onClick={resetFilters} variant="outline" className="flex-1">
            Reset to Current
          </Button>
          <Button
            disabled={!isValid}
            className="flex-1"
            onClick={() => {
              // Handle filter application here
              console.log("Applying filter:", {
                startMonth,
                startYear,
                endMonth,
                endYear,
              });
            }}
          >
            Apply Filter
          </Button>
        </div>

        {/* Validation Summary */}
        {isValid && (
          <div className="text-sm text-muted-foreground pt-2 border-t">
            <p>
              Range is valid. Data will be filtered from {months[startMonth - 1]?.label} {startYear} to{" "}
              {months[endMonth - 1]?.label} {endYear}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
