import Link from 'next/link';
import { getAiGatewayConfig } from '@/lib/ai/server';
import { AiGatewayPanel } from '@/components/AiGatewayPanel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function AiSettingsPage() {
  let config: { baseUrl: string; model: string } | undefined;
  let configurationError: string | undefined;
  try {
    const runtimeConfig = getAiGatewayConfig();
    config = { baseUrl: runtimeConfig.baseUrl, model: runtimeConfig.model };
  } catch {
    configurationError = 'AI gateway configuration is missing or invalid. Check the local environment before testing.';
  }

  return <main className="mx-auto max-w-3xl px-5 py-10 lg:px-8 lg:py-14"><Link href="/" className="mono text-[10px] uppercase tracking-[.18em] text-[#969b9a] hover:text-[#c5e86c]">← Dashboard</Link><div className="mt-10 mb-10"><p className="mono mb-4 text-[10px] uppercase tracking-[.22em] text-[#c5e86c]">Settings / AI</p><h1 className="text-4xl font-semibold tracking-[-.04em]">Gateway status.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-[#969b9a]">Check the local AI gateway before using it in your production workflow.</p></div><AiGatewayPanel config={config} configurationError={configurationError} /></main>;
}
