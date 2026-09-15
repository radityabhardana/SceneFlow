import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProject } from '../../../domain/project/service';
import { ProjectForm } from '../../../components/ProjectForm';
import { WorkspaceNav } from '../../../components/WorkspaceNav';

export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project) notFound();

  return <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-14">
    <div className="flex flex-wrap items-center justify-between gap-4"><Link href="/" className="mono text-[10px] uppercase tracking-[.18em] text-[#969b9a] hover:text-[#c5e86c]">← All projects</Link><span className="mono text-[10px] uppercase tracking-[.16em] text-[#707776]">Project workspace</span></div>
    <div className="mt-10 border-b border-[#2b3030] pb-8"><div className="flex flex-wrap items-start justify-between gap-5"><div><p className="mono mb-3 text-[10px] uppercase tracking-[.22em] text-[#c5e86c]">Project overview</p><h1 className="text-4xl font-semibold tracking-[-.04em]">{project.title}</h1></div><span className="border border-[#38403d] px-3 py-2 mono text-xs text-[#c5e86c]">{project.aspectRatio}</span></div><p className="mt-5 max-w-2xl text-sm leading-7 text-[#969b9a]">{project.premise || 'Add a premise below to give this project a clear creative north star.'}</p></div>
    <WorkspaceNav projectId={projectId} active="overview" />
    <div className="grid gap-10 py-10 lg:grid-cols-[1fr_280px]"><section><div className="mb-7"><h2 className="text-lg font-semibold">Basic metadata</h2><p className="mt-2 text-sm text-[#969b9a]">These settings guide continuity as the project grows.</p></div><ProjectForm project={project} /></section><aside className="h-fit border border-[#2b3030] bg-[#151918] p-5"><p className="mono text-[10px] uppercase tracking-[.18em] text-[#c5e86c]">Next, when ready</p><h2 className="mt-4 text-lg font-semibold">Build the story system.</h2><p className="mt-3 text-sm leading-6 text-[#969b9a]">Characters, world rules, and scenes will live here as the project takes shape.</p><div className="mt-6 border-t border-[#2b3030] pt-4 text-xs leading-5 text-[#707776]">Project data is stored locally on this device.</div></aside></div>
  </div>;
}
