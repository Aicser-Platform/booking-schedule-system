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
  const labelClass =
    "px-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground";
  const inputClass =
    "w-full rounded-2xl border-2 border-transparent bg-muted px-5 py-4 font-bold text-foreground outline-none transition-all focus:border-primary focus:bg-background";
  const textareaClass =
    "w-full resize-none rounded-2xl border-2 border-transparent bg-muted px-5 py-4 font-bold text-foreground outline-none transition-all focus:border-primary focus:bg-background";
  const inputCompactClass =
    "mt-2 w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm text-foreground";
  const pillButtonClass =
    "rounded-2xl border-2 border-transparent bg-muted px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-all hover:border-border hover:text-foreground";
  const primaryPillClass =
    "rounded-2xl border-2 border-primary bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20";
  const sectionCardClass = "rounded-[2rem] border border-border bg-card/60 p-6";
  const summaryCardClass =
    "rounded-2xl border border-border bg-card px-4 py-3 shadow-sm";
  const surfaceCardClass = "rounded-2xl border border-border bg-card shadow-sm";
  const ghostDangerClass =
    "rounded-2xl border-2 border-transparent bg-destructive/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-destructive transition-all hover:border-destructive/30";

  return (
    <div className="overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-2xl">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-8 py-6">
        <div>
          <h3 className="text-xl font-bold text-foreground">{headerTitle}</h3>
          <p className="text-xs font-medium text-muted-foreground">
            Configure precision scheduling and settlement parameters.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 p-10">
        <div className="space-y-4">
          <label className={labelClass}>Service Visual Identity</label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setImageMode("upload")}
              className={`rounded-2xl border-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                imageMode === "upload" ? primaryPillClass : pillButtonClass
              }`}
            >
              Upload Asset
            </button>
            <button
              type="button"
              onClick={() => setImageMode("url")}
              className={`rounded-2xl border-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                imageMode === "url" ? primaryPillClass : pillButtonClass
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
              className="group relative flex h-48 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed border-border/70 bg-muted/40 transition-all hover:border-primary/60 hover:bg-muted/60"
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
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera size={32} />
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-3 rounded-2xl bg-card p-4 text-muted-foreground shadow-sm transition-colors group-hover:text-primary">
                    <ImageIcon size={32} />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground transition-colors group-hover:text-primary">
                    Upload Presentation Asset
                  </p>
                  <p className="mt-1 text-[9px] uppercase tracking-widest text-muted-foreground">
                    JPG, PNG, WEBP recommended
                  </p>
                </>
              )}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-xs font-semibold text-muted-foreground">
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
              <label htmlFor="service-image-url" className={labelClass}>
                Image URL
              </label>
              <div className="flex flex-wrap gap-3">
                <input
                  id="service-image-url"
                  type="url"
                  value={imageUrlInput}
                  onChange={(event) => setImageUrlInput(event.target.value)}
                  placeholder="https://..."
                  className="min-w-[240px] flex-1 rounded-2xl border-2 border-transparent bg-muted px-5 py-4 font-bold text-foreground outline-none transition-all focus:border-primary focus:bg-background"
                />
                <button
                  type="button"
                  onClick={addImageFromInput}
                  className="rounded-2xl bg-primary px-6 py-3 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90"
                >
                  Add Image
                </button>
              </div>
            </div>
          )}

          {uploadError && (
            <p className="text-sm font-semibold text-destructive" role="alert">
              {uploadError}
            </p>
          )}

          {values.image_urls.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setImageMode("upload")}
                className={pillButtonClass}
              >
                Replace Image
              </button>
              <button
                type="button"
                onClick={() => {
                  updateImages([]);
                  setImageMode("upload");
                }}
                className={ghostDangerClass}
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
                  className="group relative overflow-hidden rounded-2xl border border-border"
                >
                  <img
                    src={url}
                    alt={`Service image ${index + 1}`}
                    className="h-40 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImageAt(index)}
                    className="absolute right-3 top-3 rounded-full bg-card/90 p-2 text-muted-foreground shadow transition hover:text-destructive"
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
            <label htmlFor="service-name" className={labelClass}>
              Institutional Label
            </label>
            <input
              id="service-name"
              type="text"
              required
              value={values.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="e.g. Executive Checkup"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="service-category" className={labelClass}>
              Classification
            </label>
            <input
              id="service-category"
              type="text"
              value={values.category}
              onChange={(event) => handleChange("category", event.target.value)}
              placeholder="e.g. Consulting"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="service-public-name" className={labelClass}>
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
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="service-internal-name" className={labelClass}>
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
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="service-tags" className={labelClass}>
            Tags
          </label>
          <input
            id="service-tags"
            type="text"
            value={values.tags}
            onChange={(event) => handleChange("tags", event.target.value)}
            placeholder="comma-separated tags"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Service Specifications</label>
          <textarea
            rows={3}
            value={values.description}
            onChange={(event) =>
              handleChange("description", event.target.value)
            }
            className={textareaClass}
            placeholder="Detailed description of the service delivery..."
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="service-inclusions" className={labelClass}>
              Inclusions
            </label>
            <textarea
              id="service-inclusions"
              rows={3}
              value={values.inclusions}
              onChange={(event) =>
                handleChange("inclusions", event.target.value)
              }
              className={textareaClass}
              placeholder="What is included"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="service-prep-notes" className={labelClass}>
              Prep Notes
            </label>
            <textarea
              id="service-prep-notes"
              rows={3}
              value={values.prep_notes}
              onChange={(event) =>
                handleChange("prep_notes", event.target.value)
              }
              className={textareaClass}
              placeholder="Preparation notes for customers"
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="service-price" className={labelClass}>
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
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="service-deposit" className={labelClass}>
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
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="service-duration" className={labelClass}>
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
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="service-buffer" className={labelClass}>
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
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="service-capacity" className={labelClass}>
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
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-border px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Active</p>
            <p className="text-xs text-muted-foreground">
              Toggle service visibility
            </p>
          </div>
          <Switch
            checked={values.is_active}
            onCheckedChange={(checked) => handleChange("is_active", checked)}
          />
        </div>

        {mode === "create" && (
          <div className={sectionCardClass}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-lg font-bold text-foreground">
                  Service Operating Schedule
                </h4>
                <p className="text-xs font-medium text-muted-foreground">
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
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
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
                      className={inputCompactClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
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
                      className={inputCompactClass}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
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
                      className={inputCompactClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
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
                      className={inputCompactClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
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
                      className={inputCompactClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
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
                      className={inputCompactClass}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">Schedule Active</p>
                    <p className="text-xs text-muted-foreground">
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
                  <h5 className="text-sm font-semibold text-foreground">
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
                      className="rounded-2xl border border-border bg-background px-4 py-2 text-sm text-foreground"
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
                        className="rounded-2xl border border-border bg-background px-4 py-2 text-sm text-foreground"
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
                        className="rounded-2xl border border-border bg-background px-4 py-2 text-sm text-foreground"
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
                          className="flex-1 rounded-2xl border border-border bg-background px-4 py-2 text-sm text-foreground"
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
                          className="flex-1 rounded-2xl border border-border bg-background px-4 py-2 text-sm text-foreground"
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
                      className="rounded-2xl border border-border bg-background px-4 py-2 text-sm text-foreground"
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
                      className="rounded-2xl border border-border bg-background px-4 py-2 text-sm text-foreground"
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
                    className={pillButtonClass}
                  >
                    Add Rule
                  </button>

                  {scheduleRules.length > 0 ? (
                    <div className="space-y-2">
                      {scheduleRules.map((rule) => (
                        <div
                          key={rule.id}
                          className="flex items-center justify-between rounded-2xl border border-border px-4 py-2 text-sm"
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              {rule.rule_type}
                            </p>
                            <p className="text-xs text-muted-foreground">
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
                            className="text-xs font-semibold text-destructive"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No rules added.
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-foreground">
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
                      className="rounded-2xl border border-border bg-background px-4 py-2 text-sm text-foreground"
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
                      className="rounded-2xl border border-border bg-background px-4 py-2 text-sm text-foreground"
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
                      className="rounded-2xl border border-border bg-background px-4 py-2 text-sm text-foreground"
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
                      className="rounded-2xl border border-border bg-background px-4 py-2 text-sm text-foreground"
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold">Open on this date</p>
                      <p className="text-xs text-muted-foreground">
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
                    className={pillButtonClass}
                  >
                    Add Exception
                  </button>

                  {scheduleExceptions.length > 0 ? (
                    <div className="space-y-2">
                      {scheduleExceptions.map((ex) => (
                        <div
                          key={ex.id}
                          className="flex items-center justify-between rounded-2xl border border-border px-4 py-2 text-sm"
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              {ex.date} {ex.is_open ? "Open" : "Closed"}
                            </p>
                            <p className="text-xs text-muted-foreground">
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
                            className="text-xs font-semibold text-destructive"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No exceptions added.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "create" && (
          <div className={sectionCardClass}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-lg font-bold text-foreground">
                  Service Review
                </h4>
                <p className="text-xs font-medium text-muted-foreground">
                  Confirm the details before creating this service.
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  values.is_active
                    ? "bg-emerald-500/15 text-emerald-200"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {values.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Primary Label
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {values.name || "Not set"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {values.public_name || "Public name not set"}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Category
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {values.category || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Internal Name
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {values.internal_name || "Not set"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Tags
                  </p>
                  {reviewTags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {reviewTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No tags added
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Description
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {values.description || "No description provided"}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Inclusions
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {values.inclusions || "None"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Prep Notes
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {values.prep_notes || "None"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {values.image_urls.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {values.image_urls.map((url, index) => (
                      <div key={`${url}-${index}`} className={surfaceCardClass}>
                        <img
                          src={url}
                          alt={`Service visual preview ${index + 1}`}
                          className="h-32 w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border bg-card text-xs font-semibold text-muted-foreground">
                    No image added
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className={summaryCardClass}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Price
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatMoney(values.price)}
                    </p>
                  </div>
                  <div className={summaryCardClass}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Deposit
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatMoney(values.deposit_amount)}
                    </p>
                  </div>
                  <div className={summaryCardClass}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Duration
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {values.duration_minutes} min
                    </p>
                  </div>
                  <div className={summaryCardClass}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Buffer
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {values.buffer_minutes} min
                    </p>
                  </div>
                  <div className={summaryCardClass}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Capacity
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {values.max_capacity}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm font-semibold text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-end gap-4 border-t border-border pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-2xl px-8 py-3.5 text-xs font-black uppercase tracking-widest text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            Discard
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-2xl bg-primary px-10 py-3.5 text-xs font-black uppercase tracking-widest text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
          >
            <Save size={18} /> {isSaving ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
