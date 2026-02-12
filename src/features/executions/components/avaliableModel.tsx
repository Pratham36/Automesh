export const AVAILABLE_OPENAI = [
  // OpenAI
  "chatgpt-4o-latest",
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-5",
  "gpt-5-mini",
] as const;

export const AVAILABLE_ANTHROPIC = [
  // Anthropic Claude
  "claude-3-5-haiku-latest",
  "claude-3-7-sonnet-latest",
  "claude-opus-4-1",
  "claude-sonnet-4-5",
] as const;

export const AVAILABLE_GEMINI = [
  // Google Gemini
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-flash-latest",
  "gemini-pro-latest",
  "gemini-1.5-pro-latest",
] as const;

export const AVAILABLE_GROQ = [
  // Groq
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
  "deepseek-r1-distill-llama-70b",
  "deepseek-r1-distill-qwen-32b",
  "qwen-2.5-32b",
  "moonshotai/kimi-k2-instruct-0905",
] as const;
