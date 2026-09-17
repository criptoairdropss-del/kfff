import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createGatewayProvider } from '@ai-sdk/gateway'
import { Models } from './constants'
import type { JSONValue } from 'ai'
import type { OpenAIResponsesProviderOptions } from '@ai-sdk/openai'
import type { LanguageModelV3 } from '@ai-sdk/provider'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
})

const gateway = createGatewayProvider({
  baseURL: process.env.AI_GATEWAY_BASE_URL,
  headers: {
    'http-referer': 'https://oss-vibe-coding-platform.vercel.app/',
    'x-title': 'Vibe Coding Platform',
  },
})

export interface ModelOptions {
  model: LanguageModelV3
  providerOptions?: Record<string, Record<string, JSONValue>>
  headers?: Record<string, string>
}

export function getModelOptions(
  modelId: string,
  options?: { reasoningEffort?: 'low' | 'medium' | 'high' }
): ModelOptions {
  if (
    modelId === Models.Gemini36Flash ||
    modelId === Models.Gemini36 ||
    modelId === Models.Gemini35Flash ||
    modelId.startsWith('google/')
  ) {
    let rawGoogleModelId = modelId.replace(/^google\//, '')
    if (rawGoogleModelId === 'gemini-3.6') {
      rawGoogleModelId = 'gemini-3.6-flash'
    }
    return {
      model: google(rawGoogleModelId),
      providerOptions: {
        google: {
          thinkingConfig: {
            includeThoughts: true,
            ...(options?.reasoningEffort
              ? { thinkingLevel: options.reasoningEffort }
              : {}),
          },
        },
      },
    }
  }

  if (modelId === Models.OpenAIGPT53Codex) {
    return {
      model: gateway(modelId),
      providerOptions: {
        openai: {
          include: ['reasoning.encrypted_content'],
          reasoningEffort: options?.reasoningEffort ?? 'low',
          reasoningSummary: 'auto',
          serviceTier: 'priority',
        } satisfies OpenAIResponsesProviderOptions,
      },
    }
  }

  if (
    modelId === Models.AnthropicClaudeSonnet46 ||
    modelId === Models.AnthropicClaudeOpus46
  ) {
    return {
      model: gateway(modelId),
      headers: { 'anthropic-beta': 'fine-grained-tool-streaming-2025-05-14' },
      providerOptions: {
        anthropic: {
          cacheControl: { type: 'ephemeral' },
        },
      },
    }
  }

  return {
    model: gateway(modelId),
  }
}
