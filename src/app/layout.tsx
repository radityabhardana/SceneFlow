import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = { title: 'SceneFlow', description: 'Local production workspace for consistent AI drama.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <div className="min-h-screen shell-grid">
      <header className="border-b border-[#2b3030] bg-[#0d1110]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center border border-[#c5e86c] text-sm font-bold text-[#c5e86c]">S</span>
            <span className="text-sm font-semibold tracking-[.18em]">SCENEFLOW</span>
          </Link>
          <span className="mono hidden text-[10px] uppercase tracking-[.22em] text-[#969b9a] sm:block">Local production workspace</span>
        </div>
      </header>
      <main>{children}</main>
    </div>
  </body></html>;
}
