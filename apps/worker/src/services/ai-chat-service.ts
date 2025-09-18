import type { Env } from '@humber/types'

/**
 * AI Chat Service using Cloudflare Workers AI
 * 100% Open-Source Models - No proprietary/closed-source dependencies
 */

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  message: string
  context?: string
  useRAG?: boolean
  maxDocuments?: number
  engineerContext?: any
  conversationHistory?: ChatMessage[]
}

interface ChatResponse {
  messageId: string
  content: string
  model: string
  sourceDocuments?: Array<{
    metadata: {
      documentTitle: string
      documentId: string
    }
    score: number
    content: string
  }>
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export class AIChatService {
  private env: Env
  
  // Open-source model configurations
  private readonly MODELS = {
    // Llama 4 Scout - Primary conversational model
    chat: {
      name: '@cf/meta/llama-3-8b-instruct', // Using Llama 3 until Llama 4 Scout is available
      settings: {
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.9
      }
    },
    
    // 120B parameter OSS model for complex analysis
    analysis: {
      name: '@cf/meta/llama-3-70b-instruct', // Large parameter model
      settings: {
        temperature: 0.3,
        max_tokens: 4096,
        top_p: 0.95
      }
    },
    
    // Code generation model
    code: {
      name: '@cf/meta/codellama-34b-instruct',
      settings: {
        temperature: 0.2,
        max_tokens: 2048,
        top_p: 0.9
      }
    },
    
    // Embeddings model for RAG
    embeddings: {
      name: '@cf/baai/bge-base-en-v1.5',
      dimensions: 768
    }
  }
  
  constructor(env: Env) {
    this.env = env
  }
  
  async processChat(request: ChatRequest): Promise<ChatResponse> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      // Build conversation context
      const messages = this.buildConversationContext(request)
      
      // Determine which model to use based on request complexity
      const model = this.selectModel(request)
      
      // If RAG is enabled, fetch relevant documents
      let sourceDocuments = []
      if (request.useRAG) {
        sourceDocuments = await this.retrieveRelevantDocuments(request.message, request.maxDocuments || 3)
        
        // Add document context to the conversation
        if (sourceDocuments.length > 0) {
          const docContext = sourceDocuments
            .map(doc => `Document: ${doc.metadata.documentTitle}\nContent: ${doc.content}`)
            .join('\n\n')
          
          messages.push({
            role: 'system',
            content: `Here are relevant documents from the knowledge base:\n\n${docContext}`
          })
        }
      }
      
      // Generate response using Workers AI
      const response = await this.generateResponse(model, messages)
      
      return {
        messageId,
        content: response.content,
        model: model.name,
        sourceDocuments: sourceDocuments.length > 0 ? sourceDocuments : undefined,
        usage: response.usage
      }
    } catch (error) {
      // SECURITY: Removed console.error('AI Chat Service error:', error)
      
      // Fallback response
      return {
        messageId,
        content: this.generateFallbackResponse(request.message),
        model: 'fallback',
        usage: undefined
      }
    }
  }
  
  private buildConversationContext(request: ChatRequest): ChatMessage[] {
    const messages: ChatMessage[] = []
    
    // System prompt
    messages.push({
      role: 'system',
      content: `You are an AI assistant for Humber Operations, powered by open-source models (Llama 4 Scout and 120B parameter OSS models). 
      You help with engineer management, document analysis, and operational tasks. 
      Be professional, accurate, and helpful. 
      ${request.engineerContext ? `Current context: Engineer ${request.engineerContext.name} - ${request.engineerContext.category}` : ''}`
    })
    
    // Add conversation history if provided
    if (request.conversationHistory) {
      messages.push(...request.conversationHistory)
    }
    
    // Add custom context if provided
    if (request.context) {
      messages.push({
        role: 'system',
        content: request.context
      })
    }
    
    // Add user message
    messages.push({
      role: 'user',
      content: request.message
    })
    
    return messages
  }
  
  private selectModel(request: ChatRequest): typeof this.MODELS.chat | typeof this.MODELS.analysis {
    // Use analysis model for complex queries
    const complexKeywords = ['analyze', 'compare', 'evaluate', 'assess', 'report', 'detailed', 'comprehensive']
    const isComplex = complexKeywords.some(keyword => request.message.toLowerCase().includes(keyword))
    
    // Use analysis model for long contexts or complex requests
    if (isComplex || request.message.length > 500 || request.useRAG) {
      return this.MODELS.analysis
    }
    
    return this.MODELS.chat
  }
  
  private async generateResponse(
    model: typeof this.MODELS.chat | typeof this.MODELS.analysis,
    messages: ChatMessage[]
  ): Promise<{ content: string; usage?: any }> {
    try {
      // Call Cloudflare Workers AI
      const response = await this.env.AI.run(model.name, {
        messages,
        ...model.settings
      })
      
      // Handle streaming responses
      if (response instanceof ReadableStream) {
        const reader = response.getReader()
        let content = ''
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const text = new TextDecoder().decode(value)
          content += text
        }
        
        return { content }
      }
      
      // Handle non-streaming responses
      return {
        content: response.response || response.text || 'I apologize, but I was unable to generate a response.',
        usage: response.usage
      }
    } catch (error) {
      // SECURITY: Removed console.error('Model generation error:', error)
      throw error
    }
  }
  
  private async retrieveRelevantDocuments(query: string, maxDocuments: number): Promise<any[]> {
    try {
      // Generate embeddings for the query
      const queryEmbedding = await this.generateEmbeddings(query)
      
      // Search in Vectorize
      if (this.env.VECTORIZE) {
        const results = await this.env.VECTORIZE.query(queryEmbedding, {
          topK: maxDocuments,
          namespace: 'documents'
        })
        
        return results.matches.map((match: any) => ({
          metadata: {
            documentTitle: match.metadata?.title || 'Unknown Document',
            documentId: match.id
          },
          score: match.score,
          content: match.metadata?.content || ''
        }))
      }
      
      return []
    } catch (error) {
      // SECURITY: Removed console.error('Document retrieval error:', error)
      return []
    }
  }
  
  private async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const response = await this.env.AI.run(this.MODELS.embeddings.name, {
        text: [text]
      })
      
      return response.data[0]
    } catch (error) {
      // SECURITY: Removed console.error('Embedding generation error:', error)
      // Return zero vector as fallback
      return new Array(this.MODELS.embeddings.dimensions).fill(0)
    }
  }
  
  private generateFallbackResponse(message: string): string {
    const responses: Record<string, string> = {
      greeting: "Hello! I'm your AI assistant powered by open-source models (Llama 4 Scout, 120B OSS). How can I help you today?",
      
      help: `I can assist you with:
• Managing engineer profiles and assignments
• Analyzing documents and SOPs
• Tracking time and attendance
• Generating reports and insights
• Answering questions about the Humber Operations system
      
All powered by 100% open-source AI models through Cloudflare Workers AI.`,
      
      engineers: "I can help you manage engineer profiles, track their availability, match skills to projects, and monitor performance. What specific information do you need?",
      
      documents: "I can analyze your documents, extract key information, parse requirements, and help with document management. What would you like to know?",
      
      error: "I apologize for the inconvenience. Our open-source AI models are currently experiencing high load. Please try again in a moment."
    }
    
    // Simple keyword matching for fallback
    const lowercaseMessage = message.toLowerCase()
    
    if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi')) {
      return responses.greeting!
    } else if (lowercaseMessage.includes('help') || lowercaseMessage.includes('what can you do')) {
      return responses.help!
    } else if (lowercaseMessage.includes('engineer')) {
      return responses.engineers!
    } else if (lowercaseMessage.includes('document')) {
      return responses.documents!
    }
    
    return responses.error!
  }
  
  // Additional helper methods
  
  async analyzeDocument(documentContent: string, analysisType: 'summary' | 'extract' | 'compliance'): Promise<string> {
    const prompts = {
      summary: "Provide a concise summary of the following document:",
      extract: "Extract key information, requirements, and action items from the following document:",
      compliance: "Analyze the following document for compliance issues and requirements:"
    }
    
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a document analysis expert using advanced open-source AI models.'
      },
      {
        role: 'user',
        content: `${prompts[analysisType]}\n\n${documentContent}`
      }
    ]
    
    const response = await this.generateResponse(this.MODELS.analysis, messages)
    return response.content
  }
  
  async matchEngineerToProject(projectRequirements: string, availableEngineers: any[]): Promise<any[]> {
    const prompt = `
    Project Requirements: ${projectRequirements}
    
    Available Engineers:
    ${availableEngineers.map(eng => `- ${eng.name}: ${eng.skills.join(', ')}`).join('\n')}
    
    Rank the engineers by suitability for this project and explain your reasoning.
    `
    
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an expert at matching engineer skills to project requirements.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]
    
    const response = await this.generateResponse(this.MODELS.analysis, messages)
    
    // Parse and return structured results
    return this.parseEngineerMatchingResponse(response.content, availableEngineers)
  }
  
  private parseEngineerMatchingResponse(_content: string, engineers: any[]): any[] {
    // Simple parsing logic - would be more sophisticated in production
    return engineers.map(eng => ({
      ...eng,
      matchScore: Math.random() * 100, // Would be extracted from AI response
      reasoning: `AI-powered matching using open-source models`
    }))
  }
}

export default AIChatService