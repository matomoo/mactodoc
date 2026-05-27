"use client";

import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SqacTrackerItem {
  id: string;
  user_id: string;
  wid: string;
  site: string;
  band: string;
  connected: string | null;
  audit: string | null;
  dt: string | null;
  sqac_status: string;
  sqac_remark: string;
  created_at: string;
}

interface FormData {
  wid: string;
  site: string;
  band: string;
  connected: string;
  audit: string;
  dt: string;
  sqac_status: string;
  sqac_remark: string;
}

const emptyForm: FormData = {
  wid: "",
  site: "",
  band: "",
  connected: "",
  audit: "",
  dt: "",
  sqac_status: "",
  sqac_remark: "",
};

export default function SqacTrackerPage() {
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SqacTrackerItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<SqacTrackerItem | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  // Filters
  const [searchWid, setSearchWid] = useState("");
  const [filterSite, setFilterSite] = useState("all");
  const [filterBand, setFilterBand] = useState("all");
  const [filterSqacStatus, setFilterSqacStatus] = useState("all");

  // Fetch data
  const { data, isPending, error } = useQuery<SqacTrackerItem[]>({
    queryKey: ["sqac-tracker"],
    queryFn: async () => {
      const response = await fetch("/mdoc/api/v1/sqac-tracker");
      if (!response.ok) throw new Error("Failed to fetch data");
      return response.json();
    },
  });

  // Extract unique values for dropdowns
  const uniqueSites = useMemo(() => [...new Set(data?.map((item) => item.site).filter(Boolean) || [])].sort(), [data]);
  const uniqueBands = useMemo(() => [...new Set(data?.map((item) => item.band).filter(Boolean) || [])].sort(), [data]);
  const uniqueSqacStatuses = useMemo(
    () => [...new Set(data?.map((item) => item.sqac_status).filter(Boolean) || [])].sort(),
    [data],
  );

  // Filtered data
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) => {
      const matchWid = !searchWid || item.wid.toLowerCase().includes(searchWid.toLowerCase());
      const matchSite = filterSite === "all" || item.site === filterSite;
      const matchBand = filterBand === "all" || item.band === filterBand;
      const matchSqacStatus = filterSqacStatus === "all" || item.sqac_status === filterSqacStatus;
      return matchWid && matchSite && matchBand && matchSqacStatus;
    });
  }, [data, searchWid, filterSite, filterBand, filterSqacStatus]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (payload: FormData) => {
      const res = await fetch("/mdoc/api/v1/sqac-tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sqac-tracker"] });
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
      const res = await fetch(`/mdoc/api/v1/sqac-tracker/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sqac-tracker"] });
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
      const res = await fetch(`/mdoc/api/v1/sqac-tracker/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sqac-tracker"] });
      setIsDeleteDialogOpen(false);
      setDeletingItem(null);
      toast.success("Deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete");
    },
  });

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: SqacTrackerItem) => {
    setEditingItem(item);
    setFormData({
      wid: item.wid,
      site: item.site,
      band: item.band,
      connected: item.connected ? item.connected.split("T")[0] : "",
      audit: item.audit ? item.audit.split("T")[0] : "",
      dt: item.dt ? item.dt.split("T")[0] : "",
      sqac_status: item.sqac_status,
      sqac_remark: item.sqac_remark,
    });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (item: SqacTrackerItem) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (deletingItem) {
      deleteMutation.mutate(deletingItem.id);
    }
  };

  const handleClearFilters = () => {
    setSearchWid("");
    setFilterSite("all");
    setFilterBand("all");
    setFilterSqacStatus("all");
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB");
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">SQAC Tracker</h1>
        <Button onClick={handleOpenCreate}>Add New</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="w-48">
          <Label htmlFor="search-wid">Search WID</Label>
          <Input
            id="search-wid"
            placeholder="Search WID..."
            value={searchWid}
            onChange={(e) => setSearchWid(e.target.value)}
          />
        </div>
        <div className="w-40">
          <Label htmlFor="filter-site">Site</Label>
          <Select value={filterSite} onValueChange={setFilterSite}>
            <SelectTrigger id="filter-site">
              <SelectValue placeholder="All Sites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {uniqueSites.map((site) => (
                <SelectItem key={site} value={site}>
                  {site}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <div className="w-44">
          <Label htmlFor="filter-status">SQAC Status</Label>
          <Select value={filterSqacStatus} onValueChange={setFilterSqacStatus}>
            <SelectTrigger id="filter-status">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {uniqueSqacStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
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
              <TableHead>WID</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Band</TableHead>
              <TableHead>Connected</TableHead>
              <TableHead>Audit</TableHead>
              <TableHead>DT</TableHead>
              <TableHead>SQAC Status</TableHead>
              <TableHead>SQAC Remark</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No data available
                </TableCell>
              </TableRow>
            )}
            {filteredData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.wid}</TableCell>
                <TableCell>{item.site}</TableCell>
                <TableCell>{item.band}</TableCell>
                <TableCell>{formatDate(item.connected)}</TableCell>
                <TableCell>{formatDate(item.audit)}</TableCell>
                <TableCell>{formatDate(item.dt)}</TableCell>
                <TableCell>{item.sqac_status}</TableCell>
                <TableCell>{item.sqac_remark}</TableCell>
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
                <Label htmlFor="wid">WID</Label>
                <Input
                  id="wid"
                  value={formData.wid}
                  onChange={(e) => setFormData({ ...formData, wid: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="site">Site</Label>
                <Input
                  id="site"
                  value={formData.site}
                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="band">Band</Label>
                <Input
                  id="band"
                  value={formData.band}
                  onChange={(e) => setFormData({ ...formData, band: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sqac_status">SQAC Status</Label>
                <Input
                  id="sqac_status"
                  value={formData.sqac_status}
                  onChange={(e) => setFormData({ ...formData, sqac_status: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="connected">Connected</Label>
                <Input
                  id="connected"
                  type="date"
                  value={formData.connected}
                  onChange={(e) => setFormData({ ...formData, connected: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="audit">Audit</Label>
                <Input
                  id="audit"
                  type="date"
                  value={formData.audit}
                  onChange={(e) => setFormData({ ...formData, audit: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="dt">DT</Label>
                <Input
                  id="dt"
                  type="date"
                  value={formData.dt}
                  onChange={(e) => setFormData({ ...formData, dt: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="sqac_remark">SQAC Remark</Label>
              <Input
                id="sqac_remark"
                value={formData.sqac_remark}
                onChange={(e) => setFormData({ ...formData, sqac_remark: e.target.value })}
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
