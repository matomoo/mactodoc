"use client";
// biome-ignore assist/source/organizeImports: <will fix later>
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ErrorState, exportToExcel, NoDataState } from "./additional-component";
import { useFilterStore } from "@/stores/filterStore";
import { Header } from "./header";
import { MobileFloatingButtons } from "./mobile-floating-buttons";
import FilterSidebar4G from "./agg-filter-sidebar-4g";
import PerformanceSummarySection4G from "./performance-summary-section-4g";
import { EnhancedLoadingState } from "./enhanced-loading-state";
import { useDataManagement4G } from "../../_hooks/agg-use-data-management-4g";
import { useDataFiltering4G } from "../../_hooks/agg-use-data-filtering-4g";
import { useSummaryMetrics4G } from "../../_hooks/use-summary-metrics-4g";
import { formatDateForDisplay } from "../../_function/helper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import PageSiteInfo from "./site-info-4g";
import { get2G4GMetricConfigs } from "./metric-configs";
import MeasTa4G, { type MeasTa4GData } from "./meas-ta-4g-v2";
import MeasPlosSite4G, { type MeasPlos4GData } from "./meas-plos-site-4g-site";
import HqRhiChart from "../ui-v2/hq-rhi-chart";
import type { RawKpiPlos4G, RawKpiRow, RawMeasTa4G } from "../../_lib/reportPerformance-3";
import { useComparisonCalculation } from "./use-comparison-data";
import { ChartsPerSectorSection4G } from "./agg-charts-per-sector-section-4g";
import { ChartsSection4G } from "./agg-charts-section-4g";

interface AggCustomProps {
  area?: string;
  apiPath: string;
  apiPathPloss?: string;
  apiPathMeasTa?: string;
  aggregateBy?: string;
  filterLabel?: string;
  columnNumber?: number;
  showViewModeState?: string;
  aggMode?: string;
  isShowTa: boolean;
  isShowHqRhi?: boolean;
  apiPathRhi?: string;
  fieldToAggregate?: string;
  tutelaLevel?: string;
  tutelaProvider?: string;
  rhiLevel?: string;
  rhiProvider?: string;
}

export default function PageAggCustom4GDaily({
  apiPath,
  apiPathPloss = "aggregate/plos-dy-site-4g",
  apiPathMeasTa = "meas-ta-multi-site-4g",
  aggregateBy = "CELL_NAME",
  filterLabel = "Cell Name",
  columnNumber = 2,
  showViewModeState = "aggregated",
  aggMode = "custom-cluster",
  isShowTa = true,
  isShowHqRhi = false,
  apiPathRhi = "aggregate/hq-rhi/by-region",
  fieldToAggregate = "Column to aggregate",
  tutelaLevel = "site",
  tutelaProvider = "Telkomsel",
  rhiLevel = "site",
  rhiProvider = "Telkomsel",
}: AggCustomProps) {
  const { dateRange2, filter, siteId, nop, kabupaten, batch, clusterFilter, viewBy, dateStart, dateEnd } =
    useFilterStore();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [filterBy, setFilterBy] = useState<string>("cell");
  const [isPerformanceSummaryExpanded, setIsPerformanceSummaryExpanded] = useState<boolean>(false);
  const [chartLayout, setChartLayout] = useState<number>(columnNumber);
  const [activeTab, setActiveTab] = useState<string>("charts");
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>(
    // Default to all KPIs selected
    get2G4GMetricConfigs()
      .filter((a) => a.tech === "4G")
      .map((chart) => chart.metric_num),
  );

  const isKabupatenSelected = !!kabupaten && kabupaten !== "---";
  const isSiteView = viewBy === "site";
  const shouldFetch = !!dateStart && !!dateEnd && (isSiteView ? !!siteId : isKabupatenSelected);

  const { isPending, error, data, isError } = useQuery({
    queryKey: [
      "PageAggCustom4GDaily",
      apiPath,
      dateStart,
      dateEnd,
      filter,
      siteId,
      nop,
      kabupaten,
      batch,
      clusterFilter,
    ],
    queryFn: async () => {
      if (!shouldFetch) {
        return { rows: [] };
      }
      const response = await fetch(
        `/tinfra/api/meas-db-ti-sul/${apiPath}?aggregateBy=${aggregateBy}&batch=${batch}&siteId=${siteId}&nop=${nop}&kabupaten=${kabupaten}&clusterFilter=${Array.isArray(clusterFilter) ? clusterFilter.join(",") : clusterFilter || ""}&tgl_1=${dateStart}&tgl_2=${dateEnd}`,
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

  const {
    isPending: isPendingSector,
    error: errorSector,
    data: rawDataSector,
    isError: isErrorSector,
  } = useQuery({
    queryKey: ["ref-get-sector", apiPath, dateStart, dateEnd, filter, siteId, nop, kabupaten, batch, clusterFilter],
    queryFn: async () => {
      if (!shouldFetch) {
        return { rows: [] };
      }
      const response = await fetch(
        `/tinfra/api/meas-db-ti-sul/aggregate/ref-get-sector?aggregateBy=${aggregateBy}&batch=${batch}&siteId=${siteId}&nop=${nop}&kabupaten=${kabupaten}&clusterFilter=${Array.isArray(clusterFilter) ? clusterFilter.join(",") : clusterFilter || ""}&tgl_1=${dateStart}&tgl_2=${dateEnd}`,
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

  const {
    isPending: isPendingPlos,
    error: errorPlos,
    data: dataPlos,
    isError: isErrorPlos,
  } = useQuery<MeasPlos4GData>({
    queryKey: ["meas-plos-site-4g", apiPathPloss, dateStart, dateEnd, filter, siteId, nop, kabupaten, batch],
    queryFn: async () => {
      if (!shouldFetch) {
        return { rows: [] };
      }
      const response = await fetch(
        `/tinfra/api/meas-db-ti-sul/${apiPathPloss}?fieldToAggregate=${fieldToAggregate}&batch=${batch}&siteId=${siteId}&nop=${nop}&kabupaten=${kabupaten}&tgl_1=${dateStart}&tgl_2=${dateEnd}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    retry: 3,
  });

  const {
    isPending: isPendingMeasTa,
    error: errorMeasTa,
    data: dataMeasTa,
    isError: isErrorMeasTa,
  } = useQuery<MeasTa4GData>({
    queryKey: ["meas-ta-4g", apiPathMeasTa, dateStart, dateEnd, filter, siteId, nop, kabupaten, batch],
    queryFn: async () => {
      if (!shouldFetch) {
        return { rows: [] };
      }
      const response = await fetch(
        `/tinfra/api/meas-db-ti-sul/${apiPathMeasTa}?batch=${batch}&siteId=${siteId}&nop=${nop}&kabupaten=${kabupaten}&tgl_1=${dateStart}&tgl_2=${dateEnd}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    retry: 3,
  });

  const dataManagement = useDataManagement4G({
    data,
    aggregateBy,
    rawDataSector,
  });
  // console.log({ dataMeasTa });

  // Call the comparison calculation hook unconditionally
  const { comparisonData } = useComparisonCalculation(data?.rows || [], "4G");

  // Calculate filteredComparisonData when selectedKPIs or data changes
  const filteredComparisonData = useMemo(() => {
    if (data?.rows) {
      return comparisonData.filter((row) => selectedKPIs.includes(row.metric_num));
    }
    return [];
  }, [selectedKPIs, data?.rows, comparisonData]);

  const { filteredData } = useDataFiltering4G({
    data,
    filterBy,
    selectedCells: dataManagement.selectedCells,
    selectedSectors: dataManagement.selectedSectors,
    selectedBands: dataManagement.selectedBands,
    aggregateBy,
    rawDataSector,
  });

  const { summaryMetrics } = useSummaryMetrics4G({
    filteredData,
    allCellsCount: dataManagement.allCells.length,
  });

  const handleExportAllData = () => {
    if (!data?.rows || data.rows.length === 0) {
      alert("No data available to export.");
      return;
    }

    const filename = `4G_Data__${siteId}_${new Date().toISOString().split("T")[0]}`;
    exportToExcel(data.rows, filename);
  };

  if (!shouldFetch) return <NoDataState message="Please select a date range to view data" />;
  if (isPending) return <EnhancedLoadingState />;
  if (isError) return <ErrorState message={error.message} />;
  if (!data?.rows || data.rows.length === 0) {
    return <NoDataState message="No data available for the selected criteria." />;
  }

  const newFilteredData = filteredData.map((item) => {
    const sector = rawDataSector.rows.find(
      (row: { G4_SITEID_CELLID: string }) => row.G4_SITEID_CELLID === item.G4_SITEID_CELLID,
    );
    return {
      ...item,
      sector: sector?.G4_SITEID_SECTOR || "",
    };
  });

  // count siteId after split by comma
  const siteIdLength = typeof siteId === "string" ? siteId.split(",").length : 1;

  // console.log({ newFilteredData, dataPlos });

  return (
    <div className="min-h-screen">
      <Header
        onExportData={handleExportAllData}
        onToggleMobileFilters={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
        title={`4G ${
          aggMode === "custom-cluster"
            ? ` - ${Array.isArray(clusterFilter) ? clusterFilter.join(", ").toUpperCase() : clusterFilter || ""} - `
            : viewBy === "site" && aggMode === "site"
              ? ` - ${Array.isArray(siteId) ? siteId.join(", ").toUpperCase() : siteId || ""} - `
              : viewBy === "kabupaten"
                ? ` - ${nop} - ${kabupaten} - All Sites - `
                : ""
        } Level Daily`}
        subtitle={` ${aggMode === "nop" ? `Performance ${nop?.toUpperCase()} | ` : ""} Data ${formatDateForDisplay(dateStart, 2)} - ${formatDateForDisplay(dateEnd, 2)}`}
        data={filteredData as unknown as RawKpiRow[]}
        dataPlos={dataPlos?.rows as unknown as RawKpiPlos4G[]}
        dataMeasTa={dataMeasTa?.rows as unknown as RawMeasTa4G[]}
        selectedKPIs={selectedKPIs}
        filteredComparisonData={filteredComparisonData as unknown as RawKpiRow[]}
        groupBy={aggregateBy}
      />

      <div className="py-4 lg:py-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Left sidebar - Filters */}

          <FilterSidebar4G
            // Summary data
            allCells={dataManagement.allCells}
            filterBy={filterBy}
            selectedCells={dataManagement.selectedCells}
            selectedSectors={dataManagement.selectedSectors}
            selectedBands={dataManagement.selectedBands}
            // Filter data
            filteredCells={dataManagement.filteredCells}
            filteredSectors={dataManagement.filteredSectors}
            filteredBands={dataManagement.filteredBands}
            // Search states
            cellSearch={dataManagement.cellSearch}
            sectorSearch={dataManagement.sectorSearch}
            bandSearch={dataManagement.bandSearch}
            // Handlers
            onFilterByChange={setFilterBy}
            onCellSearchChange={dataManagement.setCellSearch}
            onSectorSearchChange={dataManagement.setSectorSearch}
            onBandSearchChange={dataManagement.setBandSearch}
            onCellSelection={dataManagement.handleCellSelection}
            onSectorSelection={dataManagement.handleSectorSelection}
            onBandSelection={dataManagement.handleBandsSelection}
            onSelectAllCells={dataManagement.selectAllCells}
            onClearAllCells={dataManagement.clearAllCells}
            onSelectAllSectors={dataManagement.selectAllSectors}
            onClearAllSectors={dataManagement.clearAllSectors}
            onSelectAllBands={dataManagement.selectAllBands}
            onClearAllBands={dataManagement.clearAllBands}
            onExportData={handleExportAllData}
            // Configuration
            filterLabel={filterLabel}
            // Mobile overlay props
            isMobileFilterOpen={isMobileFilterOpen}
            onMobileFilterClose={() => setIsMobileFilterOpen(false)}
            aggregateBy={aggregateBy}
          />
          {/* Main content */}
          <div className={aggMode === "custom-cluster" ? "lg:col-span-12" : "lg:col-span-9"}>
            {/* Error/Empty States */}
            {filterBy === "cell" && dataManagement.selectedCells.length === 0 && (
              <NoDataState message={`Please select at least one ${filterLabel.toLowerCase()}`} />
            )}

            {filterBy === "sector" && dataManagement.selectedSectors.length === 0 && (
              <NoDataState message="Please select at least one sector" />
            )}

            {/* Main Content when filters are valid */}
            {(filterBy === "band" ||
              (filterBy === "cell" && dataManagement.selectedCells.length > 0) ||
              (filterBy === "sector" && dataManagement.selectedSectors.length > 0)) && (
              <>
                {/* Tabs for Performance Summary and Charts */}
                <Tabs defaultValue="charts" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="mb-4 flex items-center justify-between">
                    <TabsList>
                      <TabsTrigger value="charts" className="px-6">
                        Charts
                      </TabsTrigger>
                      {aggregateBy === "G4_SITEID_CELLID" && (
                        <TabsTrigger value="charts-per-sectors" className="px-6">
                          Charts Per Sectors
                        </TabsTrigger>
                      )}
                      <TabsTrigger value="summary" className="px-6">
                        Table Comparison
                      </TabsTrigger>
                      {isShowTa && (
                        <TabsTrigger value="meas-ta-4g" className="px-6">
                          TA
                        </TabsTrigger>
                      )}
                      <TabsTrigger value="meas-plos-site-4g" className="px-6">
                        Packet Loss
                      </TabsTrigger>
                      {isShowHqRhi && (
                        <TabsTrigger value="hq-rhi" className="px-6">
                          RHI
                        </TabsTrigger>
                      )}
                    </TabsList>

                    {/* Layout toggle only shows when Charts tab is active */}
                    {activeTab === "charts" && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm">Column:</span>
                        <div className="flex rounded-lg border bg-white p-1">
                          <button
                            type="button"
                            onClick={() => setChartLayout(1)}
                            className={`rounded px-3 py-1 text-sm transition-colors ${
                              chartLayout === 1 ? "bg-blue-500 text-white" : "hover:bg-gray-100"
                            }`}
                          >
                            1
                          </button>
                          <button
                            type="button"
                            onClick={() => setChartLayout(2)}
                            className={`rounded px-3 py-1 text-sm transition-colors ${
                              chartLayout === 2 ? "bg-blue-500 text-white" : "hover:bg-gray-100"
                            }`}
                          >
                            2
                          </button>
                          <button
                            type="button"
                            onClick={() => setChartLayout(3)}
                            className={`rounded px-3 py-1 text-sm transition-colors ${
                              chartLayout === 3 ? "bg-blue-500 text-white" : "hover:bg-gray-100"
                            }`}
                          >
                            3
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Charts Tab Content */}
                  <TabsContent value="charts" className="mt-0">
                    <ChartsSection4G
                      filteredData={newFilteredData}
                      chartLayout={chartLayout}
                      setChartLayout={setChartLayout}
                      aggregateBy={aggregateBy}
                      selectedKPIs={selectedKPIs}
                      onSelectedKPIsChange={setSelectedKPIs}
                      showViewModeState={showViewModeState}
                      aggMode={aggMode}
                      siteIdLength={siteIdLength}
                    />
                  </TabsContent>

                  {/* Charts Tab Content */}
                  <TabsContent value="charts-per-sectors" className="mt-0">
                    <ChartsPerSectorSection4G
                      filteredData={newFilteredData}
                      chartLayout={chartLayout}
                      setChartLayout={setChartLayout}
                      aggregateBy={aggregateBy}
                      selectedKPIs={selectedKPIs}
                      onSelectedKPIsChange={setSelectedKPIs}
                      showViewModeState={showViewModeState}
                      aggMode={aggMode}
                      siteIdLength={siteIdLength}
                    />
                  </TabsContent>

                  {/* Performance Summary Tab Content */}
                  {(aggregateBy === "G4_SITEID_CELLID" ||
                    aggregateBy === "G4_SITEID" ||
                    aggregateBy === "G4_AGGRBY2") && (
                    <TabsContent value="summary" className="mt-0">
                      <PerformanceSummarySection4G
                        metrics={summaryMetrics}
                        filteredData={filteredData}
                        filterBy={filterBy}
                        isExpanded={isPerformanceSummaryExpanded}
                        selectedKPIs={selectedKPIs}
                        onSelectedKPIsChange={setSelectedKPIs}
                        onToggle={() => setIsPerformanceSummaryExpanded(!isPerformanceSummaryExpanded)}
                      />
                    </TabsContent>
                  )}

                  {/* Performance TA Tab Content */}
                  <TabsContent value="meas-ta-4g" className="mt-0">
                    <MeasTa4G apiPath={"meas-ta-multi-site-4g"} aggregateBy="CELL_NAME" filterLabel="Cell Name" />
                  </TabsContent>

                  {/* Performance Plos Tab Content */}
                  <TabsContent value="meas-plos-site-4g" className="mt-0">
                    <MeasPlosSite4G
                      apiPath={apiPathPloss}
                      aggregateBy={aggMode}
                      filterLabel="Cell Name"
                      fieldToAggregate={""}
                    />
                  </TabsContent>

                  {isShowHqRhi && (
                    <TabsContent value="hq-rhi" className="mt-0">
                      <HqRhiChart
                        apiPath={apiPathRhi}
                        fieldToAggregate={fieldToAggregate}
                        rhiProvider={rhiProvider}
                        rhiLevel={rhiLevel}
                      />
                    </TabsContent>
                  )}
                </Tabs>
              </>
            )}
          </div>
        </div>
      </div>

      <MobileFloatingButtons
        onExportData={handleExportAllData}
        onToggleMobileFilters={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
      />
    </div>
  );
}
