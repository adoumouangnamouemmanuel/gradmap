"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select-input";
import { PROGRAM_STATUS_LABELS } from "@/lib/constants";

interface Props {
  institutions: { id: string; name: string }[];
  degreeTypes: string[];
  statuses: string[];
}

export function ProgramFilters({ institutions, degreeTypes, statuses }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentInstitution = searchParams.get("institution") || "";
  const currentDegree = searchParams.get("degree") || "";
  const currentStatus = searchParams.get("status") || "";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/programs?${params.toString()}`);
  };

  return (
    <div className="flex overflow-x-auto pb-1 -mb-1 sm:pb-0 sm:mb-0 gap-2 w-full sm:w-auto hide-scrollbar">
      {institutions.length > 0 && (
        <Select
          value={currentInstitution}
          onChange={(e) => updateParam("institution", e.target.value)}
          className="w-[180px] shrink-0 sm:w-[200px] text-[14px]"
        >
          <option value="">All Institutions</option>
          {institutions.map(inst => (
            <option key={inst.id} value={inst.id}>{inst.name}</option>
          ))}
        </Select>
      )}

      {degreeTypes.length > 0 && (
        <Select
          value={currentDegree}
          onChange={(e) => updateParam("degree", e.target.value)}
          className="w-[150px] shrink-0 sm:w-[160px] text-[14px]"
        >
          <option value="">All Degrees</option>
          {degreeTypes.map(dt => (
            <option key={dt} value={dt}>{dt}</option>
          ))}
        </Select>
      )}

      {statuses.length > 0 && (
        <Select
          value={currentStatus}
          onChange={(e) => updateParam("status", e.target.value)}
          className="w-[150px] shrink-0 sm:w-[160px] text-[14px]"
        >
          <option value="">All Statuses</option>
          {statuses.map(s => (
            <option key={s} value={s}>{PROGRAM_STATUS_LABELS[s] || s}</option>
          ))}
        </Select>
      )}
    </div>
  );
}
