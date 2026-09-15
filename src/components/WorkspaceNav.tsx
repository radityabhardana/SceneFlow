import Link from 'next/link';

export function WorkspaceNav({ projectId, active }: { projectId: string; active: 'overview' | 'world' | 'characters' | 'relationships' | 'locations' }) {
  const items = [['overview', 'Overview', ''], ['world', 'World', '/world'], ['characters', 'Characters', '/characters'], ['relationships', 'Relationships', '/relationships'], ['locations', 'Locations', '/locations']] as const;
  return <nav aria-label="Project workspace" className="mb-8 overflow-x-auto border-b border-[#2b3030]"><div className="flex min-w-max gap-6">{items.map(([key, label, suffix]) => <Link key={key} href={`/projects/${projectId}${suffix}`} className={`border-b-2 px-0 pb-3 text-xs font-semibold ${active === key ? 'border-[#c5e86c] text-[#c5e86c]' : 'border-transparent text-[#969b9a] hover:text-[#e8e8e3]'}`}>{label}</Link>)}</div></nav>;
}
