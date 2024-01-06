type LlmConfig = {
  modelInstructions: string
  api: string
}

/*
|--------------------------------------------------------------------------
| Large Language Model Configuration
|--------------------------------------------------------------------------
*/
const llm: LlmConfig = {
  modelInstructions: 'chatml',
  api: 'kobold',
}
