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
  rawDataSector: { rows: Data2G4GModel[] } | undefined;
}

export function useDataFilteringProductivityAll({
  data,
  filterBy,
  selectedCells,
  selectedSectors,
  selectedBands,
  aggregateBy,
  rawDataSector,
}: UseDataFilteringProps) {
  // console.log({ selectedSectors, aggregateBy });
  const filteredData = useMemo(() => {
    if (!data?.rows) return [];

    if (filterBy === "cell") {
      if (!data || selectedCells.length === 0) return [];

      return data.rows.filter((item: Data2G4GModel) => {
        const cellName = aggregateBy.includes("CELL_NAME")
          ? extractCellName(String(item[aggregateBy as keyof Data2G4GModel] ?? "Unknown"))
          : (String(item[aggregateBy as keyof Data2G4GModel]) ?? "Unknown");
        return selectedCells.includes(cellName);
      });
    }

    if (filterBy === "sector") {
      if (!data || !rawDataSector || selectedSectors.length === 0) return [];

      // Filter rawDataSector rows where G4_SITEID_SECTOR is in selectedSectors
      const sectorSiteCellIds = rawDataSector.rows
        .filter((sectorItem: Data2G4GModel) => {
          const sectorName = String(sectorItem.G4_SITEID_SECTOR ?? "Unknown");
          return selectedSectors.includes(sectorName);
        })
        .map((sectorItem: Data2G4GModel) => String(sectorItem.G4_SITEID_CELLID ?? "Unknown"));

      // Filter data where G4_SITEID_CELLID matches any from the selected sectors
      return data.rows.filter((item: Data2G4GModel) => {
        const g4SiteIdCellId = String(item.G4_SITEID_CELLID ?? "Unknown");
        return sectorSiteCellIds.includes(g4SiteIdCellId);
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
  }, [data, filterBy, selectedCells, selectedSectors, selectedBands, aggregateBy, rawDataSector]);

  // console.log({ selectedSectors });

  return { filteredData };
}
