"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";

interface FieldConfig {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string | number;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  hint?: string;
  kind?: "text" | "select" | "textarea" | "number";
}

interface FieldGroup {
  label?: string;
  fields: FieldConfig[];
}

interface CreatePageProps {
  title: string;
  backHref: string;
  backLabel: string;
  submitLabel: string;
  action: (formData: FormData) => Promise<{ id?: string; error?: string }> | void | Promise<void>;
  fields: (FieldConfig | FieldGroup)[];
  requiredFields?: Record<string, string>;
  /** Path to navigate to on success. Use {id} as placeholder for the created entity's ID. */
  successHref?: string;
}

function isFieldGroup(f: FieldConfig | FieldGroup): f is FieldGroup {
  return "fields" in f;
}

function inferKind(field: FieldConfig): FieldConfig["kind"] {
  if (field.kind) return field.kind;
  if (field.options) return "select";
  if (field.rows) return "textarea";
  if (field.type === "number") return "number";
  return "text";
}

function renderField(field: FieldConfig, error?: string) {
  const kind = inferKind(field);
  const inputId = `field-${field.id}`;
  const hasError = !!error;
  const errClasses = cn(hasError && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20");

  switch (kind) {
    case "select":
      return (
        <FormField label={field.label} required={field.required} error={error} htmlFor={inputId}>
          <Select
            id={inputId}
            name={field.id}
            required={field.required}
            defaultValue={field.defaultValue as string}
            className={errClasses}
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
          {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
        </FormField>
      );

    case "textarea":
      return (
        <FormField label={field.label} required={field.required} error={error} htmlFor={inputId}>
          <textarea
            id={inputId}
            name={field.id}
            rows={field.rows || 3}
            placeholder={field.placeholder}
            className={cn(
              "flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
              errClasses,
            )}
          />
        </FormField>
      );

    case "number":
      return (
        <FormField label={field.label} required={field.required} error={error} htmlFor={inputId}>
          <Input
            id={inputId}
            name={field.id}
            type="number"
            required={field.required}
            placeholder={field.placeholder}
            defaultValue={field.defaultValue}
            min={field.min}
            max={field.max}
            step={field.step}
            className={errClasses}
          />
        </FormField>
      );

    default:
      return (
        <FormField label={field.label} required={field.required} error={error} htmlFor={inputId}>
          <Input
            id={inputId}
            name={field.id}
            type={field.type || "text"}
            required={field.required}
            placeholder={field.placeholder}
            defaultValue={field.defaultValue as string}
            className={errClasses}
          />
        </FormField>
      );
  }
}

export function CreatePage({
  title,
  backHref,
  backLabel,
  submitLabel,
  action,
  fields,
  requiredFields = {},
  successHref,
}: CreatePageProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isPending, setIsPending] = React.useState(false);
  const router = useRouter();

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const newErrors: Record<string, string> = {};
      let firstErrorField: string | null = null;

      for (const [fieldId, message] of Object.entries(requiredFields)) {
        const value = formData.get(fieldId) as string;
        if (!value || !value.trim()) {
          newErrors[fieldId] = message;
          if (!firstErrorField) firstErrorField = fieldId;
        }
      }

      setErrors(newErrors);
      if (firstErrorField) {
        document.getElementById(`field-${firstErrorField}`)?.focus();
        return;
      }

      setIsPending(true);
      try {
        const result = await action(formData);
        // If the action returns a result with error or id, handle it
        if (result && typeof result === "object") {
          if ("error" in result && result.error) {
            setErrors({ _form: result.error });
            setIsPending(false);
            return;
          }
          if ("id" in result && result.id) {
            const href = successHref ? successHref.replace("{id}", result.id) : backHref;
            router.push(href);
            return;
          }
        }
        // If no result (void return), the action handled its own navigation (e.g. documents, essays)
      } catch (err: any) {
        console.error("Form action error:", err);
        setErrors({ _form: err?.message || "Something went wrong" });
        setIsPending(false);
      }
    },
    [action, requiredFields],
  );

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
      <Link
        href={backHref}
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map((item, i) => {
              if (isFieldGroup(item)) {
                return (
                  <div key={i} className="space-y-4">
                    {item.label && (
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {item.label}
                      </h3>
                    )}
                    {item.fields.length > 1 ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {item.fields.map((f) => (
                          <div key={f.id}>{renderField(f, errors[f.id])}</div>
                        ))}
                      </div>
                    ) : (
                      renderField(item.fields[0], errors[item.fields[0].id])
                    )}
                  </div>
                );
              }

              return <div key={item.id}>{renderField(item, errors[item.id])}</div>;
            })}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : submitLabel}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={backHref}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
