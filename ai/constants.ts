export enum Models {
  Gemini36Flash = 'google/gemini-3.6-flash',
  Gemini36 = 'google/gemini-3.6',
  Gemini35Flash = 'google/gemini-3.5-flash',
  AnthropicClaudeOpus46 = 'anthropic/claude-opus-4.6',
  AnthropicClaudeSonnet46 = 'anthropic/claude-sonnet-4.6',
  OpenAIGPT53Codex = 'openai/gpt-5.3-codex',
  XaiGrok41Reasoning = 'xai/grok-4.1-fast-reasoning',
}

export const DEFAULT_MODEL = Models.Gemini36Flash

export const SUPPORTED_MODELS: string[] = [
  Models.Gemini36Flash,
  Models.Gemini36,
  Models.Gemini35Flash,
  Models.AnthropicClaudeOpus46,
  Models.AnthropicClaudeSonnet46,
  Models.OpenAIGPT53Codex,
  Models.XaiGrok41Reasoning,
]

export const MODEL_NAMES: Record<string, string> = {
  [Models.Gemini36Flash]: 'Gemini 3.6 Flash',
  [Models.Gemini36]: 'Gemini 3.6',
  [Models.Gemini35Flash]: 'Gemini 3.5 Flash',
  [Models.AnthropicClaudeOpus46]: 'Claude Opus 4.6',
  [Models.AnthropicClaudeSonnet46]: 'Claude Sonnet 4.6',
  [Models.OpenAIGPT53Codex]: 'GPT-5.3 Codex',
  [Models.XaiGrok41Reasoning]: 'Grok 4.1 Reasoning',
}

export const TEST_PROMPTS = [
  'Generate a Next.js app that allows to list and search Pokemons',
  'Create a `golang` server that responds with "Hello World" to any request',
]
