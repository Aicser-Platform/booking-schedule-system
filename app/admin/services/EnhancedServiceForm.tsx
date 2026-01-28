"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Camera, DollarSign, FileText, Settings, Calendar } from "lucide-react";
import type {
  OperatingExceptionDraft,
  OperatingRuleDraft,
  OperatingScheduleDraft,
} from "./service-form/types";
import type {
  ServiceFormData,
  UpdateServiceField,
} from "./service-form/enhanced/types";
import EnhancedBasicInformation from "./service-form/enhanced/EnhancedBasicInformation";
import EnhancedPricingDuration from "./service-form/enhanced/EnhancedPricingDuration";
import EnhancedServiceMedia from "./service-form/enhanced/EnhancedServiceMedia";
import EnhancedPromotion from "./service-form/enhanced/EnhancedPromotion";
import EnhancedSchedule from "./service-form/enhanced/EnhancedSchedule";

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

  useEffect(() => {
    if (
      scheduleForm.rule_type === "weekly" &&
      ruleDraft.rule_type !== "weekly"
    ) {
      setRuleDraft((prev) => ({ ...prev, rule_type: "weekly" }));
    }
    if (
      scheduleForm.rule_type === "monthly" &&
      ruleDraft.rule_type === "weekly"
    ) {
      setRuleDraft((prev) => ({ ...prev, rule_type: "monthly_day" }));
    }
  }, [ruleDraft.rule_type, scheduleForm.rule_type]);

  const updateField: UpdateServiceField = (field, value) => {
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
    ...(mode === "create"
      ? [
          {
            id: "schedule",
            title: "Operating Schedule",
            icon: Calendar,
            description: "Optional availability and exceptions",
          },
        ]
      : []),
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
              "Failed to save schedule",
          );
        }

        const rulesToSave =
          scheduleForm.rule_type === "daily" ? [] : scheduleRules;

        for (const rule of rulesToSave) {
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
              ruleData?.detail ||
                ruleData?.message ||
                "Failed to save schedule rule",
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
              exData?.detail ||
                exData?.message ||
                "Failed to save schedule exception",
            );
          }
        }
      }

      router.push("/admin/services");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 rounded-3xl border border-border/40 bg-card/80 p-6 shadow-sm">
      {/* Progress Steps */}
      <div className="border-b border-border/30 pb-6">
        <nav aria-label="Progress">
          <ol className="flex flex-wrap items-center justify-center gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <li key={step.id} className="flex items-center">
                  <div className="group relative">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(index)}
                      className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : isCompleted
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border/60 bg-background text-muted-foreground hover:border-primary/40 hover:text-primary"
                      }`}
                      aria-label={step.title}
                      title={step.title}
                    >
                      <Icon className="h-6 w-6" />
                    </button>
                    <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground opacity-0 shadow-sm transition group-hover:opacity-100">
                      {step.title}
                    </div>
                  </div>

                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Form Content */}
      <div className="min-h-96">
        {steps[currentStep]?.id === "basic" && (
          <EnhancedBasicInformation
            formData={formData}
            updateField={updateField}
          />
        )}
        {steps[currentStep]?.id === "pricing" && (
          <EnhancedPricingDuration
            formData={formData}
            updateField={updateField}
          />
        )}
        {steps[currentStep]?.id === "media" && (
          <EnhancedServiceMedia
            formData={formData}
            updateField={updateField}
            addImageUrl={addImageUrl}
            removeImageUrl={removeImageUrl}
            handleFileUpload={handleFileUpload}
            isUploading={isUploading}
            uploadError={uploadError}
          />
        )}
        {steps[currentStep]?.id === "promotion" && (
          <EnhancedPromotion formData={formData} updateField={updateField} />
        )}
        {steps[currentStep]?.id === "schedule" && (
          <EnhancedSchedule
            scheduleEnabled={scheduleEnabled}
            setScheduleEnabled={setScheduleEnabled}
            scheduleForm={scheduleForm}
            setScheduleForm={setScheduleForm}
            scheduleRules={scheduleRules}
            setScheduleRules={setScheduleRules}
            scheduleExceptions={scheduleExceptions}
            setScheduleExceptions={setScheduleExceptions}
            ruleDraft={ruleDraft}
            setRuleDraft={setRuleDraft}
            exceptionDraft={exceptionDraft}
            setExceptionDraft={setExceptionDraft}
          />
        )}
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
