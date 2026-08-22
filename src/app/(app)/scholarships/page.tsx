import { Award } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { EmptyState } from "@/components/domain/empty-state";

export default function ScholarshipsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Scholarships"
        description="Track funding opportunities and scholarship applications."
      />
      <EmptyState
        icon={<Award className="h-6 w-6" />}
        title="Scholarship tracking coming soon"
        description="Scholarship management will be available in a future update."
      />
    </div>
  );
}
