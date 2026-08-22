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
        className="flex items-center gap-1.5 text-sm font-medium"
      >
        {label}
        {required && <span className="text-destructive text-xs">Required</span>}
        {!required && (
          <span className="text-muted-foreground/60 text-xs font-normal">(optional)</span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

// ── Client-side validation hook for forms with required fields ──

interface FieldError {
  [fieldId: string]: string | undefined;
}

export function useFormValidation(requiredFields: Record<string, string>) {
  // requiredFields: { fieldId: errorMessage }
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
