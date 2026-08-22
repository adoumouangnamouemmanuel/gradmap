import { FolderOpen } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { EmptyState } from "@/components/domain/empty-state";

export default function DocumentsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Documents"
        description="Your private document vault."
      />
      <EmptyState
        icon={<FolderOpen className="h-6 w-6" />}
        title="Document vault coming soon"
        description="Secure document upload and version management will be available in a future update."
      />
    </div>
  );
}
