"use client";

import { useState } from "react";

import Image from "next/image";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tab1Upload({ wid }: { wid: string }) {
  // Map Site state
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState(0);

  const fileName = `${wid}-map_ta`;
  const imageUrl = `/chart-for-doc/${fileName}.jpg${imageKey ? `?v=${imageKey}` : ""}`;

  // Map Cluster state
  const [clusterFile, setClusterFile] = useState<File | null>(null);
  const [isClusterUploading, setIsClusterUploading] = useState(false);
  const [clusterPreviewUrl, setClusterPreviewUrl] = useState<string | null>(null);
  const [clusterImageKey, setClusterImageKey] = useState(0);

  const clusterFileName = `${wid}-map_cluster`;
  const clusterImageUrl = `/chart-for-doc/${clusterFileName}.jpg${clusterImageKey ? `?v=${clusterImageKey}` : ""}`;

  // SD to TCH state
  const [sdToTchFile, setSdToTchFile] = useState<File | null>(null);
  const [isSdToTchUploading, setIsSdToTchUploading] = useState(false);
  const [sdToTchPreviewUrl, setSdToTchPreviewUrl] = useState<string | null>(null);
  const [sdToTchImageKey, setSdToTchImageKey] = useState(0);

  const sdToTchFileName = `${wid}-sd_to_tch`;
  const sdToTchImageUrl = `/chart-for-doc/${sdToTchFileName}.jpg${sdToTchImageKey ? `?v=${sdToTchImageKey}` : ""}`;

  // Packet Loss state
  const [packetLossFile, setPacketLossFile] = useState<File | null>(null);
  const [isPacketLossUploading, setIsPacketLossUploading] = useState(false);
  const [packetLossPreviewUrl, setPacketLossPreviewUrl] = useState<string | null>(null);
  const [packetLossImageKey, setPacketLossImageKey] = useState(0);

  const packetLossFileName = `${wid}-packet_loss`;
  const packetLossImageUrl = `/chart-for-doc/${packetLossFileName}.jpg${packetLossImageKey ? `?v=${packetLossImageKey}` : ""}`;

  // Active Alarm state
  const [activeAlarmFile, setActiveAlarmFile] = useState<File | null>(null);
  const [isActiveAlarmUploading, setIsActiveAlarmUploading] = useState(false);
  const [activeAlarmPreviewUrl, setActiveAlarmPreviewUrl] = useState<string | null>(null);
  const [activeAlarmImageKey, setActiveAlarmImageKey] = useState(0);

  const activeAlarmFileName = `${wid}-active_alarm`;
  const activeAlarmImageUrl = `/chart-for-doc/${activeAlarmFileName}.jpg${activeAlarmImageKey ? `?v=${activeAlarmImageKey}` : ""}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleClusterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setClusterFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setClusterPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", fileName);

      const response = await fetch("/mdoc/api/v1/upload-chart", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      toast.success("File uploaded successfully");
      setFile(null);
      setPreviewUrl(null);
      setImageKey((k) => k + 1);
    } catch {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClusterUpload = async () => {
    if (!clusterFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsClusterUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", clusterFile);
      formData.append("fileName", clusterFileName);

      const response = await fetch("/mdoc/api/v1/upload-chart", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      toast.success("Map cluster uploaded successfully");
      setClusterFile(null);
      setClusterPreviewUrl(null);
      setClusterImageKey((k) => k + 1);
    } catch {
      toast.error("Failed to upload map cluster");
    } finally {
      setIsClusterUploading(false);
    }
  };

  const handleSdToTchFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setSdToTchFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setSdToTchPreviewUrl(url);
    }
  };

  const handleSdToTchUpload = async () => {
    if (!sdToTchFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsSdToTchUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", sdToTchFile);
      formData.append("fileName", sdToTchFileName);

      const response = await fetch("/mdoc/api/v1/upload-chart", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      toast.success("SD to TCH uploaded successfully");
      setSdToTchFile(null);
      setSdToTchPreviewUrl(null);
      setSdToTchImageKey((k) => k + 1);
    } catch {
      toast.error("Failed to upload SD to TCH");
    } finally {
      setIsSdToTchUploading(false);
    }
  };

  const handlePacketLossFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setPacketLossFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPacketLossPreviewUrl(url);
    }
  };

  const handlePacketLossUpload = async () => {
    if (!packetLossFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsPacketLossUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", packetLossFile);
      formData.append("fileName", packetLossFileName);

      const response = await fetch("/mdoc/api/v1/upload-chart", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      toast.success("Packet Loss uploaded successfully");
      setPacketLossFile(null);
      setPacketLossPreviewUrl(null);
      setPacketLossImageKey((k) => k + 1);
    } catch {
      toast.error("Failed to upload Packet Loss");
    } finally {
      setIsPacketLossUploading(false);
    }
  };

  const handleActiveAlarmFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setActiveAlarmFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setActiveAlarmPreviewUrl(url);
    }
  };

  const handleActiveAlarmUpload = async () => {
    if (!activeAlarmFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsActiveAlarmUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", activeAlarmFile);
      formData.append("fileName", activeAlarmFileName);

      const response = await fetch("/mdoc/api/v1/upload-chart", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      toast.success("Active Alarm uploaded successfully");
      setActiveAlarmFile(null);
      setActiveAlarmPreviewUrl(null);
      setActiveAlarmImageKey((k) => k + 1);
    } catch {
      toast.error("Failed to upload Active Alarm");
    } finally {
      setIsActiveAlarmUploading(false);
    }
  };

  return (
    <div className="space-y-4 p-2">
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardHeader>
            <CardTitle>Map Site</CardTitle>
            <CardDescription>Upload map site image for {wid}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Image */}
            <div className="space-y-2">
              <Label>Current Image</Label>
              <div className="border rounded-md overflow-hidden bg-muted/50">
                <Image
                  key={imageKey}
                  src={imageUrl}
                  alt={`Map site for ${wid}`}
                  width={600}
                  height={200}
                  unoptimized
                  className="w-full h-auto max-h-[200px] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>

            {/* Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload New Image</Label>
              <div className="flex items-center gap-4">
                <Input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="flex-1" />
                <Button onClick={handleUpload} disabled={!file || isUploading}>
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name} → {fileName}.jpg
                </p>
              )}
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-md overflow-hidden bg-muted/50">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={600}
                    height={200}
                    className="w-full h-auto max-h-[200px] object-contain"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Map Cluster Card */}
        <Card>
          <CardHeader>
            <CardTitle>Map Cluster</CardTitle>
            <CardDescription>Upload map cluster image for {wid}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Image */}
            <div className="space-y-2">
              <Label>Current Image</Label>
              <div className="border rounded-md overflow-hidden bg-muted/50">
                <Image
                  key={clusterImageKey}
                  src={clusterImageUrl}
                  alt={`Map cluster for ${wid}`}
                  width={600}
                  height={200}
                  unoptimized
                  className="w-full h-auto max-h-[200px] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>

            {/* Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="cluster-upload">Upload New Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="cluster-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleClusterFileChange}
                  className="flex-1"
                />
                <Button onClick={handleClusterUpload} disabled={!clusterFile || isClusterUploading}>
                  {isClusterUploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
              {clusterFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {clusterFile.name} → {clusterFileName}.jpg
                </p>
              )}
            </div>

            {/* Preview */}
            {clusterPreviewUrl && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-md overflow-hidden bg-muted/50">
                  <Image
                    src={clusterPreviewUrl}
                    alt="Preview"
                    width={600}
                    height={200}
                    className="w-full h-auto max-h-[200px] object-contain"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SD to TCH Card */}
        <Card>
          <CardHeader>
            <CardTitle>SD to TCH</CardTitle>
            <CardDescription>Upload SD to TCH chart for {wid}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Image */}
            <div className="space-y-2">
              <Label>Current Image</Label>
              <div className="border rounded-md overflow-hidden bg-muted/50">
                <Image
                  key={sdToTchImageKey}
                  src={sdToTchImageUrl}
                  alt={`SD to TCH for ${wid}`}
                  width={600}
                  height={200}
                  unoptimized
                  className="w-full h-auto max-h-[200px] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>

            {/* Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="sd-to-tch-upload">Upload New Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="sd-to-tch-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleSdToTchFileChange}
                  className="flex-1"
                />
                <Button onClick={handleSdToTchUpload} disabled={!sdToTchFile || isSdToTchUploading}>
                  {isSdToTchUploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
              {sdToTchFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {sdToTchFile.name} → {sdToTchFileName}.jpg
                </p>
              )}
            </div>

            {/* Preview */}
            {sdToTchPreviewUrl && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-md overflow-hidden bg-muted/50">
                  <Image
                    src={sdToTchPreviewUrl}
                    alt="Preview"
                    width={600}
                    height={200}
                    className="w-full h-auto max-h-[200px] object-contain"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Packet Loss Card */}
        <Card>
          <CardHeader>
            <CardTitle>Packet Loss</CardTitle>
            <CardDescription>Upload packet loss chart for {wid}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Image */}
            <div className="space-y-2">
              <Label>Current Image</Label>
              <div className="border rounded-md overflow-hidden bg-muted/50">
                <Image
                  key={packetLossImageKey}
                  src={packetLossImageUrl}
                  alt={`Packet Loss for ${wid}`}
                  width={600}
                  height={200}
                  unoptimized
                  className="w-full h-auto max-h-[200px] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>

            {/* Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="packet-loss-upload">Upload New Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="packet-loss-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePacketLossFileChange}
                  className="flex-1"
                />
                <Button onClick={handlePacketLossUpload} disabled={!packetLossFile || isPacketLossUploading}>
                  {isPacketLossUploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
              {packetLossFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {packetLossFile.name} → {packetLossFileName}.jpg
                </p>
              )}
            </div>

            {/* Preview */}
            {packetLossPreviewUrl && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-md overflow-hidden bg-muted/50">
                  <Image
                    src={packetLossPreviewUrl}
                    alt="Preview"
                    width={600}
                    height={200}
                    className="w-full h-auto max-h-[200px] object-contain"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Alarm Card */}
        <Card>
          <CardHeader>
            <CardTitle>Active Alarm</CardTitle>
            <CardDescription>Upload active alarm chart for {wid}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Image */}
            <div className="space-y-2">
              <Label>Current Image</Label>
              <div className="border rounded-md overflow-hidden bg-muted/50">
                <Image
                  key={activeAlarmImageKey}
                  src={activeAlarmImageUrl}
                  alt={`Active Alarm for ${wid}`}
                  width={600}
                  height={200}
                  unoptimized
                  className="w-full h-auto max-h-[200px] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>

            {/* Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="active-alarm-upload">Upload New Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="active-alarm-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleActiveAlarmFileChange}
                  className="flex-1"
                />
                <Button onClick={handleActiveAlarmUpload} disabled={!activeAlarmFile || isActiveAlarmUploading}>
                  {isActiveAlarmUploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
              {activeAlarmFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {activeAlarmFile.name} → {activeAlarmFileName}.jpg
                </p>
              )}
            </div>

            {/* Preview */}
            {activeAlarmPreviewUrl && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-md overflow-hidden bg-muted/50">
                  <Image
                    src={activeAlarmPreviewUrl}
                    alt="Preview"
                    width={600}
                    height={200}
                    className="w-full h-auto max-h-[200px] object-contain"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
