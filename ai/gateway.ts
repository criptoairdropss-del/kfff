import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createGatewayProvider } from '@ai-sdk/gateway'
import { Models } from './constants'
import type { JSONValue } from 'ai'
import type { OpenAIResponsesProviderOptions } from '@ai-sdk/openai'
import type { LanguageModelV3 } from '@ai-sdk/provider'

async function fetchWithRateLimitRetry(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const maxAttempts = 5
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetch(input, init)
    if (response.status === 429 && attempt < maxAttempts) {
      let delayMs = 7000
      try {
        const cloned = response.clone()
        const json = (await cloned.json()) as {
          error?: { details?: Array<{ retryDelay?: string }> }
        }
        const retryDelayStr = json?.error?.details?.find(
          (d) => d?.retryDelay
        )?.retryDelay
        if (retryDelayStr) {
          const seconds = parseFloat(retryDelayStr.replace('s', ''))
          if (!isNaN(seconds) && seconds > 0) {
            delayMs = Math.ceil(seconds * 1000) + 1000
          }
        }
      } catch {
        delayMs = attempt * 5000
      }
      console.warn(
        `[Google AI Studio] Rate limited (429). Retrying in ${delayMs / 1000}s (attempt ${attempt}/${maxAttempts})...`
      )
      await new Promise((r) => setTimeout(r, delayMs))
      continue
    }
    return response
  }
  return fetch(input, init)
}

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
  fetch: fetchWithRateLimitRetry,
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
