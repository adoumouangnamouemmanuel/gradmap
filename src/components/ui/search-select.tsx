"use client";

import { useId, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  parentValue?: string;
}

export function SearchSelect({
  id,
  name,
  label,
  options,
  value,
  onChange,
  multiple = false,
  required,
  disabled,
  invalid,
  describedBy,
}: {
  id?: string;
  name: string;
  label: string;
  options: SelectOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const [visibleLimit, setVisibleLimit] = useState(60);
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  const matching = options.filter((option) =>
    option.label.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const visible = matching.slice(0, visibleLimit);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const placeholder =
    options.find((option) => !option.value)?.label || `Choose ${label.toLowerCase()}`;
  function choose(option: SelectOption) {
    onChange(
      multiple
        ? selected.includes(option.value)
          ? selected.filter((item) => item !== option.value)
          : [...selected, option.value]
        : option.value,
    );
    if (!multiple) setOpen(false);
  }
  return (
    <>
      {multiple ? (
        selected.map((item) => <input key={item} type="hidden" name={name} value={item} />)
      ) : (
        <input type="hidden" name={name} value={typeof value === "string" ? value : ""} />
      )}
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          setSearch("");
          setActive(0);
          setVisibleLimit(60);
        }}
      >
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            role="combobox"
            aria-label={label}
            aria-expanded={open}
            aria-controls={listId}
            aria-haspopup="listbox"
            aria-required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            disabled={disabled}
            className={cn(
              "form-select-trigger bg-card hover:border-primary/35 flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              invalid && "border-destructive",
            )}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                setSearch(""); setActive(0); setVisibleLimit(60);
                setOpen(true);
              }
            }}
          >
            <span
              className={cn("min-w-0 flex-1 truncate", !selected.length && "text-muted-foreground")}
            >
              {selected.length
                ? multiple
                  ? `${selected.length} selected · ${options
                      .filter((option) => selected.includes(option.value))
                      .map((option) => option.label)
                      .join(", ")}`
                  : options.find((option) => option.value === selected[0])?.label || placeholder
                : placeholder}
            </span>
            <ChevronDown size={16} className="text-muted-foreground shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] min-w-[240px] rounded-2xl p-2"
        >
          <div className="mb-2 flex items-center gap-2 border-b px-2 pt-1 pb-3">
            <Search size={16} className="text-muted-foreground" />
            <input
              aria-label={`Search ${label.toLowerCase()}`}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setActive(0);
                setVisibleLimit(60);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  event.preventDefault();
                  const next = Math.max(
                    0,
                    Math.min(
                      visible.length - 1,
                      event.key === "ArrowDown" ? 0 : visible.length - 1,
                    ),
                  );
                  setActive(next);
                  optionRefs.current[next]?.focus();
                }
                if (event.key === "Enter" && visible[active]) {
                  event.preventDefault();
                  choose(visible[active]);
                }
              }}
              placeholder="Type to search…"
            />
          </div>
          <div
            id={listId}
            role="listbox"
            aria-label={label}
            aria-multiselectable={multiple || undefined}
            className="max-h-64 overflow-y-auto"
          >
            {visible.map((option, index) => (
              <button
                key={option.value}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                type="button"
                role="option"
                aria-selected={selected.includes(option.value)}
                className="hover:bg-muted focus:bg-muted flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm"
                onClick={() => choose(option)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    const next = Math.max(
                      0,
                      Math.min(visible.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)),
                    );
                    setActive(next);
                    optionRefs.current[next]?.focus();
                  }
                  if (event.key === "Escape") setOpen(false);
                }}
              >
                {option.label}
                {selected.includes(option.value) && (
                  <Check size={16} className="text-primary shrink-0" />
                )}
              </button>
            ))}
            {!visible.length && (
              <p className="text-muted-foreground px-3 py-5 text-center text-sm">
                No matching choices. Try another search.
              </p>
            )}
          </div>
          {matching.length > visible.length && <button type="button" onClick={() => setVisibleLimit((limit) => limit + 60)} className="mt-2 w-full rounded-xl border-t px-3 py-3 text-sm font-medium text-primary hover:bg-muted">Show more choices · {matching.length - visible.length} remaining</button>}
        </PopoverContent>
      </Popover>
      {multiple && selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selected.map((item) => (
            <button
              key={item}
              type="button"
              disabled={disabled}
              onClick={() => onChange(selected.filter((current) => current !== item))}
              aria-label={`Remove ${options.find((option) => option.value === item)?.label || item}`}
              className="bg-primary/10 text-primary rounded-lg px-2 py-1 text-xs"
            >
              {options.find((option) => option.value === item)?.label || item} ×
            </button>
          ))}
        </div>
      )}
    </>
  );
}
