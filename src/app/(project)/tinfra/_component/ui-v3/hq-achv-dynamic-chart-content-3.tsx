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

// // Add this custom plugin above your ChartJS.register(...)
// const targetNeedlePlugin = {
//   id: "targetNeedle",
//   afterDraw(chart: any) {
//     const { ctx, chartArea } = chart;
//     const dataset = chart.data.datasets[0];
//     const meta = chart.getDatasetMeta(0);
//     if (!meta.data.length) return;

//     const arc = meta.data[0]; // first arc (current value)
//     const maxValue = dataset.data[0] + dataset.data[1]; // current + remaining
//     const targetValue = dataset.data[2]
//       ? chart.data.datasets[0]._targetValue
//       : 1;

//     // Center of the chart
//     const centerX = (chartArea.left + chartArea.right) / 2;
//     const centerY = chartArea.bottom; // bottom because rotation: -90, circumference: 180

//     const outerRadius = arc.outerRadius;
//     const innerRadius = arc.innerRadius;

//     // Map target value to angle (-90deg = start, +90deg = end for half gauge)
//     const targetRatio = targetValue / maxValue;
//     const startAngle = -Math.PI; // -180deg
//     const endAngle = 0; // 0deg
//     const targetAngle = startAngle + targetRatio * (endAngle - startAngle);

//     // Draw tick line
//     const tickLength = 5;
//     ctx.save();
//     ctx.beginPath();
//     ctx.moveTo(
//       centerX + (innerRadius - tickLength) * Math.cos(targetAngle),
//       centerY + (innerRadius - tickLength) * Math.sin(targetAngle),
//     );
//     ctx.lineTo(
//       centerX + (outerRadius + tickLength) * Math.cos(targetAngle),
//       centerY + (outerRadius + tickLength) * Math.sin(targetAngle),
//     );
//     ctx.strokeStyle = "#FF6F00"; // amber target color
//     ctx.lineWidth = 2.5;
//     ctx.setLineDash([4, 3]);
//     ctx.stroke();
//     ctx.restore();

//     // Draw small label "Target X%"
//     ctx.save();
//     ctx.font = "bold 10px sans-serif";
//     ctx.fillStyle = "#FF6F00";
//     ctx.textAlign = "center";
//     const labelX = centerX + (outerRadius + 22) * Math.cos(targetAngle);
//     const labelY = centerY + (outerRadius + 22) * Math.sin(targetAngle);
//     ctx.fillText(`T: ${targetValue}%`, labelX, labelY);
//     ctx.restore();
//   },
// };

// // Add to ChartJS.register(...)
// ChartJS.register(targetNeedlePlugin);

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

export default function HqAchvDynamicChartContent2({
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
    const currentValue = Math.abs(parseFloat((techData.ALL[0].value ?? 0).toString()));
    const target = parseFloat((techData.ALL[0].target_achv ?? 0).toString());
    const maxValue = parseFloat((techData.ALL[0].max_value ?? 0).toString());

    const isPassing = currentValue <= target;

    // Outer ring — achievement with zone coloring
    const outerData = isPassing
      ? [currentValue, target - currentValue] // [target, currentValue - target, maxValue - currentValue]
      : [target, target - currentValue]; // ok portion | over target | remaining

    const outerColors = isPassing
      ? ["#1E88E5", "#66BB6A", "#FFFFFF"] // blue | green | red
      : ["#1E88E5", "#EF5350", "#FFFFFF"]; // blue | red | gray

    // Inner ring — target marker
    const innerData = isPassing ? [target, 0] : [target, maxValue - target];
    const innerColors = ["#FF8F00", "#FFFFFF"]; // amber for target | gray for remaining

    return {
      datasets: [
        {
          label: "Achievement",
          data: outerData,
          backgroundColor: outerColors,
          borderWidth: 0,
          borderRadius: 5,
          spacing: 1,
          weight: 3, // outer ring is thicker
        },
        {
          label: "Target",
          data: innerData,
          backgroundColor: innerColors,
          borderWidth: 0,
          borderRadius: 5,
          spacing: 1,
          weight: 1, // inner ring is thinner
        },
      ],
    };
  };

  const getDoughnutChartOptions = (techData: TechGroupedData) => {
    const currentValue = Math.abs(parseFloat((techData.ALL[0].value ?? 0).toString()));

    const target = parseFloat((techData.ALL[0].target_achv ?? 0).toString());
    const isPassing = currentValue <= target;

    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "55%", // tighter cutout to give room for both rings
      circumference: 180,
      rotation: -90,
      plugins: {
        legend: {
          display: false, // use your own HTML legend below
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const { datasetIndex, dataIndex, parsed } = context;

              if (datasetIndex === 0) {
                // Outer ring — achievement
                const labels = isPassing ? ["Within target", "Safe zone"] : ["Within target", "Over target"];
                return `${labels[dataIndex]}: ${parsed.toFixed(2)}%`;
              }

              if (datasetIndex === 1) {
                // Inner ring — target
                const labels = ["Target", "-"];
                return `${labels[dataIndex]}: ${parsed.toFixed(2)}%`;
              }

              return "";
            },
          },
        },
        datalabels: {
          display: false,
        },
        annotation: {
          annotations: {
            centerLabel: {
              type: "doughnutLabel" as any,
              content: () => [`${currentValue.toFixed(2)}`, annotationLabel],
              drawTime: "beforeDraw" as const,
              position: { y: "80%" },
              font: { size: 16, weight: "bold" as const },
              color: !isPassing ? "#EF5350" : "#1E88E5",
              backgroundColor: "transparent",
              borderColor: "transparent",
            },
          },
        },
      },
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
