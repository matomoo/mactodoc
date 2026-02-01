// components/sales-transactions-chart.tsx
"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useState, useMemo } from "react";
import { useSalesTransactions } from "../../hooks/useSalesTransactions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  summarizeSalesByCustomer,
  formatCurrency,
  summarizeSalesByRegion,
  summarizeSalesBySalesperson,
  summarizeSalesByType,
} from "../../utils/sales-utils";

type SortField = "customer" | "total_sales" | "transaction_count" | "region" | "salesperson" | "type";
type SortDirection = "asc" | "desc";

export function SalesTransactionsChart() {
  const { data: transactions = [], isLoading } = useSalesTransactions();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("total_sales");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Process data
  const customerSummaries = useMemo(() => {
    return summarizeSalesByCustomer(transactions);
  }, [transactions]);

  const regionSummaries = useMemo(() => {
    return summarizeSalesByRegion(transactions);
  }, [transactions]);

  const salespersonSummaries = useMemo(() => {
    return summarizeSalesBySalesperson(transactions);
  }, [transactions]);

  const typeSummaries = useMemo(() => {
    return summarizeSalesByType(transactions);
  }, [transactions]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = customerSummaries.filter(
      (customer) =>
        customer.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.region.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    filtered.sort((a, b) => {
      // For string fields (region)
      if (sortField === "customer") {
        const aValue = a[sortField].toLowerCase();
        const bValue = b[sortField].toLowerCase();

        if (sortDirection === "asc") {
          return aValue.localeCompare(bValue);
        }
        return bValue.localeCompare(aValue);
      }
      // For numeric fields (total_sales, transaction_count)
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

    // Sorting
    filtered.sort((a, b) => {
      // For string fields (region)
      if (sortField === "region") {
        const aValue = a[sortField].toLowerCase();
        const bValue = b[sortField].toLowerCase();

        if (sortDirection === "asc") {
          return aValue.localeCompare(bValue);
        }
        return bValue.localeCompare(aValue);
      }
      // For numeric fields (total_sales, transaction_count)
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

    // Sorting
    filtered.sort((a, b) => {
      // For string fields (region)
      if (sortField === "type") {
        const aValue = a[sortField].toLowerCase();
        const bValue = b[sortField].toLowerCase();

        if (sortDirection === "asc") {
          return aValue.localeCompare(bValue);
        }
        return bValue.localeCompare(aValue);
      }
      // For numeric fields (total_sales, transaction_count)
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

    // Sorting
    filtered.sort((a, b) => {
      // For string fields (region)
      if (sortField === "salesperson") {
        const aValue = a[sortField].toLowerCase();
        const bValue = b[sortField].toLowerCase();

        if (sortDirection === "asc") {
          return aValue.localeCompare(bValue);
        }
        return bValue.localeCompare(aValue);
      }
      // For numeric fields (total_sales, transaction_count)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Summary</CardTitle>
          {/* <CardDescription>
            Total {customerSummaries.length} customers with {transactions.length} transactions
          </CardDescription> */}
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-gray-500">Total Customers</div>
                <div className="text-2xl font-bold">{customerSummaries.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-gray-500">Total Transactions</div>
                <div className="text-2xl font-bold">{transactions.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-gray-500">Total Sales Value</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(customerSummaries.reduce((sum, cust) => sum + cust.total_sales, 0))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales Summary by Customer</CardTitle>
          <CardDescription>
            Total {customerSummaries.length} customers with {transactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Customer</TableHead>
                  <TableHead className="text-right">Total Sales</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((customer) => (
                    <TableRow key={customer.customer}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">{customer.customer}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(customer.total_sales)}</TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {customer.transaction_count}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No customers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary Stats */}
          {/* <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-gray-500">Total Customers</div>
                <div className="text-2xl font-bold">{customerSummaries.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-gray-500">Total Transactions</div>
                <div className="text-2xl font-bold">{transactions.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-gray-500">Total Sales Value</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    customerSummaries.reduce((sum, cust) => sum + cust.total_sales, 0)
                  )}
                </div>
              </CardContent>
            </Card>
          </div> */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales Summary by Region</CardTitle>
          <CardDescription>
            Total {regionSummaries.length} region with {transactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Region</TableHead>
                  <TableHead className="text-right">Total Sales</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedDataRegion.length > 0 ? (
                  filteredAndSortedDataRegion.map((customer) => (
                    <TableRow key={customer.region}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">{customer.region}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(customer.total_sales)}</TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {customer.transaction_count}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No regions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales Summary by Type</CardTitle>
          <CardDescription>
            Total {typeSummaries.length} type with {transactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Type</TableHead>
                  <TableHead className="text-right">Total Sales</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedDataByType.length > 0 ? (
                  filteredAndSortedDataByType.map((data) => (
                    <TableRow key={data.type}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">{data.type}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(data.total_sales)}</TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {data.transaction_count}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No type found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales Summary by Salesperson</CardTitle>
          <CardDescription>
            Total {salespersonSummaries.length} salesperson with {transactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Sales Person</TableHead>
                  <TableHead className="text-right">Total Sales</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedDataBySalesperson.length > 0 ? (
                  filteredAndSortedDataBySalesperson.map((data) => (
                    <TableRow key={data.salesperson}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">{data.salesperson}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(data.total_sales)}</TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {data.transaction_count}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No salesperson found
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
