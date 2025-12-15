import {
  LLM_PROVIDER,
  AZURE_MODELS,
  OPENAI_MODELS,
  OPENROUTER_MODELS,
  ANTHROPIC_MODELS,
  GEMINI_MODELS,
} from '@/services/Constants';

export function getModelForTask(task) {
  switch (LLM_PROVIDER) {
    case 'azure':
      return { vendor: 'azure', model: AZURE_MODELS[task] };
    case 'openai':
      return { vendor: 'openai', model: OPENAI_MODELS[task] };
    case 'openrouter':
      return { vendor: 'openrouter', model: OPENROUTER_MODELS[task] };
    case 'anthropic':
      return { vendor: 'anthropic', model: ANTHROPIC_MODELS[task] };
    case 'google':
      return { vendor: 'google', model: GEMINI_MODELS[task] };
    default:
      return { vendor: 'openrouter', model: OPENROUTER_MODELS[task] };
  }
}
