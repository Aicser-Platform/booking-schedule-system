"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Image as ImageIcon, Save } from "lucide-react";
import type { Service } from "@/lib/types/database";
import { Switch } from "@/components/ui/switch";

type ServiceFormValues = Omit<
  Service,
  "id" | "admin_id" | "created_at" | "description"
> & {
  public_name: string;
  internal_name: string;
  category: string;
  tags: string;
  description: string;
  inclusions: string;
  prep_notes: string;
  image_url: string;
};

type ServiceInitialValues = Partial<
  Omit<ServiceFormValues, "tags"> & { tags: string | string[] | null }
>;

type ServiceFormProps = {
  mode: "create" | "edit";
  serviceId?: string;
  initialValues?: ServiceInitialValues;
};

export default function ServiceForm({
  mode,
  serviceId,
  initialValues,
}: ServiceFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const defaults: ServiceFormValues = useMemo(() => {
    const tagsValue = Array.isArray(initialValues?.tags)
      ? initialValues?.tags.join(", ")
      : initialValues?.tags ?? "";

    return {
      name: initialValues?.name ?? "",
      public_name: initialValues?.public_name ?? "",
      internal_name: initialValues?.internal_name ?? "",
      category: initialValues?.category ?? "",
      tags: tagsValue,
      description: initialValues?.description ?? "",
      inclusions: initialValues?.inclusions ?? "",
      prep_notes: initialValues?.prep_notes ?? "",
      image_url: initialValues?.image_url ?? "",
      duration_minutes: initialValues?.duration_minutes ?? 60,
      price: initialValues?.price ?? 0,
      deposit_amount: initialValues?.deposit_amount ?? 0,
      buffer_minutes: initialValues?.buffer_minutes ?? 0,
      max_capacity: initialValues?.max_capacity ?? 1,
      is_active: initialValues?.is_active ?? true,
    };
  }, [initialValues]);
  const [values, setValues] = useState<ServiceFormValues>(defaults);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState<"upload" | "url">(
    initialValues?.image_url ? "url" : "upload",
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleChange = <K extends keyof ServiceFormValues>(
    key: K,
    value: ServiceFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    setError(null);
    setIsSaving(true);

    const payload = {
      name: values.name.trim(),
      public_name: values.public_name.trim() || null,
      internal_name: values.internal_name.trim() || null,
      category: values.category.trim() || null,
      tags: values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      description: values.description.trim() || null,
      inclusions: values.inclusions.trim() || null,
      prep_notes: values.prep_notes.trim() || null,
      image_url: values.image_url.trim() || null,
      duration_minutes: Number(values.duration_minutes),
      price: Number(values.price),
      deposit_amount: Number(values.deposit_amount),
      buffer_minutes: Number(values.buffer_minutes),
      max_capacity: Number(values.max_capacity),
      is_active: values.is_active,
    };

    try {
      const endpoint =
        mode === "create" ? "/api/services" : `/api/services/${serviceId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || data?.message || "Save failed");
      }

      router.push("/admin/services");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save service");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit();
  };

  const uploadImage = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/services/upload-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.detail || data?.message || "Upload failed");
      }

      if (!data?.image_url) {
        throw new Error("Upload failed: missing image URL");
      }

      handleChange("image_url", data.image_url as string);
      setImageMode("url");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (file?: File | null) => {
    if (!file) return;
    void uploadImage(file);
  };

  const headerTitle =
    mode === "create" ? "Design New Offering" : "Update Service Protocol";
  const submitLabel = mode === "create" ? "Initialize Service" : "Commit Update";

  return (
    <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-8 py-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{headerTitle}</h3>
          <p className="text-xs font-medium text-slate-500">
            Configure precision scheduling and settlement parameters.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 p-10">
        <div className="space-y-4">
          <label className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Service Visual Identity
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setImageMode("upload")}
              className={`rounded-2xl border-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                imageMode === "upload"
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                  : "border-transparent bg-slate-50 text-slate-400 hover:border-slate-200"
              }`}
            >
              Upload Asset
            </button>
            <button
              type="button"
              onClick={() => setImageMode("url")}
              className={`rounded-2xl border-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                imageMode === "url"
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                  : "border-transparent bg-slate-50 text-slate-400 hover:border-slate-200"
              }`}
            >
              Image URL
            </button>
          </div>

          {imageMode === "upload" && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleFileSelect(event.dataTransfer.files?.[0]);
              }}
              className="group relative flex h-48 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:border-indigo-400 hover:bg-indigo-50/30"
              role="button"
              tabIndex={0}
            >
              {values.image_url ? (
                <>
                  <img
                    src={values.image_url}
                    alt="Service preview"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera size={32} />
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-3 rounded-2xl bg-white p-4 text-slate-400 shadow-sm transition-colors group-hover:text-indigo-600">
                    <ImageIcon size={32} />
                  </div>
                  <p className="text-xs font-bold text-slate-500 transition-colors group-hover:text-indigo-600">
                    Upload Presentation Asset
                  </p>
                  <p className="mt-1 text-[9px] uppercase tracking-widest text-slate-400">
                    JPG, PNG, WEBP recommended
                  </p>
                </>
              )}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-semibold text-slate-600">
                  Uploading...
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleFileSelect(event.target.files?.[0])}
          />

          {imageMode === "url" && (
            <div className="space-y-2">
              <label
                htmlFor="service-image-url"
                className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400"
              >
                Image URL
              </label>
              <input
                id="service-image-url"
                type="url"
                value={values.image_url}
                onChange={(event) =>
                  handleChange("image_url", event.target.value)
                }
                placeholder="https://..."
                className="w-full rounded-2xl border-2 border-transparent bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:bg-white"
              />
            </div>
          )}

          {uploadError && (
            <p className="text-sm font-semibold text-rose-600" role="alert">
              {uploadError}
            </p>
          )}

          {imageMode === "url" && values.image_url && (
            <div className="overflow-hidden rounded-2xl border border-slate-100">
              <img
                src={values.image_url}
                alt="Service preview"
                className="h-40 w-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="service-name"
              className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
              Institutional Label
            </label>
            <input
              id="service-name"
              type="text"
              required
              value={values.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="e.g. Executive Checkup"
              className="w-full rounded-2xl border-2 border-transparent bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="service-category"
              className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
              Classification
            </label>
            <input
              id="service-category"
              type="text"
              value={values.category}
              onChange={(event) => handleChange("category", event.target.value)}
              placeholder="e.g. Consulting"
              className="w-full rounded-2xl border-2 border-transparent bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="service-public-name"
              className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
              Public Name
            </label>
            <input
              id="service-public-name"
              type="text"
              value={values.public_name}
              onChange={(event) =>
                handleChange("public_name", event.target.value)
              }
              placeholder="Name shown to customers"
              className="w-full rounded-2xl border-2 border-transparent bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="service-internal-name"
              className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
              Internal Name
            </label>
            <input
              id="service-internal-name"
              type="text"
              value={values.internal_name}
              onChange={(event) =>
                handleChange("internal_name", event.target.value)
              }
              placeholder="Internal reference"
              className="w-full rounded-2xl border-2 border-transparent bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:bg-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="service-tags"
            className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400"
          >
            Tags
          </label>
          <input
            id="service-tags"
            type="text"
            value={values.tags}
            onChange={(event) => handleChange("tags", event.target.value)}
            placeholder="comma-separated tags"
            className="w-full rounded-2xl border-2 border-transparent bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Service Specifications
          </label>
          <textarea
            rows={3}
            value={values.description}
            onChange={(event) => handleChange("description", event.target.value)}
            className="w-full resize-none rounded-2xl border-2 border-transparent bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:bg-white"
            placeholder="Detailed description of the service delivery..."
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="service-inclusions"
              className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
              Inclusions
            </label>
            <textarea
              id="service-inclusions"
              rows={3}
              value={values.inclusions}
              onChange={(event) =>
                handleChange("inclusions", event.target.value)
              }
              className="w-full resize-none rounded-2xl border-2 border-transparent bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:bg-white"
              placeholder="What is included"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="service-prep-notes"
              className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
              Prep Notes
            </label>
            <textarea
              id="service-prep-notes"
              rows={3}
              value={values.prep_notes}
              onChange={(event) =>
                handleChange("prep_notes", event.target.value)
              }
              className="w-full resize-none rounded-2xl border-2 border-transparent bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:bg-white"
              placeholder="Preparation notes for customers"
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <label
              htmlFor="service-price"
              className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
              Settlement ($)
            </label>
            <input
              id="service-price"
              type="number"
              min={0}
              step="0.01"
              value={values.price}
              onChange={(event) =>
                handleChange("price", Number(event.target.value))
              }
              className="w-full rounded-2xl border-2 border-transparent bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="service-deposit"
              className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
              Deposit ($)
            </label>
            <input
              id="service-deposit"
              type="number"
              min={0}
              step="0.01"
              value={values.deposit_amount}
              onChange={(event) =>
                handleChange("deposit_amount", Number(event.target.value))
              }
              className="w-full rounded-2xl border-2 border-transparent bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="service-duration"
              className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
              Active Mins
            </label>
            <input
              id="service-duration"
              type="number"
              min={10}
              value={values.duration_minutes}
              onChange={(event) =>
                handleChange("duration_minutes", Number(event.target.value))
              }
              className="w-full rounded-2xl border-2 border-transparent bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="service-buffer"
              className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
              Sync Buffer
            </label>
            <input
              id="service-buffer"
              type="number"
              min={0}
              value={values.buffer_minutes}
              onChange={(event) =>
                handleChange("buffer_minutes", Number(event.target.value))
              }
              className="w-full rounded-2xl border-2 border-transparent bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="service-capacity"
              className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
              Slot Capacity
            </label>
            <input
              id="service-capacity"
              type="number"
              min={1}
              value={values.max_capacity}
              onChange={(event) =>
                handleChange("max_capacity", Number(event.target.value))
              }
              className="w-full rounded-2xl border-2 border-transparent bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-slate-100 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Active</p>
            <p className="text-xs text-slate-500">
              Toggle service visibility
            </p>
          </div>
          <Switch
            checked={values.is_active}
            onCheckedChange={(checked) => handleChange("is_active", checked)}
          />
        </div>

        {error && (
          <p className="text-sm font-semibold text-rose-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-end gap-4 border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-2xl px-8 py-3.5 text-xs font-black uppercase tracking-widest text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600"
          >
            Discard
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-10 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-2xl shadow-indigo-200 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
          >
            <Save size={18} /> {isSaving ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
