"use client";
// biome-ignore assist/source/organizeImports: <will fix later>
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ErrorState, exportToExcel, NoDataState } from "./additional-component";
import { useFilterStore } from "@/stores/filterStore";
import { Header } from "./header";
import { MobileFloatingButtons } from "./mobile-floating-buttons";
import { EnhancedLoadingState } from "./enhanced-loading-state";
import { useDataFilteringProductivityAll } from "../../_hooks/agg-use-data-filtering-productivity-all";
import { useSummaryMetricsProductivityAll } from "../../_hooks/use-summary-metrics-productivity-all";
import { formatDateForDisplay } from "../../_function/helper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { get2G4GMetricConfigs } from "./metric-configs";
import type { RawKpiRow } from "../../_lib/reportPerformance-3";
import { useComparisonDataProductivityAll } from "./use-comparison-data-productivity-all";
import FilterSidebarProductivityAll from "./agg-filter-sidebar-productivity-all";
import { type ChartDataItem, ProductivityAllCharts } from "./productivity-all-charts";
import { useDataManagementProductivityAll } from "../../_hooks/agg-use-data-management-productivity-all";
import PerformanceSummarySectionProductivityAll from "./performance-summary-section-productivity-all";

interface AggCustomProps {
  area?: string;
  apiPath: string;
  aggregateBy?: string;
  filterLabel?: string;
  columnNumber?: number;
  aggMode?: string;
  fieldToAggregate?: string;
}

export default function PageAggCustomProductivityAll({
  apiPath,
  aggregateBy = "CELL_NAME",
  filterLabel = "Cell Name",
  columnNumber = 2,
  aggMode = "custom-cluster",
  fieldToAggregate = "Column to aggregate",
}: AggCustomProps) {
  const { dateRange2, filter, siteId, nop, kabupaten, batch, clusterFilter } = useFilterStore();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [filterBy, setFilterBy] = useState<string>("cell");
  const [isPerformanceSummaryExpanded, setIsPerformanceSummaryExpanded] = useState<boolean>(false);
  const [chartLayout, setChartLayout] = useState<number>(columnNumber);
  const [activeTab, setActiveTab] = useState<string>("charts");

  const allMetricNums = useMemo(() => {
    return get2G4GMetricConfigs()
      .filter((a) => a.tech === "All")
      .map((chart) => chart.metric_num);
  }, []);

  const [selectedKPIs, setSelectedKPIs] = useState<string[]>(allMetricNums);

  const shouldFetch = !!dateRange2 && dateRange2.includes("|") && siteId !== null && siteId.length !== 0;

  const { isPending, error, data, isError } = useQuery({
    queryKey: [
      "productivity-all",
      apiPath,
      dateRange2,
      filter,
      siteId,
      nop,
      kabupaten,
      batch,
      clusterFilter,
      fieldToAggregate,
    ],
    queryFn: async () => {
      if (!shouldFetch || fieldToAggregate === "---") {
        return { rows: [] };
      }
      const response = await fetch(
        `/tinfra/api/${apiPath}?fieldToAggregate=${fieldToAggregate}&aggregateBy=${aggregateBy}&batch=${batch}&siteid=${siteId}&nop=${nop}&kabupaten=${kabupaten}&clusterFilter=${Array.isArray(clusterFilter) ? clusterFilter.join(",") : clusterFilter || ""}&tgl_1=${dateRange2?.split("|")[0]}&tgl_2=${dateRange2?.split("|")[1]}`,
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

  const dataManagement = useDataManagementProductivityAll({
    data,
    aggregateBy,
    rawDataSector: { rows: [] },
  });

  const { comparisonData } = useComparisonDataProductivityAll(data?.rows || [], "4G");

  const filteredComparisonData = useMemo(() => {
    if (data?.rows) {
      return comparisonData.filter((row) => selectedKPIs.includes(row.metric_num));
    }
    return [];
  }, [selectedKPIs, data?.rows, comparisonData]);

  const { filteredData } = useDataFilteringProductivityAll({
    data,
    filterBy,
    selectedCells: dataManagement.selectedCells,
    selectedSectors: dataManagement.selectedSectors,
    selectedBands: dataManagement.selectedBands,
    aggregateBy,
    rawDataSector: { rows: [] },
  });

  console.log({ filteredData });

  const { summaryMetrics } = useSummaryMetricsProductivityAll({
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

  return (
    <div className="min-h-screen">
      <Header
        onExportData={handleExportAllData}
        onToggleMobileFilters={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
        title={`Productivity ${
          aggMode === "custom-cluster"
            ? ` - ${Array.isArray(clusterFilter) ? clusterFilter.join(", ").toUpperCase() : clusterFilter || ""} - `
            : aggMode === "site"
              ? ` - ${Array.isArray(siteId) ? siteId.join(", ").toUpperCase() : siteId || ""} - `
              : ""
        } Level Daily`}
        subtitle={` ${aggMode === "nop" ? `Performance ${nop?.toUpperCase()} | ` : ""} Data ${formatDateForDisplay(dateRange2?.split("|")[0], 2)} - ${formatDateForDisplay(dateRange2?.split("|")[1], 2)}`}
        data={filteredData as unknown as RawKpiRow[]}
        selectedKPIs={selectedKPIs}
        filteredComparisonData={filteredComparisonData as unknown as RawKpiRow[]}
        groupBy={aggregateBy}
        showExportPpt={false}
      />

      <div className="py-4 lg:py-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Left sidebar - Filters */}

          <FilterSidebarProductivityAll
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

                      <TabsTrigger value="summary" className="px-6">
                        Table Comparison
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Charts Tab Content */}
                  <TabsContent value="charts" className="mt-0">
                    <div className="grid grid-cols-1 gap-4">
                      <ProductivityAllCharts data={filteredData as unknown as ChartDataItem[]} legendBy="All" />
                      <ProductivityAllCharts data={filteredData as unknown as ChartDataItem[]} legendBy="SITEID" />
                      <ProductivityAllCharts data={filteredData as unknown as ChartDataItem[]} legendBy="Tech" />
                    </div>
                  </TabsContent>

                  {/* Performance Summary Tab Content */}
                  {(aggregateBy === "G4_SITEID_CELLID" || aggregateBy === "SITEID" || aggregateBy === "G4_AGGRBY2") && (
                    <TabsContent value="summary" className="mt-0">
                      <PerformanceSummarySectionProductivityAll
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
