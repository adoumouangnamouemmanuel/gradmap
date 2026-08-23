"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  required = false,
  error,
  htmlFor,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1.5 text-[13px] font-medium text-foreground/80"
      >
        {label}
        {required && <span className="text-destructive text-[11px]">*</span>}
        {!required && (
          <span className="text-muted-foreground/40 text-[11px] font-normal">optional</span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-[12px] text-destructive animate-apple-fade">{error}</p>
      )}
    </div>
  );
}

// ── Client-side validation hook for forms with required fields ──

interface FieldError {
  [fieldId: string]: string | undefined;
}

export function useFormValidation(requiredFields: Record<string, string>) {
  const [errors, setErrors] = React.useState<FieldError>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validate = React.useCallback(
    (fieldId: string, value: string) => {
      const message = requiredFields[fieldId];
      if (!message) {
        setErrors((prev) => ({ ...prev, [fieldId]: undefined }));
        return true;
      }
      if (!value.trim()) {
        setErrors((prev) => ({ ...prev, [fieldId]: message }));
        return false;
      }
      setErrors((prev) => ({ ...prev, [fieldId]: undefined }));
      return true;
    },
    [requiredFields],
  );

  const handleBlur = React.useCallback(
    (fieldId: string, value: string) => {
      setTouched((prev) => ({ ...prev, [fieldId]: true }));
      validate(fieldId, value);
    },
    [validate],
  );

  const validateAll = React.useCallback(
    (formData: FormData) => {
      const newErrors: FieldError = {};
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
        document.getElementById(firstErrorField)?.focus();
        return false;
      }
      return true;
    },
    [requiredFields],
  );

  return { errors, touched, handleBlur, validate, validateAll };
}
