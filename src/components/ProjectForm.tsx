'use client';

import { useActionState } from 'react';
import type { Project } from '../domain/project/types';
import { createProjectAction, updateProjectAction, type ProjectFormState } from '../app/actions/projects';

const ratios = ['16:9', '9:16', '1:1'];
const blank: ProjectFormState = { errors: {}, values: {} };

type Props = { project?: Project };

export function ProjectForm({ project }: Props) {
  const initial = project ? {
    title: project.title, premise: project.premise, genre: project.genre, tone: project.tone,
    aspectRatio: project.aspectRatio, visualStyle: project.visualStyle,
  } : {};
  const initialState: ProjectFormState = { errors: {}, values: Object.fromEntries(Object.entries(initial).map(([k, v]) => [k, String(v ?? '')])) };
  const formAction = project ? updateProjectAction.bind(null, project.id) : createProjectAction;
  const [state, action, pending] = useActionState(formAction, initialState);
  const value = (key: string) => state.values[key] ?? '';
  const error = (key: keyof ProjectFormState['errors']) => state.errors[key];

  return <form action={action} className="space-y-7">
    {state.message && <div role="alert" className="border border-[#805047] bg-[#2b1b19] px-4 py-3 text-sm text-[#f09a8b]">{state.message}</div>}
    <div className="grid gap-6 md:grid-cols-2">
      <Field label="Project title" name="title" value={value('title')} error={error('title')} required placeholder="e.g. PC Kosan" />
      <Field label="Genre" name="genre" value={value('genre')} error={error('genre')} placeholder="e.g. Mystery drama" />
      <Field label="Tone" name="tone" value={value('tone')} error={error('tone')} placeholder="e.g. Quiet, uneasy" />
      <div>
        <label htmlFor="aspectRatio" className="mb-2 block text-xs font-semibold uppercase tracking-[.14em] text-[#969b9a]">Aspect ratio <span className="text-[#c5e86c]">*</span></label>
        <select id="aspectRatio" name="aspectRatio" defaultValue={value('aspectRatio')} className={fieldClass(Boolean(error('aspectRatio')))}>
          <option value="">Select ratio</option>{ratios.map((ratio) => <option key={ratio} value={ratio}>{ratio}</option>)}
        </select>{error('aspectRatio') && <ErrorText text={error('aspectRatio')} />}
      </div>
    </div>
    <Field label="Premise" name="premise" value={value('premise')} error={error('premise')} required multiline placeholder="What is this series about? Keep the working premise clear." />
    <Field label="Visual style" name="visualStyle" value={value('visualStyle')} error={error('visualStyle')} multiline placeholder="Describe the visual language, palette, and camera feel." />
    <div className="flex items-center justify-between gap-4 border-t border-[#2b3030] pt-6">
      <p className="mono text-[10px] uppercase tracking-[.14em] text-[#707776]">Fields marked * are required</p>
      <button disabled={pending} className="bg-[#c5e86c] px-5 py-3 text-sm font-bold text-[#0d1110] hover:bg-[#d8f48e] disabled:cursor-wait disabled:opacity-60">{pending ? 'Saving…' : project ? 'Save changes' : 'Create project'}</button>
    </div>
  </form>;
}

function fieldClass(hasError: boolean) { return `w-full border bg-[#151918] px-3 py-3 text-sm text-[#e8e8e3] outline-none placeholder:text-[#606765] focus:border-[#c5e86c] ${hasError ? 'border-[#f09a8b]' : 'border-[#2b3030]'}`; }
function ErrorText({ text }: { text?: string }) { return text ? <p className="mt-2 text-xs text-[#f09a8b]">{text}</p> : null; }
function Field({ label, name, value, error, multiline, required, placeholder }: { label: string; name: string; value: string; error?: string; multiline?: boolean; required?: boolean; placeholder?: string }) {
  return <div><label htmlFor={name} className="mb-2 block text-xs font-semibold uppercase tracking-[.14em] text-[#969b9a]">{label} {required && <span className="text-[#c5e86c]">*</span>}</label>{multiline ? <textarea id={name} name={name} defaultValue={value} placeholder={placeholder} rows={4} className={fieldClass(Boolean(error))} /> : <input id={name} name={name} defaultValue={value} placeholder={placeholder} className={fieldClass(Boolean(error))} />}{<ErrorText text={error} />}</div>;
}
