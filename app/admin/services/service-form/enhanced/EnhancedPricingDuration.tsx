"use client";

import { Input } from "@/components/ui/input";
import { DollarSign, Clock, Users } from "lucide-react";
import type { ServiceFormData, UpdateServiceField } from "./types";

type EnhancedPricingDurationProps = {
  formData: ServiceFormData;
  updateField: UpdateServiceField;
};

export default function EnhancedPricingDuration({
  formData,
  updateField,
}: EnhancedPricingDurationProps) {
  return (
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
}
