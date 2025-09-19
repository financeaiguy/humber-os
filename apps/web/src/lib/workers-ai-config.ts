/**
 * Cloudflare Workers AI Configuration
 * Using 100% open-source models - no closed-source dependencies
 */

export const WORKERS_AI_MODELS = {
  // Primary language model - Llama 4 Scout
  chat: {
    primary: '@cf/meta/llama-4-scout-8b-instruct',
    fallback: '@cf/meta/llama-3-8b-instruct',
    settings: {
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
      frequency_penalty: 0.3,
      presence_penalty: 0.3
    }
  },
  
  // Large-scale analytical model - 120B parameter OSS
  analysis: {
    primary: '@cf/meta/llama-3-70b-instruct',
    fallback: '@cf/mistral/mixtral-8x7b-instruct',
    settings: {
      temperature: 0.3,
      max_tokens: 4096,
      top_p: 0.95,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    }
  },
  
  // Code generation and technical tasks
  code: {
    primary: '@cf/meta/code-llama-34b-instruct',
    fallback: '@cf/deepseek/deepseek-coder-6.7b-instruct',
    settings: {
      temperature: 0.2,
      max_tokens: 2048,
      top_p: 0.9
    }
  },
  
  // Embedding model for vector search
  embeddings: {
    primary: '@cf/baai/bge-base-en-v1.5',
    fallback: '@cf/sentence-transformers/all-MiniLM-L6-v2',
    dimensions: 768
  },
  
  // Document understanding and parsing
  document: {
    primary: '@cf/meta/llama-3-8b-instruct',
    settings: {
      temperature: 0.5,
      max_tokens: 3072
    }
  },
  
  // Summarization tasks
  summarization: {
    primary: '@cf/facebook/bart-large-cnn',
    settings: {
      max_length: 512,
      min_length: 50
    }
  },
  
  // Translation (if needed)
  translation: {
    primary: '@cf/meta/m2m-100-1.2b',
    settings: {
      max_length: 1024
    }
  }
}

export interface WorkersAIRequest {
  model: string
  messages?: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  prompt?: string
  stream?: boolean
  max_tokens?: number
  temperature?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
}

export interface WorkersAIResponse {
  response?: string
  messages?: Array<{
    role: string
    content: string
  }>
  created: number
  model: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class WorkersAIClient {
  private accountId: string
  private apiToken: string
  private baseUrl: string
  
  constructor(accountId: string, apiToken: string) {
    this.accountId = accountId
    this.apiToken = apiToken
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run`
  }
  
  async chat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: Partial<typeof WORKERS_AI_MODELS.chat.settings> = {}
  ): Promise<WorkersAIResponse> {
    const settings = { ...WORKERS_AI_MODELS.chat.settings, ...options }
    
    try {
      const response = await this.runModel(WORKERS_AI_MODELS.chat.primary, {
        messages,
        ...settings
      })
      
      return response
    } catch (error) {
      // SECURITY: console statement removed: console.warn('Primary chat model failed, trying fallback:', error)
      return this.runModel(WORKERS_AI_MODELS.chat.fallback, {
        messages,
        ...settings
      })
    }
  }
  
  async analyze(
    prompt: string,
    context?: string,
    options: Partial<typeof WORKERS_AI_MODELS.analysis.settings> = {}
  ): Promise<WorkersAIResponse> {
    const settings = { ...WORKERS_AI_MODELS.analysis.settings, ...options }
    
    const messages = [
      {
        role: 'system' as const,
        content: 'You are an advanced analytical AI assistant using a 120B parameter open-source model. Provide detailed, accurate analysis.'
      },
      {
        role: 'user' as const,
        content: context ? `Context: ${context}\n\nQuery: ${prompt}` : prompt
      }
    ]
    
    try {
      const response = await this.runModel(WORKERS_AI_MODELS.analysis.primary, {
        messages,
        ...settings
      })
      
      return response
    } catch (error) {
      // SECURITY: console statement removed: console.warn('Primary analysis model failed, trying fallback:', error)
      return this.runModel(WORKERS_AI_MODELS.analysis.fallback, {
        messages,
        ...settings
      })
    }
  }
  
  async generateCode(
    prompt: string,
    language?: string,
    options: Partial<typeof WORKERS_AI_MODELS.code.settings> = {}
  ): Promise<WorkersAIResponse> {
    const settings = { ...WORKERS_AI_MODELS.code.settings, ...options }
    
    const messages = [
      {
        role: 'system' as const,
        content: `You are a code generation assistant. Generate clean, efficient ${language || 'code'} following best practices.`
      },
      {
        role: 'user' as const,
        content: prompt
      }
    ]
    
    try {
      const response = await this.runModel(WORKERS_AI_MODELS.code.primary, {
        messages,
        ...settings
      })
      
      return response
    } catch (error) {
      // SECURITY: console statement removed: console.warn('Primary code model failed, trying fallback:', error)
      return this.runModel(WORKERS_AI_MODELS.code.fallback, {
        messages,
        ...settings
      })
    }
  }
  
  async generateEmbeddings(text: string | string[]): Promise<number[][]> {
    const texts = Array.isArray(text) ? text : [text]
    
    try {
      const response = await fetch(`${this.baseUrl}/${WORKERS_AI_MODELS.embeddings.primary}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: texts })
      })
      
      if (!response.ok) {
        throw new Error(`Embeddings generation failed: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.result.data
    } catch (error) {
      // SECURITY: console statement removed: console.warn('Primary embeddings model failed, trying fallback:', error)
      
      const response = await fetch(`${this.baseUrl}/${WORKERS_AI_MODELS.embeddings.fallback}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: texts })
      })
      
      const data = await response.json()
      return data.result.data
    }
  }
  
  async summarize(text: string, options: Partial<typeof WORKERS_AI_MODELS.summarization.settings> = {}): Promise<string> {
    const settings = { ...WORKERS_AI_MODELS.summarization.settings, ...options }
    
    const response = await fetch(`${this.baseUrl}/${WORKERS_AI_MODELS.summarization.primary}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input_text: text,
        ...settings
      })
    })
    
    if (!response.ok) {
      throw new Error(`Summarization failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.result.summary
  }
  
  private async runModel(model: string, request: Partial<WorkersAIRequest>): Promise<WorkersAIResponse> {
    const response = await fetch(`${this.baseUrl}/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })
    
    if (!response.ok) {
      throw new Error(`Model ${model} failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    return {
      response: data.result.response || data.result.text,
      messages: data.result.messages,
      created: Date.now(),
      model,
      usage: data.result.usage
    }
  }
}

// Export singleton instance
let clientInstance: WorkersAIClient | null = null

export function getWorkersAIClient(): WorkersAIClient {
  if (!clientInstance) {
    const accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID || ''
    const apiToken = process.env.CLOUDFLARE_API_TOKEN || ''
    
    if (!accountId || !apiToken) {
      throw new Error('Cloudflare Workers AI credentials not configured')
    }
    
    clientInstance = new WorkersAIClient(accountId, apiToken)
  }
  
  return clientInstance
}

// Helper function to determine best model for a task
export function selectModelForTask(taskType: 'chat' | 'analysis' | 'code' | 'document' | 'summary'): string {
  switch (taskType) {
    case 'chat':
      return WORKERS_AI_MODELS.chat.primary
    case 'analysis':
      return WORKERS_AI_MODELS.analysis.primary
    case 'code':
      return WORKERS_AI_MODELS.code.primary
    case 'document':
      return WORKERS_AI_MODELS.document.primary
    case 'summary':
      return WORKERS_AI_MODELS.summarization.primary
    default:
      return WORKERS_AI_MODELS.chat.primary
  }
}

// Model capabilities mapping
export const MODEL_CAPABILITIES = {
  'llama-4-scout': {
    maxTokens: 8192,
    contextWindow: 32768,
    strengths: ['conversation', 'reasoning', 'instruction-following'],
    languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko']
  },
  'llama-3-70b': {
    maxTokens: 4096,
    contextWindow: 8192,
    strengths: ['analysis', 'complex-reasoning', 'long-form-generation'],
    languages: ['en', 'es', 'fr', 'de', 'it', 'pt']
  },
  'code-llama-34b': {
    maxTokens: 4096,
    contextWindow: 16384,
    strengths: ['code-generation', 'debugging', 'code-explanation'],
    languages: ['python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust']
  },
  'mixtral-8x7b': {
    maxTokens: 4096,
    contextWindow: 32768,
    strengths: ['instruction-following', 'multi-task', 'reasoning'],
    languages: ['en', 'es', 'fr', 'de', 'it']
  }
}

export default WorkersAIClient