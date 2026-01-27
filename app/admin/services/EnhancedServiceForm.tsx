"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Image as ImageIcon,
  X,
  Plus,
  Camera,
  DollarSign,
  Clock,
  Users,
  FileText,
  Settings,
} from "lucide-react";

type ServiceFormData = {
  name: string;
  description: string;
  category: string;
  duration_minutes: number;
  price: number;
  deposit_amount: number;
  max_capacity: number;
  buffer_minutes: number;
  image_url: string;
  image_urls: string[];
  is_active: boolean;
  tags: string;
  inclusions: string;
  prep_notes: string;
};

type EnhancedServiceFormProps = {
  mode: "create" | "edit";
  serviceId?: string;
  initialValues?: any;
  onPreviewUpdate?: (data: any) => void;
};

export default function EnhancedServiceForm({
  mode,
  serviceId,
  initialValues,
  onPreviewUpdate,
}: EnhancedServiceFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const initialTags = Array.isArray(initialValues?.tags)
    ? initialValues.tags.join(", ")
    : (initialValues?.tags ?? "");
  const initialImages = Array.isArray(initialValues?.image_urls)
    ? initialValues.image_urls
    : [];

  const [formData, setFormData] = useState<ServiceFormData>({
    name: initialValues?.name || "",
    description: initialValues?.description || "",
    category: initialValues?.category || "WELLNESS",
    duration_minutes: initialValues?.duration_minutes || 60,
    price: initialValues?.price || 149,
    deposit_amount: initialValues?.deposit_amount || 0,
    max_capacity: initialValues?.max_capacity || 1,
    buffer_minutes: initialValues?.buffer_minutes || 15,
    image_url: initialValues?.image_url || "",
    image_urls: initialImages,
    is_active: initialValues?.is_active ?? true,
    tags: typeof initialTags === "string" ? initialTags : "",
    inclusions: initialValues?.inclusions || "",
    prep_notes: initialValues?.prep_notes || "",
  });

  // Update preview whenever form data changes
  useEffect(() => {
    if (onPreviewUpdate) {
      onPreviewUpdate({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        duration_minutes: formData.duration_minutes,
        price: formData.price,
        image_url: formData.image_url,
        image_urls: formData.image_urls,
        is_active: formData.is_active,
      });
    }
  }, [formData, onPreviewUpdate]);

  const updateField = <K extends keyof ServiceFormData>(
    field: K,
    value: ServiceFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addImageUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      const nextUrls = prev.image_urls.includes(trimmed)
        ? prev.image_urls
        : [...prev.image_urls, trimmed];
      return { ...prev, image_url: trimmed, image_urls: nextUrls };
    });
  };

  const removeImageUrl = (url: string) => {
    setFormData((prev) => {
      const nextUrls = prev.image_urls.filter((img) => img !== url);
      const nextPrimary =
        prev.image_url === url ? (nextUrls[0] ?? "") : prev.image_url;
      return { ...prev, image_urls: nextUrls, image_url: nextPrimary };
    });
  };

  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/services/upload-image", {
        method: "POST",
        body: form,
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.detail || data?.message || "Upload failed");
      }

      if (data?.image_url) {
        addImageUrl(data.image_url as string);
      } else {
        throw new Error("Upload failed to return image URL");
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const steps = [
    {
      id: "basic",
      title: "Basic Information",
      icon: FileText,
      description: "Service name, description, and category",
    },
    {
      id: "pricing",
      title: "Pricing & Duration",
      icon: DollarSign,
      description: "Set pricing, duration, and capacity",
    },
    {
      id: "media",
      title: "Service Media",
      icon: Camera,
      description: "Upload images and media",
    },
    {
      id: "promotion",
      title: "Promotion",
      icon: Settings,
      description: "Visibility and promotional settings",
    },
  ];

  const handleSubmit = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const endpoint =
        mode === "create" ? "/api/services" : `/api/services/${serviceId}`;

      const method = mode === "create" ? "POST" : "PUT";
      const normalizedImages = formData.image_urls.filter(Boolean);
      const normalizedTags = (
        typeof formData.tags === "string" ? formData.tags : ""
      )
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category || null,
        duration_minutes: Number(formData.duration_minutes) || 0,
        price: Number(formData.price) || 0,
        deposit_amount: Number(formData.deposit_amount) || 0,
        max_capacity: Number(formData.max_capacity) || 1,
        buffer_minutes: Number(formData.buffer_minutes) || 0,
        image_urls: normalizedImages.length > 0 ? normalizedImages : null,
        image_url: (normalizedImages[0] ?? formData.image_url.trim()) || null,
        is_active: formData.is_active,
        tags: normalizedTags.length > 0 ? normalizedTags : null,
        inclusions: formData.inclusions.trim() || null,
        prep_notes: formData.prep_notes.trim() || null,
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          responseData?.detail ||
            responseData?.message ||
            "Failed to save service",
        );
      }

      router.push("/admin/services");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const renderBasicInformation = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Service Name
          </label>
          <Input
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="e.g. Signature Hydrafacial"
            className="text-lg font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Service Description
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Describe your service offering..."
            rows={4}
            className="resize-none"
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.description.length}/250 characters
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Category
          </label>
          <Select
            value={formData.category}
            onValueChange={(value) => updateField("category", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WELLNESS">Wellness</SelectItem>
              <SelectItem value="THERAPY">Therapy</SelectItem>
              <SelectItem value="RITUAL">Ritual</SelectItem>
              <SelectItem value="BEAUTY">Beauty</SelectItem>
              <SelectItem value="FITNESS">Fitness</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderPricingDuration = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Price ($)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => updateField("price", Number(e.target.value))}
              className="pl-10"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Duration (minutes)
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) =>
                updateField("duration_minutes", Number(e.target.value))
              }
              className="pl-10"
              min="1"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Deposit Amount ($)
          </label>
          <Input
            type="number"
            value={formData.deposit_amount}
            onChange={(e) =>
              updateField("deposit_amount", Number(e.target.value))
            }
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Max Capacity
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="number"
              value={formData.max_capacity}
              onChange={(e) =>
                updateField("max_capacity", Number(e.target.value))
              }
              className="pl-10"
              min="1"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Buffer Time (minutes)
        </label>
        <Input
          type="number"
          value={formData.buffer_minutes}
          onChange={(e) =>
            updateField("buffer_minutes", Number(e.target.value))
          }
          min="0"
        />
        <div className="text-xs text-gray-500 mt-1">
          Time between appointments for setup/cleanup
        </div>
      </div>
    </div>
  );

  const renderServiceMedia = () => (
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

  const renderPromotion = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-muted/40 p-4">
        <div>
          <h4 className="font-semibold text-gray-900">Service Status</h4>
          <p className="text-sm text-gray-600">
            Control whether this service is visible to customers
          </p>
        </div>
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => updateField("is_active", checked)}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Tags (comma separated)
        </label>
        <Input
          value={formData.tags}
          onChange={(e) => updateField("tags", e.target.value)}
          placeholder="e.g. relaxing, premium, hydrating"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          What&apos;s Included
        </label>
        <Textarea
          value={formData.inclusions}
          onChange={(e) => updateField("inclusions", e.target.value)}
          placeholder="List what's included in this service..."
          rows={3}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 rounded-3xl border border-border/40 bg-card/80 p-6 shadow-sm">
      {/* Progress Steps */}
      <div className="border-b border-border/30 pb-6">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <li key={step.id} className="flex-1">
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : isCompleted
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border/60 bg-background text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p
                        className={`text-sm font-medium ${
                          isActive
                            ? "text-primary"
                            : isCompleted
                              ? "text-foreground"
                              : "text-muted-foreground"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="flex-1 h-px bg-border/40 ml-5" />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Form Content */}
      <div className="min-h-96">
        {currentStep === 0 && renderBasicInformation()}
        {currentStep === 1 && renderPricingDuration()}
        {currentStep === 2 && renderServiceMedia()}
        {currentStep === 3 && renderPromotion()}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-border/30">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          Previous
        </Button>

        <div className="flex gap-3">
          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              onClick={() =>
                setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
              }
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Next Step
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSaving
                ? "Saving..."
                : mode === "create"
                  ? "Create Service"
                  : "Update Service"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
