"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Trash2, Calendar, Loader2 } from "lucide-react";
import type { SalesTarget } from "../../types";
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
import { useDeleteSalesTarget, useSalesTargets } from "../../hooks/useSalesTargets";

export function SalesTargetsTable() {
  const router = useRouter();
  const { data: salesTarget = [], isLoading, refetch } = useSalesTargets();
  const { mutate: deleteSalesTarget } = useDeleteSalesTarget({
    onSuccess: () => {
      refetch();
    },
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [salesTargetToDelete, setSalesTargetToDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setSalesTargetToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (salesTargetToDelete) {
      deleteSalesTarget(salesTargetToDelete);
      setDeleteDialogOpen(false);
      setSalesTargetToDelete(null);
    }
  };

  const columns: ColumnDef<SalesTarget>[] = [
    {
      accessorFn: (row) => row.sales?.full_name || "Unknown",
      id: "sales_full_name",
      header: "Sales",
      cell: ({ row }) => {
        const salesName = row.original.sales?.full_name || "Unknown";
        return (
          <div className="max-w-50 truncate" title={salesName}>
            {salesName}
          </div>
        );
      },
    },
    {
      accessorKey: "target_amount",
      header: "Target Amount",
      cell: ({ row }) => {
        const amount = row.getValue("target_amount") as number;
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(amount);
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const dataRow = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              {/* <DropdownMenuItem onClick={() => router.push(`/ichiba/app/sales-targets/${dataRow.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem> */}
              <DropdownMenuItem onClick={() => router.push(`/ichiba/app/sales-targets/edit/${dataRow.id}`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(dataRow.id)}>
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
    data: salesTarget,
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
        <div className="flex items-center justify-between">
          {/* <Input
            placeholder="Cari ..."
            value={(table.getColumn("profiles_id")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("profiles_id")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          /> */}
          <div>{}</div>
          <Button onClick={() => router.push("/ichiba/app/sales-targets/create")}>
            <Calendar className="mr-2 h-4 w-4" />
            SalesTarget Baru
          </Button>
        </div>

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
                    Tidak ada data salesTarget.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Menampilkan {table.getFilteredRowModel().rows.length} dari {salesTarget.length} salesTarget.
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus SalesTarget</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus salesTarget ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSalesTargetToDelete(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
