"use client";

import * as React from "react";

export function StatusSelect({
  name = "status",
  id,
  defaultValue,
  options,
}: {
  name?: string;
  id?: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      name={name}
      id={id}
      defaultValue={defaultValue}
      onChange={(event) => event.currentTarget.form?.requestSubmit()}
      className="bg-background h-9 rounded-lg border px-2 text-xs font-medium"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
