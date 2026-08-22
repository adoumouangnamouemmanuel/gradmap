import { getPrograms } from "@/features/programs/actions";
import NewScholarshipForm from "./form";

export default async function NewScholarshipPage() {
  const programs = await getPrograms();
  return <NewScholarshipForm programs={programs} />;
}
