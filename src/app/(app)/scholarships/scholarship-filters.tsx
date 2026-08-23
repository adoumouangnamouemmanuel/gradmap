"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select-input";
import { FUNDING_TYPE_LABELS } from "@/lib/constants";

interface Props {
  fundingTypes: string[];
  statuses: string[];
}

export function ScholarshipFilters({ fundingTypes, statuses }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentFunding = searchParams.get("fundingType") || "";
  const currentStatus = searchParams.get("status") || "";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/scholarships?${params.toString()}`);
  };

  return (
    <div className="flex overflow-x-auto pb-1 -mb-1 sm:pb-0 sm:mb-0 gap-2 w-full sm:w-auto hide-scrollbar">
      {fundingTypes.length > 0 && (
        <Select
          value={currentFunding}
          onChange={(e) => updateParam("fundingType", e.target.value)}
          className="w-[160px] shrink-0 sm:w-[180px] h-9 text-sm"
        >
          <option value="">All Funding Types</option>
          {fundingTypes.map(ft => (
            <option key={ft} value={ft} className="capitalize">
              {FUNDING_TYPE_LABELS[ft] || ft.replace(/_/g, " ")}
            </option>
          ))}
        </Select>
      )}

      {statuses.length > 0 && (
        <Select
          value={currentStatus}
          onChange={(e) => updateParam("status", e.target.value)}
          className="w-[140px] shrink-0 sm:w-[150px] h-9 text-sm"
        >
          <option value="">All Statuses</option>
          {statuses.map(s => (
            <option key={s} value={s} className="capitalize">
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </Select>
      )}
    </div>
  );
}
