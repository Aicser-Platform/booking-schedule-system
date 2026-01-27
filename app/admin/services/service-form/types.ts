import type { Service } from "@/lib/types/database";

export type ServiceFormValues = Omit<
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

export type ServiceInitialValues = Partial<
  Omit<ServiceFormValues, "tags"> & {
    tags: string | string[] | null;
    image_urls: string[] | null;
  }
>;

export type OperatingRuleDraft = {
  id: string;
  rule_type: "weekly" | "monthly_day" | "monthly_nth_weekday";
  weekday?: number;
  month_day?: number;
  nth?: number;
  start_time?: string;
  end_time?: string;
};

export type OperatingExceptionDraft = {
  id: string;
  date: string;
  is_open: boolean;
  start_time?: string;
  end_time?: string;
  reason?: string;
};

export type OperatingScheduleDraft = {
  timezone: string;
  rule_type: "daily" | "weekly" | "monthly";
  open_time?: string;
  close_time?: string;
  effective_from?: string;
  effective_to?: string;
  is_active: boolean;
};

export const weekdays = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export const nthOptions = [
  { value: 1, label: "1st" },
  { value: 2, label: "2nd" },
  { value: 3, label: "3rd" },
  { value: 4, label: "4th" },
  { value: 5, label: "5th" },
  { value: -1, label: "Last" },
];
