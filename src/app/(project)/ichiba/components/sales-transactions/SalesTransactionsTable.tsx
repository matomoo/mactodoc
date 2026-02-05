"use client";

import { useMemo, useState } from "react";

import { endOfDay, format, parseISO, startOfDay } from "date-fns";
import { Filter, Loader2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useSalesTransactions } from "../../hooks/useSalesTransactions";
import type { SalesTransaction } from "../../types";
import { formatCurrency } from "../../utils/sales-utils";

interface SalesTransactionsTableProps {
  data?: SalesTransaction[];
  useHook?: boolean;
}

export default function SalesTransactionsCardView({ data, useHook = false }: SalesTransactionsTableProps) {
  const { data: salesTransactions = [], isLoading } = useSalesTransactions();
  const [filterState, setFilterState] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // Get unique values for filter dropdowns
  const filterOptions = useMemo(() => {
    const salespersons = new Set<string>();
    const categories = new Set<string>();
    const regions = new Set<string>();
    const types = new Set<string>();
    const products = new Set<string>();

    salesTransactions.forEach((transaction) => {
      if (transaction.salesperson) salespersons.add(transaction.salesperson);
      if (transaction.category) categories.add(transaction.category);
      if (transaction.region) regions.add(transaction.region);
      if (transaction.type) types.add(transaction.type);
      if (transaction.product_name) products.add(transaction.product_name);
    });

    return {
      salespersons: Array.from(salespersons).sort(),
      categories: Array.from(categories).sort(),
      regions: Array.from(regions).sort(),
      types: Array.from(types).sort(),
      products: Array.from(products).sort(),
    };
  }, [salesTransactions]);

  // Apply filters
  const filteredTransactions = useMemo(() => {
    const filterTransaction = (transaction: SalesTransaction) => {
      if (Object.keys(filterState).length === 0) return true;

      let match = true;

      // Check customer name
      if (filterState.customerName) {
        const rowCustomer = transaction.customer || "";
        match = match && rowCustomer.toLowerCase().includes(filterState.customerName.toLowerCase());
      }

      // Check salesperson
      if (filterState.salesperson && filterState.salesperson !== "Semua Sales") {
        const rowSalesperson = transaction.salesperson || "";
        match = match && rowSalesperson === filterState.salesperson;
      }

      // Check date range
      if (filterState.dateFrom || filterState.dateTo) {
        try {
          const rowDate = parseISO(transaction.date);

          if (filterState.dateFrom) {
            const startDate = startOfDay(parseISO(filterState.dateFrom));
            match = match && rowDate >= startDate;
          }
          if (filterState.dateTo) {
            const endDate = endOfDay(parseISO(filterState.dateTo));
            match = match && rowDate <= endDate;
          }
        } catch (error) {
          console.error("Error parsing date:", error);
          return false;
        }
      }

      return match;
    };

    return salesTransactions.filter(filterTransaction);
  }, [salesTransactions, filterState]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Clear all filters
  const clearAllFilters = () => {
    setFilterState({});
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = Object.keys(filterState).length > 0;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Filter Toggle Button */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
              <X className="mr-1 h-3 w-3" />
              Clear All Filters
            </Button>
          )}
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="shrink-0"
          >
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Filter Lanjutan</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-6 text-xs">
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
              {/* Customer Filter */}
              <div className="space-y-2">
                <div className="text-xs font-medium">Customer</div>
                <Input
                  placeholder="Cari customer..."
                  value={filterState.customerName || ""}
                  onChange={(event) => {
                    setFilterState((prev) => ({
                      ...prev,
                      customerName: event.target.value || undefined,
                    }));
                    setCurrentPage(1); // Reset to first page when filter changes
                  }}
                  className="h-8 text-sm"
                />
              </div>

              {/* Salesperson Filter */}
              <div className="space-y-2">
                <div className="text-xs font-medium">Sales</div>
                <Select
                  value={filterState.salesperson || ""}
                  onValueChange={(value) => {
                    setFilterState((prev) => ({
                      ...prev,
                      salesperson: value === "all" ? undefined : value,
                    }));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Semua Sales" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Sales</SelectItem>
                    {filterOptions.salespersons.map((salesperson) => (
                      <SelectItem key={salesperson} value={salesperson}>
                        {salesperson}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <div className="text-xs font-medium">Tanggal (Range)</div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Dari"
                    type="date"
                    value={filterState.dateFrom || ""}
                    onChange={(event) => {
                      setFilterState((prev) => ({
                        ...prev,
                        dateFrom: event.target.value || undefined,
                      }));
                      setCurrentPage(1);
                    }}
                    className="h-8 text-sm"
                  />
                  <Input
                    placeholder="Sampai"
                    type="date"
                    value={filterState.dateTo || ""}
                    onChange={(event) => {
                      setFilterState((prev) => ({
                        ...prev,
                        dateTo: event.target.value || undefined,
                      }));
                      setCurrentPage(1);
                    }}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              <div className="text-sm font-medium">Filter Aktif:</div>

              {Object.entries(filterState).map(([key, value]) => {
                if (!value) return null;

                let displayValue = "";
                let displayLabel = "";

                switch (key) {
                  case "customerName":
                    displayLabel = "Customer";
                    displayValue = value;
                    break;
                  case "salesperson":
                    displayLabel = "Sales";
                    displayValue = value;
                    break;
                  case "dateFrom":
                    displayLabel = "Tanggal Dari";
                    try {
                      displayValue = format(new Date(value), "dd MMM yyyy");
                    } catch {
                      displayValue = value;
                    }
                    break;
                  case "dateTo":
                    displayLabel = "Tanggal Sampai";
                    try {
                      displayValue = format(new Date(value), "dd MMM yyyy");
                    } catch {
                      displayValue = value;
                    }
                    break;
                  default:
                    displayLabel = key;
                    displayValue = value;
                }

                return (
                  <Badge key={key} variant="secondary" className="inline-flex items-center gap-1">
                    <span>
                      {displayLabel}: {displayValue}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilterState((prev) => {
                          const newState = { ...prev };
                          delete newState[key];
                          return newState;
                        });
                        setCurrentPage(1);
                      }}
                      className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        Menampilkan {filteredTransactions.length} transaksi
        {filteredTransactions.length !== salesTransactions.length &&
          ` (difilter dari ${salesTransactions.length} total)`}
      </div>

      {/* Transactions Cards */}
      {/* {paginatedTransactions.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedTransactions.map((transaction) => (
            <Card key={`${transaction.customer}-${transaction.product_name}-${transaction.date}`} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium truncate">
                  {transaction.customer || "Unknown Customer"}
                </CardTitle>
                <CardDescription className="text-xs">
                  {format(new Date(transaction.date), "dd MMM yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Salesperson:</span>
                    <span className="text-xs font-medium">{transaction.salesperson}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Amount:</span>
                    <span className="text-sm font-bold">${transaction.sales_amount}</span>
                  </div>
                  {transaction.product_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Product:</span>
                      <span className="text-xs truncate max-w-[150px]">{transaction.product_name}</span>
                    </div>
                  )}
                  {transaction.region && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Region:</span>
                      <span className="text-xs">{transaction.region}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground text-sm">
              {hasActiveFilters
                ? "Tidak ada transaksi dengan filter yang dipilih."
                : "Tidak ada data transaksi."}
            </p>
          </CardContent>
        </Card>
      )} */}

      {/* // Simple list view alternative */}
      <div className="space-y-2">
        {paginatedTransactions.map((transaction) => (
          <div
            key={`${transaction.customer}-${transaction.product_name}-${transaction.date}`}
            className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
          >
            <div className="flex-1">
              <div className="font-medium">{transaction.customer || "Unknown"}</div>
              <div className="text-sm text-muted-foreground">
                {transaction.salesperson} • {format(new Date(transaction.date), "dd MMM yyyy")}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold">{formatCurrency(transaction.sales_amount)}</div>
              <div className="text-xs text-muted-foreground">{transaction.product_name}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages} • Menampilkan {startIndex + 1}-
                {Math.min(endIndex, filteredTransactions.length)} dari {filteredTransactions.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 text-xs"
                >
                  Sebelumnya
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="h-8 w-8 text-xs"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 text-xs"
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
