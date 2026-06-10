export const chartJsV1Settings = {
  titleFontSize: 16,
  titleFontFamily: "var(--font-roboto)",
  titleFontWeight: "bold" as "bold" | "normal" | "lighter" | "bolder",
  legendFontSize: 12,
  legendFontFamily: "var(--font-roboto)",
  legendFontWeight: "normal" as "bold" | "normal" | "lighter" | "bolder",
  tooltipTitleFontSize: 12,
  tooltipBodyFontSize: 9,
  yAxisTitleFontSize: 12,
  yAxisTitleFontWeight: "normal" as "bold" | "normal" | "lighter" | "bolder",
  yAxisTickFontSize: 11,
  xAxisTitleFontSize: 12,
  xAxisTickFontSize: 11,
  tooltipBackgroundColor: "rgba(0, 0, 0, 0.6)",
  yAxisTick: "var(--font-roboto)",
  yAxisTitle: "var(--font-roboto)",
  xAxisTick: "var(--font-roboto)",
  xAxisTitle: "var(--font-roboto)",
};

// (index * 137.5) % 360;
export const chartJsColors = [
  "hsl(240, 100%, 50%,0.8)",
  "hsl(0, 100%, 40%,0.8)",
  "hsl(120, 100%, 50%,0.8)",
  "hsl(190, 100%, 50%,0.8)",
  "hsl(327.5, 100%, 50%,0.8)",
  "hsl(85, 100%, 50%,0.8)",
  "hsl(215, 100%, 50%,0.8)",
  "hsl(157.5, 100%, 50%,0.8)",
  "hsl(295, 100%, 50%,0.8)",
  "hsl(72.5, 100%, 50%,0.8)",
  "hsl(210, 100%, 50%,0.8)",
  "hsl(347.5, 100%, 50%,0.8)",
  "hsl(125, 100%, 50%,0.8)",
  "hsl(262.5, 100%, 50%,0.8)",
  "hsl(40, 100%, 50%,0.8)",
  "hsl(177.5, 100%, 50%,0.8)",
  "hsl(315, 100%, 50%,0.8)",
  "hsl(92.5, 100%, 50%,0.8)",
  "hsl(230, 100%, 50%,0.8)",
  "hsl(7.5, 100%, 50%,0.8)",
  "hsl(145, 100%, 50%,0.8)",
  "hsl(282.5, 100%, 50%,0.8)",
  "hsl(60, 100%, 50%,0.8)",
  "hsl(197.5, 100%, 50%,0.8)",
  "hsl(335, 100%, 50%,0.8)",
  "hsl(112.5, 100%, 50%,0.8)",
  "hsl(250, 100%, 50%,0.8)",
  "hsl(27.5, 100%, 50%,0.8)",
  "hsl(165, 100%, 50%,0.8)",
];

export const chartJsColorsTransparent = chartJsColors.map(
  (color) => color.replace(/0\.8\)$/, "0.2)"), // Replace 0.8 opacity with 0.2
);

export const hexToRGBA = (hex: string, alpha: number) => {
  // Remove the # if present
  const hexx = hex.replace("#", "");

  // Parse the hex values
  const r = parseInt(hexx.substring(0, 2), 16);
  const g = parseInt(hexx.substring(2, 4), 16);
  const b = parseInt(hexx.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
