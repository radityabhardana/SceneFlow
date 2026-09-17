'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createStoryObject, deleteStoryObject, updateStoryObject, type StoryObjectInput } from '@/domain/object';
import { clearCharacterState, clearObjectState, setCharacterState, setObjectState, type CharacterStateInput, type ObjectStateInput } from '@/domain/state';

export type CurrentStateForm = { errors: Record<string, string>; values: Record<string, string>; message?: string };
export type CurrentStateMutation = { error?: string };
const empty: CurrentStateForm = { errors: {}, values: {} };
const mutationEmpty: CurrentStateMutation = {};
const read = (data: FormData, key: string) => String(data.get(key) ?? '');
const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'The change could not be saved. Try again.';
function domainErrors(error: unknown) { if (typeof error === 'object' && error !== null && 'errors' in error && typeof error.errors === 'object' && error.errors !== null) return Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, String(value)])); return {}; }
function failure(error: unknown, values: Record<string, string>): CurrentStateForm { return { errors: domainErrors(error), values, message: errorMessage(error) }; }
function refresh(projectId: string, section: 'objects' | 'state', detail?: string) { revalidatePath(`/projects/${projectId}/${section}`, 'page'); if (detail) revalidatePath(`/projects/${projectId}/${section}/${detail}`, 'page'); }
const objectValues = (data: FormData) => ({ name: read(data, 'name'), description: read(data, 'description'), visualLock: read(data, 'visualLock') });
const characterStateValues = (data: FormData) => ({ locationId: read(data, 'locationId'), emotion: read(data, 'emotion'), condition: read(data, 'condition') });
const objectStateValues = (data: FormData) => ({ holderCharacterId: read(data, 'holderCharacterId'), locationId: read(data, 'locationId'), condition: read(data, 'condition') });

export async function createObjectAction(projectId: string, _previous: CurrentStateForm = empty, data: FormData): Promise<CurrentStateForm> { const input: StoryObjectInput = { name: read(data, 'name'), description: read(data, 'description'), visualLock: read(data, 'visualLock') || null }; try { await createStoryObject(projectId, input); } catch (error) { return failure(error, objectValues(data)); } refresh(projectId, 'objects'); redirect(`/projects/${projectId}/objects`); }
export async function updateObjectAction(projectId: string, objectId: string, _previous: CurrentStateForm = empty, data: FormData): Promise<CurrentStateForm> { const input: StoryObjectInput = { name: read(data, 'name'), description: read(data, 'description'), visualLock: read(data, 'visualLock') || null }; try { await updateStoryObject(projectId, objectId, input); } catch (error) { return failure(error, objectValues(data)); } refresh(projectId, 'objects', objectId); refresh(projectId, 'state'); redirect(`/projects/${projectId}/objects`); }
export async function deleteObjectAction(projectId: string, objectId: string, _previous: CurrentStateMutation = mutationEmpty, _data?: FormData): Promise<CurrentStateMutation> { try { await deleteStoryObject(projectId, objectId); } catch (error) { return { error: errorMessage(error) }; } refresh(projectId, 'objects'); refresh(projectId, 'state'); redirect(`/projects/${projectId}/objects`); }

export async function setCharacterStateAction(projectId: string, characterId: string, _previous: CurrentStateForm = empty, data: FormData): Promise<CurrentStateForm> { const locationId = read(data, 'locationId'); const input: CharacterStateInput = { locationId: locationId || null, emotion: read(data, 'emotion') || null, condition: read(data, 'condition') || null }; try { await setCharacterState(projectId, characterId, input); } catch (error) { return failure(error, characterStateValues(data)); } refresh(projectId, 'state'); redirect(`/projects/${projectId}/state`); }
export async function clearCharacterStateAction(projectId: string, characterId: string, _previous: CurrentStateMutation = mutationEmpty, _data?: FormData): Promise<CurrentStateMutation> { try { await clearCharacterState(projectId, characterId); } catch (error) { return { error: errorMessage(error) }; } refresh(projectId, 'state'); redirect(`/projects/${projectId}/state`); }
export async function setObjectStateAction(projectId: string, objectId: string, _previous: CurrentStateForm = empty, data: FormData): Promise<CurrentStateForm> { const holderCharacterId = read(data, 'holderCharacterId'); const locationId = read(data, 'locationId'); const input: ObjectStateInput = { holderCharacterId: holderCharacterId || null, locationId: locationId || null, condition: read(data, 'condition') || null }; try { await setObjectState(projectId, objectId, input); } catch (error) { return failure(error, objectStateValues(data)); } refresh(projectId, 'state'); refresh(projectId, 'objects'); redirect(`/projects/${projectId}/state`); }
export async function clearObjectStateAction(projectId: string, objectId: string, _previous: CurrentStateMutation = mutationEmpty, _data?: FormData): Promise<CurrentStateMutation> { try { await clearObjectState(projectId, objectId); } catch (error) { return { error: errorMessage(error) }; } refresh(projectId, 'state'); refresh(projectId, 'objects'); redirect(`/projects/${projectId}/state`); }
