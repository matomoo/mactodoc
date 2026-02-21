"use client";
// biome-ignore assist/source/organizeImports: <will fix later>
import { useQuery } from "@tanstack/react-query";
import { ErrorState, NoDataState } from "./additional-component";
import { useFilterStore } from "@/stores/filterStore";
import { EnhancedLoadingState } from "./enhanced-loading-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Data2G4GModel } from "@/types/schema";

interface AggCustomProps {
  area?: string;
  apiPath: string;
  aggregateBy?: string;
  filterLabel?: string;
  columnNumber?: number;
}

export default function PageSiteInfo({ apiPath }: AggCustomProps) {
  const { dateRange2, filter, siteId, nop, kabupaten, batch } = useFilterStore();
  const shouldFetch = !!dateRange2 && dateRange2.includes("|") && siteId?.length === 6;

  const { isPending, error, data, isError } = useQuery({
    queryKey: ["PageSiteInfo", apiPath, dateRange2, filter, siteId, nop, kabupaten, batch],
    queryFn: async () => {
      if (!shouldFetch) {
        return { rows: [] };
      }
      const response = await fetch(
        `/gefr/api/meas-db-ti-sul/${apiPath}?batch=${batch}&siteId=${siteId}&nop=${nop}&kabupaten=${kabupaten}&tgl_1=${dateRange2?.split("|")[0]}&tgl_2=${dateRange2?.split("|")[1]}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (isPending) return <EnhancedLoadingState />;
  if (isError) return <ErrorState message={error.message} />;
  if (!shouldFetch) return <NoDataState message="Please select a date range to view data" />;
  if (!data?.rows || data.rows.length === 0) {
    return (
      <NoDataState message="No data available for the selected criteria. For demo purposes, available site ID is NBW001, NBW002, NBW003, NBW004, NBW005" />
    );
  }

  console.log(data);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-4 lg:py-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Main content */}
          <div className="lg:col-span-9">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-4">Cell Name</TableHead>
                    <TableHead className="w-2">Cell ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.rows.map((row: Data2G4GModel) => (
                    <TableRow key={row.CELL_NAME}>
                      <TableCell className="font-medium">{row.CELL_NAME}</TableCell>
                      <TableCell className="font-medium">{row.CELL_ID}</TableCell>
                      <TableCell className="font-medium">xxxx</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
