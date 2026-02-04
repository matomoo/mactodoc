"use client";

import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { endOfDay, format, isWithinInterval, parseISO, startOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Filter, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useSalesTransactions } from "../../hooks/useSalesTransactions";
import type { SalesTransaction } from "../../types";

interface SalesTransactionsTableProps {
  data?: SalesTransaction[];
  useHook?: boolean;
}

// Custom filter function for date range
const dateRangeFilter: FilterFn<SalesTransaction> = (row, columnId, filterValue) => {
  if (!filterValue || !Array.isArray(filterValue) || filterValue.length !== 2) {
    return true;
  }

  const [from, to] = filterValue;
  if (!from && !to) return true;

  try {
    const date = parseISO(row.getValue(columnId));

    if (from && to) {
      const startDate = startOfDay(parseISO(from));
      const endDate = endOfDay(parseISO(to));
      return isWithinInterval(date, { start: startDate, end: endDate });
    }
    if (from) {
      const startDate = startOfDay(parseISO(from));
      return date >= startDate;
    }
    if (to) {
      const endDate = endOfDay(parseISO(to));
      return date <= endDate;
    }
  } catch (error) {
    console.error("Error parsing date:", error);
    return false;
  }

  return true;
};

export default function SalesTransactionsTable({ data, useHook = false }: SalesTransactionsTableProps) {
  const router = useRouter();
  const { data: salesTransactions = [], isLoading } = useSalesTransactions(); // Always use hook
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

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

  const columns: ColumnDef<SalesTransaction>[] = [
    {
      accessorFn: (row) => row.customer || "Unknown",
      id: "customerName",
      header: "Customer",
      cell: ({ row }) => {
        const customerName = row.original.customer || "Unknown";
        return (
          <div className="max-w-50 truncate text-sm" title={customerName}>
            {customerName}
          </div>
        );
      },
    },
    {
      accessorFn: (row) => row.product_name || "Unknown",
      id: "productName",
      header: "Nama Produk",
      cell: ({ row }) => {
        const productName = row.original.product_name || "Unknown";
        return (
          <div className="max-w-50 truncate text-sm" title={productName}>
            {productName}
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Tanggal",
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"));
        return format(date, "dd MMM yyyy", { locale: id });
      },
      filterFn: dateRangeFilter, // Use the function reference directly
    },
    {
      accessorKey: "salesperson",
      header: "Sales",
      cell: ({ row }) => <div className="text-sm">{row.getValue("salesperson")}</div>,
    },
    {
      accessorKey: "quantity",
      header: "Jumlah",
      cell: ({ row }) => <div className="text-sm">{row.getValue("quantity")}</div>,
    },
    {
      accessorKey: "sales_amount",
      header: "Jumlah Penjualan",
      cell: ({ row }) => {
        const sales_amount = Number(row.getValue("sales_amount")) || 0;
        return <div className="text-sm">Rp {sales_amount.toLocaleString()}</div>;
      },
    },
    {
      accessorKey: "category",
      header: "Kategory",
      cell: ({ row }) => <div className="text-sm">{row.getValue("category")}</div>,
    },
    {
      accessorKey: "region",
      header: "Region",
      cell: ({ row }) => <div className="text-sm">{row.getValue("region")}</div>,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <div className="text-sm">{row.getValue("type")}</div>,
    },
  ];

  const table = useReactTable({
    data: salesTransactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
    },
    // Set initial page size to 100
    initialState: {
      pagination: {
        pageSize: 100,
      },
    },
  });

  // Clear all filters
  const clearAllFilters = () => {
    setColumnFilters([]);
    setGlobalFilter("");
  };

  // Check if any filters are active
  const hasActiveFilters = columnFilters.length > 0 || globalFilter;

  // Show loading state AFTER all hooks are called
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
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium">Filter Lanjutan</h3>
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-6 text-xs">
              Clear All
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Customer Filter */}
            <div className="space-y-2">
              <div className="text-xs font-medium">Customer</div>
              <Input
                placeholder="Cari customer..."
                value={(table.getColumn("customerName")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("customerName")?.setFilterValue(event.target.value)}
                className="h-8 text-sm"
              />
            </div>

            {/* Product Filter */}
            <div className="space-y-2">
              <div className="text-xs font-medium">Produk</div>
              <Select
                value={(table.getColumn("productName")?.getFilterValue() as string) ?? ""}
                onValueChange={(value) =>
                  table.getColumn("productName")?.setFilterValue(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Semua Produk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Produk</SelectItem>
                  {filterOptions.products.map((product) => (
                    <SelectItem key={product} value={product}>
                      {product}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Salesperson Filter */}
            <div className="space-y-2">
              <div className="text-xs font-medium">Sales</div>
              <Select
                value={(table.getColumn("salesperson")?.getFilterValue() as string) ?? ""}
                onValueChange={(value) =>
                  table.getColumn("salesperson")?.setFilterValue(value === "all" ? undefined : value)
                }
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

            {/* Category Filter */}
            <div className="space-y-2">
              <div className="text-xs font-medium">Kategori</div>
              <Select
                value={(table.getColumn("category")?.getFilterValue() as string) ?? ""}
                onValueChange={(value) =>
                  table.getColumn("category")?.setFilterValue(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {filterOptions.categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Region Filter */}
            <div className="space-y-2">
              <div className="text-xs font-medium">Region</div>
              <Select
                value={(table.getColumn("region")?.getFilterValue() as string) ?? ""}
                onValueChange={(value) =>
                  table.getColumn("region")?.setFilterValue(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Semua Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Region</SelectItem>
                  {filterOptions.regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <div className="text-xs font-medium">Type</div>
              <Select
                value={(table.getColumn("type")?.getFilterValue() as string) ?? ""}
                onValueChange={(value) => table.getColumn("type")?.setFilterValue(value === "all" ? undefined : value)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Semua Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Type</SelectItem>
                  {filterOptions.types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
                  value={(table.getColumn("date")?.getFilterValue() as [string, string])?.[0] ?? ""}
                  onChange={(event) => {
                    const from = event.target.value || undefined;
                    const current = (table.getColumn("date")?.getFilterValue() as [string, string]) ?? [
                      undefined,
                      undefined,
                    ];
                    table.getColumn("date")?.setFilterValue([from, current[1]]);
                  }}
                  className="h-8 text-sm"
                />
                <Input
                  placeholder="Sampai"
                  type="date"
                  value={(table.getColumn("date")?.getFilterValue() as [string, string])?.[1] ?? ""}
                  onChange={(event) => {
                    const to = event.target.value || undefined;
                    const current = (table.getColumn("date")?.getFilterValue() as [string, string]) ?? [
                      undefined,
                      undefined,
                    ];
                    table.getColumn("date")?.setFilterValue([current[0], to]);
                  }}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 rounded-lg bg-muted p-3">
          <div className="text-sm font-medium">Filter Aktif:</div>

          {globalFilter && (
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs">
              <span>Search: "{globalFilter}"</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGlobalFilter("")}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {columnFilters.map((filter) => {
            const column = table.getColumn(filter.id);
            if (!column) return null;

            const filterValue = filter.value;
            let displayValue = "";

            if (Array.isArray(filterValue)) {
              // Handle range filters
              if (filter.id === "quantity") {
                const [min, max] = filterValue as [number?, number?];
                if (min || max) {
                  displayValue = `Jumlah: ${min ?? "min"} - ${max ?? "max"}`;
                }
              } else if (filter.id === "date") {
                const [from, to] = filterValue as [string?, string?];
                if (from || to) {
                  try {
                    displayValue = `Tanggal: ${from ? format(new Date(from), "dd MMM yyyy") : "..."} - ${to ? format(new Date(to), "dd MMM yyyy") : "..."}`;
                  } catch (error) {
                    displayValue = `Tanggal: ${from} - ${to}`;
                  }
                }
              }
            } else if (filterValue && filterValue !== "all") {
              // Handle single value filters, skip "all" value
              displayValue = `${column.columnDef.header}: ${filterValue}`;
            }

            if (!displayValue) return null;

            return (
              <div
                key={filter.id}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs"
              >
                <span>{displayValue}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => column.setFilterValue(undefined)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Table with smaller font */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-xs">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-xs">
                  {hasActiveFilters ? "Tidak ada data dengan filter yang dipilih." : "Tidak ada data transaksi."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination with 100 rows per page */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-xs">
          Menampilkan {table.getFilteredRowModel().rows.length} dari {salesTransactions.length} transaksi.
          <span className="ml-2 text-xs">
            (Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()})
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 text-xs"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="text-xs">
            {table.getState().pagination.pageIndex * 100 + 1} -{" "}
            {Math.min((table.getState().pagination.pageIndex + 1) * 100, table.getFilteredRowModel().rows.length)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 text-xs"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
          <div className="ml-4 text-xs text-muted-foreground">100 baris per halaman</div>
        </div>
      </div>
    </div>
  );
}
