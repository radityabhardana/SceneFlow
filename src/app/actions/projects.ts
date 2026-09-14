'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  createProject,
  updateProject,
  validateProjectInput,
} from '../../domain/project/service';
import type { ProjectInput, ProjectValidationErrors } from '../../domain/project/types';

export type ProjectFormState = {
  errors: Partial<Record<keyof ProjectInput, string>>;
  values: Record<string, string>;
  message?: string;
};

const emptyState: ProjectFormState = { errors: {}, values: {} };

function readInput(formData: FormData): ProjectInput {
  return {
    title: String(formData.get('title') ?? ''),
    premise: String(formData.get('premise') ?? ''),
    genre: String(formData.get('genre') ?? ''),
    tone: String(formData.get('tone') ?? ''),
    aspectRatio: String(formData.get('aspectRatio') ?? '') as ProjectInput['aspectRatio'],
    visualStyle: String(formData.get('visualStyle') ?? ''),
  };
}

function valuesOf(input: ProjectInput): Record<string, string> {
  return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, String(value ?? '')]));
}

function validationState(input: ProjectInput, errors: ProjectValidationErrors): ProjectFormState {
  const fields = ['title', 'premise', 'genre', 'tone', 'aspectRatio', 'visualStyle'] as const;
  const nextErrors: ProjectFormState['errors'] = {};
  for (const field of fields) {
    const value = errors[field];
    if (value) nextErrors[field] = String(value);
  }
  return { errors: nextErrors, values: valuesOf(input), message: 'Review the marked fields before saving.' };
}

export async function createProjectAction(_previous: ProjectFormState = emptyState, formData: FormData): Promise<ProjectFormState> {
  const input = readInput(formData);
  const errors = await validateProjectInput(input);
  if (Object.keys(errors).length > 0) return validationState(input, errors);
  let project: Awaited<ReturnType<typeof createProject>>;
  try {
    project = await createProject(input);
  } catch {
    return { errors: {}, values: valuesOf(input), message: 'The project could not be saved. Try again.' };
  }
  revalidatePath('/', 'page');
  redirect(`/projects/${project.id}`);
}

export async function updateProjectAction(id: string, _previous: ProjectFormState = emptyState, formData: FormData): Promise<ProjectFormState> {
  const input = readInput(formData);
  const errors = await validateProjectInput(input);
  if (Object.keys(errors).length > 0) return validationState(input, errors);
  try {
    await updateProject(id, input);
  } catch {
    return { errors: {}, values: valuesOf(input), message: 'The project could not be updated. Try again.' };
  }
  revalidatePath('/', 'page');
  revalidatePath(`/projects/${id}`, 'page');
  redirect(`/projects/${id}`);
}
