"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Info, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchSelect, type SelectOption } from "@/components/ui/search-select";
import { FormField } from "@/components/ui/form-field";
import { changeDependentChoices } from "@/features/entries/choices";

export interface FieldConfig {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  defaultValue?: string | number | string[];
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  hint?: string;
  kind?: "text" | "select" | "textarea" | "number" | "checkbox";
  multiple?: boolean;
  dependsOn?: string;
  createHref?: string;
  disabled?: boolean;
  visibleWhen?: { field: string; value: string };
}
export interface FieldGroup {
  label?: string;
  description?: string;
  fields: FieldConfig[];
}
export interface FormResult {
  id?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}
interface CreatePageProps {
  title: string;
  description?: string;
  backHref: string;
  backLabel: string;
  submitLabel: string;
  action: (formData: FormData) => Promise<FormResult | void> | void;
  fields: (FieldConfig | FieldGroup)[];
  requiredFields?: Record<string, string>;
  successHref?: string;
  notice?: string;
  context?: string;
  blocked?: boolean;
}

export function CreatePage({
  title,
  description,
  backHref,
  backLabel,
  submitLabel,
  action,
  fields,
  requiredFields = {},
  successHref,
  notice,
  context,
  blocked = false,
}: CreatePageProps) {
  const allFields = fields.flatMap((item) => ("fields" in item ? item.fields : [item]));
  const [values, setValues] = useState<Record<string, string | string[]>>(() =>
    Object.fromEntries(
      allFields
        .filter((field) => field.options)
        .map((field) => [
          field.id,
          (typeof field.defaultValue === "number"
            ? String(field.defaultValue)
            : field.defaultValue) ?? (field.multiple ? [] : field.options?.[0]?.value || ""),
        ]),
    ),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const submitting = useRef(false);
  const feedback = useRef<HTMLDivElement>(null);
  const router = useRouter();
  function available(field: FieldConfig) {
    return (
      field.options?.filter(
        (option) =>
          !option.value || !field.dependsOn || option.parentValue === values[field.dependsOn],
      ) || []
    );
  }
  const visible = (field: FieldConfig) =>
    !field.visibleWhen || values[field.visibleWhen.field] === field.visibleWhen.value;
  function creationHref(field: FieldConfig) {
    const parent = field.dependsOn && values[field.dependsOn];
    return field.dependsOn === "institution_id" && typeof parent === "string" && parent
      ? `${field.createHref}?institution=${encodeURIComponent(parent)}`
      : field.createHref || backHref;
  }
  const missing = allFields.filter(
    (field) =>
      visible(field) &&
      field.required &&
      field.options &&
      (!field.dependsOn || !!values[field.dependsOn]) &&
      !available(field).some((option) => option.value),
  );
  function change(fieldId: string, value: string | string[]) {
    setSaved(false);
    setValues((previous) => changeDependentChoices(allFields, previous, fieldId, value));
    setErrors((previous) => {
      const next = { ...previous };
      delete next[fieldId];
      delete next._form;
      return next;
    });
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || blocked || missing.length) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const nextErrors: Record<string, string> = {};
    for (const field of allFields) {
      if (!visible(field)) continue;
      const value = data.get(field.id);
      if (
        (field.required || requiredFields[field.id]) &&
        (typeof value !== "string" || !value.trim())
      )
        nextErrors[field.id] = requiredFields[field.id] || `${field.label} is required.`;
      if (
        field.options &&
        typeof value === "string" &&
        value &&
        !available(field).some((option) => option.value === value)
      )
        nextErrors[field.id] = "Choose an available option.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      document.getElementById(`field-${Object.keys(nextErrors)[0]}`)?.focus();
      return;
    }
    if (!form.reportValidity()) return;
    submitting.current = true;
    setPending(true);
    setSaved(false);
    try {
      const result = await action(data);
      if (result?.error) {
        setErrors({ _form: result.error, ...result.fieldErrors });
        requestAnimationFrame(() => feedback.current?.focus());
        return;
      }
      if (result?.id && !result.success) {
        router.push(successHref ? successHref.replace("{id}", result.id) : backHref);
        router.refresh();
      } else {
        setSaved(true);
        router.refresh();
      }
    } catch {
      setErrors({
        _form:
          "We couldn’t save this entry. Your changes are still here. Check your connection and try again.",
      });
      requestAnimationFrame(() => feedback.current?.focus());
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }
  function render(field: FieldConfig) {
    if (!visible(field)) return null;
    const id = `field-${field.id}`;
    const helpId = `${id}-help`;
    const errorId = `${id}-error`;
    const disabled = field.disabled || (field.dependsOn ? !values[field.dependsOn] : false);
    const common = {
      id,
      name: field.id,
      required: field.required,
      "aria-invalid": errors[field.id] ? true : undefined,
      "aria-describedby":
        [field.hint ? helpId : "", errors[field.id] ? errorId : ""].filter(Boolean).join(" ") ||
        undefined,
    };
    return (
      <FormField
        key={field.id}
        label={field.label}
        required={field.required}
        htmlFor={id}
        error={errors[field.id]}
      >
        {field.options ? (
          <SearchSelect
            id={id}
            name={field.id}
            label={field.label}
            options={available(field)}
            value={values[field.id] || (field.multiple ? [] : "")}
            onChange={(value) => change(field.id, value)}
            multiple={field.multiple}
            disabled={disabled}
            required={field.required}
            invalid={!!errors[field.id]}
            describedBy={common["aria-describedby"]}
          />
        ) : field.kind === "checkbox" ? (
          <input
            {...common}
            type="checkbox"
            defaultChecked={field.defaultValue === "on"}
            className="accent-primary h-5 w-5"
          />
        ) : field.kind === "textarea" || field.rows ? (
          <textarea
            {...common}
            disabled={disabled}
            defaultValue={typeof field.defaultValue === "string" ? field.defaultValue : undefined}
            rows={field.rows || 4}
            placeholder={field.placeholder}
            className="form-textarea bg-card placeholder:text-muted-foreground/70 w-full resize-y rounded-2xl border px-4 py-3 text-sm"
          />
        ) : (
          <Input
            {...common}
            disabled={disabled}
            type={field.type || (field.kind === "number" ? "number" : "text")}
            defaultValue={Array.isArray(field.defaultValue) ? undefined : field.defaultValue}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            className="bg-card min-h-12 rounded-2xl text-sm"
          />
        )}
        {field.hint && (
          <p id={helpId} className="text-muted-foreground mt-2 text-xs leading-relaxed">
            {field.hint}
          </p>
        )}
        {field.dependsOn && disabled && (
          <p className="text-muted-foreground mt-2 text-xs">
            Choose {allFields.find((parent) => parent.id === field.dependsOn)?.label.toLowerCase()}{" "}
            first.
          </p>
        )}
        {field.options && !available(field).some((option) => option.value) && !disabled && (
          <p className="text-muted-foreground mt-2 text-xs">No choices available yet.</p>
        )}
        {field.createHref && (
          <Link
            href={creationHref(field)}
            className="text-primary mt-2 inline-flex items-center gap-1 text-xs font-medium hover:underline"
          >
            <Plus size={13} /> Add {field.label.toLowerCase()}
          </Link>
        )}
      </FormField>
    );
  }
  return (
    <div className="workspace-page">
      <Link
        href={backHref}
        className="text-muted-foreground hover:text-primary mb-6 inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft size={16} />
        {backLabel}
      </Link>
      <div className="mb-7">
        <p className="eyebrow mb-3">MAKE IT A PLAN</p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-relaxed">
          {description || "Keep the essentials clear. Add detail where it helps you move forward."}
        </p>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,800px)_minmax(230px,1fr)]">
        <form onSubmit={submit} noValidate className="workspace-panel min-w-0 p-5 sm:p-8">
          <div ref={feedback} tabIndex={-1}>
            {errors._form && (
              <div
                role="alert"
                className="bg-destructive/10 text-destructive mb-6 rounded-2xl p-4 text-sm"
              >
                {errors._form}
              </div>
            )}
            {saved && (
              <p
                role="status"
                className="bg-success/10 mb-6 flex items-center gap-2 rounded-2xl p-4 text-sm"
              >
                <CheckCircle2 size={17} />
                Changes saved.
              </p>
            )}
          </div>
          {notice && (
            <p className="bg-primary/5 mb-6 rounded-2xl p-4 text-sm leading-relaxed">{notice}</p>
          )}
          {missing.length > 0 && (
            <div role="status" className="bg-primary/5 mb-6 rounded-2xl p-4 text-sm">
              <p className="font-medium">One step before this entry</p>
              <p className="text-muted-foreground mt-2">
                Add {missing.map((field) => field.label.toLowerCase()).join(" and ")} first. Return
                here when it’s ready.
              </p>
              {missing.map(
                (field) =>
                  field.createHref && (
                    <Button
                      key={field.id}
                      variant="outline"
                      size="sm"
                      asChild
                      className="mt-3 mr-2"
                    >
                      <Link href={creationHref(field)}>Create {field.label.toLowerCase()}</Link>
                    </Button>
                  ),
              )}
            </div>
          )}
          <fieldset disabled={pending || blocked} className="space-y-7">
            {fields.map((item, index) =>
              "fields" in item ? (
                <section key={index} className="space-y-4">
                  {item.label && (
                    <div className="border-b pb-3">
                      <h2 className="text-base font-semibold">{item.label}</h2>
                      {item.description && (
                        <p className="text-muted-foreground mt-1 text-sm">{item.description}</p>
                      )}
                    </div>
                  )}
                  <div
                    className={item.fields.length > 1 ? "grid gap-5 sm:grid-cols-2" : "space-y-5"}
                  >
                    {item.fields.map(render)}
                  </div>
                </section>
              ) : (
                render(item)
              ),
            )}
          </fieldset>
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t pt-6">
            <Button type="submit" disabled={pending || blocked || missing.length > 0}>
              {pending && <Loader2 size={16} className="animate-spin" />}
              {pending ? "Saving…" : submitLabel}
            </Button>
            <Button variant="ghost" asChild>
              <Link href={backHref}>Cancel</Link>
            </Button>
            <span className="text-muted-foreground text-xs">* Required fields</span>
          </div>
        </form>
        <aside className="workspace-panel hidden p-6 xl:block">
          <Info size={20} className="text-primary mb-4" />
          <h2 className="text-sm font-semibold">A connected workspace</h2>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            {context ||
              "Institutions contain programs. Programs become applications. Your deadlines, writing, documents and people can then support those applications."}
          </p>
          <p className="text-muted-foreground mt-5 border-t pt-4 text-xs leading-relaxed">
            Your entries stay private. Creating a record does not submit an application or contact
            anyone.
          </p>
        </aside>
      </div>
    </div>
  );
}
