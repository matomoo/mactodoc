"use client";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SqacFirstTierItem {
  id: string;
  siteid_main: string;
  siteid_tier: string;
  sector_tier: string;
  remark: string | null;
}

interface FormData {
  siteid_main: string;
  siteid_tier: string;
  sector_tier: string;
  remark: string;
}

const emptyForm: FormData = {
  siteid_main: "",
  siteid_tier: "",
  sector_tier: "",
  remark: "",
};

export default function SqacFirstTierPage({ wid }: { wid: string }) {
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SqacFirstTierItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<SqacFirstTierItem | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  // Search filters
  const [searchSiteidMain, setSearchSiteidMain] = useState("");
  const [searchSiteidTier, setSearchSiteidTier] = useState("");

  // Fetch data
  const { data, isPending, error } = useQuery<SqacFirstTierItem[]>({
    queryKey: ["sqac-first-tier"],
    queryFn: async () => {
      const response = await fetch("/mdoc/api/v1/sqac-first-tier");
      if (!response.ok) throw new Error("Failed to fetch data");
      return response.json();
    },
  });

  // Filtered data
  const filteredData =
    data?.filter((item) => {
      const matchMain = !searchSiteidMain || item.siteid_main.toLowerCase().includes(searchSiteidMain.toLowerCase());
      const matchTier = !searchSiteidTier || item.siteid_tier.toLowerCase().includes(searchSiteidTier.toLowerCase());
      return matchMain && matchTier;
    }) || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (payload: FormData) => {
      const res = await fetch("/mdoc/api/v1/sqac-first-tier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sqac-first-tier"] });
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
      const res = await fetch(`/mdoc/api/v1/sqac-first-tier/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sqac-first-tier"] });
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
      const res = await fetch(`/mdoc/api/v1/sqac-first-tier/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sqac-first-tier"] });
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

  const handleOpenEdit = (item: SqacFirstTierItem) => {
    setEditingItem(item);
    setFormData({
      siteid_main: item.siteid_main,
      siteid_tier: item.siteid_tier,
      sector_tier: item.sector_tier,
      remark: item.remark || "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (item: SqacFirstTierItem) => {
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
    setSearchSiteidMain("");
    setSearchSiteidTier("");
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">SQAC First Tier</h1>
        <Button onClick={handleOpenCreate}>Add New</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-48">
          <Label htmlFor="search-siteid-main">Search Site ID Main</Label>
          <Input
            id="search-siteid-main"
            placeholder="Search Site ID Main..."
            value={searchSiteidMain}
            onChange={(e) => setSearchSiteidMain(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Label htmlFor="search-siteid-tier">Search Site ID Tier</Label>
          <Input
            id="search-siteid-tier"
            placeholder="Search Site ID Tier..."
            value={searchSiteidTier}
            onChange={(e) => setSearchSiteidTier(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleClearFilters}>
          Clear
        </Button>
      </div>

      {isPending && <div className="text-muted-foreground">Loading...</div>}
      {error && <div className="text-destructive">Error: {error.message}</div>}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Site ID Main</TableHead>
              <TableHead>Site ID Tier</TableHead>
              <TableHead>Sector Tier</TableHead>
              <TableHead>Remark</TableHead>
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
              <TableRow key={item.id}>
                <TableCell>{item.siteid_main}</TableCell>
                <TableCell>{item.siteid_tier}</TableCell>
                <TableCell>{item.sector_tier}</TableCell>
                <TableCell>{item.remark || "-"}</TableCell>
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
                <Label htmlFor="siteid_main">Site ID Main</Label>
                <Input
                  id="siteid_main"
                  value={formData.siteid_main}
                  onChange={(e) => setFormData({ ...formData, siteid_main: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="siteid_tier">Site ID Tier</Label>
                <Input
                  id="siteid_tier"
                  value={formData.siteid_tier}
                  onChange={(e) => setFormData({ ...formData, siteid_tier: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sector_tier">Sector Tier</Label>
                <Input
                  id="sector_tier"
                  value={formData.sector_tier}
                  onChange={(e) => setFormData({ ...formData, sector_tier: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="remark">Remark</Label>
              <Input
                id="remark"
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
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
