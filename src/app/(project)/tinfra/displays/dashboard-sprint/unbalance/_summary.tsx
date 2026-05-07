/** biome-ignore-all lint/suspicious/noExplicitAny: <none> */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { getSheetData } from "../../../_lib/googleSheets";
import { ActivityLogChart, type ActivityLogPoint } from "./_chart";

export default async function Summary() {
  const data = await getSheetData("1LrmNvW_drnU6tUVGxwr_wrAySjKj6wTenxGHc0XipGk", "1000919754");

  const activityAll = data.filter((item: any) => item.Sprint === "Sprint 6");
  const activityDone = data.filter(
    (item: any) => item.Sprint === "Sprint 6" && item["DONE/NY"]?.toUpperCase() === "DONE",
  );
  const activitySkip = data.filter(
    (item: any) =>
      item.Sprint === "Sprint 6" &&
      (item["DONE/NY"]?.toUpperCase() === "SKIP" || item["DONE/NY"]?.toUpperCase() === "LLR"),
  );
  const activityNy = data.filter((item: any) => item.Sprint === "Sprint 6" && item["DONE/NY"]?.toUpperCase() === "NY");
  const activityDoneSkip = data.filter(
    (item: any) =>
      item.Sprint === "Sprint 6" &&
      (item["DONE/NY"]?.toUpperCase() === "DONE" ||
        item["DONE/NY"]?.toUpperCase() === "SKIP" ||
        item["DONE/NY"]?.toUpperCase() === "LLR"),
  );
  const activityDone_GetSiteId = data.filter(
    (item: any) => item.Sprint === "Sprint 6" && item["DONE/NY"]?.toUpperCase() === "DONE",
  );

  const total = activityAll.length;
  const done = activityDone.length;
  const skip = activitySkip.length;
  const achievement = total > 0 ? Math.round(((done + skip) / total) * 100) : 0;

  const picMap: Record<string, { total: number; done: number; llr: number; ny: number }> = {};

  activityAll.forEach((item: any) => {
    const pic = item["PIC"]?.trim() || "Unknown";
    if (!picMap[pic]) picMap[pic] = { total: 0, done: 0, llr: 0, ny: 0 };
    picMap[pic].total += 1;
    const status = item["DONE/NY"]?.toUpperCase();
    if (status === "DONE") picMap[pic].done += 1;
    else if (status === "LLR" || status === "SKIP") picMap[pic].llr += 1;
    else if (status === "NY") picMap[pic].ny += 1;
  });

  const picRows = Object.entries(picMap)
    .map(([pic, s]) => ({
      pic,
      ...s,
      achievement: s.total > 0 ? Math.round((s.done / s.total) * 100) : 0,
    }))
    .sort((a, b) => b.achievement - a.achievement);

  // --- Activity log chart: DONE count grouped by Action Date ---
  // Parse multiple date formats and bucket DONE items per date
  const parseDateLabel = (raw: string): string | null => {
    if (!raw?.trim()) return null;

    let date: Date | null = null;
    const trimmed = raw.trim();

    // Try M/D/YYYY format (e.g., "5/5/2026", "4/30/2026")
    if (trimmed.includes("/")) {
      const parts = trimmed.split("/");
      if (parts.length === 3) {
        const [m, d, y] = parts.map(Number);
        if (!Number.isNaN(m) && !Number.isNaN(d) && !Number.isNaN(y)) {
          date = new Date(y, m - 1, d);
        }
      }
    }

    // Try D-MMM-YY or D MMM YY format (e.g., "4-May-26", "4 May 26")
    if (!date && (trimmed.includes("-") || /\s/.test(trimmed))) {
      const parts = trimmed.replace(/-/g, " ").split(/\s+/);
      if (parts.length === 3) {
        const [d, month, year] = parts;
        const dayNum = parseInt(d);
        const yearNum = parseInt(year);

        // Handle 2-digit years (convert to current century)
        const fullYear = yearNum < 100 ? 2000 + yearNum : yearNum;

        const monthMap: Record<string, number> = {
          jan: 0,
          feb: 1,
          mar: 2,
          apr: 3,
          may: 4,
          jun: 5,
          jul: 6,
          aug: 7,
          sep: 8,
          oct: 9,
          nov: 10,
          dec: 11,
        };

        const monthNum = monthMap[month.toLowerCase().substring(0, 3)];
        if (!Number.isNaN(dayNum) && !Number.isNaN(yearNum) && monthNum !== undefined) {
          date = new Date(fullYear, monthNum, dayNum);
        }
      }
    }

    if (!date || Number.isNaN(date.getTime())) return null;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const dateCountMap: Record<string, number> = {};
  const dateOrderMap: Record<string, Date> = {};

  activityDoneSkip.forEach((item: any) => {
    const raw: string = item["Action Date"] ?? "";
    const label = parseDateLabel(raw);
    if (!label) return;
    dateCountMap[label] = (dateCountMap[label] ?? 0) + 1;
    if (!dateOrderMap[label]) {
      // Parse the date again to get the actual Date object for ordering
      let date: Date | null = null;
      const trimmed = raw.trim();

      // Try M/D/YYYY format
      if (trimmed.includes("/")) {
        const parts = trimmed.split("/");
        if (parts.length === 3) {
          const [m, d, y] = parts.map(Number);
          if (!Number.isNaN(m) && !Number.isNaN(d) && !Number.isNaN(y)) {
            date = new Date(y, m - 1, d);
          }
        }
      }

      // Try D-MMM-YY or D MMM YY format
      if (!date && (trimmed.includes("-") || /\s/.test(trimmed))) {
        const parts = trimmed.replace(/-/g, " ").split(/\s+/);
        if (parts.length === 3) {
          const [d, month, year] = parts;
          const dayNum = parseInt(d);
          const yearNum = parseInt(year);

          const fullYear = yearNum < 100 ? 2000 + yearNum : yearNum;

          const monthMap: Record<string, number> = {
            jan: 0,
            feb: 1,
            mar: 2,
            apr: 3,
            may: 4,
            jun: 5,
            jul: 6,
            aug: 7,
            sep: 8,
            oct: 9,
            nov: 10,
            dec: 11,
          };

          const monthNum = monthMap[month.toLowerCase().substring(0, 3)];
          if (!Number.isNaN(dayNum) && !Number.isNaN(yearNum) && monthNum !== undefined) {
            date = new Date(fullYear, monthNum, dayNum);
          }
        }
      }

      if (date) {
        dateOrderMap[label] = date;
      }
    }
  });

  const activityLogPoints: ActivityLogPoint[] = Object.entries(dateCountMap)
    .sort(([a], [b]) => dateOrderMap[a].getTime() - dateOrderMap[b].getTime())
    .reduce<ActivityLogPoint[]>((acc, [date, count]) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].count : 0;
      acc.push({ date, count: prev + count });
      return acc;
    }, []);

  // Target = 80% of unique SITE IDs in Sprint
  const uniqueSites = new Set(activityAll.map((item: any) => item["unitID"]?.trim()).filter(Boolean));
  const activityLogTarget = Math.round(uniqueSites.size * 0.8);

  const stats = [
    {
      label: "All Activities",
      value: total,
      badge: "TOTAL",
      badgeStyle: { backgroundColor: "#e2e8f0", color: "#475569" },
      valueStyle: { color: "#0f172a" },
      borderStyle: { borderColor: "#cbd5e1" },
    },
    {
      label: "Done",
      value: done,
      badge: "DONE",
      badgeStyle: { backgroundColor: "#dcfce7", color: "#166534" },
      valueStyle: { color: "#16a34a" },
      borderStyle: { borderColor: "#86efac" },
    },
    {
      label: "Low Level Review",
      value: activitySkip.length,
      badge: "LLR",
      badgeStyle: { backgroundColor: "#dbeafe", color: "#1e40af" },
      valueStyle: { color: "#2563eb" },
      borderStyle: { borderColor: "#93c5fd" },
    },
    {
      label: "Not Yet",
      value: activityNy.length,
      badge: "NY",
      badgeStyle: { backgroundColor: "#fee2e2", color: "#991b1b" },
      valueStyle: { color: "#dc2626" },
      borderStyle: { borderColor: "#fca5a5" },
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "24px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#94a3b8",
            marginBottom: "4px",
          }}
        >
          Sprint 6
        </p>
        <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#0f172a" }}>Activity Dashboard</h1>
      </div>

      {/* Achievement Card */}
      <Card
        style={{
          marginBottom: "24px",
          backgroundColor: "#ffffff",
          borderColor: "#e2e8f0",
        }}
      >
        <CardHeader style={{ paddingBottom: "8px" }}>
          <CardTitle
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Sprint Achievement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                fontSize: "48px",
                fontWeight: 700,
                color: "#16a34a",
                lineHeight: 1,
              }}
            >
              {achievement}%
            </span>
            <span
              style={{
                fontSize: "14px",
                color: "#94a3b8",
                marginBottom: "4px",
              }}
            >
              {done} of {total} activities completed
            </span>
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: "100%",
              height: "10px",
              borderRadius: "9999px",
              backgroundColor: "#f1f5f9",
            }}
          >
            <div
              style={{
                height: "10px",
                borderRadius: "9999px",
                backgroundColor: "#22c55e",
                width: `${achievement}%`,
                transition: "width 0.5s ease",
              }}
            />
          </div>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "12px",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "12px", color: "#16a34a" }}>✓ {done} Done</span>
            <span style={{ fontSize: "12px", color: "#2563eb" }}>◎ {activitySkip.length} LLR</span>
            <span style={{ fontSize: "12px", color: "#dc2626" }}>✕ {activityNy.length} NY</span>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
              — {total - done - activitySkip.length - activityNy.length} Other
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {stats.map((stat) => (
          <Card
            key={stat.label}
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid",
              ...stat.borderStyle,
            }}
          >
            <CardContent style={{ paddingTop: "20px" }}>
              <span
                style={{
                  display: "inline-block",
                  fontSize: "11px",
                  fontWeight: 500,
                  padding: "2px 8px",
                  borderRadius: "4px",
                  marginBottom: "12px",
                  ...stat.badgeStyle,
                }}
              >
                {stat.badge}
              </span>
              <p
                style={{
                  fontSize: "36px",
                  fontWeight: 700,
                  ...stat.valueStyle,
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  marginTop: "4px",
                }}
              >
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Log Chart — DONE count by Action Date */}
      <Card
        style={{
          backgroundColor: "#ffffff",
          borderColor: "#e2e8f0",
          marginBottom: "24px",
        }}
      >
        <CardHeader style={{ paddingBottom: "8px" }}>
          <CardTitle
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Activity Log — Done by Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginBottom: "12px",
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Done", color: "#22c55e", dashed: false },
              {
                label: `Target (80% of ${uniqueSites.size} sites = ${activityLogTarget})`,
                color: "#f59e0b",
                dashed: true,
              },
            ].map((item) => (
              <span
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                <span
                  style={{
                    width: "20px",
                    height: item.dashed ? "0px" : "10px",
                    borderRadius: item.dashed ? "0" : "2px",
                    backgroundColor: item.dashed ? "transparent" : item.color,
                    borderTop: item.dashed ? `2px dashed ${item.color}` : "none",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                {item.label}
              </span>
            ))}
          </div>

          <div style={{ position: "relative", height: "260px" }}>
            <ActivityLogChart points={activityLogPoints} target={activityLogTarget} />
          </div>
        </CardContent>
      </Card>

      {/* Achievement by PIC Table */}
      <Card style={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0" }}>
        <CardHeader style={{ paddingBottom: "8px" }}>
          <CardTitle
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Achievement by PIC
          </CardTitle>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          <Table>
            <TableHeader>
              <TableRow
                style={{
                  borderBottomColor: "#e2e8f0",
                  backgroundColor: "#f8fafc",
                }}
              >
                <TableHead
                  style={{
                    color: "#64748b",
                    fontWeight: 500,
                    fontSize: "12px",
                  }}
                >
                  #
                </TableHead>
                <TableHead
                  style={{
                    color: "#64748b",
                    fontWeight: 500,
                    fontSize: "12px",
                  }}
                >
                  PIC
                </TableHead>
                <TableHead
                  style={{
                    color: "#64748b",
                    fontWeight: 500,
                    fontSize: "12px",
                    textAlign: "center",
                  }}
                >
                  Total
                </TableHead>
                <TableHead
                  style={{
                    color: "#64748b",
                    fontWeight: 500,
                    fontSize: "12px",
                    textAlign: "center",
                  }}
                >
                  Done
                </TableHead>
                <TableHead
                  style={{
                    color: "#64748b",
                    fontWeight: 500,
                    fontSize: "12px",
                    textAlign: "center",
                  }}
                >
                  LLR
                </TableHead>
                <TableHead
                  style={{
                    color: "#64748b",
                    fontWeight: 500,
                    fontSize: "12px",
                    textAlign: "center",
                  }}
                >
                  NY
                </TableHead>
                <TableHead
                  style={{
                    color: "#64748b",
                    fontWeight: 500,
                    fontSize: "12px",
                  }}
                >
                  Achievement
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {picRows.map((row, i) => (
                <TableRow key={row.pic} style={{ borderBottomColor: "#f1f5f9" }}>
                  <TableCell style={{ color: "#94a3b8", fontSize: "13px" }}>{i + 1}</TableCell>
                  <TableCell
                    style={{
                      color: "#0f172a",
                      fontWeight: 500,
                      fontSize: "14px",
                    }}
                  >
                    {row.pic}
                  </TableCell>
                  <TableCell
                    style={{
                      textAlign: "center",
                      color: "#475569",
                      fontSize: "13px",
                    }}
                  >
                    {row.total}
                  </TableCell>
                  <TableCell style={{ textAlign: "center" }}>
                    <span
                      style={{
                        color: "#16a34a",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      {row.done}
                    </span>
                  </TableCell>
                  <TableCell style={{ textAlign: "center" }}>
                    <span
                      style={{
                        color: "#2563eb",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      {row.llr}
                    </span>
                  </TableCell>
                  <TableCell style={{ textAlign: "center" }}>
                    <span
                      style={{
                        color: "#dc2626",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      {row.ny}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: "6px",
                          borderRadius: "9999px",
                          backgroundColor: "#f1f5f9",
                          minWidth: "60px",
                        }}
                      >
                        <div
                          style={{
                            height: "6px",
                            borderRadius: "9999px",
                            width: `${row.achievement}%`,
                            backgroundColor:
                              row.achievement >= 75 ? "#22c55e" : row.achievement >= 40 ? "#f59e0b" : "#ef4444",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          width: "36px",
                          textAlign: "right",
                          color: row.achievement >= 75 ? "#16a34a" : row.achievement >= 40 ? "#d97706" : "#dc2626",
                        }}
                      >
                        {row.achievement}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
