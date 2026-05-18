"use client";
// biome-ignore assist/source/organizeImports: <will fix later>
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { ErrorState, exportToExcel, NoDataState } from "./additional-component";
import { useFilterStore } from "@/stores/filterStore";
import { Header } from "./header";
import { MobileFloatingButtons } from "./mobile-floating-buttons";
import FilterSidebar4G from "./agg-filter-sidebar-4g";
import PerformanceSummarySection4G from "./performance-summary-section-4g";
import { ChartsSection4G } from "./agg-charts-section-4g";
import { EnhancedLoadingState } from "./enhanced-loading-state";
import { useDataManagement4G } from "../../_hooks/agg-use-data-management-4g";
import { useDataFiltering4G } from "../../_hooks/agg-use-data-filtering-4g";
import { useSummaryMetrics4G } from "../../_hooks/use-summary-metrics-4g";
import { useComparisonCalculation } from "./use-comparison-data";
import { formatDateForDisplay } from "../../_function/helper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import PageSiteInfo from "./site-info-4g";
import { get2G4GMetricConfigs } from "./metric-configs";
import MeasTa4G from "./meas-ta-4g-v2";
import MeasPlosSite4G from "./meas-plos-site-4g-site";
import HqTutelaChart from "../ui-v2/hq-tutela-chart";
import HqRhiChart from "../ui-v2/hq-rhi-chart";
import type { RawKpiRow } from "../../_lib/reportPerformance-3";
import { Loader2 } from "lucide-react";

interface AggCustomProps {
  area?: string;
  apiPath: string;
  apiPathPloss?: string;
  apiPathTutela?: string;
  apiPathRhi?: string;
  aggregateBy?: string;
  filterLabel?: string;
  columnNumber?: number;
  showViewModeState?: string;
  aggMode?: string;
  isShowTa?: boolean;
  isShowHqTutela?: boolean;
  isShowHqRhi?: boolean;
  fieldToAggregate?: string;
  tutelaLevel?: string;
  tutelaProvider?: string;
  rhiLevel?: string;
  rhiProvider?: string;
}

function TimeoutBanner() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 mb-4">
      <div className="flex items-center gap-2 text-yellow-800">
        <span className="text-lg">⚠️</span>
        <div>
          <p className="text-sm font-medium">Server timeout — Netlify cut the connection</p>
          <p className="text-xs text-yellow-600">The query may have completed. Refreshing will load from cache.</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="ml-4 rounded-md bg-yellow-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-yellow-600 transition-colors"
      >
        Refresh Page
      </button>
    </div>
  );
}

function QueryLoadingState({ startedAt }: { startedAt?: number }) {
  const [elapsed, setElapsed] = useState(0);
  const effectiveStart = useMemo(() => startedAt ?? Date.now(), [startedAt]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - effectiveStart) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [effectiveStart]);

  // ✅ Escape hatch — stop infinite polling after 90s
  if (elapsed > 90) {
    return (
      <div className="min-h-screen p-4">
        <TimeoutBanner />
        <NoDataState message="Taking too long. Try refreshing — first load may already be cached." />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-sm">Aggregating data... {elapsed}s</p>
      <p className="text-xs">Large date ranges may take up to 60s</p>
    </div>
  );
}

export default function PageAggCustom4GDaily({
  apiPath,
  apiPathPloss = "---",
  apiPathTutela = "---",
  apiPathRhi = "---",
  aggregateBy = "CELL_NAME",
  filterLabel = "Cell Name",
  columnNumber = 2,
  showViewModeState = "aggregated",
  aggMode = "custom-cluster",
  isShowTa = false,
  isShowHqTutela = false,
  isShowHqRhi = false,
  fieldToAggregate = "Column to aggregate",
  tutelaLevel = "site",
  tutelaProvider = "Telkomsel",
  rhiLevel = "site",
  rhiProvider = "Telkomsel",
}: AggCustomProps) {
  const { dateRange2, filter, siteId, nop, kabupaten, kecamatan, batch, clusterFilter, region } = useFilterStore();
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

  // Get the appropriate filter value based on fieldToAggregate
  const filterValue =
    fieldToAggregate === "region"
      ? region
      : fieldToAggregate === "nop"
        ? nop
        : fieldToAggregate === "kabupaten"
          ? kabupaten
          : fieldToAggregate === "kecamatan"
            ? kecamatan
            : siteId;

  const shouldFetch = Boolean(
    dateRange2?.includes("|") &&
      filterValue && // Now uses the correct filter
      filterValue.trim().length > 0 &&
      filterValue !== "---" &&
      filterValue !== "All",
  );

  const POLL_INTERVALS = [3000, 5000, 8000, 15000, 30000]; // ms
  const [pollCount, setPollCount] = useState(0);
  const [isPolling, setIsPolling] = useState(false);

  const { isPending, error, data, isError } = useQuery({
    queryKey: [
      "PageAggCustom4GDaily",
      apiPath,
      dateRange2,
      filter,
      filterValue,
      nop,
      kabupaten,
      batch,
      clusterFilter,
      region,
      fieldToAggregate,
    ],
    queryFn: async () => {
      if (!shouldFetch) return { rows: [] };

      const response = await fetch(
        `/tinfra/api/${apiPath}?fieldToAggregate=${fieldToAggregate}&batch=${batch}&siteId=${siteId}&nop=${nop}&kabupaten=${kabupaten}&kecamatan=${kecamatan}&region=${region}&clusterFilter=${Array.isArray(clusterFilter) ? clusterFilter.join(",") : clusterFilter || ""}&tgl_1=${dateRange2?.split("|")[0]}&tgl_2=${dateRange2?.split("|")[1]}`,
      );

      if (response.status === 202) {
        setIsPolling(true);
        setPollCount((c) => c + 1); // advance backoff
        return { rows: [], source: "loading" };
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const json = await response.json();

      if (json.source !== "loading") {
        setIsPolling(false);
        setPollCount(0); // reset for next query
      }

      return json;
    },
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    retry: 2,
    staleTime: 5 * 60 * 1000,

    // ✅ Poll aggressively at first, slow down if taking long
    refetchInterval: isPolling ? POLL_INTERVALS[Math.min(pollCount, POLL_INTERVALS.length - 1)] : false,
    refetchIntervalInBackground: true,
  });

  const {
    isPending: isPendingSector,
    error: errorSector,
    data: rawDataSector,
    isError: isErrorSector,
  } = useQuery({
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
    retry: 5,
  });

  // retrieve data from api aggregate/meas-dy-dynamic-4g-v3
  // console.log({ data });

  useEffect(() => {
    if (dateRange2 && filterValue && nop && kabupaten && clusterFilter && region) {
      setIsPolling(false);
    }
  }, [dateRange2, filterValue, nop, kabupaten, clusterFilter, region]);

  const dataManagement = useDataManagement4G({
    data,
    aggregateBy,
    rawDataSector,
  });

  // Call the comparison calculation hook unconditionally
  const { comparisonData } = useComparisonCalculation(data?.rows || [], "4G");

  // Calculate filteredComparisonData when selectedKPIs or data changes
  const filteredComparisonData = useMemo(() => {
    if (data?.rows) {
      return comparisonData.filter((row) => selectedKPIs.includes(row.metric_num));
    }
    return [];
  }, [selectedKPIs, data?.rows, comparisonData]);

  // console.log({ filteredComparisonData });

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
    if (!filteredData || filteredData.length === 0) {
      alert("No data available to export.");
      return;
    }

    const filename = `4G_Data_NOP__${new Date().toISOString().split("T")[0]}`;
    exportToExcel(filteredData, filename);
  };

  // console.log({ filteredData });

  if (!shouldFetch) return <NoDataState message="Please select a date range to view data" />;

  if (isPending) return <EnhancedLoadingState />;

  if (isError) {
    if (error.message === "502") {
      return (
        <div className="min-h-screen p-4">
          <TimeoutBanner />
          <NoDataState message="Query timed out. The data may be ready — try refreshing." />
        </div>
      );
    }
    return <ErrorState message={error.message} />;
  }
  // ✅ Add this — show loading state when 202 / polling
  // if (data?.source === "loading") {
  //   return (
  //     <EnhancedLoadingState
  //       message="Data is being prepared, please wait..."
  //       subMessage="This may take up to 30 seconds for the first load"
  //     />
  //   );
  // }

  if (data?.source === "loading") {
    return <QueryLoadingState startedAt={data?.startedAt} />;
  }

  if (!data?.rows || data.rows.length === 0 || filterValue === null) {
    return <NoDataState message="No data available for selected criteria." />;
  }
  // console.log({ filteredData });

  return (
    <div className="min-h-screen">
      <Header
        onExportData={handleExportAllData}
        onToggleMobileFilters={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
        title={`4G ${
          aggMode === "custom-cluster"
            ? ` - ${Array.isArray(clusterFilter) ? clusterFilter.join(", ").toUpperCase() : clusterFilter || ""} - `
            : aggMode === "site"
              ? ` - ${Array.isArray(siteId) ? siteId.join(", ").toUpperCase() : siteId || ""} - `
              : ""
        } Level Daily`}
        subtitle={` ${aggMode === "nop" ? `Performance ${nop?.toUpperCase()} | ` : ""} Data ${formatDateForDisplay(dateRange2?.split("|")[0] || "", 2)} - ${formatDateForDisplay(dateRange2?.split("|")[1] || "", 2)}`}
        data={filteredData as unknown as RawKpiRow[]}
        selectedKPIs={selectedKPIs}
        filteredComparisonData={filteredComparisonData as unknown as RawKpiRow[]}
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
            fieldToAggregate={fieldToAggregate}
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
                      <TabsTrigger value="summary" className="px-6">
                        Table Comparison
                      </TabsTrigger>
                      {isShowTa && (
                        <TabsTrigger value="meas-ta-4g" className="px-6">
                          TA
                        </TabsTrigger>
                      )}

                      {(aggMode === "kabupaten" || aggMode === "site-cell") && (
                        <TabsTrigger value="meas-plos-site-4g" className="px-6">
                          Packet Loss
                        </TabsTrigger>
                      )}

                      {isShowHqTutela && (
                        <TabsTrigger value="hq-tutela" className="px-6">
                          TUTELA
                        </TabsTrigger>
                      )}
                      {isShowHqRhi && (
                        <TabsTrigger value="hq-rhi" className="px-6">
                          RHI
                        </TabsTrigger>
                      )}
                      {/* <TabsTrigger value="site-info-4g" className="px-6">
                          Site Info
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
                    <ChartsSection4G
                      filteredData={filteredData}
                      chartLayout={chartLayout}
                      setChartLayout={setChartLayout}
                      aggregateBy={aggregateBy}
                      selectedKPIs={selectedKPIs}
                      onSelectedKPIsChange={setSelectedKPIs}
                      showViewModeState={showViewModeState}
                      aggMode={aggMode}
                    />
                  </TabsContent>

                  {/* Performance Summary Tab Content */}
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
                      fieldToAggregate={fieldToAggregate}
                    />
                  </TabsContent>

                  {/* Performance Tutela Tab Content */}
                  <TabsContent value="hq-tutela" className="mt-0">
                    <HqTutelaChart
                      apiPath={apiPathTutela}
                      fieldToAggregate={aggMode}
                      tutelaLevel={tutelaLevel}
                      tutelaProvider={tutelaProvider}
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
