'use client';

import { useActionState } from 'react';
import { aiGatewayAction, type AiActionState } from '@/app/settings/ai/actions';

type SafeConfig = { baseUrl: string; model: string };
const idle: AiActionState = { status: 'idle', reachable: false, configuredModel: '', modelAvailable: false, modelIds: [] };

export function AiGatewayPanel({ config, configurationError }: { config?: SafeConfig; configurationError?: string }) {
  const [state, action, pending] = useActionState(aiGatewayAction, idle);
  const hasCheck = state.status !== 'idle';
  const model = state.configuredModel || config?.model || 'Not available';

  return <div className="space-y-5">
    <section className="border border-[#2b3030] bg-[#151918] p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><p className="mono text-[10px] uppercase tracking-[.18em] text-[#c5e86c]">Runtime configuration</p><h2 className="mt-3 text-lg font-semibold">Gateway connection</h2></div><span className="mono text-[10px] uppercase tracking-[.14em] text-[#707776]">{hasCheck ? (state.reachable ? 'Reachable' : 'Unavailable') : 'Not checked'}</span></div>
      {configurationError ? <p role="alert" className="mt-5 border border-[#805047] bg-[#2b1b19] px-4 py-3 text-sm leading-6 text-[#f09a8b]">{configurationError}</p> : <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2"><div><dt className="mono text-[10px] uppercase tracking-[.14em] text-[#707776]">Canonical URL</dt><dd className="mt-2 break-all text-[#e8e8e3]">{config?.baseUrl}</dd></div><div><dt className="mono text-[10px] uppercase tracking-[.14em] text-[#707776]">Configured model</dt><dd className="mt-2 break-all text-[#e8e8e3]">{model}</dd></div></dl>}
      {state.error && <p role="alert" className="mt-5 border border-[#805047] bg-[#2b1b19] px-4 py-3 text-sm leading-6 text-[#f09a8b]">{state.error}</p>}
      <div className="mt-6 flex flex-wrap gap-3"><form action={action}><input type="hidden" name="intent" value="check" /><button disabled={pending || Boolean(configurationError)} className="border border-[#c5e86c] px-4 py-2.5 text-sm font-semibold text-[#c5e86c] hover:bg-[#c5e86c] hover:text-[#0d1110] disabled:cursor-wait disabled:opacity-50">{pending ? 'Checking…' : 'Check connection'}</button></form><form action={action}><input type="hidden" name="intent" value="test" /><button disabled={pending || Boolean(configurationError)} className="bg-[#c5e86c] px-4 py-2.5 text-sm font-bold text-[#0d1110] hover:bg-[#d8f48e] disabled:cursor-wait disabled:opacity-50">{pending ? 'Testing…' : 'Test AI'}</button></form></div>
    </section>
    {hasCheck && <section className="border border-[#2b3030] p-5 sm:p-6"><div className="flex items-center justify-between gap-4"><h2 className="text-lg font-semibold">Model availability</h2><span className={`mono text-[10px] uppercase tracking-[.14em] ${state.modelAvailable ? 'text-[#c5e86c]' : 'text-[#f09a8b]'}`}>{state.modelAvailable ? 'Available' : 'Unavailable'}</span></div><p className="mt-3 text-sm leading-6 text-[#969b9a]">Configured model: <span className="text-[#e8e8e3]">{model}</span></p>{state.modelIds.length > 0 && <p className="mt-3 text-xs leading-5 text-[#707776]">Gateway models: {state.modelIds.join(', ')}</p>}{state.response && <div className="mt-5 border-t border-[#2b3030] pt-5"><p className="mono text-[10px] uppercase tracking-[.14em] text-[#c5e86c]">Test response</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#e8e8e3]">{state.response}</p></div>}</section>}
    <p className="text-xs leading-5 text-[#707776]">Configuration comes from the local environment. Secrets are never displayed or edited here.</p>
  </div>;
}
