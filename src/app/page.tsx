import Link from 'next/link';
import { listProjects } from '../domain/project/service';
import type { Project } from '../domain/project/types';

export default async function DashboardPage() {
  let projects: Project[] = [];
  let failed = false;
  try { projects = await listProjects(); } catch { failed = true; }

  return <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
    <div className="flex flex-col justify-between gap-8 border-b border-[#2b3030] pb-10 sm:flex-row sm:items-end">
      <div><p className="mono mb-4 text-[10px] uppercase tracking-[.22em] text-[#c5e86c]">01 / Projects</p><h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-[-.04em] text-[#e8e8e3] sm:text-5xl">Keep the story<br /><span className="text-[#969b9a]">in frame.</span></h1><p className="mt-5 max-w-md text-sm leading-6 text-[#969b9a]">A focused workspace for building consistent AI drama, one project at a time.</p></div>
      <Link href="/projects/new" className="inline-flex items-center justify-center bg-[#c5e86c] px-5 py-3 text-sm font-bold text-[#0d1110] hover:bg-[#d8f48e]">New project <span className="ml-5 text-lg">+</span></Link>
    </div>
    <section className="pt-9"><div className="mb-5 flex items-center justify-between"><h2 className="text-sm font-semibold">Your projects</h2><span className="mono text-[10px] uppercase tracking-[.16em] text-[#707776]">{projects.length} {projects.length === 1 ? 'project' : 'projects'}</span></div>
      {failed ? <Feedback title="Projects are unavailable" body="The local store could not be reached. Refresh to try again." /> : projects.length === 0 ? <EmptyState /> : <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>}
    </section>
  </div>;
}

function ProjectCard({ project }: { project: Project }) { return <Link href={`/projects/${project.id}`} className="group block border border-[#2b3030] bg-[#151918] p-5 hover:-translate-y-0.5 hover:border-[#c5e86c]"><div className="mb-9 flex items-start justify-between gap-4"><span className="mono text-[10px] uppercase tracking-[.15em] text-[#c5e86c]">{project.aspectRatio}</span><span className="text-[#707776] transition-colors group-hover:text-[#c5e86c]">↗</span></div><h3 className="mb-2 text-lg font-semibold">{project.title}</h3><p className="line-clamp-2 min-h-12 text-sm leading-6 text-[#969b9a]">{project.premise || 'No premise added yet.'}</p><div className="mt-6 flex gap-4 border-t border-[#2b3030] pt-4 text-xs text-[#707776]"><span>{project.genre || 'Genre unset'}</span><span>·</span><span>{project.tone || 'Tone unset'}</span></div></Link>; }
function EmptyState() { return <div className="border border-dashed border-[#38403d] bg-[#151918]/70 px-6 py-14 text-center"><p className="mono mb-3 text-[10px] uppercase tracking-[.18em] text-[#c5e86c]">No active projects</p><h3 className="text-lg font-semibold">Start with the shape of the story.</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#969b9a]">Set a premise, tone, and visual direction. You can build the rest from there.</p><Link href="/projects/new" className="mt-6 inline-block border border-[#c5e86c] px-4 py-2 text-sm font-semibold text-[#c5e86c] hover:bg-[#c5e86c] hover:text-[#0d1110]">Create first project</Link></div>; }
function Feedback({ title, body }: { title: string; body: string }) { return <div role="alert" className="border border-[#805047] bg-[#2b1b19] px-5 py-8"><h3 className="font-semibold text-[#f09a8b]">{title}</h3><p className="mt-2 text-sm text-[#c8958d]">{body}</p></div>; }
