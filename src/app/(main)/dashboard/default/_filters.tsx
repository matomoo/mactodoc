import { DateRangeSelector } from "@/app/(project)/ichiba/components/filters/date-range-selector";

export default function FiltersPage() {
  return (
    <div className="container mx-auto space-y-8 py-8">
      {/* Compact Filter (for dashboards) */}
      <div className="flex w-100 items-center justify-between">
        <DateRangeSelector />
        {/* <CompactDateFilter /> */}
      </div>

      {/* Usage Example */}
      {/* <div className="space-y-4 rounded-lg bg-muted p-6">
        <h3 className="font-medium text-lg">Usage Example</h3>
        <p className="text-sm">
          The filter state is managed by Zustand and persists across page reloads.
          You can access the filter values in any component:
        </p>
        <pre className="bg-black text-white p-4 rounded text-sm overflow-x-auto">
          {`import { useDateFilterStore } from '@/lib/store/date-filter-store';

function DataComponent() {
  const { startMonth, startYear, endMonth, endYear } = useDateFilterStore();
  
  // Use these values to filter your data
  const filterData = () => {
    // Your filtering logic here
  };
}`}
        </pre>
      </div> */}
    </div>
  );
}
