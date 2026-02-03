"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useMemo, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useSalesTransactions } from "../../hooks/useSalesTransactions";
import {
  formatCurrency,
  summarizeSalesByCategory,
  summarizeSalesByCustomer,
  summarizeSalesByRegion,
  summarizeSalesBySalesperson,
  summarizeSalesByType,
} from "../../utils/sales-utils";
import { useDateFilterStore } from "@/stores/date-filter-store";
import { filterTransactionsByDateRange, formatDateRange } from "../../utils/date-utils";

type SortField = "customer" | "total_sales" | "transaction_count" | "region" | "salesperson" | "type" | "category";
type SortDirection = "asc" | "desc";

export function SalesTransactionsChart() {
  const { data: allTransactions = [], isLoading } = useSalesTransactions();
  const [searchQuery, _setSearchQuery] = useState("");
  const [sortField, _setSortField] = useState<SortField>("total_sales");
  const [sortDirection, _setSortDirection] = useState<SortDirection>("desc");

  const { startMonth, startYear, endMonth, endYear } = useDateFilterStore();

  // Filter transactions based on date range
  const filteredTransactions = useMemo(() => {
    return filterTransactionsByDateRange(allTransactions, startMonth, startYear, endMonth, endYear);
  }, [allTransactions, startMonth, startYear, endMonth, endYear]);

  // Process data with filtered transactions
  const customerSummaries = useMemo(() => {
    return summarizeSalesByCustomer(filteredTransactions);
  }, [filteredTransactions]);

  const regionSummaries = useMemo(() => {
    return summarizeSalesByRegion(filteredTransactions);
  }, [filteredTransactions]);

  const salespersonSummaries = useMemo(() => {
    return summarizeSalesBySalesperson(filteredTransactions);
  }, [filteredTransactions]);

  const typeSummaries = useMemo(() => {
    return summarizeSalesByType(filteredTransactions);
  }, [filteredTransactions]);

  const categorySummaries = useMemo(() => {
    return summarizeSalesByCategory(filteredTransactions);
  }, [filteredTransactions]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = customerSummaries.filter(
      (customer) =>
        customer.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.region.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    filtered.sort((a, b) => {
      if (sortField === "customer") {
        const aValue = a[sortField].toLowerCase();
        const bValue = b[sortField].toLowerCase();
        if (sortDirection === "asc") {
          return aValue.localeCompare(bValue);
        }
        return bValue.localeCompare(aValue);
      }
      if (sortField === "total_sales" || sortField === "transaction_count") {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (sortDirection === "asc") {
          return aValue - bValue;
        }
        return bValue - aValue;
      }
      return 0;
    });

    return filtered;
  }, [customerSummaries, searchQuery, sortField, sortDirection]);

  const filteredAndSortedDataRegion = useMemo(() => {
    const filtered = regionSummaries.filter((region) =>
      region.region.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    filtered.sort((a, b) => {
      if (sortField === "region") {
        const aValue = a[sortField].toLowerCase();
        const bValue = b[sortField].toLowerCase();
        if (sortDirection === "asc") {
          return aValue.localeCompare(bValue);
        }
        return bValue.localeCompare(aValue);
      }
      if (sortField === "total_sales" || sortField === "transaction_count") {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (sortDirection === "asc") {
          return aValue - bValue;
        }
        return bValue - aValue;
      }
      return 0;
    });

    return filtered;
  }, [regionSummaries, searchQuery, sortField, sortDirection]);

  const filteredAndSortedDataByType = useMemo(() => {
    const filtered = typeSummaries.filter((data) => data.type.toLowerCase().includes(searchQuery.toLowerCase()));

    filtered.sort((a, b) => {
      if (sortField === "type") {
        const aValue = a[sortField].toLowerCase();
        const bValue = b[sortField].toLowerCase();
        if (sortDirection === "asc") {
          return aValue.localeCompare(bValue);
        }
        return bValue.localeCompare(aValue);
      }
      if (sortField === "total_sales" || sortField === "transaction_count") {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (sortDirection === "asc") {
          return aValue - bValue;
        }
        return bValue - aValue;
      }
      return 0;
    });

    return filtered;
  }, [typeSummaries, searchQuery, sortField, sortDirection]);

  const filteredAndSortedDataBySalesperson = useMemo(() => {
    const filtered = salespersonSummaries.filter((data) =>
      data.salesperson.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    filtered.sort((a, b) => {
      if (sortField === "salesperson") {
        const aValue = a[sortField].toLowerCase();
        const bValue = b[sortField].toLowerCase();
        if (sortDirection === "asc") {
          return aValue.localeCompare(bValue);
        }
        return bValue.localeCompare(aValue);
      }
      if (sortField === "total_sales" || sortField === "transaction_count") {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (sortDirection === "asc") {
          return aValue - bValue;
        }
        return bValue - aValue;
      }
      return 0;
    });

    return filtered;
  }, [salespersonSummaries, searchQuery, sortField, sortDirection]);

  const filteredAndSortedDataByCategory = useMemo(() => {
    const filtered = categorySummaries.filter((data) =>
      data.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    filtered.sort((a, b) => {
      if (sortField === "category") {
        const aValue = a[sortField].toLowerCase();
        const bValue = b[sortField].toLowerCase();
        if (sortDirection === "asc") {
          return aValue.localeCompare(bValue);
        }
        return bValue.localeCompare(aValue);
      }
      if (sortField === "total_sales" || sortField === "transaction_count") {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (sortDirection === "asc") {
          return aValue - bValue;
        }
        return bValue - aValue;
      }
      return 0;
    });

    return filtered;
  }, [categorySummaries, searchQuery, sortField, sortDirection]);

  // Pastel color classes for cards
  const cardColors = [
    "bg-gradient-to-br from-pastel-blue-light to-pastel-blue-dark border-pastel-blue-border",
    "bg-gradient-to-br from-pastel-green-light to-pastel-green-dark border-pastel-green-border",
    "bg-gradient-to-br from-pastel-pink-light to-pastel-pink-dark border-pastel-pink-border",
    "bg-gradient-to-br from-pastel-purple-light to-pastel-purple-dark border-pastel-purple-border",
    "bg-gradient-to-br from-pastel-yellow-light to-pastel-yellow-dark border-pastel-yellow-border",
    "bg-gradient-to-br from-pastel-orange-light to-pastel-orange-dark border-pastel-orange-border",
  ];

  // Pastel color badges for transaction counts
  const badgeColors = [
    "bg-pastel-blue-100 text-pastel-blue-800",
    "bg-pastel-green-100 text-pastel-green-800",
    "bg-pastel-pink-100 text-pastel-pink-800",
    "bg-pastel-purple-100 text-pastel-purple-800",
    "bg-pastel-yellow-100 text-pastel-yellow-800",
    "bg-pastel-orange-100 text-pastel-orange-800",
  ];

  // Date range display
  const dateRangeText = formatDateRange(startMonth, startYear, endMonth, endYear);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-primary border-b-2" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Sales Summary Card */}
      <Card className="border-pastel-purple-border bg-gradient-to-br from-pastel-purple-light/20 to-pastel-purple-dark/10">
        <CardHeader>
          <CardTitle className="text-pastel-purple-900">Sales Summary</CardTitle>
          <CardDescription className="text-pastel-purple-700">Filtered data from {dateRangeText}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className={`border-0 shadow-sm ${cardColors[0]}`}>
              <CardContent className="pt-6">
                <div className="text-pastel-blue-800 text-sm">Total Customers</div>
                <div className="font-bold text-2xl text-pastel-blue-900">{customerSummaries.length}</div>
                <div className="text-pastel-blue-600 text-xs mt-1">
                  {filteredTransactions.length > 0 ? <>Active in selected period</> : <>No data in selected range</>}
                </div>
              </CardContent>
            </Card>
            <Card className={`border-0 shadow-sm ${cardColors[1]}`}>
              <CardContent className="pt-6">
                <div className="text-pastel-green-800 text-sm">Total Transactions</div>
                <div className="font-bold text-2xl text-pastel-green-900">{filteredTransactions.length}</div>
                <div className="text-pastel-green-600 text-xs mt-1">
                  {allTransactions.length > 0 && (
                    <>{((filteredTransactions.length / allTransactions.length) * 100).toFixed(1)}% of total</>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className={`border-0 shadow-sm ${cardColors[2]}`}>
              <CardContent className="pt-6">
                <div className="text-pastel-pink-800 text-sm">Total Sales Value</div>
                <div className="font-bold text-2xl text-pastel-pink-900">
                  {formatCurrency(customerSummaries.reduce((sum, cust) => sum + cust.total_sales, 0))}
                </div>
                <div className="text-pastel-pink-600 text-xs mt-1">
                  Average:{" "}
                  {formatCurrency(
                    filteredTransactions.length > 0
                      ? customerSummaries.reduce((sum, cust) => sum + cust.total_sales, 0) / filteredTransactions.length
                      : 0,
                  )}{" "}
                  per transaction
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Customer Sales Card */}
      <Card className="border-pastel-blue-border bg-gradient-to-br from-pastel-blue-light/20 to-pastel-blue-dark/10">
        <CardHeader>
          <CardTitle className="text-pastel-blue-900">Sales Summary by Customer</CardTitle>
          <CardDescription className="text-pastel-blue-700">
            Total {customerSummaries.length} customers with {filteredTransactions.length} transactions in{" "}
            {dateRangeText}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-pastel-blue-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-pastel-blue-50 hover:bg-pastel-blue-50">
                  <TableHead className="w-[40%] text-pastel-blue-800">Customer</TableHead>
                  <TableHead className="text-right text-pastel-blue-800">Total Sales</TableHead>
                  <TableHead className="text-right text-pastel-blue-800">Transactions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((customer, index) => (
                    <TableRow key={customer.customer} className="hover:bg-pastel-blue-50/50">
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold text-pastel-blue-900">{customer.customer}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-pastel-blue-900">
                        {formatCurrency(customer.total_sales)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-2 py-1 font-semibold text-xs ${badgeColors[index % badgeColors.length]}`}
                        >
                          {customer.transaction_count}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-pastel-blue-700">
                      No customers found in selected date range
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Region Sales Card */}
      <Card className="border-pastel-green-border bg-gradient-to-br from-pastel-green-light/20 to-pastel-green-dark/10">
        <CardHeader>
          <CardTitle className="text-pastel-green-900">Sales Summary by Region</CardTitle>
          <CardDescription className="text-pastel-green-700">
            Total {regionSummaries.length} region with {filteredTransactions.length} transactions in {dateRangeText}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-pastel-green-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-pastel-green-50 hover:bg-pastel-green-50">
                  <TableHead className="w-[40%] text-pastel-green-800">Region</TableHead>
                  <TableHead className="text-right text-pastel-green-800">Total Sales</TableHead>
                  <TableHead className="text-right text-pastel-green-800">Transactions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedDataRegion.length > 0 ? (
                  filteredAndSortedDataRegion.map((region, index) => (
                    <TableRow key={region.region} className="hover:bg-pastel-green-50/50">
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold text-pastel-green-900">{region.region}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-pastel-green-900">
                        {formatCurrency(region.total_sales)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-2 py-1 font-semibold text-xs ${badgeColors[index % badgeColors.length]}`}
                        >
                          {region.transaction_count}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-pastel-green-700">
                      No regions found in selected date range
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Type Sales Card */}
      <Card className="border-pastel-pink-border bg-gradient-to-br from-pastel-pink-light/20 to-pastel-pink-dark/10">
        <CardHeader>
          <CardTitle className="text-pastel-pink-900">Sales Summary by Type</CardTitle>
          <CardDescription className="text-pastel-pink-700">
            Total {typeSummaries.length} type with {filteredTransactions.length} transactions in {dateRangeText}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-pastel-pink-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-pastel-pink-50 hover:bg-pastel-pink-50">
                  <TableHead className="w-[40%] text-pastel-pink-800">Type</TableHead>
                  <TableHead className="text-right text-pastel-pink-800">Total Sales</TableHead>
                  <TableHead className="text-right text-pastel-pink-800">Transactions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedDataByType.length > 0 ? (
                  filteredAndSortedDataByType.map((data, index) => (
                    <TableRow key={data.type} className="hover:bg-pastel-pink-50/50">
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold text-pastel-pink-900">{data.type}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-pastel-pink-900">
                        {formatCurrency(data.total_sales)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-2 py-1 font-semibold text-xs ${badgeColors[index % badgeColors.length]}`}
                        >
                          {data.transaction_count}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-pastel-pink-700">
                      No type found in selected date range
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Category Sales Card */}
      <Card className="border-pastel-purple-border bg-gradient-to-br from-pastel-purple-light/20 to-pastel-purple-dark/10">
        <CardHeader>
          <CardTitle className="text-pastel-purple-900">Sales Summary by Category</CardTitle>
          <CardDescription className="text-pastel-purple-700">
            Total {categorySummaries.length} category with {filteredTransactions.length} transactions in {dateRangeText}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-pastel-purple-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-pastel-purple-50 hover:bg-pastel-purple-50">
                  <TableHead className="w-[40%] text-pastel-purple-800">Category</TableHead>
                  <TableHead className="text-right text-pastel-purple-800">Total Sales</TableHead>
                  <TableHead className="text-right text-pastel-purple-800">Transactions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedDataByCategory.length > 0 ? (
                  filteredAndSortedDataByCategory.map((data, index) => (
                    <TableRow key={data.category} className="hover:bg-pastel-purple-50/50">
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold text-pastel-purple-900">{data.category}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-pastel-purple-900">
                        {formatCurrency(data.total_sales)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-2 py-1 font-semibold text-xs ${badgeColors[index % badgeColors.length]}`}
                        >
                          {data.transaction_count}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-pastel-purple-700">
                      No category found in selected date range
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Salesperson Sales Card */}
      <Card className="border-pastel-yellow-border bg-gradient-to-br from-pastel-yellow-light/20 to-pastel-yellow-dark/10">
        <CardHeader>
          <CardTitle className="text-pastel-yellow-900">Sales Summary by Salesperson</CardTitle>
          <CardDescription className="text-pastel-yellow-700">
            Total {salespersonSummaries.length} salesperson with {filteredTransactions.length} transactions in{" "}
            {dateRangeText}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-pastel-yellow-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-pastel-yellow-50 hover:bg-pastel-yellow-50">
                  <TableHead className="w-[40%] text-pastel-yellow-800">Sales Person</TableHead>
                  <TableHead className="text-right text-pastel-yellow-800">Total Sales</TableHead>
                  <TableHead className="text-right text-pastel-yellow-800">Transactions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedDataBySalesperson.length > 0 ? (
                  filteredAndSortedDataBySalesperson.map((data, index) => (
                    <TableRow key={data.salesperson} className="hover:bg-pastel-yellow-50/50">
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold text-pastel-yellow-900">{data.salesperson}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-pastel-yellow-900">
                        {formatCurrency(data.total_sales)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-2 py-1 font-semibold text-xs ${badgeColors[index % badgeColors.length]}`}
                        >
                          {data.transaction_count}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-pastel-yellow-700">
                      No salesperson found in selected date range
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
