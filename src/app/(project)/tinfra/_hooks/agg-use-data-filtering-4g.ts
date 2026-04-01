// hooks/use-data-filtering.ts
// biome-ignore assist/source/organizeImports: <will fix later>
import { useMemo } from "react";
import type { Data2G4GModel } from "@/types/schema";
import { extractBandFromCellName4G, extractCellName } from "../_function/helper";

interface UseDataFilteringProps {
  data: { rows: Data2G4GModel[] } | undefined;
  filterBy: string;
  selectedCells: string[];
  selectedSectors: string[];
  selectedBands: string[];
  aggregateBy: string;
}

export function useDataFiltering4G({
  data,
  filterBy,
  selectedCells,
  selectedSectors,
  selectedBands,
  aggregateBy,
}: UseDataFilteringProps) {
  const filteredData = useMemo(() => {
    if (!data?.rows) return [];

    if (filterBy === "cell") {
      if (!data || selectedCells.length === 0) return [];

      return data.rows.filter((item: Data2G4GModel) => {
        // const cellName = aggregateBy.includes("CELL")
        //   ? extractCellName(String(item[aggregateBy as keyof Data2G4GModel] ?? "Unknown"))
        //   : (String(item[aggregateBy as keyof Data2G4GModel]) ?? "Unknown");
        // return selectedCells.includes(cellName);
        return String(item[aggregateBy as keyof Data2G4GModel]) ?? "Unknown";
      });
    }

    if (filterBy === "sector") {
      if (!data || selectedSectors.length === 0) return [];

      return data.rows.filter((item: Data2G4GModel) => {
        const cellId = String(item["4G_CELL_ID"] ?? "Unknown");

        // Use the SAME logic as in your useEffect for extracting sectors
        const sector =
          cellId.length === 3
            ? cellId.slice(0, 2) // First two digits for 3-digit IDs
            : cellId.slice(0, 1); // First digit for 2-digit IDs

        return selectedSectors.includes(sector);
      });
    }

    if (filterBy === "band") {
      if (!data || selectedBands.length === 0) return [];

      return data.rows.filter((item: Data2G4GModel) => {
        const cellName = aggregateBy.includes("CELL")
          ? extractCellName(String(item[aggregateBy as keyof Data2G4GModel] ?? "Unknown"))
          : (String(item[aggregateBy as keyof Data2G4GModel]) ?? "Unknown");
        const band = extractBandFromCellName4G(cellName);
        return selectedBands.includes(band);
      });
    }

    return [];
  }, [data, filterBy, selectedCells, selectedSectors, selectedBands, aggregateBy]);

  return { filteredData };
}
