"use client";

import { useState } from "react";

import Image from "next/image";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploaderCardProps {
  title: string;
  wid: string;
  suffix: string;
  imageKey: number;
  setImageKey: (key: number) => void;
  basePath?: string;
}

export function ImageUploaderCard({
  title,
  wid,
  suffix,
  imageKey,
  setImageKey,
  basePath = "/chart-for-doc/",
}: ImageUploaderCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileName = `${wid}-${suffix}`;
  const imageUrl = `${basePath}${fileName}.jpg${imageKey ? `?v=${imageKey}` : ""}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
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
      setImageKey(imageKey + 1);
    } catch {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Current Image</Label>
          <div className="overflow-hidden rounded-md border bg-muted/50">
            <Image
              key={imageKey}
              src={imageUrl}
              alt={`${title} for ${wid}`}
              width={600}
              height={200}
              unoptimized
              className="h-auto max-h-50 w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`file-upload-${suffix}`}>Upload New Image</Label>
          <div className="flex items-center gap-4">
            <Input
              id={`file-upload-${suffix}`}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="flex-1"
            />
            <Button onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
          {file && (
            <p className="text-muted-foreground text-sm">
              Selected: {file.name} → {fileName}.jpg
            </p>
          )}
        </div>

        {previewUrl && (
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="overflow-hidden rounded-md border bg-muted/50">
              <Image
                src={previewUrl}
                alt="Preview"
                width={600}
                height={200}
                className="h-auto max-h-50 w-full object-contain"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
