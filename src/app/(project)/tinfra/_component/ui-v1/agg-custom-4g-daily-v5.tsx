"use client";
// biome-ignore assist/source/organizeImports: <will fix later>
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ErrorState, exportToExcel, NoDataState } from "./additional-component";
import { useFilterStore } from "@/stores/filterStore";
import { Header } from "./header";
import { MobileFloatingButtons } from "./mobile-floating-buttons";
import FilterSidebar4G from "./filter-sidebar-4g";
import PerformanceSummarySection4G from "./performance-summary-section-4g";
import { ChartsSection4G } from "./charts-section-4g";
import { EnhancedLoadingState } from "./enhanced-loading-state";
import { useDataManagement4G } from "../../_hooks/use-data-management-4g";
import { useDataFiltering4G } from "../../_hooks/use-data-filtering-4g";
import { useSummaryMetrics4G } from "../../_hooks/use-summary-metrics-4g";
import { formatDateForDisplay } from "../../_function/helper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageSiteInfo from "./site-info-4g";
import { get2G4GMetricConfigs } from "./metric-configs";
import MeasTa4G from "./meas-ta-4g";
import MeasPlosSite4G from "./meas-plos-site-4g-site";

interface AggCustomProps {
  area?: string;
  apiPath: string;
  aggregateBy?: string;
  filterLabel?: string;
  columnNumber?: number;
}

export default function PageAggCustom4GDaily({
  apiPath,
  aggregateBy = "CELL_NAME",
  filterLabel = "Cell Name",
  columnNumber = 2,
}: AggCustomProps) {
  const { dateRange2, filter, siteId, nop, kabupaten, batch } = useFilterStore();
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

  const shouldFetch = !!dateRange2 && dateRange2.includes("|") && siteId?.length === 6;

  const { isPending, error, data, isError } = useQuery({
    queryKey: ["PageAggCustom4GDaily", apiPath, dateRange2, filter, siteId, nop, kabupaten, batch],
    queryFn: async () => {
      if (!shouldFetch) {
        return { rows: [] };
      }
      const response = await fetch(
        `/tinfra/api/meas-db-ti-sul/${apiPath}?batch=${batch}&siteId=${siteId}&nop=${nop}&kabupaten=${kabupaten}&tgl_1=${dateRange2?.split("|")[0]}&tgl_2=${dateRange2?.split("|")[1]}`,
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

  const dataManagement = useDataManagement4G({ data, aggregateBy });
  const { filteredData } = useDataFiltering4G({
    data,
    filterBy,
    selectedCells: dataManagement.selectedCells,
    selectedSectors: dataManagement.selectedSectors,
    selectedBands: dataManagement.selectedBands,
    aggregateBy,
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

    const filename = `4G_Data__${new Date().toISOString().split("T")[0]}`;
    exportToExcel(data.rows, filename);
  };

  if (siteId?.length !== 6) return <NoDataState message="Site ID must be 6 characters long" />;
  if (isPending) return <EnhancedLoadingState />;
  if (isError) return <ErrorState message={error.message} />;
  if (!shouldFetch) return <NoDataState message="Please select a date range to view data" />;
  if (!data?.rows || data.rows.length === 0) {
    return <NoDataState message="No data available for the selected criteria." />;
  }

  return (
    <div className="min-h-screen">
      <Header
        onExportData={handleExportAllData}
        onToggleMobileFilters={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
        title="4G Site Level Daily"
        subtitle={`Performance Site ${siteId} | Data ${formatDateForDisplay(dateRange2?.split("|")[0], 2)} - ${formatDateForDisplay(dateRange2?.split("|")[1], 2)}`}
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
          />

          {/* Main content */}
          <div className="lg:col-span-9">
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
                      <TabsTrigger value="meas-ta-4g" className="px-6">
                        TA
                      </TabsTrigger>
                      <TabsTrigger value="meas-plos-site-4g" className="px-6">
                        Packet Loss
                      </TabsTrigger>
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

                  {/* Performance Site Info Tab Content */}
                  <TabsContent value="meas-ta-4g" className="mt-0">
                    <MeasTa4G apiPath={"meas-ta-site-4g"} aggregateBy="CELL_NAME" filterLabel="Cell Name" />
                  </TabsContent>

                  {/* Performance Site Info Tab Content */}
                  {/* <TabsContent value="site-info-4g" className="mt-0">
                    <PageSiteInfo apiPath={"site-info-4g"} aggregateBy="CELL_NAME" filterLabel="Cell Name" />
                  </TabsContent> */}
                  <TabsContent value="meas-plos-site-4g" className="mt-0">
                    <MeasPlosSite4G
                      apiPath={"aggregate/plos-dy-site-4g"}
                      aggregateBy={"site"}
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
