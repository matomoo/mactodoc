"use client";

import { useEffect, useRef } from "react";

import { Chart, type ChartDataset, registerables } from "chart.js";

Chart.register(...registerables);

interface PicRow {
  pic: string;
  total: number;
  done: number;
  llr: number;
  ny: number;
  achievement: number;
}

interface SprintSummary {
  sprint: string;
  done: number;
  llr: number;
  ny: number;
  total: number;
}

interface ActivityChartProps {
  picRows: PicRow[];
  sprintSummary: SprintSummary[];
}

export function ActivityDonutChart({ done, llr, ny, total }: { done: number; llr: number; ny: number; total: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: ["Done", "LLR", "Not Yet"],
        datasets: [
          {
            data: [done, llr, ny],
            backgroundColor: ["#22c55e", "#3b82f6", "#ef4444"],
            borderColor: ["#16a34a", "#2563eb", "#dc2626"],
            borderWidth: 1.5,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const pct = Math.round((ctx.parsed / total) * 100);
                return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
              },
            },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [done, llr, ny, total]);

  return <canvas ref={canvasRef} role="img" aria-label="Donut chart of activity status distribution" />;
}

export function PicBarChart({ picRows }: { picRows: PicRow[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = picRows.map((r) => r.pic);

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Done",
            data: picRows.map((r) => r.done),
            backgroundColor: "#22c55e",
            borderColor: "#16a34a",
            borderWidth: 0.5,
            borderRadius: 3,
            borderSkipped: false,
          },
          {
            label: "LLR",
            data: picRows.map((r) => r.llr),
            backgroundColor: "#3b82f6",
            borderColor: "#2563eb",
            borderWidth: 0.5,
            borderRadius: 3,
            borderSkipped: false,
          },
          {
            label: "Not Yet",
            data: picRows.map((r) => r.ny),
            backgroundColor: "#ef4444",
            borderColor: "#dc2626",
            borderWidth: 0.5,
            borderRadius: 3,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              afterBody: (items) => {
                const pic = picRows[items[0].dataIndex];
                return [`Achievement: ${pic.achievement}%`];
              },
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: { color: "rgba(0,0,0,0.06)" },
            ticks: {
              color: "#94a3b8",
              font: { size: 11 },
              stepSize: 1,
            },
            title: {
              display: true,
              text: "Number of activities",
              color: "#94a3b8",
              font: { size: 11 },
            },
          },
          y: {
            stacked: true,
            grid: { display: false },
            ticks: { color: "#475569", font: { size: 12 } },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [picRows]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Horizontal stacked bar chart showing done, LLR, and not yet counts per PIC"
    />
  );
}

export interface ActivityLogPoint {
  date: string; // formatted label, e.g. "Jan 28"
  count: number; // DONE count on that date
}

export function ActivityLogChart({ points, target }: { points: ActivityLogPoint[]; target: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = points.map((p) => p.date);
    const counts = points.map((p) => p.count);
    const targetData = points.map(() => target);

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            type: "bar",
            label: "Done",
            data: counts,
            backgroundColor: "#22c55e",
            borderColor: "#16a34a",
            borderWidth: 0.5,
            borderRadius: 4,
            borderSkipped: false,
            order: 2,
          } as ChartDataset<"bar">,
          {
            type: "line",
            label: "Target (20%)",
            data: targetData,
            borderColor: "#f59e0b",
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 0,
            pointHoverRadius: 0,
            fill: false,
            tension: 0,
            order: 1,
          } as ChartDataset<"bar" | "line">,
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => `Date: ${items[0].label}`,
              label: (ctx) => {
                if (ctx.dataset.label === "Target (20%)") return ` Target: ${target} sites`;
                return ` Done: ${ctx.parsed.y}`;
              },
              afterBody: (items) => {
                const done = items.find((i) => i.dataset.label === "Done")?.parsed.y ?? 0;
                const pct = target > 0 ? Math.round((done / target) * 100) : 0;
                return [`vs Target: ${pct}%`];
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: "#94a3b8",
              font: { size: 11 },
              maxRotation: 45,
              autoSkip: false,
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(0,0,0,0.05)" },
            ticks: {
              color: "#94a3b8",
              font: { size: 11 },
              stepSize: 1,
              precision: 0,
            },
            title: {
              display: true,
              text: "DONE count",
              color: "#94a3b8",
              font: { size: 11 },
            },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [points, target]);

  return <canvas ref={canvasRef} role="img" aria-label="Bar chart of daily DONE activity count with target line" />;
}
