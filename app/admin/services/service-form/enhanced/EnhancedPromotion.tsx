"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { ServiceFormData, UpdateServiceField } from "./types";

type EnhancedPromotionProps = {
  formData: ServiceFormData;
  updateField: UpdateServiceField;
};

export default function EnhancedPromotion({
  formData,
  updateField,
}: EnhancedPromotionProps) {
  return (
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
}
