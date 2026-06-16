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
  user_id: string | null;
  wid: string;
  siteid: string;
  band_4g_sow: string;
  connected: string | null;
  audit: string | null;
  dt: string | null;
  sqac_status: string;
  sqac_remark: string;
  created_at: string;
  type_of_work: string;
  tac: string;
  city: string;
  band_2g_sow: string;
  site_name_4g: string;
  site_name_2g: string;
  enodeb_id: string;
  cell_id_4g: string;
  cell_id_2g: string;
  longitude: string;
  latitude: string;
  kabupaten: string;
  lac_2g: string;
  site_no_2g: string;
  trx_configuration: string;
}

interface FormData {
  wid: string;
  siteid: string;
  band_4g_sow: string;
  connected: string;
  audit: string;
  dt: string;
  sqac_status: string;
  sqac_remark: string;
  type_of_work: string;
  tac: string;
  city: string;
  band_2g_sow: string;
  site_name_4g: string;
  site_name_2g: string;
  enodeb_id: string;
  cell_id_4g: string;
  cell_id_2g: string;
  longitude: string;
  latitude: string;
  kabupaten: string;
  lac_2g: string;
  site_no_2g: string;
  trx_configuration: string;
}

const emptyForm: FormData = {
  wid: "",
  siteid: "",
  band_4g_sow: "",
  connected: "",
  audit: "",
  dt: "",
  sqac_status: "",
  sqac_remark: "",
  type_of_work: "",
  tac: "",
  city: "",
  band_2g_sow: "",
  site_name_4g: "",
  site_name_2g: "",
  enodeb_id: "",
  cell_id_4g: "",
  cell_id_2g: "",
  longitude: "",
  latitude: "",
  kabupaten: "",
  lac_2g: "",
  site_no_2g: "",
  trx_configuration: "",
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
  const [filterKabupaten, setFilterKabupaten] = useState("all");

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
  const uniqueSites = useMemo(
    () => [...new Set(data?.map((item) => item.siteid).filter(Boolean) || [])].sort(),
    [data],
  );
  const uniqueBands = useMemo(
    () => [...new Set(data?.map((item) => item.band_4g_sow).filter(Boolean) || [])].sort(),
    [data],
  );
  const uniqueSqacStatuses = useMemo(
    () => [...new Set(data?.map((item) => item.sqac_status).filter(Boolean) || [])].sort(),
    [data],
  );
  const uniqueKabupaten = useMemo(
    () => [...new Set(data?.map((item) => item.kabupaten).filter(Boolean) || [])].sort(),
    [data],
  );

  // Filtered data
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) => {
      const matchWid = !searchWid || item.wid.toLowerCase().includes(searchWid.toLowerCase());
      const matchSite = filterSite === "all" || item.siteid === filterSite;
      const matchBand = filterBand === "all" || item.band_4g_sow === filterBand;
      const matchSqacStatus = filterSqacStatus === "all" || item.sqac_status === filterSqacStatus;
      const matchKabupaten = filterKabupaten === "all" || item.kabupaten === filterKabupaten;
      return matchWid && matchSite && matchBand && matchSqacStatus && matchKabupaten;
    });
  }, [data, searchWid, filterSite, filterBand, filterSqacStatus, filterKabupaten]);

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

  const handleOpenKpi = (item: SqacTrackerItem) => {
    window.open(`/mdoc/displays/doc-4g/kpi-statistic/${item.wid}`, "_blank");
  };

  const handleOpenEdit = (item: SqacTrackerItem) => {
    setEditingItem(item);
    setFormData({
      wid: item.wid ?? "",
      siteid: item.siteid ?? "",
      band_4g_sow: item.band_4g_sow ?? "",
      connected: item.connected ? item.connected.split("T")[0] : "",
      audit: item.audit ? item.audit.split("T")[0] : "",
      dt: item.dt ? item.dt.split("T")[0] : "",
      sqac_status: item.sqac_status ?? "",
      sqac_remark: item.sqac_remark ?? "",
      type_of_work: item.type_of_work ?? "",
      tac: item.tac ?? "",
      city: item.city ?? "",
      band_2g_sow: item.band_2g_sow ?? "",
      site_name_4g: item.site_name_4g ?? "",
      site_name_2g: item.site_name_2g ?? "",
      enodeb_id: item.enodeb_id ?? "",
      cell_id_4g: item.cell_id_4g ?? "",
      cell_id_2g: item.cell_id_2g ?? "",
      longitude: item.longitude ?? "",
      latitude: item.latitude ?? "",
      kabupaten: item.kabupaten ?? "",
      lac_2g: item.lac_2g ?? "",
      site_no_2g: item.site_no_2g ?? "",
      trx_configuration: item.trx_configuration ?? "",
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
    setFilterKabupaten("all");
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB");
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">SQAC Tracker</h1>
        <Button onClick={handleOpenCreate}>Add New</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
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
          <Label htmlFor="filter-site">Site ID</Label>
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
          <Label htmlFor="filter-band">Band 4G SOW</Label>
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
        <div className="w-44">
          <Label htmlFor="filter-kabupaten">Kabupaten</Label>
          <Select value={filterKabupaten} onValueChange={setFilterKabupaten}>
            <SelectTrigger id="filter-kabupaten">
              <SelectValue placeholder="All Kabupaten" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Kabupaten</SelectItem>
              {uniqueKabupaten.map((kab) => (
                <SelectItem key={kab} value={kab}>
                  {kab}
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

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>WID</TableHead>
              <TableHead>Site ID</TableHead>
              <TableHead>Band 4G SOW</TableHead>
              <TableHead>Band 2G SOW</TableHead>
              <TableHead>Kabupaten</TableHead>
              <TableHead>Type of Work</TableHead>
              <TableHead>Connected</TableHead>
              <TableHead>SQAC Status</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={21} className="text-center text-muted-foreground">
                  No data available
                </TableCell>
              </TableRow>
            )}
            {filteredData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.wid}</TableCell>
                <TableCell>{item.siteid}</TableCell>
                <TableCell>{item.band_4g_sow}</TableCell>
                <TableCell>{item.band_2g_sow}</TableCell>
                <TableCell>{item.kabupaten}</TableCell>
                <TableCell>{item.type_of_work}</TableCell>
                <TableCell>{formatDate(item.connected)}</TableCell>
                <TableCell>{item.sqac_status}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenKpi(item)}>
                      KPI
                    </Button>
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
        <DialogContent className="max-h-[90vh] max-w-3xl! overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
                <Label htmlFor="siteid">Site ID</Label>
                <Input
                  id="siteid"
                  value={formData.siteid}
                  onChange={(e) => setFormData({ ...formData, siteid: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="site_name_4g">Site Name 4G</Label>
                <Input
                  id="site_name_4g"
                  value={formData.site_name_4g}
                  onChange={(e) => setFormData({ ...formData, site_name_4g: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="site_name_2g">Site Name 2G</Label>
                <Input
                  id="site_name_2g"
                  value={formData.site_name_2g}
                  onChange={(e) => setFormData({ ...formData, site_name_2g: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="band_4g_sow">Band 4G SOW</Label>
                <Input
                  id="band_4g_sow"
                  value={formData.band_4g_sow}
                  onChange={(e) => setFormData({ ...formData, band_4g_sow: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="band_2g_sow">Band 2G SOW</Label>
                <Input
                  id="band_2g_sow"
                  value={formData.band_2g_sow}
                  onChange={(e) => setFormData({ ...formData, band_2g_sow: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="kabupaten">Kabupaten</Label>
                <Input
                  id="kabupaten"
                  value={formData.kabupaten}
                  onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
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
                <Label htmlFor="type_of_work">Type of Work</Label>
                <Input
                  id="type_of_work"
                  value={formData.type_of_work}
                  onChange={(e) => setFormData({ ...formData, type_of_work: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tac">TAC</Label>
                <Input
                  id="tac"
                  value={formData.tac}
                  onChange={(e) => setFormData({ ...formData, tac: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lac_2g">LAC</Label>
                <Input
                  id="lac_2g"
                  value={formData.lac_2g}
                  onChange={(e) => setFormData({ ...formData, lac_2g: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="site_no_2g">Site No 2G</Label>
                <Input
                  id="site_no_2g"
                  value={formData.site_no_2g}
                  onChange={(e) => setFormData({ ...formData, site_no_2g: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="enodeb_id">eNodeB ID</Label>
                <Input
                  id="enodeb_id"
                  value={formData.enodeb_id}
                  onChange={(e) => setFormData({ ...formData, enodeb_id: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cell_id_4g">Cell ID 4G</Label>
                <Input
                  id="cell_id_4g"
                  value={formData.cell_id_4g}
                  onChange={(e) => setFormData({ ...formData, cell_id_4g: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cell_id_2g">Cell ID 2G</Label>
                <Input
                  id="cell_id_2g"
                  value={formData.cell_id_2g}
                  onChange={(e) => setFormData({ ...formData, cell_id_2g: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="trx_configuration">TRX Configuration</Label>
                <Input
                  id="trx_configuration"
                  value={formData.trx_configuration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      trx_configuration: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
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
