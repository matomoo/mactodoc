"use client";

import { BarChart3, Loader2, TrendingUp, User } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useVisits } from "../../hooks/useVisits";

interface CustomerData {
  id: string;
  customer_id: string;
  tanggal: string;
  sales_id: string;
  notes: string;
  created_at: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    created_at: string;
    contact_person: string;
  };
  sales: {
    id: string;
    roles: string;
    website: string | null;
    username: string | null;
    full_name: string;
    avatar_url: string | null;
    updated_at: string | null;
  };
}

interface ChartDataPoint {
  name: string;
  [key: string]: number | string;
}

interface SalesSummary {
  name: string;
  totalVisits: number;
  percentage: number;
  color: string;
}

export function VisitsChart() {
  const { data: visits = [], isLoading } = useVisits();

  // Calculate sales summary for cards
  const calculateSalesSummary = (): SalesSummary[] => {
    const salesMap: Record<string, number> = {};

    // Count visits per sales
    visits.forEach((item) => {
      const salesName = item.sales?.full_name;
      if (salesName) {
        salesMap[salesName] = (salesMap[salesName] || 0) + 1;
      }
    });

    const totalVisits = visits.length;
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

    return Object.entries(salesMap)
      .sort(([, a], [, b]) => b - a) // Sort by most visits first
      .map(([name, totalVisitsCount], index) => ({
        name,
        totalVisits: totalVisitsCount,
        percentage: totalVisits > 0 ? (totalVisitsCount / totalVisits) * 100 : 0,
        color: COLORS[index % COLORS.length],
      }));
  };

  const salesSummary = calculateSalesSummary();

  // Prepare data for line chart (existing logic)
  const processData = (): ChartDataPoint[] => {
    const groupedByDate: Record<string, Record<string, number>> = {};

    visits.forEach((item) => {
      const date = item.tanggal;
      const salesName = item.sales?.full_name;

      if (!date || !salesName) return;

      if (!groupedByDate[date]) {
        groupedByDate[date] = {};
      }

      if (!groupedByDate[date][salesName]) {
        groupedByDate[date][salesName] = 0;
      }

      groupedByDate[date][salesName] += 1;
    });

    return Object.keys(groupedByDate)
      .map((date) => {
        const point: ChartDataPoint = { name: date };
        Object.keys(groupedByDate[date]).forEach((salesName) => {
          point[salesName] = groupedByDate[date][salesName];
        });
        return point;
      })
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  };

  // Prepare data for bar chart (total visits per sales)
  const prepareBarChartData = () => {
    return salesSummary.map((sales) => ({
      name: sales.name,
      visits: sales.totalVisits,
      percentage: sales.percentage,
    }));
  };

  const getSalesNames = (): string[] => {
    const salesSet = new Set<string>();
    visits.forEach((item) => {
      const salesName = item.sales?.full_name;
      if (salesName) {
        salesSet.add(salesName);
      }
    });
    return Array.from(salesSet);
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];
  const chartData = processData();
  const barChartData = prepareBarChartData();
  const salesNames = getSalesNames();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No visit data available</h3>
        <p className="text-gray-500 mt-1">Start tracking visits to see analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sales Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {salesSummary.map((sales, index) => (
          <div
            key={sales.name}
            className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: sales.color }}
                >
                  {sales.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{sales.name}</h3>
                  <p className="text-sm text-gray-500">Sales Person</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{sales.totalVisits}</div>
                <div className="text-sm text-gray-500">visits</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Contribution</span>
                <span className="font-medium text-gray-900">{sales.percentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${sales.percentage}%`,
                    backgroundColor: sales.color,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="text-sm text-gray-500">Rank #{index + 1}</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                <span className="text-gray-600">of {visits.length} total visits</span>
              </div>
            </div>
          </div>
        ))}

        {/* Total Visits Summary Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Total Visits</h3>
              <p className="text-sm text-gray-500">All sales combined</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-900 mb-2">{visits.length}</div>
            <div className="text-sm text-gray-600">visits tracked</div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active Sales Persons</span>
              <span className="font-medium text-gray-900">{salesSummary.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Average per Sales</span>
              <span className="font-medium text-gray-900">
                {salesSummary.length > 0 ? (visits.length / salesSummary.length).toFixed(1) : 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h3 className="font-semibold text-lg mb-4">Visits Trend Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#666", fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis tick={{ fill: "#666", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number, name: string) => [`${value} visits`, `${name}`]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                {salesNames.map((salesName, index) => (
                  <Line
                    key={salesName}
                    type="monotone"
                    dataKey={salesName}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Total Visits per Sales */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h3 className="font-semibold text-lg mb-4">Visits Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fill: "#666", fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fill: "#666", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number, name: string, props: any) => {
                    if (name === "visits") {
                      return [`${value} visits`, "Total Visits"];
                    }
                    return [`${value}%`, "Percentage"];
                  }}
                  labelStyle={{ fontWeight: "bold" }}
                />
                <Legend />
                <Bar dataKey="visits" name="Total Visits" radius={[4, 4, 0, 0]}>
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Summary Section */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h3 className="font-semibold text-lg mb-4">Performance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {salesSummary.map((sales, index) => (
            <div key={sales.name} className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: sales.color }} />
                <span className="font-medium text-gray-900">{sales.name}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Visits</span>
                  <span className="font-medium">{sales.totalVisits}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Share</span>
                  <span className="font-medium">{sales.percentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rank</span>
                  <span className="font-medium">#{index + 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
