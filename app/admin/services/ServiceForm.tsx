"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Image as ImageIcon, Save, X } from "lucide-react";
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
  image_urls: string[];
};

type ServiceInitialValues = Partial<
  Omit<ServiceFormValues, "tags"> & {
    tags: string | string[] | null;
    image_urls: string[] | null;
  }
>;

type ServiceFormProps = {
  mode: "create" | "edit";
  serviceId?: string;
  initialValues?: ServiceInitialValues;
};

type OperatingRuleDraft = {
  id: string;
  rule_type: "weekly" | "monthly_day" | "monthly_nth_weekday";
  weekday?: number;
  month_day?: number;
  nth?: number;
  start_time?: string;
  end_time?: string;
};

type OperatingExceptionDraft = {
  id: string;
  date: string;
  is_open: boolean;
  start_time?: string;
  end_time?: string;
  reason?: string;
};

type OperatingScheduleDraft = {
  timezone: string;
  rule_type: "daily" | "weekly" | "monthly";
  open_time?: string;
  close_time?: string;
  effective_from?: string;
  effective_to?: string;
  is_active: boolean;
};

const weekdays = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const nthOptions = [
  { value: 1, label: "1st" },
  { value: 2, label: "2nd" },
  { value: 3, label: "3rd" },
  { value: 4, label: "4th" },
  { value: 5, label: "5th" },
  { value: -1, label: "Last" },
];

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
      : (initialValues?.tags ?? "");
    const initialImages = Array.isArray(initialValues?.image_urls)
      ? initialValues?.image_urls.filter(Boolean)
      : initialValues?.image_url
        ? [initialValues.image_url]
        : [];

    return {
      name: initialValues?.name ?? "",
      public_name: initialValues?.public_name ?? "",
      internal_name: initialValues?.internal_name ?? "",
      category: initialValues?.category ?? "",
      tags: tagsValue,
      description: initialValues?.description ?? "",
      inclusions: initialValues?.inclusions ?? "",
      prep_notes: initialValues?.prep_notes ?? "",
      image_url: initialImages[0] ?? initialValues?.image_url ?? "",
      image_urls: initialImages,
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
  const [imageMode, setImageMode] = useState<"upload" | "url">(() =>
    initialValues?.image_url ||
    (Array.isArray(initialValues?.image_urls) &&
      initialValues.image_urls.length > 0)
      ? "url"
      : "upload",
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleForm, setScheduleForm] = useState<OperatingScheduleDraft>({
    timezone: "UTC",
    rule_type: "daily",
    open_time: "",
    close_time: "",
    effective_from: "",
    effective_to: "",
    is_active: true,
  });
  const [scheduleRules, setScheduleRules] = useState<OperatingRuleDraft[]>([]);
  const [scheduleExceptions, setScheduleExceptions] = useState<
    OperatingExceptionDraft[]
  >([]);
  const [ruleDraft, setRuleDraft] = useState<OperatingRuleDraft>({
    id: "",
    rule_type: "weekly",
    weekday: 1,
    month_day: 1,
    nth: 1,
    start_time: "",
    end_time: "",
  });
  const [exceptionDraft, setExceptionDraft] = useState<OperatingExceptionDraft>(
    {
      id: "",
      date: "",
      is_open: false,
      start_time: "",
      end_time: "",
      reason: "",
    },
  );
  const reviewTags = useMemo(
    () =>
      values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [values.tags],
  );
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number.isFinite(amount) ? amount : 0);
  const primaryImage = values.image_urls[0] ?? values.image_url;

  const handleChange = <K extends keyof ServiceFormValues>(
    key: K,
    value: ServiceFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const updateImages = (nextImages: string[]) => {
    const normalized = nextImages.filter(Boolean);
    setValues((prev) => ({
      ...prev,
      image_urls: normalized,
      image_url: normalized[0] ?? "",
    }));
  };

  const addImages = (urls: string[]) => {
    const next = Array.from(
      new Set([...(values.image_urls ?? []), ...urls.filter(Boolean)]),
    );
    updateImages(next);
  };

  const addImageFromInput = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    addImages([trimmed]);
    setImageUrlInput("");
    setImageMode("url");
  };

  const removeImageAt = (index: number) => {
    const next = values.image_urls.filter((_, idx) => idx !== index);
    updateImages(next);
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
      image_urls: values.image_urls,
      image_url: (values.image_urls[0] ?? values.image_url.trim()) || null,
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

      const responseData = await res.json().catch(() => ({}));
      const createdServiceId = responseData?.id ?? serviceId;

      if (mode === "create" && scheduleEnabled && createdServiceId) {
        const scheduleRes = await fetch(
          `/api/services/${createdServiceId}/operating-schedule`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              timezone: scheduleForm.timezone,
              rule_type: scheduleForm.rule_type,
              open_time: scheduleForm.open_time || null,
              close_time: scheduleForm.close_time || null,
              effective_from: scheduleForm.effective_from || null,
              effective_to: scheduleForm.effective_to || null,
              is_active: scheduleForm.is_active,
            }),
          },
        );

        if (!scheduleRes.ok) {
          const scheduleData = await scheduleRes.json().catch(() => ({}));
          throw new Error(
            scheduleData?.detail ||
              scheduleData?.message ||
              "Schedule save failed",
          );
        }

        for (const rule of scheduleRules) {
          const ruleRes = await fetch(
            `/api/services/${createdServiceId}/operating-schedule/rules`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                rule_type: rule.rule_type,
                weekday: rule.rule_type === "weekly" ? rule.weekday : null,
                month_day:
                  rule.rule_type === "monthly_day" ? rule.month_day : null,
                nth: rule.rule_type === "monthly_nth_weekday" ? rule.nth : null,
                start_time: rule.start_time || null,
                end_time: rule.end_time || null,
              }),
            },
          );
          if (!ruleRes.ok) {
            const ruleData = await ruleRes.json().catch(() => ({}));
            throw new Error(
              ruleData?.detail || ruleData?.message || "Rule save failed",
            );
          }
        }

        for (const ex of scheduleExceptions) {
          const exRes = await fetch(
            `/api/services/${createdServiceId}/operating-schedule/exceptions`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                date: ex.date,
                is_open: ex.is_open,
                start_time: ex.start_time || null,
                end_time: ex.end_time || null,
                reason: ex.reason || null,
              }),
            },
          );
          if (!exRes.ok) {
            const exData = await exRes.json().catch(() => ({}));
            throw new Error(
              exData?.detail || exData?.message || "Exception save failed",
            );
          }
        }
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

  const uploadSingleImage = async (file: File) => {
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
      return data.image_url as string;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Upload failed");
    }
  };

  const handleFilesSelect = async (files?: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setIsUploading(true);
    const uploaded: string[] = [];

    try {
      for (const file of Array.from(files)) {
        try {
          const url = await uploadSingleImage(file);
          uploaded.push(url);
        } catch (err) {
          setUploadError(err instanceof Error ? err.message : "Upload failed");
        }
      }
    } finally {
      if (uploaded.length > 0) {
        addImages(uploaded);
        setImageMode("url");
      }
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const headerTitle =
    mode === "create" ? "Design New Offering" : "Update Service Protocol";
  const submitLabel =
    mode === "create" ? "Initialize Service" : "Commit Update";

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
                void handleFilesSelect(event.dataTransfer.files);
              }}
              className="group relative flex h-48 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:border-indigo-400 hover:bg-indigo-50/30"
              role="button"
              tabIndex={0}
            >
              {primaryImage ? (
                <>
                  <img
                    src={primaryImage}
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
            multiple
            className="hidden"
            onChange={(event) => void handleFilesSelect(event.target.files)}
          />

          {imageMode === "url" && (
            <div className="space-y-2">
              <label
                htmlFor="service-image-url"
                className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400"
              >
                Image URL
              </label>
              <div className="flex flex-wrap gap-3">
                <input
                  id="service-image-url"
                  type="url"
                  value={imageUrlInput}
                  onChange={(event) => setImageUrlInput(event.target.value)}
                  placeholder="https://..."
                  className="min-w-[240px] flex-1 rounded-2xl border-2 border-transparent bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={addImageFromInput}
                  className="rounded-2xl bg-indigo-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
                >
                  Add Image
                </button>
              </div>
            </div>
          )}

          {uploadError && (
            <p className="text-sm font-semibold text-rose-600" role="alert">
              {uploadError}
            </p>
          )}

          {values.image_urls.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setImageMode("upload")}
                className="rounded-2xl border-2 border-transparent bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:border-slate-200"
              >
                Replace Image
              </button>
              <button
                type="button"
                onClick={() => {
                  updateImages([]);
                  setImageMode("upload");
                }}
                className="rounded-2xl border-2 border-transparent bg-rose-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-600 transition-all hover:border-rose-200"
              >
                Remove Image
              </button>
            </div>
          )}

          {values.image_urls.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {values.image_urls.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="group relative overflow-hidden rounded-2xl border border-slate-100"
                >
                  <img
                    src={url}
                    alt={`Service image ${index + 1}`}
                    className="h-40 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImageAt(index)}
                    className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-500 shadow transition hover:text-rose-600"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
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
            onChange={(event) =>
              handleChange("description", event.target.value)
            }
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
            <p className="text-xs text-slate-500">Toggle service visibility</p>
          </div>
          <Switch
            checked={values.is_active}
            onCheckedChange={(checked) => handleChange("is_active", checked)}
          />
        </div>

        {mode === "create" && (
          <div className="rounded-[2rem] border border-slate-100 bg-slate-50/70 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  Service Operating Schedule
                </h4>
                <p className="text-xs font-medium text-slate-500">
                  Define when this service is open before saving.
                </p>
              </div>
              <Switch
                checked={scheduleEnabled}
                onCheckedChange={setScheduleEnabled}
              />
            </div>

            {scheduleEnabled && (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Timezone
                    </label>
                    <input
                      value={scheduleForm.timezone}
                      onChange={(event) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          timezone: event.target.value,
                        }))
                      }
                      placeholder="e.g. UTC, Asia/Singapore"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Rule Type
                    </label>
                    <select
                      value={scheduleForm.rule_type}
                      onChange={(event) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          rule_type: event.target
                            .value as OperatingScheduleDraft["rule_type"],
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Open Time
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.open_time ?? ""}
                      onChange={(event) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          open_time: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Close Time
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.close_time ?? ""}
                      onChange={(event) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          close_time: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Effective From
                    </label>
                    <input
                      type="date"
                      value={scheduleForm.effective_from ?? ""}
                      onChange={(event) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          effective_from: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Effective To
                    </label>
                    <input
                      type="date"
                      value={scheduleForm.effective_to ?? ""}
                      onChange={(event) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          effective_to: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">Schedule Active</p>
                    <p className="text-xs text-slate-500">
                      Enable or disable this schedule.
                    </p>
                  </div>
                  <Switch
                    checked={scheduleForm.is_active}
                    onCheckedChange={(checked) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        is_active: checked,
                      }))
                    }
                  />
                </div>

                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-slate-900">
                    Rules
                  </h5>
                  <div className="grid gap-3 md:grid-cols-2">
                    <select
                      value={ruleDraft.rule_type}
                      onChange={(event) =>
                        setRuleDraft((prev) => ({
                          ...prev,
                          rule_type: event.target
                            .value as OperatingRuleDraft["rule_type"],
                        }))
                      }
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                    >
                      <option value="weekly">Weekly (weekday)</option>
                      <option value="monthly_day">
                        Monthly (day of month)
                      </option>
                      <option value="monthly_nth_weekday">
                        Monthly (nth weekday)
                      </option>
                    </select>

                    {ruleDraft.rule_type === "weekly" && (
                      <select
                        value={ruleDraft.weekday}
                        onChange={(event) =>
                          setRuleDraft((prev) => ({
                            ...prev,
                            weekday: Number(event.target.value),
                          }))
                        }
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                      >
                        {weekdays.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {ruleDraft.rule_type === "monthly_day" && (
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={ruleDraft.month_day}
                        onChange={(event) =>
                          setRuleDraft((prev) => ({
                            ...prev,
                            month_day: Number(event.target.value),
                          }))
                        }
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                        placeholder="Day of month"
                      />
                    )}

                    {ruleDraft.rule_type === "monthly_nth_weekday" && (
                      <div className="flex gap-2">
                        <select
                          value={ruleDraft.nth}
                          onChange={(event) =>
                            setRuleDraft((prev) => ({
                              ...prev,
                              nth: Number(event.target.value),
                            }))
                          }
                          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                        >
                          {nthOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <select
                          value={ruleDraft.weekday}
                          onChange={(event) =>
                            setRuleDraft((prev) => ({
                              ...prev,
                              weekday: Number(event.target.value),
                            }))
                          }
                          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                        >
                          {weekdays.map((day) => (
                            <option key={day.value} value={day.value}>
                              {day.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <input
                      type="time"
                      value={ruleDraft.start_time ?? ""}
                      onChange={(event) =>
                        setRuleDraft((prev) => ({
                          ...prev,
                          start_time: event.target.value,
                        }))
                      }
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                    />
                    <input
                      type="time"
                      value={ruleDraft.end_time ?? ""}
                      onChange={(event) =>
                        setRuleDraft((prev) => ({
                          ...prev,
                          end_time: event.target.value,
                        }))
                      }
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setScheduleRules((prev) => [
                        ...prev,
                        {
                          ...ruleDraft,
                          id: crypto.randomUUID(),
                        },
                      ]);
                    }}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600"
                  >
                    Add Rule
                  </button>

                  {scheduleRules.length > 0 ? (
                    <div className="space-y-2">
                      {scheduleRules.map((rule) => (
                        <div
                          key={rule.id}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-2 text-sm"
                        >
                          <div>
                            <p className="font-medium text-slate-900">
                              {rule.rule_type}
                            </p>
                            <p className="text-xs text-slate-500">
                              {rule.start_time || "--"} -{" "}
                              {rule.end_time || "--"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setScheduleRules((prev) =>
                                prev.filter((item) => item.id !== rule.id),
                              )
                            }
                            className="text-xs font-semibold text-rose-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No rules added.</p>
                  )}
                </div>

                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-slate-900">
                    Exceptions
                  </h5>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      type="date"
                      value={exceptionDraft.date}
                      onChange={(event) =>
                        setExceptionDraft((prev) => ({
                          ...prev,
                          date: event.target.value,
                        }))
                      }
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={exceptionDraft.reason ?? ""}
                      onChange={(event) =>
                        setExceptionDraft((prev) => ({
                          ...prev,
                          reason: event.target.value,
                        }))
                      }
                      placeholder="Reason"
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                    />
                    <input
                      type="time"
                      value={exceptionDraft.start_time ?? ""}
                      onChange={(event) =>
                        setExceptionDraft((prev) => ({
                          ...prev,
                          start_time: event.target.value,
                        }))
                      }
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                    />
                    <input
                      type="time"
                      value={exceptionDraft.end_time ?? ""}
                      onChange={(event) =>
                        setExceptionDraft((prev) => ({
                          ...prev,
                          end_time: event.target.value,
                        }))
                      }
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold">Open on this date</p>
                      <p className="text-xs text-slate-500">
                        Enable for a special open day.
                      </p>
                    </div>
                    <Switch
                      checked={exceptionDraft.is_open}
                      onCheckedChange={(checked) =>
                        setExceptionDraft((prev) => ({
                          ...prev,
                          is_open: checked,
                        }))
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!exceptionDraft.date) return;
                      setScheduleExceptions((prev) => [
                        ...prev,
                        { ...exceptionDraft, id: crypto.randomUUID() },
                      ]);
                      setExceptionDraft({
                        id: "",
                        date: "",
                        is_open: false,
                        start_time: "",
                        end_time: "",
                        reason: "",
                      });
                    }}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600"
                  >
                    Add Exception
                  </button>

                  {scheduleExceptions.length > 0 ? (
                    <div className="space-y-2">
                      {scheduleExceptions.map((ex) => (
                        <div
                          key={ex.id}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-2 text-sm"
                        >
                          <div>
                            <p className="font-medium text-slate-900">
                              {ex.date} {ex.is_open ? "Open" : "Closed"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {ex.start_time || "--"} - {ex.end_time || "--"}
                              {ex.reason ? ` • ${ex.reason}` : ""}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setScheduleExceptions((prev) =>
                                prev.filter((item) => item.id !== ex.id),
                              )
                            }
                            className="text-xs font-semibold text-rose-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      No exceptions added.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "create" && (
          <div className="rounded-[2rem] border border-slate-100 bg-slate-50/70 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  Service Review
                </h4>
                <p className="text-xs font-medium text-slate-500">
                  Confirm the details before creating this service.
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  values.is_active
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {values.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Primary Label
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {values.name || "Not set"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {values.public_name || "Public name not set"}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Category
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {values.category || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Internal Name
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {values.internal_name || "Not set"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Tags
                  </p>
                  {reviewTags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {reviewTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No tags added</p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Description
                  </p>
                  <p className="text-sm text-slate-600">
                    {values.description || "No description provided"}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Inclusions
                    </p>
                    <p className="text-sm text-slate-600">
                      {values.inclusions || "None"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Prep Notes
                    </p>
                    <p className="text-sm text-slate-600">
                      {values.prep_notes || "None"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {values.image_urls.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {values.image_urls.map((url, index) => (
                      <div
                        key={`${url}-${index}`}
                        className="overflow-hidden rounded-2xl border border-white bg-white shadow-sm"
                      >
                        <img
                          src={url}
                          alt={`Service visual preview ${index + 1}`}
                          className="h-32 w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-xs font-semibold text-slate-400">
                    No image added
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Price
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatMoney(values.price)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Deposit
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatMoney(values.deposit_amount)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Duration
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {values.duration_minutes} min
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Buffer
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {values.buffer_minutes} min
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Capacity
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {values.max_capacity}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
