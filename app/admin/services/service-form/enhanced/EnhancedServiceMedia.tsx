"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Upload, Image, Link, Camera } from "lucide-react";
import type { ServiceFormData, UpdateServiceField } from "./types";

type EnhancedServiceMediaProps = {
  formData: ServiceFormData;
  updateField: UpdateServiceField;
  addImageUrl: (url: string) => void;
  removeImageUrl: (url: string) => void;
  handleFileUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadError: string | null;
};

export default function EnhancedServiceMedia({
  formData,
  updateField,
  addImageUrl,
  removeImageUrl,
  handleFileUpload,
  isUploading,
  uploadError,
}: EnhancedServiceMediaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      handleFileUpload(imageFile);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Service Images
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Upload high-quality images to showcase your service
        </p>

        <div className="space-y-6">
          {/* Drag & Drop Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-gray-400 bg-gray-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isDragOver ? "bg-primary/10" : "bg-white shadow-sm"
                }`}
              >
                <Camera
                  className={`w-8 h-8 ${isDragOver ? "text-primary" : "text-gray-400"}`}
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-medium text-gray-900">
                  {isDragOver
                    ? "Drop your image here"
                    : "Upload Service Images"}
                </h4>
                <p className="text-sm text-gray-600">
                  Drag and drop your images here, or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Supports: JPG, PNG, GIF up to 10MB
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={handleFileSelect}
                  disabled={isUploading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "Uploading..." : "Choose Files"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="border-gray-300"
                >
                  <Link className="w-4 h-4 mr-2" />
                  Add URL
                </Button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
                e.currentTarget.value = "";
              }}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* URL Input Section */}
          {showUrlInput && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Add Image from URL
              </label>
              <div className="flex gap-3">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={(e) => updateField("image_url", e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => {
                    addImageUrl(formData.image_url);
                    updateField("image_url", "");
                    setShowUrlInput(false);
                  }}
                  disabled={!formData.image_url.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Upload Status */}
          {isUploading && (
            <div className="flex items-center justify-center p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-3"></div>
              <span className="text-sm text-primary">Uploading image...</span>
            </div>
          )}

          {uploadError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{uploadError}</p>
            </div>
          )}

          {/* Image Gallery */}
          {formData.image_urls.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">
                Uploaded Images
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.image_urls.map((url, index) => (
                  <div
                    key={url}
                    className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
                  >
                    {/* Loading placeholder */}
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center pointer-events-none">
                      <div className="animate-pulse text-gray-400">
                        <Image className="w-8 h-8" />
                      </div>
                    </div>
                    <img
                      src={url}
                      alt={`Service image ${index + 1}`}
                      className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                      onLoad={(e) => {
                        // Hide loading placeholder when image loads
                        const target = e.target as HTMLImageElement;
                        const parent = target.parentElement;
                        const loadingDiv =
                          parent?.querySelector(
                            ".animate-pulse",
                          )?.parentElement;
                        if (loadingDiv) {
                          loadingDiv.remove();
                        }
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const parent = target.parentElement;
                        if (
                          parent &&
                          !parent.querySelector(".error-placeholder")
                        ) {
                          // Hide loading placeholder
                          const loadingDiv =
                            parent.querySelector(
                              ".animate-pulse",
                            )?.parentElement;
                          if (loadingDiv) {
                            loadingDiv.remove();
                          }

                          // Create error placeholder
                          const errorDiv = document.createElement("div");
                          errorDiv.className =
                            "error-placeholder absolute inset-0 bg-gray-100 flex items-center justify-center pointer-events-none";
                          errorDiv.innerHTML = `
                            <div class="text-center">
                              <div class="w-8 h-8 mx-auto mb-2 text-gray-400">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.632 0L4.182 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                              </div>
                              <p class="text-xs text-gray-500">Failed to load</p>
                            </div>
                          `;
                          parent.appendChild(errorDiv);
                          target.style.display = "none";
                        }
                      }}
                    />

                    {/* Primary badge */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
                        Primary
                      </div>
                    )}

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeImageUrl(url)}
                      className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-destructive shadow-sm transition hover:bg-background hover:text-destructive"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    {/* Image overlay on hover */}
                    <div className="pointer-events-none absolute inset-0 bg-black/0 transition-all group-hover:bg-black/20 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Image className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500">
                💡 The first image will be used as the primary service image.
                Drag images to reorder.
              </p>
            </div>
          )}

          {/* Empty State */}
          {formData.image_urls.length === 0 && !isUploading && (
            <div className="text-center py-8">
              <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No images uploaded yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Add some images to make your service more appealing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
