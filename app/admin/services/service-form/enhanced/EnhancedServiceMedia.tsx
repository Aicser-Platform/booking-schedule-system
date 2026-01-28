"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
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
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-4">
          Service Images
        </label>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              placeholder="Enter image URL"
              value={formData.image_url}
              onChange={(e) => updateField("image_url", e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addImageUrl(formData.image_url)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Upload from your device
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
                e.currentTarget.value = "";
              }}
              disabled={isUploading}
            />
            {isUploading && (
              <p className="text-xs text-gray-500">Uploading image...</p>
            )}
            {uploadError && (
              <p className="text-xs text-red-600">{uploadError}</p>
            )}
          </div>

          {formData.image_urls.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {formData.image_urls.map((url) => (
                <div
                  key={url}
                  className="relative w-24 h-20 rounded-lg overflow-hidden border border-gray-200"
                >
                  <img
                    src={url}
                    alt="Service"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImageUrl(url)}
                    className="absolute top-1 right-1 rounded-full bg-white/80 p-1 text-gray-600 hover:text-gray-900"
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
