// app/ref-query-cluster/page.tsx
"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useState, useMemo, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  PlusCircle,
  Trash2,
  Loader2,
  Search,
  Hash,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertTriangle,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { EnhancedLoadingState } from "@/app/(project)/tinfra/_component/ui-v1/enhanced-loading-state";
import { ErrorState, NoDataState } from "@/app/(project)/tinfra/_component/ui-v1/additional-component";

interface RefQueryCluster {
  nama_cluster: string;
  siteid: string;
}

interface ClusterSummary {
  nama_cluster: string;
  total_sites: number;
  site_ids: string[];
}

interface ApiResponse {
  rows?: RefQueryCluster[];
  data?: RefQueryCluster[];
  [key: string]: unknown;
}

interface ImportResult {
  success: boolean;
  totalRows: number;
  insertedRows: number;
  skippedRows: number;
  errors: string[];
  data: RefQueryCluster[];
}

interface ImportPreview {
  validData: RefQueryCluster[];
  invalidRows: Array<{ row: number; data: any; errors: string[] }>;
}

const SITES_PER_PAGE = 10;

export default function RefQueryClusterPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<ClusterSummary | null>(null);
  const [selectedSiteForDelete, setSelectedSiteForDelete] = useState<RefQueryCluster | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({});
  const [importProgress, setImportProgress] = useState(0);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for add dialog
  const [formData, setFormData] = useState({
    nama_cluster: "",
    siteid: "",
  });

  const queryClient = useQueryClient();

  // Type guard to check if an object is a valid RefQueryCluster
  const isRefQueryCluster = useCallback((item: unknown): item is RefQueryCluster => {
    return (
      typeof item === "object" &&
      item !== null &&
      "nama_cluster" in item &&
      "siteid" in item &&
      typeof (item as RefQueryCluster).nama_cluster === "string" &&
      typeof (item as RefQueryCluster).siteid === "string" &&
      (item as RefQueryCluster).nama_cluster.trim() !== "" &&
      (item as RefQueryCluster).siteid.trim() !== ""
    );
  }, []);

  // Safe data extractor - wrapped in useCallback
  const extractRows = useCallback(
    (data: unknown): RefQueryCluster[] => {
      if (!data) return [];

      // If data is an array
      if (Array.isArray(data)) {
        return data.filter(isRefQueryCluster);
      }

      // If data is an object with rows property
      if (typeof data === "object" && data !== null) {
        const apiData = data as ApiResponse;
        if (Array.isArray(apiData.rows)) {
          return apiData.rows.filter(isRefQueryCluster);
        }
        if (Array.isArray(apiData.data)) {
          return apiData.data.filter(isRefQueryCluster);
        }
      }

      return [];
    },
    [isRefQueryCluster],
  );

  // Fetch data with proper typing
  const { data, isPending, error, isError, refetch } = useQuery<unknown, Error>({
    queryKey: ["ref-query-cluster", searchTerm],
    queryFn: async () => {
      const url = searchTerm
        ? `/tinfra/api/meas-db-ti-sul/ref-query-cluster?nama_cluster=${encodeURIComponent(searchTerm)}`
        : "/tinfra/api/meas-db-ti-sul/ref-query-cluster";

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
  });

  // Process data to get cluster summaries with proper typing
  const clusterSummaries = useMemo((): ClusterSummary[] => {
    const rows = extractRows(data);

    // Group by nama_cluster
    const grouped = rows.reduce<Record<string, ClusterSummary>>((acc, curr) => {
      if (!acc[curr.nama_cluster]) {
        acc[curr.nama_cluster] = {
          nama_cluster: curr.nama_cluster,
          total_sites: 0,
          site_ids: [],
        };
      }
      acc[curr.nama_cluster].total_sites += 1;
      acc[curr.nama_cluster].site_ids.push(curr.siteid);
      return acc;
    }, {});

    // Convert to array and sort by cluster name
    return Object.values(grouped).sort((a, b) => a.nama_cluster.localeCompare(b.nama_cluster));
  }, [data, extractRows]);

  // Filter clusters based on search
  const filteredClusters = useMemo((): ClusterSummary[] => {
    if (!searchTerm) return clusterSummaries;

    return clusterSummaries.filter(
      (cluster) =>
        cluster.nama_cluster.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cluster.site_ids.some((siteId) => siteId.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [clusterSummaries, searchTerm]);

  // Insert mutation
  const insertMutation = useMutation({
    mutationFn: async (newData: RefQueryCluster) => {
      const response = await fetch("/tinfra/api/meas-db-ti-sul/ref-query-cluster", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to insert data");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ref-query-cluster"] });
      toast.success("Data inserted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Bulk insert mutation
  const bulkInsertMutation = useMutation({
    mutationFn: async (dataArray: RefQueryCluster[]) => {
      const results = [];
      const errors = [];

      for (let i = 0; i < dataArray.length; i++) {
        try {
          const response = await fetch("/tinfra/api/meas-db-ti-sul/ref-query-cluster", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dataArray[i]),
          });

          if (!response.ok) {
            const error = await response.json();
            errors.push(`Row ${i + 1}: ${error.error || "Failed to insert"}`);
          } else {
            const result = await response.json();
            results.push(result);
          }
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }

        // Update progress
        setImportProgress(((i + 1) / dataArray.length) * 100);
      }

      return {
        success: errors.length === 0,
        totalRows: dataArray.length,
        insertedRows: results.length,
        skippedRows: errors.length,
        errors,
        data: results.flatMap((r: any) => r.data),
      };
    },
    onSuccess: (result: ImportResult) => {
      setImportResult(result);
      queryClient.invalidateQueries({ queryKey: ["ref-query-cluster"] });

      if (result.errors.length === 0) {
        toast.success(`Successfully imported ${result.insertedRows} rows`);
      } else {
        toast.warning(`Imported ${result.insertedRows} rows with ${result.errors.length} errors`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Import failed: ${error.message}`);
    },
    onSettled: () => {
      setIsImporting(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (data: RefQueryCluster) => {
      const response = await fetch(
        `/tinfra/api/meas-db-ti-sul/ref-query-cluster?nama_cluster=${encodeURIComponent(data.nama_cluster)}&siteid=${encodeURIComponent(data.siteid)}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete data");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ref-query-cluster"] });
      setIsDeleteDialogOpen(false);
      setSelectedCluster(null);
      setSelectedSiteForDelete(null);
      setExpandedCluster(null);
      toast.success("Data deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    insertMutation.mutate(formData);
    setIsAddDialogOpen(false);
    setFormData({ nama_cluster: "", siteid: "" });
  };

  const handleDeleteSite = (clusterName: string, siteId: string) => {
    // Find the cluster from filteredClusters
    const cluster = filteredClusters.find((c) => c.nama_cluster === clusterName);
    setSelectedCluster(cluster || null);
    setSelectedSiteForDelete({ nama_cluster: clusterName, siteid: siteId });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCluster = (cluster: ClusterSummary) => {
    setSelectedCluster(cluster);
    setSelectedSiteForDelete(null);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedSiteForDelete) {
      deleteMutation.mutate(selectedSiteForDelete);
    } else if (selectedCluster) {
      // Delete all sites in the cluster one by one
      Promise.all(
        selectedCluster.site_ids.map((siteId) =>
          deleteMutation.mutateAsync({
            nama_cluster: selectedCluster.nama_cluster,
            siteid: siteId,
          }),
        ),
      )
        .then(() => {
          toast.success(`All sites in ${selectedCluster.nama_cluster} deleted successfully`);
        })
        .catch((error) => {
          toast.error(`Error deleting cluster: ${error.message}`);
        });
    }
  };

  const toggleClusterExpand = (clusterName: string) => {
    if (expandedCluster === clusterName) {
      setExpandedCluster(null);
      // Reset page for this cluster when collapsing
      setCurrentPage((prev) => {
        const newState = { ...prev };
        delete newState[clusterName];
        return newState;
      });
    } else {
      setExpandedCluster(clusterName);
      // Initialize page to 1 when expanding
      setCurrentPage((prev) => ({
        ...prev,
        [clusterName]: 1,
      }));
    }
  };

  const handlePageChange = (clusterName: string, page: number) => {
    setCurrentPage((prev) => ({
      ...prev,
      [clusterName]: page,
    }));
  };

  // Get paginated sites for a cluster
  const getPaginatedSites = (cluster: ClusterSummary) => {
    const page = currentPage[cluster.nama_cluster] || 1;
    const startIndex = (page - 1) * SITES_PER_PAGE;
    const endIndex = startIndex + SITES_PER_PAGE;
    const paginatedSites = cluster.site_ids.slice(startIndex, endIndex);
    const totalPages = Math.ceil(cluster.site_ids.length / SITES_PER_PAGE);

    return {
      sites: paginatedSites,
      currentPage: page,
      totalPages,
      startIndex,
      endIndex: Math.min(endIndex, cluster.site_ids.length),
    };
  };

  // Excel Import Functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip header row and process data
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as any[][];

        // Validate headers
        const expectedHeaders = ["nama_cluster", "siteid"];
        const headerErrors: string[] = [];

        expectedHeaders.forEach((expected, index) => {
          const actualHeader = headers[index]?.toString().toLowerCase().trim();
          if (actualHeader !== expected) {
            headerErrors.push(`Column ${index + 1} should be "${expected}" but found "${headers[index] || "empty"}"`);
          }
        });

        if (headerErrors.length > 0) {
          toast.error(`Invalid file format: ${headerErrors.join(", ")}`);
          return;
        }

        // Process and validate rows
        const validData: RefQueryCluster[] = [];
        const invalidRows: Array<{ row: number; data: any; errors: string[] }> = [];

        rows.forEach((row, index) => {
          const rowNumber = index + 2; // +2 because header is row 1
          const rowErrors: string[] = [];

          const nama_cluster = row[0]?.toString().trim();
          const siteid = row[1]?.toString().trim();

          if (!nama_cluster) {
            rowErrors.push("nama_cluster is required");
          }
          if (!siteid) {
            rowErrors.push("siteid is required");
          }

          if (rowErrors.length === 0) {
            validData.push({ nama_cluster, siteid });
          } else {
            invalidRows.push({
              row: rowNumber,
              data: { nama_cluster, siteid },
              errors: rowErrors,
            });
          }
        });

        setImportPreview({
          validData,
          invalidRows,
        });

        toast.success(`File processed: ${validData.length} valid rows, ${invalidRows.length} invalid rows`);
      } catch (error) {
        toast.error(`Error processing file: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (!importPreview || importPreview.validData.length === 0) {
      toast.error("No valid data to import");
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportResult(null);

    // Check for duplicates with existing data
    const existingRows = extractRows(data);
    const existingKeys = new Set(existingRows.map((row) => `${row.nama_cluster}|${row.siteid}`));

    const newData = importPreview.validData.filter((row) => !existingKeys.has(`${row.nama_cluster}|${row.siteid}`));

    const duplicates = importPreview.validData.length - newData.length;

    if (duplicates > 0) {
      toast.info(`${duplicates} duplicate rows will be skipped`);
    }

    if (newData.length === 0) {
      toast.warning("All rows are duplicates, nothing to import");
      setIsImporting(false);
      return;
    }

    await bulkInsertMutation.mutateAsync(newData);
  };

  const resetImport = () => {
    setImportPreview(null);
    setImportResult(null);
    setImportProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const template = [
      ["nama_cluster", "siteid"],
      ["Cluster A", "SITE001"],
      ["Cluster A", "SITE002"],
      ["Cluster B", "SITE003"],
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(template);
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "cluster_template.xlsx");
  };

  const handleCloseImportDialog = () => {
    setIsImportDialogOpen(false);
    resetImport();
  };

  // Get paginated sites for a cluster
  const getPaginatedSitesForCluster = (cluster: ClusterSummary) => {
    const page = currentPage[cluster.nama_cluster] || 1;
    const startIndex = (page - 1) * SITES_PER_PAGE;
    const endIndex = startIndex + SITES_PER_PAGE;
    const paginatedSites = cluster.site_ids.slice(startIndex, endIndex);
    const totalPages = Math.ceil(cluster.site_ids.length / SITES_PER_PAGE);

    return {
      sites: paginatedSites,
      currentPage: page,
      totalPages,
      startIndex,
      endIndex: Math.min(endIndex, cluster.site_ids.length),
    };
  };

  if (isPending) return <EnhancedLoadingState />;
  if (isError) return <ErrorState message={error.message} />;

  // Calculate total sites safely
  const totalSites = clusterSummaries.reduce((acc, curr) => acc + curr.total_sites, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ref Query Cluster Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Total Clusters: {clusterSummaries.length} | Total Sites: {totalSites}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Import Button */}
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Import Excel
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Import from Excel</DialogTitle>
                  <DialogDescription>Upload an Excel file with columns: nama_cluster and siteid</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Template Download */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">Download template</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={downloadTemplate}>
                      <Download className="h-4 w-4 mr-2" />
                      Template
                    </Button>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Select Excel File</div>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="cursor-pointer"
                    />
                  </div>

                  {/* Preview */}
                  {importPreview && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Preview</h3>
                        <Badge variant={importPreview.invalidRows.length > 0 ? "destructive" : "default"}>
                          {importPreview.validData.length} valid, {importPreview.invalidRows.length} invalid
                        </Badge>
                      </div>

                      {/* Valid Data Preview */}
                      {importPreview.validData.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Valid Rows (First 5)
                          </h4>
                          <ScrollArea className="h-[200px] border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Cluster Name</TableHead>
                                  <TableHead>Site ID</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {importPreview.validData.slice(0, 5).map((row, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>{row.nama_cluster}</TableCell>
                                    <TableCell>{row.siteid}</TableCell>
                                  </TableRow>
                                ))}
                                {importPreview.validData.length > 5 && (
                                  <TableRow>
                                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                                      ... and {importPreview.validData.length - 5} more rows
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </ScrollArea>
                        </div>
                      )}

                      {/* Invalid Data Preview */}
                      {importPreview.invalidRows.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            Invalid Rows
                          </h4>
                          <ScrollArea className="h-[200px] border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Row</TableHead>
                                  <TableHead>Data</TableHead>
                                  <TableHead>Errors</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {importPreview.invalidRows.map((row, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>{row.row}</TableCell>
                                    <TableCell>
                                      {row.data.nama_cluster} - {row.data.siteid}
                                    </TableCell>
                                    <TableCell>
                                      <ul className="list-disc list-inside text-xs text-red-600">
                                        {row.errors.map((err, i) => (
                                          <li key={i}>{err}</li>
                                        ))}
                                      </ul>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </ScrollArea>
                        </div>
                      )}

                      {/* Import Progress */}
                      {isImporting && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Importing...</span>
                            <span>{Math.round(importProgress)}%</span>
                          </div>
                          <Progress value={importProgress} />
                        </div>
                      )}

                      {/* Import Result */}
                      {importResult && (
                        <Alert variant={importResult.errors.length === 0 ? "default" : "destructive"}>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Import Complete</AlertTitle>
                          <AlertDescription>
                            <p>Total rows: {importResult.totalRows}</p>
                            <p>Inserted: {importResult.insertedRows}</p>
                            <p>Skipped: {importResult.skippedRows}</p>
                            {importResult.errors.length > 0 && (
                              <div className="mt-2">
                                <p className="font-semibold">Errors:</p>
                                <ul className="list-disc list-inside text-sm">
                                  {importResult.errors.slice(0, 3).map((err, idx) => (
                                    <li key={idx}>{err}</li>
                                  ))}
                                  {importResult.errors.length > 3 && (
                                    <li>... and {importResult.errors.length - 3} more errors</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  <DialogFooter>
                    <Button variant="outline" onClick={handleCloseImportDialog}>
                      Cancel
                    </Button>
                    {importPreview && !importResult && (
                      <>
                        <Button variant="outline" onClick={resetImport}>
                          <X className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                        <Button onClick={handleImport} disabled={isImporting || importPreview.validData.length === 0}>
                          {isImporting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Importing...
                            </>
                          ) : (
                            "Import Data"
                          )}
                        </Button>
                      </>
                    )}
                    {importResult && <Button onClick={handleCloseImportDialog}>Close</Button>}
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Button */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add New Site
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Site to Cluster</DialogTitle>
                  <DialogDescription>Enter the cluster name and site ID to add a new reference.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAddSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="nama_cluster" className="text-sm font-medium">
                      Cluster Name
                    </label>
                    <Input
                      id="nama_cluster"
                      name="nama_cluster"
                      value={formData.nama_cluster}
                      onChange={handleInputChange}
                      placeholder="Enter cluster name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="siteid" className="text-sm font-medium">
                      Site ID
                    </label>
                    <Input
                      id="siteid"
                      name="siteid"
                      value={formData.siteid}
                      onChange={handleInputChange}
                      placeholder="Enter site ID"
                      required
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={insertMutation.isPending}>
                      {insertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search by cluster name or site ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Clusters List */}
        <div className="space-y-4">
          {filteredClusters.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <NoDataState message="No clusters found" />
              </CardContent>
            </Card>
          ) : (
            filteredClusters.map((cluster) => {
              const {
                sites,
                currentPage: page,
                totalPages,
                startIndex,
                endIndex,
              } = getPaginatedSitesForCluster(cluster);

              return (
                <Card key={cluster.nama_cluster} className="overflow-hidden">
                  {/* Cluster Header */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleClusterExpand(cluster.nama_cluster)}
                      className="flex items-center gap-4 flex-1 p-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                      aria-expanded={expandedCluster === cluster.nama_cluster}
                    >
                      <div className="flex items-center gap-2">
                        {expandedCluster === cluster.nama_cluster ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                        <Hash className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{cluster.nama_cluster}</span>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        {cluster.total_sites} site{cluster.total_sites !== 1 ? "s" : ""}
                      </Badge>
                      {cluster.total_sites > SITES_PER_PAGE && expandedCluster === cluster.nama_cluster && (
                        <Badge variant="outline" className="text-xs">
                          Showing {startIndex + 1}-{endIndex} of {cluster.total_sites}
                        </Badge>
                      )}
                    </button>

                    <div className="px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCluster(cluster);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Site Details */}
                  {expandedCluster === cluster.nama_cluster && (
                    <div className="border-t">
                      {cluster.total_sites > SITES_PER_PAGE ? (
                        // With pagination for large lists
                        <>
                          <ScrollArea className="h-[400px]">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-gray-50 sticky top-0">
                                  <TableHead className="w-[200px]">Site ID</TableHead>
                                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {sites.map((siteId, index) => (
                                  <TableRow key={`${cluster.nama_cluster}-${siteId}-${index}`}>
                                    <TableCell className="font-mono text-sm">{siteId}</TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteSite(cluster.nama_cluster, siteId)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </ScrollArea>

                          {/* Pagination */}
                          <div className="border-t p-4">
                            <Pagination>
                              <PaginationContent>
                                <PaginationItem>
                                  <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (page > 1) handlePageChange(cluster.nama_cluster, page - 1);
                                    }}
                                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                                  />
                                </PaginationItem>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                                  // Show first, last, and pages around current page
                                  if (
                                    pageNum === 1 ||
                                    pageNum === totalPages ||
                                    (pageNum >= page - 1 && pageNum <= page + 1)
                                  ) {
                                    return (
                                      <PaginationItem key={pageNum}>
                                        <PaginationLink
                                          href="#"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handlePageChange(cluster.nama_cluster, pageNum);
                                          }}
                                          isActive={pageNum === page}
                                        >
                                          {pageNum}
                                        </PaginationLink>
                                      </PaginationItem>
                                    );
                                  }
                                  if (pageNum === page - 2 || pageNum === page + 2) {
                                    return (
                                      <PaginationItem key={pageNum}>
                                        <PaginationEllipsis />
                                      </PaginationItem>
                                    );
                                  }
                                  return null;
                                })}

                                <PaginationItem>
                                  <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (page < totalPages) handlePageChange(cluster.nama_cluster, page + 1);
                                    }}
                                    className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                                  />
                                </PaginationItem>
                              </PaginationContent>
                            </Pagination>
                          </div>
                        </>
                      ) : (
                        // Simple table for small lists
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="w-[200px]">Site ID</TableHead>
                              <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cluster.site_ids.map((siteId, index) => (
                              <TableRow key={`${cluster.nama_cluster}-${siteId}-${index}`}>
                                <TableCell className="font-mono text-sm">{siteId}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteSite(cluster.nama_cluster, siteId)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}

                      {/* Show total count if > 10 */}
                      {cluster.total_sites > SITES_PER_PAGE && (
                        <div className="border-t bg-gray-50 px-4 py-2 text-xs text-gray-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>
                            Showing {Math.min(SITES_PER_PAGE, cluster.total_sites)} sites per page. Total{" "}
                            {cluster.total_sites} sites.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                {selectedSiteForDelete ? (
                  <>
                    This action cannot be undone. This will permanently delete the site
                    <span className="mt-2 block font-semibold">
                      {selectedSiteForDelete.nama_cluster} - {selectedSiteForDelete.siteid}
                    </span>
                  </>
                ) : (
                  selectedCluster && (
                    <>
                      This action cannot be undone. This will permanently delete all {selectedCluster.total_sites} sites
                      in cluster
                      <span className="mt-2 block font-semibold">{selectedCluster.nama_cluster}</span>
                    </>
                  )
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
