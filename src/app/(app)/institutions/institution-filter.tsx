"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select-input";

export function InstitutionFilter({ countries }: { countries: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCountry = searchParams.get("country") || "";

  return (
    <Select
      value={currentCountry}
      onChange={(e) => {
        const val = e.target.value;
        if (val) {
          router.push(`/institutions?country=${encodeURIComponent(val)}`);
        } else {
          router.push(`/institutions`);
        }
      }}
      className="w-full sm:w-[220px] text-[14px]"
    >
      <option value="">All Countries</option>
      {countries.map(c => (
        <option key={c} value={c}>{c}</option>
      ))}
    </Select>
  );
}
