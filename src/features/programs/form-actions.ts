"use server";
import { createEntryFromForm } from "@/features/entries/actions";
export async function createInstitutionFromForm(form: FormData) { return createEntryFromForm("institution", form); }
export async function createProgramFromForm(form: FormData) { return createEntryFromForm("program", form); }
export async function createApplicationFromForm(form: FormData) { return createEntryFromForm("application", form); }
export async function createDeadlineFromForm(form: FormData) { return createEntryFromForm("deadline", form); }
