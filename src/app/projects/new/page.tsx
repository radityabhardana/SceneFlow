import Link from 'next/link';
import { ProjectForm } from '../../../components/ProjectForm';

export default function NewProjectPage() { return <div className="mx-auto max-w-3xl px-5 py-12 lg:px-8 lg:py-16"><Link href="/" className="mono text-[10px] uppercase tracking-[.18em] text-[#969b9a] hover:text-[#c5e86c]">← All projects</Link><div className="mt-10 mb-10"><p className="mono mb-4 text-[10px] uppercase tracking-[.22em] text-[#c5e86c]">New project</p><h1 className="text-4xl font-semibold tracking-[-.04em]">Set the direction.</h1><p className="mt-4 text-sm leading-6 text-[#969b9a]">Start with the metadata that keeps every future scene aligned.</p></div><ProjectForm /></div>; }
