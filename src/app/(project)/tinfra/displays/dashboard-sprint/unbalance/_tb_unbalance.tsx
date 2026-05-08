/** biome-ignore-all lint/suspicious/noExplicitAny: <none> */
"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Line } from "react-chartjs-2";
import { useSummaryStore } from "@/stores/summaryStore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  ChartTooltip,
  ChartLegend,
  ChartDataLabels,
);

interface ApiDataItem {
  selected_date: string;
  branch: string;
  kotakab: string;
  mtd_traffic_this_year: number;
  mtd_traffic_last_year: number;
  mtd_traffic_diff: string;
  mtd_payload_this_year: number;
  mtd_payload_last_year: number;
  mtd_payload_diff: string;
  wow_traffic_current: number;
  wow_traffic_prior: number;
  wow_traffic_diff: string;
  wow_payload_current: number;
  wow_payload_prior: number;
  wow_payload_diff: string;

  region?: string;
  yoy_payload_growth_pct?: number;
  yoy_traffic_growth_pct?: number;
  wow_payload_growth_pct?: number;
  wow_traffic_growth_pct?: number;
  mtd_payload_growth_pct?: number;
  mtd_traffic_growth_pct?: number;
  mtd_this_year_traffic_growth_pct?: number;
  mtd_this_year_payload_growth_pct?: number;

  BEGIN_TIME: string;
  G4_DL_PRB_UTILIZATION_NUM: number;
  G4_DL_PRB_UTILIZATION_DENUM: number;
  G4_UL_PRB_UTILIZATION_NUM: number;
  G4_UL_PRB_UTILIZATION_DENUM: number;
  G4_USER_DL_THP_NUM: number;
  G4_USER_DL_THP_DENUM: number;
  G4_SECTOR: string;
  G4_BAND: string;
}

interface ApiResponse {
  rows: ApiDataItem[];
  source?: string;
  message?: string;
  ttl?: number;
}

interface IProps {
  unbalanceApiPath: string;
  productivityLevel?: string;
  productivityLocation?: string;
  productivityColumn?: string;
  title?: string;
}

export default function UnbalanceViewByTable({
  unbalanceApiPath = "aggregate/unbalance-view-table",
  data,
}: IProps & { data: any[] }) {
  const { yearweek, viewBy, nop, region, kabupaten, kecamatan, dateEnd } = useSummaryStore();
  const [isPolling, setIsPolling] = useState(false);
  const [sprintName, setSprintName] = useState("Sprint 6");
  const [sprintKpi, setSprintKpi] = useState("unbalance");
  const [sprintPic, setSprintPic] = useState("all");

  const maxDateActivityDone = data
    .filter((item: any) => item.Sprint === "Sprint 6" && item["Action Date"])
    .map((item) => new Date(item["Action Date"]).getTime())
    .reduce((max, current) => Math.max(max, current), 0);

  const uniqueSector = data
    .filter((item: any) => item.Sprint === "Sprint 6" && item["DONE/NY"].toUpperCase() === "DONE")
    .map((item: any) => item.unitID)
    .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index)
    .join(",");
  //   console.log({ uniqueSector });

  const tgl2 = maxDateActivityDone > 0 ? new Date(maxDateActivityDone).toISOString().split("T")[0] : null;

  //   console.log({
  //     maxDateActivityDone,
  //     tgl2,
  //   });

  const valueLocation =
    viewBy === "region" ? region : viewBy === "nop" ? nop : viewBy === "kabupaten" ? kabupaten : kecamatan;

  // Fetch productivity data by NOP
  const {
    data: unbalanceData,
    isLoading: unbalanceLoading,
    error: unbalanceError,
  } = useQuery<ApiResponse>({
    queryKey: ["unbalance-data", yearweek, unbalanceApiPath, valueLocation, dateEnd],
    queryFn: async () => {
      if (!unbalanceApiPath || unbalanceApiPath === "noUrl") {
        return { rows: [] };
      }

      const tgl1 = tgl2
        ? new Date(new Date(tgl2).getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        : "";

      const response = await fetch(
        [
          `${unbalanceApiPath}?fieldToAggregate=${viewBy}`,
          `${viewBy}=${valueLocation}`,
          `tgl_1=${tgl1}`,
          `tgl_2=${tgl2}`,
          `sector=${uniqueSector}`,
          `sprintKpi=${sprintKpi}`,
          `sprintName=${sprintName}`,
          `sprintPic=${sprintPic}`,
        ].join("&"),
      );

      if (response.status === 202) {
        setIsPolling(true);
        return { rows: [], source: "loading" };
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      if (result.source !== "loading") {
        setIsPolling(false);
      }

      // Handle API response format with rows property
      return result as ApiResponse;
    },
    enabled: !!(unbalanceApiPath && unbalanceApiPath !== "noUrl"),
    refetchOnWindowFocus: false,
    retry: 3,

    // Poll every 15 seconds when in loading state
    refetchInterval: isPolling ? 15000 : false,
    refetchIntervalInBackground: true,
  });

  const dataUnbalance: ApiDataItem[] = unbalanceData?.rows || [];

  console.log("debug:", { dataUnbalance });

  if (unbalanceLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (unbalanceError) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="text-red-500">Error: {unbalanceError.message}</p>
      </div>
    );
  }

  // Check if API is still preparing data
  if (unbalanceData?.source === "loading") {
    return (
      <div className="flex h-32 items-center justify-center">
        <p>Data is being prepared, please wait...</p>
      </div>
    );
  }

  if (dataUnbalance.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p>No data available</p>
      </div>
    );
  }

  // Get unique dates and sort them for chart display
  const uniqueDates = [...new Set(dataUnbalance.map((item) => item.BEGIN_TIME))].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );

  // Filter data to only include the last 3 dates for table
  const lastThreeDates = [...new Set(dataUnbalance.map((item) => item.BEGIN_TIME))]
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 3);

  const filteredData = dataUnbalance.filter((item) => lastThreeDates.includes(item.BEGIN_TIME));

  // Process data to group by sector and calculate metrics
  const processedData = filteredData.reduce((acc: any, item) => {
    const sector = item.G4_SECTOR;
    const band = item.G4_BAND;
    const beginTime = item.BEGIN_TIME;

    if (!acc[sector]) {
      acc[sector] = {
        sector,
        bands: {},
        allUtils: [],
        beginTimes: [],
      };
    }

    // Calculate utilization
    const dlUtil = (item.G4_DL_PRB_UTILIZATION_NUM / item.G4_DL_PRB_UTILIZATION_DENUM) * 100;
    const ulUtil = (item.G4_DL_PRB_UTILIZATION_NUM / item.G4_DL_PRB_UTILIZATION_DENUM) * 100;
    const avgUtil = (dlUtil + ulUtil) / 2;

    // Calculate throughput
    const dlThp = item.G4_USER_DL_THP_NUM / item.G4_USER_DL_THP_DENUM;
    const ulThp = item.G4_USER_DL_THP_NUM / item.G4_USER_DL_THP_DENUM;

    acc[sector].bands[band] = {
      util: avgUtil,
      thpDl: dlThp,
      thpUl: ulThp,
    };

    acc[sector].allUtils.push(avgUtil);
    acc[sector].beginTimes.push(beginTime);

    return acc;
  }, {});

  // Calculate min/max utilization for each sector
  Object.values(processedData).forEach((sectorData: any) => {
    const utils = sectorData.allUtils;
    sectorData.minUtil = Math.min(...utils);
    sectorData.maxUtil = Math.max(...utils);
  });

  const tableData = Object.values(processedData);

  // Prepare data for Chart.js
  const chartData = {
    labels: uniqueDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
    datasets: [
      {
        label: "LTE 900",
        data: uniqueDates
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
          .map((date) => {
            const dateData = dataUnbalance.filter((item) => item.BEGIN_TIME === date);
            const bandData = dateData.find((item) => item.G4_BAND === "LTE 900");
            if (bandData) {
              const dlUtil = (bandData.G4_DL_PRB_UTILIZATION_NUM / bandData.G4_DL_PRB_UTILIZATION_DENUM) * 100;
              const ulUtil = (bandData.G4_UL_PRB_UTILIZATION_NUM / bandData.G4_UL_PRB_UTILIZATION_DENUM) * 100;
              return ((dlUtil + ulUtil) / 2).toFixed(2);
            }
            return null;
          }),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
      },
      {
        label: "LTE 1800",
        data: uniqueDates
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
          .map((date) => {
            const dateData = dataUnbalance.filter((item) => item.BEGIN_TIME === date);
            const bandData = dateData.find((item) => item.G4_BAND === "LTE 1800");
            if (bandData) {
              const dlUtil = (bandData.G4_DL_PRB_UTILIZATION_NUM / bandData.G4_DL_PRB_UTILIZATION_DENUM) * 100;
              const ulUtil = (bandData.G4_UL_PRB_UTILIZATION_NUM / bandData.G4_UL_PRB_UTILIZATION_DENUM) * 100;
              return ((dlUtil + ulUtil) / 2).toFixed(2);
            }
            return null;
          }),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.1,
      },
      {
        label: "LTE 2100",
        data: uniqueDates
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
          .map((date) => {
            const dateData = dataUnbalance.filter((item) => item.BEGIN_TIME === date);
            const bandData = dateData.find((item) => item.G4_BAND === "LTE 2100");
            if (bandData) {
              const dlUtil = (bandData.G4_DL_PRB_UTILIZATION_NUM / bandData.G4_DL_PRB_UTILIZATION_DENUM) * 100;
              const ulUtil = (bandData.G4_UL_PRB_UTILIZATION_NUM / bandData.G4_UL_PRB_UTILIZATION_DENUM) * 100;
              return ((dlUtil + ulUtil) / 2).toFixed(2);
            }
            return null;
          }),
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.1,
      },
      {
        label: "LTE 2300",
        data: uniqueDates
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
          .map((date) => {
            const dateData = dataUnbalance.filter((item) => item.BEGIN_TIME === date);
            const bandData = dateData.find((item) => item.G4_BAND === "LTE 2300");
            if (bandData) {
              const dlUtil = (bandData.G4_DL_PRB_UTILIZATION_NUM / bandData.G4_DL_PRB_UTILIZATION_DENUM) * 100;
              const ulUtil = (bandData.G4_UL_PRB_UTILIZATION_NUM / bandData.G4_UL_PRB_UTILIZATION_DENUM) * 100;
              return ((dlUtil + ulUtil) / 2).toFixed(2);
            }
            return null;
          }),
        borderColor: "rgb(255, 205, 86)",
        backgroundColor: "rgba(255, 205, 86, 0.2)",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Utilization by Band Over Time",
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      x: {
        title: {
          display: false,
          text: "Date",
        },
        ticks: {
          maxRotation: 90,
          minRotation: 90,
          callback: (_value: any, index: number) => {
            const dateLabel = uniqueDates[index];
            const date = new Date(dateLabel);
            return date
              .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "2-digit",
              })
              .replace(" ", " ");
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Utilization (%)",
        },
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div className="h-screen space-y-6 overflow-x-auto">
      <div className="bg-white p-4 rounded-lg shadow">
        <div style={{ height: "400px" }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="rounded-md border">
        <table className="min-w-full divide-y divide-gray-200 ">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Util L9
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Util L18
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Util L21
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Util L23
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                THP DL L9
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                THP DL L18
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                THP DL L21
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                THP DL L23
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Min Util
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Max Util
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.map((sectorData: any) => (
              <tr key={sectorData.sector}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sectorData.sector}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sectorData.bands["LTE 900"]?.util?.toFixed(2) || "-"}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sectorData.bands["LTE 1800"]?.util?.toFixed(2) || "-"}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sectorData.bands["LTE 2100"]?.util?.toFixed(2) || "-"}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sectorData.bands["LTE 2300"]?.util?.toFixed(2) || "-"}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sectorData.bands["LTE 900"]?.thpDl?.toFixed(2) || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sectorData.bands["LTE 1800"]?.thpDl?.toFixed(2) || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sectorData.bands["LTE 2100"]?.thpDl?.toFixed(2) || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sectorData.bands["LTE 2300"]?.thpDl?.toFixed(2) || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sectorData.minUtil?.toFixed(2)}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sectorData.maxUtil?.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
