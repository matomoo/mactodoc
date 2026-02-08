"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Loader2,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useCustomers, useDeleteCustomer } from "../../hooks/useCustomers";
import type { Customer } from "../../types";
import { bpjsMapping, getDisplayName, jenisMapping, kerjasamaMapping } from "../../utils/customer-mapping";

interface CustomersTableProps {
  data?: Customer[];
  useHook?: boolean;
}

export default function CustomersTable({ data, useHook = false }: CustomersTableProps) {
  const router = useRouter();
  const { mutate: deleteCustomer } = useDeleteCustomer();
  const { data: customers = [], isLoading } = useCustomers();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setCustomerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      deleteCustomer(customerToDelete);
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  // Helper function to add/remove filters
  const updateColumnFilter = (columnId: string, value: string | null) => {
    setColumnFilters((prev) => {
      // Remove existing filter for this column
      const filtersWithoutColumn = prev.filter((filter) => filter.id !== columnId);

      // If value is not null, add the new filter
      if (value !== null) {
        return [...filtersWithoutColumn, { id: columnId, value }];
      }

      return filtersWithoutColumn;
    });
  };

  // Get current filter values for display
  const getCurrentFilterValue = (columnId: string) => {
    const filter = columnFilters.find((filter) => filter.id === columnId);
    return filter ? (filter.value as string) : null;
  };

  // Handle dropdown selection
  const handleJenisSelect = (value: string) => {
    const currentValue = getCurrentFilterValue("jenis");
    updateColumnFilter("jenis", currentValue === value ? null : value);
  };

  const handleBpjsSelect = (value: string) => {
    const currentValue = getCurrentFilterValue("bpjs");
    updateColumnFilter("bpjs", currentValue === value ? null : value);
  };

  const handleKerjasamaSelect = (value: string) => {
    const currentValue = getCurrentFilterValue("kerjasama");
    updateColumnFilter("kerjasama", currentValue === value ? null : value);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setColumnFilters([]);
  };

  // Clear specific filter
  const clearFilter = (columnId: string) => {
    updateColumnFilter(columnId, null);
  };

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: "Nama",
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="font-medium">
            {customer.name}
            {customer.contact_person && <div className="text-muted-foreground text-sm">{customer.contact_person}</div>}
          </div>
        );
      },
    },
    {
      accessorKey: "wilayah",
      header: "Wilayah",
      cell: ({ row }) => {
        const wilayah = row.getValue("wilayah") as string;
        return wilayah ? <span>{wilayah}</span> : <span className="text-muted-foreground">-</span>;
      },
    },
    {
      accessorKey: "jenis",
      header: "Jenis",
      cell: ({ row }) => {
        const jenis = row.getValue("jenis") as string;
        return <span>{getDisplayName(jenis, jenisMapping)}</span>;
      },
    },
    {
      accessorKey: "bpjs",
      header: "BPJS",
      cell: ({ row }) => {
        const bpjs = row.getValue("bpjs") as string;
        return <span>{getDisplayName(bpjs, bpjsMapping)}</span>;
      },
    },
    {
      accessorKey: "kerjasama",
      header: "Kerjasama",
      cell: ({ row }) => {
        const kerjasama = row.getValue("kerjasama") as string;
        return <span>{getDisplayName(kerjasama, kerjasamaMapping)}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const customer = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/ichiba/app/customers/${customer.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/ichiba/app/customers/edit/${customer.id}`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(customer.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: customers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  // Get current filter values
  const nameFilter = getCurrentFilterValue("name");
  const jenisFilter = getCurrentFilterValue("jenis");
  const bpjsFilter = getCurrentFilterValue("bpjs");
  const kerjasamaFilter = getCurrentFilterValue("kerjasama");

  // Check if any filters are active
  const hasActiveFilters = nameFilter || jenisFilter || bpjsFilter || kerjasamaFilter;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filter Controls */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari customer..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                className="pl-10 pr-10"
              />
              {nameFilter && (
                <button
                  type="button"
                  onClick={() => clearFilter("name")}
                  className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Jenis Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Jenis
                    {jenisFilter && (
                      <Badge variant="secondary" className="ml-2">
                        1
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter Jenis</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {Object.entries(jenisMapping).map(([value, label]) => (
                      <DropdownMenuItem
                        key={value}
                        onClick={() => handleJenisSelect(value)}
                        className="flex items-center justify-between"
                      >
                        {label}
                        {jenisFilter === value && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* BPJS Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    BPJS
                    {bpjsFilter && (
                      <Badge variant="secondary" className="ml-2">
                        1
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter BPJS</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {Object.entries(bpjsMapping).map(([value, label]) => (
                      <DropdownMenuItem
                        key={value}
                        onClick={() => handleBpjsSelect(value)}
                        className="flex items-center justify-between"
                      >
                        {label}
                        {bpjsFilter === value && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Kerjasama Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Kerjasama
                    {kerjasamaFilter && (
                      <Badge variant="secondary" className="ml-2">
                        1
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter Kerjasama</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {Object.entries(kerjasamaMapping).map(([value, label]) => (
                      <DropdownMenuItem
                        key={value}
                        onClick={() => handleKerjasamaSelect(value)}
                        className="flex items-center justify-between"
                      >
                        {label}
                        {kerjasamaFilter === value && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button onClick={() => router.push("/ichiba/app/customers/create")}>
                <UserPlus className="mr-2 h-4 w-4" />
                Tambah Customer
              </Button>
            </div>
          </div>

          {/* Summary Filter */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/50 p-3">
              <span className="text-sm font-medium">Filter Aktif:</span>

              {nameFilter && (
                <Badge variant="secondary" className="gap-1 pl-2">
                  Nama: {nameFilter}
                  <button
                    type="button"
                    onClick={() => clearFilter("name")}
                    className="ml-1 rounded-full hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {jenisFilter && (
                <Badge variant="secondary" className="gap-1 pl-2">
                  Jenis: {getDisplayName(jenisFilter, jenisMapping)}
                  <button
                    type="button"
                    onClick={() => clearFilter("jenis")}
                    className="ml-1 rounded-full hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {bpjsFilter && (
                <Badge variant="secondary" className="gap-1 pl-2">
                  BPJS: {getDisplayName(bpjsFilter, bpjsMapping)}
                  <button
                    type="button"
                    onClick={() => clearFilter("bpjs")}
                    className="ml-1 rounded-full hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {kerjasamaFilter && (
                <Badge variant="secondary" className="gap-1 pl-2">
                  Kerjasama: {getDisplayName(kerjasamaFilter, kerjasamaMapping)}
                  <button
                    type="button"
                    onClick={() => clearFilter("kerjasama")}
                    className="ml-1 rounded-full hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="ml-auto h-7 text-xs">
                <X className="mr-1 h-3 w-3" />
                Hapus Semua Filter
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {hasActiveFilters ? "Tidak ada data yang cocok dengan filter" : "Tidak ada data customer."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Menampilkan {table.getFilteredRowModel().rows.length} dari {customers.length} customer.
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus customer ini? Tindakan ini tidak dapat dibatalkan dan semua data order
              yang terkait akan terpengaruh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCustomerToDelete(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
