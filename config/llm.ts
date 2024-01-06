type LlmConfig = {
  modelInstructions: string
  api: string
}

/*
|--------------------------------------------------------------------------
| Large Language Model Configuration
|--------------------------------------------------------------------------
*/
export const llm: LlmConfig = {
  modelInstructions: 'chatml',
  api: 'kobold',
}
