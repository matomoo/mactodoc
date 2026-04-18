/** biome-ignore-all lint/suspicious/noExplicitAny: <none> */
"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import ChartAnnotation from "chartjs-plugin-annotation";
import { useSummaryStore } from "@/stores/summaryStore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  ChartLegend,
  ChartDataLabels,
  ChartAnnotation,
);

interface ChartDataItem {
  provider: string;
  value: number;
  wow_diff: number | null;
  rank: number | null;
  target_achv: number | null;
  max_value: number | null;
  tech: string | null;
}

interface TechGroupedData {
  [tech: string]: ChartDataItem[];
}

interface ApiDataItem {
  wow_pct_achv_unbalance_p1: string;
}

interface IProps {
  apiPath: string;
  chartMaxValue?: number;
  targetValue?: number;
  annotationLabel?: string;
  kpiColumnValue?: string;
}

export default function HqAchvDynamicChartContent({
  apiPath,
  chartMaxValue = 100,
  targetValue = 1,
  annotationLabel = "Target",
  kpiColumnValue = "pct_achv_unbalance_p1",
}: IProps) {
  const { yearweek, viewBy, nop, region, kabupaten, kecamatan } = useSummaryStore();

  const valueLocation =
    viewBy === "region" ? region : viewBy === "nop" ? nop : viewBy === "kabupaten" ? kabupaten : kecamatan;

  const {
    data: unbalanceRawData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["unbalance-data", yearweek, apiPath, valueLocation],
    queryFn: async () => {
      if (!apiPath || apiPath === "noUrl") {
        return [];
      }

      const response = await fetch(
        [
          `${apiPath}?level=${viewBy}`,
          `valueLocation=${valueLocation}`,
          `yearweek=${yearweek}`,
          `fieldToAggregate=${viewBy}`,
        ].join("&"),
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Handle API response format with rows property
      const dataArray = result.rows || result || [];

      return dataArray as ApiDataItem[];
    },
    enabled: !!(apiPath && apiPath !== "noUrl"),
  });

  const dataUnbalance = unbalanceRawData || [];

  // console.log("debug:", { apiPath, dataUnbalance });

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="text-red-500">Error: {error.message}</p>
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

  // Group data by KPI for new aggregated structure
  const groupedData = (Array.isArray(dataUnbalance) ? dataUnbalance : []).reduce(
    (acc, item: ApiDataItem) => {
      const kpiColumns = Array.isArray(kpiColumnValue) ? kpiColumnValue : [kpiColumnValue];

      kpiColumns.forEach((kpiColumn) => {
        const value = item[kpiColumn as keyof ApiDataItem];
        if (value !== null && value !== undefined && value !== "") {
          if (!acc[kpiColumn]) {
            acc[kpiColumn] = {} as TechGroupedData;
          }

          const tech = "ALL";
          if (!acc[kpiColumn][tech]) {
            acc[kpiColumn][tech] = [];
          }

          // Get corresponding WOW value
          const wowColumn = `wow_${kpiColumn}`;

          acc[kpiColumn][tech].push({
            provider: "item.region", // Use region as provider name
            value: parseFloat(String(value)),
            wow_diff: item[wowColumn as keyof ApiDataItem]
              ? parseFloat(String(item[wowColumn as keyof ApiDataItem]))
              : null,
            rank: null, // No rank data in new structure
            tech: tech,
            target_achv: targetValue,
            max_value: chartMaxValue,
          });
        }
      });

      return acc;
    },
    {} as Record<string, TechGroupedData>,
  );

  // Doughnut chart configuration
  const getDoughnutChartData = (techData: TechGroupedData) => {
    const currentValue = parseFloat((techData.ALL[0].value ?? 0).toString());
    const targetValue = parseFloat((techData.ALL[0].target_achv ?? 0).toString());
    const maxValue = parseFloat((techData.ALL[0].max_value ?? 0).toString());

    return {
      labels: ["Current", "Remaining", "Target"],
      datasets: [
        {
          data: [
            Math.abs(currentValue),
            Math.max(0, maxValue - Math.abs(parseFloat((techData.ALL[0].value ?? 0).toString()))),
            1,
          ],
          backgroundColor: [
            // unbalance: pass = currentValue <= targetValue
            currentValue > targetValue ? "#90CAF9" : "#1E88E5",
            "#D3D3D3",
            "#9E9E9E",
          ],
          borderWidth: 0,
          borderRadius: 15,
          spacing: 5,
        },
      ],
    };
  };

  const getDoughnutChartOptions = (techData: TechGroupedData) => {
    const currentValue = parseFloat((techData.ALL[0].value ?? 0).toString());
    const targetValue = parseFloat((techData.ALL[0].target_achv ?? 0).toString());
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context: any) => `${context.label}: ${context.parsed.toFixed(2)}%`,
          },
        },
        datalabels: {
          display: false,
        },
        annotation: {
          annotations: {
            centerLabel: {
              type: "doughnutLabel" as any,
              content: ({ chart }: any) => [`${chart.data.datasets[0].data[0].toFixed(2)} %`, annotationLabel],
              drawTime: "beforeDraw" as const,
              position: {
                y: "80%",
              },
              font: {
                size: 16,
                weight: "bold" as const,
              },
              color: currentValue > targetValue ? "#90CAF9" : "#1E88E5",
              backgroundColor: "transparent",
              borderColor: "transparent",
            },
          },
        },
      },
      cutout: "70%",
      circumference: 180,
      rotation: -90,
    };
  };

  return (
    <div className="space-y-2">
      {Object.entries(groupedData).map(([metric, techData]) => (
        <div key={metric} className="flex flex-row items-center lg:overflow-x-auto">
          <div className="ml-8">
            {techData && (
              <div
                style={{
                  width: "200px",
                  height: "200px",
                  position: "relative",
                }}
              >
                <Doughnut data={getDoughnutChartData(techData)} options={getDoughnutChartOptions(techData)} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
