"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Calendar,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import type { Catalog } from "../../types";
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
import { useDeleteCatalog, useCatalogs } from "../../hooks/useCatalogs";
import { Card, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CatalogsCard() {
  const router = useRouter();
  const { data: catalogs = [], isLoading, refetch } = useCatalogs();
  const { mutate: deleteCatalog } = useDeleteCatalog({
    onSuccess: () => {
      refetch();
    },
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [catalogToDelete, setCatalogToDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setCatalogToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (catalogToDelete) {
      deleteCatalog(catalogToDelete);
      setDeleteDialogOpen(false);
      setCatalogToDelete(null);
    }
  };

  const columns: ColumnDef<Catalog>[] = [
    {
      accessorKey: "title",
      header: "Nama Catalog",
    },
    {
      accessorKey: "category",
      header: "Kategori",
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
              <DropdownMenuItem onClick={() => router.push(`/ichiba/app/catalogs/${dataRow.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/ichiba/app/catalogs/edit/${dataRow.id}`)}>
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
    data: catalogs,
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

  const filteredCatalogs = table.getFilteredRowModel().rows;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Input
            placeholder="Cari catalog..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
          <Button onClick={() => router.push("/ichiba/app/catalogs/create")}>
            <Calendar className="mr-2 h-4 w-4" />
            Catalog Baru
          </Button>
        </div>

        {filteredCatalogs.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
            <div className="text-lg text-muted-foreground">Tidak ada data catalogs.</div>
            <div className="mt-2 text-muted-foreground text-sm">
              {table.getColumn("title")?.getFilterValue() ? "Coba pencarian lain atau " : ""}
              <Button variant="link" className="p-0" onClick={() => router.push("/ichiba/app/catalogs/create")}>
                buat catalog baru.
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Card Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCatalogs.map((row) => {
                const catalog = row.original;
                return (
                  <Card
                    key={catalog.id}
                    className="group relative mx-auto w-full max-w-sm overflow-hidden pt-0 transition-all hover:shadow-lg"
                  >
                    <div className="relative aspect-video overflow-hidden bg-gray-50">
                      {catalog.image_url ? (
                        <div className="relative h-auto w-full">
                          <div className="relative aspect-video w-full">
                            {" "}
                            {/* Maintain 16:9 ratio */}
                            <Image
                              src={catalog.image_url}
                              alt={catalog.title}
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 100vw, 66vw"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-75 items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                          <div className="text-center">
                            <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <p className="text-gray-500">Tidak ada gambar tersedia</p>
                          </div>
                        </div>
                      )}
                      {/* <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/ichiba/app/catalogs/${catalog.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/ichiba/app/catalogs/edit/${catalog.id}`)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(catalog.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div> */}
                    </div>
                    <CardHeader className="">
                      <div className="flex flex-col items-start justify-between gap-2">
                        {catalog.category && (
                          <Badge variant="outline" className="text-xs">
                            {catalog.category}
                          </Badge>
                        )}
                        <h3 className="line-clamp-2 font-semibold leading-tight">{catalog.title}</h3>
                      </div>
                      <CardDescription className="">
                        {catalog.description && (
                          <div className="text-sm">
                            {catalog.description.slice(0, 80)}
                            {catalog.description.length > 80 ? "..." : ""}
                          </div>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => router.push(`/ichiba/app/catalogs/${catalog.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-sm">
                Menampilkan {filteredCatalogs.length} dari {catalogs.length} catalogs.
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
          </>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Catalog</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus catalog ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCatalogToDelete(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
