"use client"; // Next.js App Router

import { Button } from "@/components/ui/button";

export default function GenerateButtonForPPT() {
  const handleExport = async () => {
    try {
      const PptxGenJS = (await import("pptxgenjs")).default;
      const pptx = new PptxGenJS();
      const slide = pptx.addSlide();

      // Add chart with Excel-like editability
      slide.addChart(
        "line",
        [
          {
            name: "Monthly Trend",
            labels: ["Jan", "Feb", "Mar"],
            values: [45, 62, 78],
          },
        ],
        { x: 1, y: 1, w: 8, h: 4 },
      );

      await pptx.writeFile({ fileName: "my-chart.pptx" });
    } catch (error) {
      console.error("Error generating PPT:", error);
    }
  };

  return <Button onClick={handleExport}>Export PPT with Chart</Button>;
}
