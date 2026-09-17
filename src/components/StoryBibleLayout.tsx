import { WorkspaceNav } from './WorkspaceNav';

export function StoryBibleHeader({ projectId, title, eyebrow, copy, active }: { projectId: string; title: string; eyebrow: string; copy: string; active: 'world' | 'characters' | 'relationships' | 'locations' | 'objects' | 'state' }) {
  return <><div className="mb-8"><a href={`/projects/${projectId}`} className="mono text-[10px] uppercase tracking-[.18em] text-[#969b9a] hover:text-[#c5e86c]">← Project overview</a><div className="mt-8"><p className="mono mb-3 text-[10px] uppercase tracking-[.22em] text-[#c5e86c]">{eyebrow}</p><h1 className="text-4xl font-semibold tracking-[-.04em]">{title}</h1><p className="mt-4 max-w-xl text-sm leading-6 text-[#969b9a]">{copy}</p></div></div><WorkspaceNav projectId={projectId} active={active} /></>;
}

export function StoryBibleEmpty({ text }: { text: string }) {
  return <div className="border border-dashed border-[#38403d] px-5 py-12 text-center text-sm text-[#969b9a]">{text}</div>;
}
