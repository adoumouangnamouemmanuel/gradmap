import { getInstitutions } from "@/features/programs/actions";
import NewProgramForm from "./form";

export default async function NewProgramPage() {
  const institutions = await getInstitutions();
  return <NewProgramForm institutions={institutions} />;
}
