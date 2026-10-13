"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";

function FormSubmitButton({ children, className, disabled, ...props }: ButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      {...props}
      type="submit"
      disabled={disabled || pending}
      className={cn("relative", className)}
    >
      {pending ? "Please wait..." : children}
    </Button>
  );
}

export function PendingButton({ children, ...props }: ButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} type="submit" disabled={pending}>
      {pending ? "Please wait..." : children}
    </Button>
  );
}

export function AuthForm({
  action,
  children,
  className,
  submit,
  submitClassName,
}: {
  action: (formData: FormData) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
  submit: React.ReactNode;
  submitClassName?: string;
}) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [isValid, setIsValid] = React.useState(false);
  const [showValidation, setShowValidation] = React.useState(false);

  const updateValidity = () => {
    const valid = formRef.current?.checkValidity() ?? false;
    setIsValid(valid);
    if (valid) setShowValidation(false);
  };

  return (
    <form
      ref={formRef}
      action={action}
      className={className}
      onInput={updateValidity}
      onInvalid={() => setShowValidation(true)}
    >
      {children}
      {showValidation && !isValid ? (
        <p className="text-destructive mt-2 text-xs" role="alert">
          Please complete the required fields before continuing.
        </p>
      ) : null}
      <FormSubmitButton aria-disabled={!isValid} className={submitClassName} disabled={!isValid}>
        {submit}
      </FormSubmitButton>
    </form>
  );
}
