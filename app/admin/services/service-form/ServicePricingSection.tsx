import { Switch } from "@/components/ui/switch";
import type { ServiceFormValues } from "./types";

type ServicePricingSectionProps = {
  values: ServiceFormValues;
  onChange: <K extends keyof ServiceFormValues>(
    key: K,
    value: ServiceFormValues[K],
  ) => void;
  labelClass: string;
  inputClass: string;
};

export function ServicePricingSection({
  values,
  onChange,
  labelClass,
  inputClass,
}: ServicePricingSectionProps) {
  return (
    <>
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
            onChange={(event) => onChange("price", Number(event.target.value))}
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
              onChange("deposit_amount", Number(event.target.value))
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
              onChange("duration_minutes", Number(event.target.value))
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
              onChange("buffer_minutes", Number(event.target.value))
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
              onChange("max_capacity", Number(event.target.value))
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
          onCheckedChange={(checked) => onChange("is_active", checked)}
        />
      </div>
    </>
  );
}
