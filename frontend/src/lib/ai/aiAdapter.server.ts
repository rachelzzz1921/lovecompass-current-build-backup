import { generateText, streamText, type CoreMessage } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export type AIAdapterGenerateInput = {
  prompt: string;
  system?: string;
  messages?: CoreMessage[];
};

export type AIAdapterGenerateOutput = {
  text: string;
  provider: string;
  model: string;
  degraded: boolean;
};

const DEFAULT_ZHIPU_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4';
const DEFAULT_ZHIPU_MODEL = 'glm-4-flash';

function getAIConfig() {
  return {
    provider: process.env.AI_PROVIDER || 'zhipu',
    apiKey: process.env.ZHIPU_API_KEY || '',
    baseURL: process.env.ZHIPU_BASE_URL || DEFAULT_ZHIPU_BASE_URL,
    model: process.env.ZHIPU_MODEL || DEFAULT_ZHIPU_MODEL,
  };
}

function createZhipuProvider() {
  const config = getAIConfig();

  return createOpenAICompatible({
    name: 'zhipu',
    baseURL: config.baseURL,
    apiKey: config.apiKey,
  });
}

/**
 * Server-only AI adapter inspired by Vercel AI SDK provider abstraction.
 *
 * SECURITY: This file must only be imported by server routes/functions. Do not
 * import it from client components or browser code because it reads provider API
 * keys from process.env.
 */
export class AIAdapter {
  async generate(input: string | AIAdapterGenerateInput): Promise<AIAdapterGenerateOutput> {
    const config = getAIConfig();
    const prompt = typeof input === 'string' ? input : input.prompt;
    const system = typeof input === 'string' ? undefined : input.system;
    const messages = typeof input === 'string' ? undefined : input.messages;

    if (!config.apiKey) {
      return {
        text: 'AI provider key is not configured yet. This is a safe local placeholder response.',
        provider: config.provider,
        model: config.model,
        degraded: true,
      };
    }

    if (config.provider !== 'zhipu') {
      throw new Error(`Unsupported AI_PROVIDER: ${config.provider}`);
    }

    const zhipu = createZhipuProvider();
    const result = await generateText({
      model: zhipu(config.model),
      system,
      prompt: messages ? undefined : prompt,
      messages,
    });

    return {
      text: result.text,
      provider: config.provider,
      model: config.model,
      degraded: false,
    };
  }

  stream(input: string | AIAdapterGenerateInput) {
    const config = getAIConfig();
    if (!config.apiKey) {
      throw new Error('ZHIPU_API_KEY is required for streaming responses.');
    }
    if (config.provider !== 'zhipu') {
      throw new Error(`Unsupported AI_PROVIDER: ${config.provider}`);
    }

    const prompt = typeof input === 'string' ? input : input.prompt;
    const system = typeof input === 'string' ? undefined : input.system;
    const messages = typeof input === 'string' ? undefined : input.messages;
    const zhipu = createZhipuProvider();

    return streamText({
      model: zhipu(config.model),
      system,
      prompt: messages ? undefined : prompt,
      messages,
    });
  }
}

export const aiAdapter = new AIAdapter();
