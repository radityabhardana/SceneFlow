'use server';

import { checkAiGateway, generateText } from '@/lib/ai';

export type AiActionState = {
  status: 'idle' | 'checked' | 'tested';
  reachable: boolean;
  configuredModel: string;
  modelAvailable: boolean;
  modelIds: string[];
  error?: string;
  response?: string;
};

const idleState: AiActionState = {
  status: 'idle',
  reachable: false,
  configuredModel: '',
  modelAvailable: false,
  modelIds: [],
};

const modelMismatch = 'Configured AI_GATEWAY_MODEL must exactly match a model returned by the gateway /models endpoint.';

async function safeCheck() {
  try {
    return await checkAiGateway();
  } catch {
    return {
      reachable: false,
      configuredModel: '',
      modelAvailable: false,
      error: { code: 'AI_GATEWAY_CONFIGURATION_ERROR' as const, message: 'The AI gateway configuration could not be checked safely.' },
    };
  }
}

function checkedState(result: Awaited<ReturnType<typeof checkAiGateway>>, status: AiActionState['status'] = 'checked'): AiActionState {
  return {
    status,
    reachable: result.reachable,
    configuredModel: result.configuredModel,
    modelAvailable: result.modelAvailable,
    modelIds: result.modelIds ?? [],
    error: result.error?.code === 'AI_MODEL_NOT_AVAILABLE' ? modelMismatch : result.error?.message,
  };
}

export async function aiGatewayAction(_previous: AiActionState = idleState, formData: FormData): Promise<AiActionState> {
  const result = await safeCheck();
  if (formData.get('intent') !== 'test') return checkedState(result);
  if (!result.reachable || !result.modelAvailable) return checkedState(result, 'tested');

  try {
    const generation = await generateText([{ role: 'user', content: 'Respond with exactly SCENEFLOW_AI_OK.' }], { maxTokens: 8 });
    if (generation.text.trim() !== 'SCENEFLOW_AI_OK') return { ...checkedState(result, 'tested'), error: 'The AI gateway returned an unexpected test response.' };
    return { ...checkedState(result, 'tested'), response: 'SCENEFLOW_AI_OK', error: undefined };
  } catch {
    return { ...checkedState(result, 'tested'), error: 'The gateway is reachable, but the test response could not be completed.' };
  }
}
