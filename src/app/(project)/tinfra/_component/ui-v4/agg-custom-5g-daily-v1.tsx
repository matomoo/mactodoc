"use client";
// biome-ignore assist/source/organizeImports: <will fix later>
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ErrorState, exportToExcel, NoDataState } from "./additional-component";
import { useFilterStore } from "@/stores/filterStore";
import { Header } from "./header";
import { MobileFloatingButtons } from "./mobile-floating-buttons";
import FilterSidebar4G from "./agg-filter-sidebar-4g";
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
import type { RawKpiPlos4G, RawKpiRow, RawMeasTa4G } from "../../_lib/reportPerformance-3";
import { useComparisonCalculation } from "./use-comparison-data";
import { ChartsPerSectorSection5G } from "./agg-charts-per-sector-section-5g";
import { ChartsSection5G } from "./agg-charts-section-5g";
import PerformanceSummarySection5G from "./performance-summary-section-5g";

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
  tech?: string;
  showExportPpt?: boolean;
}

export default function PageAggCustom5GDaily({
  apiPath,
  apiPathPloss = "aggregate/plos-dy-site-4g",
  apiPathMeasTa = "meas-ta-multi-site-4g",
  aggregateBy = "CELL_NAME",
  filterLabel = "Cell Name",
  columnNumber = 2,
  showViewModeState = "aggregated",
  aggMode = "custom-cluster",
  fieldToAggregate = "Column to aggregate",
  tech = "5G",
  showExportPpt = false,
}: AggCustomProps) {
  const { dateRange2, filter, siteId, nop, kabupaten, batch, clusterFilter } = useFilterStore();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [filterBy, setFilterBy] = useState<string>("cell");
  const [isPerformanceSummaryExpanded, setIsPerformanceSummaryExpanded] = useState<boolean>(false);
  const [chartLayout, setChartLayout] = useState<number>(columnNumber);
  const [activeTab, setActiveTab] = useState<string>("charts");
  const allMetricNums = useMemo(() => {
    return get2G4GMetricConfigs()
      .filter((a) => a.tech === tech)
      .map((chart) => chart.metric_num);
  }, [tech]);

  const [selectedKPIs, setSelectedKPIs] = useState<string[]>(allMetricNums);

  // console.log({ selectedKPIs });

  const shouldFetch = !!dateRange2 && dateRange2.includes("|") && siteId !== null && siteId.length !== 0;

  const { isPending, error, data, isError } = useQuery({
    queryKey: ["PageAggCustom5GDaily", apiPath, dateRange2, filter, siteId, nop, kabupaten, batch, clusterFilter, tech],
    queryFn: async () => {
      if (!shouldFetch) {
        return { rows: [] };
      }
      const response = await fetch(
        `/tinfra/api/${apiPath}?fieldToAggregate=${fieldToAggregate}&aggregateBy=${aggregateBy}&batch=${batch}&siteId=${siteId}&nop=${nop}&kabupaten=${kabupaten}&clusterFilter=${Array.isArray(clusterFilter) ? clusterFilter.join(",") : clusterFilter || ""}&tgl_1=${dateRange2?.split("|")[0]}&tgl_2=${dateRange2?.split("|")[1]}`,
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

  // console.log({ data });

  const { data: rawDataSector } = useQuery({
    queryKey: ["ref-get-sector", apiPath, dateRange2, filter, siteId, nop, kabupaten, batch, clusterFilter],
    queryFn: async () => {
      if (!shouldFetch) {
        return { rows: [] };
      }
      const response = await fetch(
        `/tinfra/api/meas-db-ti-sul/aggregate/ref-get-sector?aggregateBy=${aggregateBy}&batch=${batch}&siteId=${siteId}&nop=${nop}&kabupaten=${kabupaten}&clusterFilter=${Array.isArray(clusterFilter) ? clusterFilter.join(",") : clusterFilter || ""}&tgl_1=${dateRange2?.split("|")[0]}&tgl_2=${dateRange2?.split("|")[1]}`,
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

  const { data: dataPlos } = useQuery<MeasPlos4GData>({
    queryKey: ["meas-plos-site-4g", apiPathPloss, dateRange2, filter, siteId, nop, kabupaten, batch],
    queryFn: async () => {
      if (!shouldFetch) {
        return { rows: [] };
      }
      const response = await fetch(
        `/tinfra/api/meas-db-ti-sul/${apiPathPloss}?fieldToAggregate=${fieldToAggregate}&batch=${batch}&siteId=${siteId}&nop=${nop}&kabupaten=${kabupaten}&tgl_1=${dateRange2?.split("|")[0]}&tgl_2=${dateRange2?.split("|")[1]}`,
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

  const { data: dataMeasTa } = useQuery<MeasTa4GData>({
    queryKey: ["meas-ta-4g", apiPathMeasTa, dateRange2, filter, siteId, nop, kabupaten, batch],
    queryFn: async () => {
      if (!shouldFetch) {
        return { rows: [] };
      }
      const response = await fetch(
        `/tinfra/api/meas-db-ti-sul/${apiPathMeasTa}?batch=${batch}&siteId=${siteId}&nop=${nop}&kabupaten=${kabupaten}&tgl_1=${dateRange2?.split("|")[0]}&tgl_2=${dateRange2?.split("|")[1]}`,
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

  const { comparisonData } = useComparisonCalculation(data?.rows || [], tech);

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

    const filename = `${tech}_Data__${siteId}_${new Date().toISOString().split("T")[0]}`;
    exportToExcel(data.rows, filename);
  };

  if (!shouldFetch) return <NoDataState message="Please select a date range to view data" />;
  if (isPending) return <EnhancedLoadingState />;
  if (isError) return <ErrorState message={error.message} />;
  if (!data?.rows || data.rows.length === 0) {
    return <NoDataState message="No data available for the selected criteria." />;
  }

  const newFilteredData =
    tech === "5G" || tech === "2G"
      ? filteredData
      : filteredData.map((item) => {
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
        title={`${tech} ${
          aggMode === "custom-cluster"
            ? ` - ${Array.isArray(clusterFilter) ? clusterFilter.join(", ").toUpperCase() : clusterFilter || ""} - `
            : aggMode === "site"
              ? ` - ${Array.isArray(siteId) ? siteId.join(", ").toUpperCase() : siteId || ""} - `
              : ""
        } Level Daily`}
        subtitle={` ${aggMode === "nop" ? `Performance ${nop?.toUpperCase()} | ` : ""} Data ${formatDateForDisplay(dateRange2?.split("|")[0], 2)} - ${formatDateForDisplay(dateRange2?.split("|")[1], 2)}`}
        data={filteredData as unknown as RawKpiRow[]}
        dataPlos={dataPlos?.rows as unknown as RawKpiPlos4G[]}
        dataMeasTa={dataMeasTa?.rows as unknown as RawMeasTa4G[]}
        selectedKPIs={selectedKPIs}
        filteredComparisonData={filteredComparisonData as unknown as RawKpiRow[]}
        groupBy={aggregateBy}
        showExportPpt={showExportPpt}
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
                      {aggregateBy.includes("G4_SITEID_CELLID") && (
                        <TabsTrigger value="charts-per-sectors" className="px-6">
                          Charts Per Sectors
                        </TabsTrigger>
                      )}
                      <TabsTrigger value="summary" className="px-6">
                        Table Comparison
                      </TabsTrigger>
                      {/* {isShowTa && (
                        <TabsTrigger value="meas-ta-4g" className="px-6">
                          TA
                        </TabsTrigger>
                      )}
                      <TabsTrigger value="meas-plos-site-4g" className="px-6">
                        Packet Loss
                      </TabsTrigger> */}
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
                    <ChartsSection5G
                      filteredData={newFilteredData}
                      chartLayout={chartLayout}
                      setChartLayout={setChartLayout}
                      aggregateBy={aggregateBy}
                      selectedKPIs={selectedKPIs}
                      onSelectedKPIsChange={setSelectedKPIs}
                      showViewModeState={showViewModeState}
                      aggMode={aggMode}
                      siteIdLength={siteIdLength}
                      tech={tech}
                    />
                  </TabsContent>

                  {/* Charts Tab Content */}
                  <TabsContent value="charts-per-sectors" className="mt-0">
                    <ChartsPerSectorSection5G
                      filteredData={newFilteredData}
                      chartLayout={chartLayout}
                      setChartLayout={setChartLayout}
                      aggregateBy={aggregateBy}
                      selectedKPIs={selectedKPIs}
                      onSelectedKPIsChange={setSelectedKPIs}
                      showViewModeState={showViewModeState}
                      aggMode={aggMode}
                      siteIdLength={siteIdLength}
                      tech={tech}
                    />
                  </TabsContent>

                  {/* Performance Summary Tab Content */}
                  {
                    <TabsContent value="summary" className="mt-0">
                      <PerformanceSummarySection5G
                        metrics={summaryMetrics}
                        filteredData={filteredData}
                        filterBy={filterBy}
                        isExpanded={isPerformanceSummaryExpanded}
                        selectedKPIs={selectedKPIs}
                        onSelectedKPIsChange={setSelectedKPIs}
                        onToggle={() => setIsPerformanceSummaryExpanded(!isPerformanceSummaryExpanded)}
                        tech={tech}
                      />
                    </TabsContent>
                  }

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
