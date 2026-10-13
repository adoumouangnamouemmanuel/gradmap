export type PlanningKind = "deadline" | "task" | "recommendation" | "document";
export interface PlanningItem {
  id: string;
  kind: PlanningKind;
  title: string;
  dueAt: string | null;
  applicationId: string | null;
  context: string;
  href: string | null;
  completed: boolean;
  status: string;
}
export interface PlanningData {
  items: PlanningItem[];
  truncated: boolean;
}
