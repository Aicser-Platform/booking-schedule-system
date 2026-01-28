"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ServiceFormData, UpdateServiceField } from "./types";

type EnhancedBasicInformationProps = {
  formData: ServiceFormData;
  updateField: UpdateServiceField;
};

export default function EnhancedBasicInformation({
  formData,
  updateField,
}: EnhancedBasicInformationProps) {
  return (
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
}
