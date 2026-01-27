import type { ServiceFormValues } from "./types";

type ServiceDetailsSectionProps = {
  values: ServiceFormValues;
  onChange: <K extends keyof ServiceFormValues>(
    key: K,
    value: ServiceFormValues[K],
  ) => void;
  labelClass: string;
  inputClass: string;
  textareaClass: string;
};

export function ServiceDetailsSection({
  values,
  onChange,
  labelClass,
  inputClass,
  textareaClass,
}: ServiceDetailsSectionProps) {
  return (
    <>
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
            onChange={(event) => onChange("name", event.target.value)}
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
            onChange={(event) => onChange("category", event.target.value)}
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
            onChange={(event) => onChange("public_name", event.target.value)}
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
            onChange={(event) => onChange("internal_name", event.target.value)}
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
          onChange={(event) => onChange("tags", event.target.value)}
          placeholder="comma-separated tags"
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label className={labelClass}>Service Specifications</label>
        <textarea
          rows={3}
          value={values.description}
          onChange={(event) => onChange("description", event.target.value)}
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
            onChange={(event) => onChange("inclusions", event.target.value)}
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
            onChange={(event) => onChange("prep_notes", event.target.value)}
            className={textareaClass}
            placeholder="Preparation notes for customers"
          />
        </div>
      </div>
    </>
  );
}
