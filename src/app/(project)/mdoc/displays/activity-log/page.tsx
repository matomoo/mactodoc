"use client";

import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ActivityLogItem {
  tanggal: string;
  siteid: string;
  band: string;
  deskripsi: string | null;
}

interface FormData {
  tanggal: string;
  siteid: string;
  band: string;
  deskripsi: string;
}

const emptyForm: FormData = {
  tanggal: "",
  siteid: "",
  band: "",
  deskripsi: "",
};

export default function ActivityLogPage() {
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ActivityLogItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ActivityLogItem | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  // Filters
  const [searchSiteid, setSearchSiteid] = useState("");
  const [filterBand, setFilterBand] = useState("all");

  // Fetch data
  const { data, isPending, error } = useQuery<ActivityLogItem[]>({
    queryKey: ["activity-log"],
    queryFn: async () => {
      const response = await fetch("/mdoc/api/v1/activity-log");
      if (!response.ok) throw new Error("Failed to fetch data");
      return response.json();
    },
  });

  // Extract unique values for dropdowns
  const uniqueBands = useMemo(() => [...new Set(data?.map((item) => item.band).filter(Boolean) || [])].sort(), [data]);

  // Filtered data
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) => {
      const matchSiteid = !searchSiteid || item.siteid.toLowerCase().includes(searchSiteid.toLowerCase());
      const matchBand = filterBand === "all" || item.band === filterBand;
      return matchSiteid && matchBand;
    });
  }, [data, searchSiteid, filterBand]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (payload: FormData) => {
      const res = await fetch("/mdoc/api/v1/activity-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-log"] });
      setIsDialogOpen(false);
      setFormData(emptyForm);
      toast.success("Created successfully");
    },
    onError: () => {
      toast.error("Failed to create");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: FormData }) => {
      const res = await fetch(`/mdoc/api/v1/activity-log/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-log"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData(emptyForm);
      toast.success("Updated successfully");
    },
    onError: () => {
      toast.error("Failed to update");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/mdoc/api/v1/activity-log/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-log"] });
      setIsDeleteDialogOpen(false);
      setDeletingItem(null);
      toast.success("Deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete");
    },
  });

  // Encode composite key for URL
  const encodeId = (item: ActivityLogItem) => {
    return encodeURIComponent(`${item.siteid}|${item.tanggal}|${item.band}`);
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: ActivityLogItem) => {
    setEditingItem(item);
    setFormData({
      tanggal: toDateInputValue(item.tanggal),
      siteid: item.siteid,
      band: item.band,
      deskripsi: item.deskripsi || "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (item: ActivityLogItem) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: encodeId(editingItem), payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (deletingItem) {
      deleteMutation.mutate(encodeId(deletingItem));
    }
  };

  const handleClearFilters = () => {
    setSearchSiteid("");
    setFilterBand("all");
  };

  const formatDate = (dateStr: string | Date | null) => {
    if (!dateStr) return "-";
    const d = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    return format(d, "dd/MM/yyyy");
  };

  const toDateInputValue = (dateStr: string | Date | null) => {
    if (!dateStr) return "";
    const d = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    return format(d, "yyyy-MM-dd");
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <Button onClick={handleOpenCreate}>Add New</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="w-48">
          <Label htmlFor="search-siteid">Search Site ID</Label>
          <Input
            id="search-siteid"
            placeholder="Search Site ID..."
            value={searchSiteid}
            onChange={(e) => setSearchSiteid(e.target.value)}
          />
        </div>
        <div className="w-36">
          <Label htmlFor="filter-band">Band</Label>
          <Select value={filterBand} onValueChange={setFilterBand}>
            <SelectTrigger id="filter-band">
              <SelectValue placeholder="All Bands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bands</SelectItem>
              {uniqueBands.map((band) => (
                <SelectItem key={band} value={band}>
                  {band}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={handleClearFilters}>
          Clear
        </Button>
      </div>

      {isPending && <div className="text-muted-foreground">Loading...</div>}
      {error && <div className="text-destructive">Error: {error.message}</div>}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Site ID</TableHead>
              <TableHead>Band</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No data available
                </TableCell>
              </TableRow>
            )}
            {filteredData.map((item) => (
              <TableRow key={`${item.siteid}-${item.tanggal}-${item.band}`}>
                <TableCell>{formatDate(item.tanggal)}</TableCell>
                <TableCell>{item.siteid}</TableCell>
                <TableCell>{item.band}</TableCell>
                <TableCell>{item.deskripsi || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(item)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleOpenDelete(item)}>
                      Del
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tanggal">Tanggal</Label>
                <Input
                  id="tanggal"
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="siteid">Site ID</Label>
                <Input
                  id="siteid"
                  value={formData.siteid}
                  onChange={(e) => setFormData({ ...formData, siteid: e.target.value })}
                  required
                  disabled={!!editingItem}
                />
              </div>
              <div>
                <Label htmlFor="band">Band</Label>
                <Input
                  id="band"
                  value={formData.band}
                  onChange={(e) => setFormData({ ...formData, band: e.target.value })}
                  required
                  disabled={!!editingItem}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Input
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingItem ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this item? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
