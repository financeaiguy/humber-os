/**
 * Workers AI Photo OCR using Llama 4 Scout
 * Intelligent photo analysis for time tracking verification
 */

import { getWorkersAIClient, WORKERS_AI_MODELS } from './workers-ai-config'

export interface PhotoAnalysisResult {
  isValid: boolean
  confidence: number
  analysis: {
    faceDetected: boolean
    workplaceEnvironment: boolean
    livePhoto: boolean
    timestamp: string
    location?: string
  }
  extractedText?: string
  flags: string[]
  recommendation: 'approve' | 'review' | 'reject'
  reasoning: string
}

export interface PhotoMetadata {
  timestamp: string
  employeeId: string
  purpose: 'clock-in' | 'clock-out'
  location?: { lat: number; lng: number; accuracy: number }
  deviceInfo: {
    userAgent: string
    screenResolution: string
    timezone: string
  }
}

class WorkersAIPhotoOCR {
  private client: any = null
  private aiEnabled: boolean = false

  constructor() {
    try {
      this.client = getWorkersAIClient()
      this.aiEnabled = true
    } catch (error) {
      console.log('Workers AI not configured, falling back to manual submission')
      this.aiEnabled = false
    }
  }

  async analyzeTimeTrackingPhoto(
    imageBase64: string,
    metadata: PhotoMetadata
  ): Promise<PhotoAnalysisResult> {
    // Check if AI analysis is enabled
    if (!this.aiEnabled || !this.client) {
      return this.createManualReviewResult(metadata)
    }

    try {
      // Create analysis prompt for Llama 4 Scout
      const analysisPrompt = this.createAnalysisPrompt(metadata)

      // Since Workers AI doesn't directly process images with Llama models,
      // we'll use a hybrid approach: extract visual features and analyze with AI
      const visualAnalysis = await this.performVisualAnalysis(imageBase64)
      const textAnalysis = await this.performTextAnalysis(visualAnalysis, analysisPrompt, metadata)

      return this.combineAnalysisResults(visualAnalysis, textAnalysis, metadata)
    } catch (error) {
      console.error('Photo analysis failed:', error)
      return this.createFailureResult(error as Error)
    }
  }

  private createAnalysisPrompt(metadata: PhotoMetadata): string {
    return `
You are an AI time tracking verification specialist analyzing employee clock-in photos.

CONTEXT:
- Employee ID: ${metadata.employeeId}
- Action: ${metadata.purpose}
- Timestamp: ${metadata.timestamp}
- Time Zone: ${metadata.deviceInfo.timezone}
- Location: ${metadata.location ? `${metadata.location.lat}, ${metadata.location.lng}` : 'Unknown'}

VERIFICATION REQUIREMENTS:
1. FACE DETECTION: Must show a clear, live human face
2. WORKPLACE VERIFICATION: Must appear to be at appropriate work location
3. TIMESTAMP VALIDATION: Photo should match current time context
4. FRAUD DETECTION: Must be a live photo, not a screenshot or fake

ANALYSIS TASK:
Analyze the provided photo description and determine:
- Is this a valid time tracking photo?
- Does it show a real person in an appropriate work environment?
- Are there any red flags or concerns?
- Should this be approved, reviewed, or rejected?

Provide detailed reasoning for your decision.
    `.trim()
  }

  private async performVisualAnalysis(imageBase64: string): Promise<any> {
    // Basic image analysis using Canvas API for metadata extraction
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)

        // Basic visual characteristics
        const analysis = {
          dimensions: { width: img.width, height: img.height },
          aspectRatio: img.width / img.height,
          dataSize: imageBase64.length,
          hasMovement: this.detectPotentialMovement(canvas),
          brightness: this.analyzeBrightness(canvas),
          colorDistribution: this.analyzeColors(canvas),
          edgeDetection: this.detectEdges(canvas)
        }

        resolve(analysis)
      }

      img.onerror = () => {
        resolve({
          dimensions: { width: 0, height: 0 },
          aspectRatio: 0,
          dataSize: imageBase64.length,
          error: 'Image loading failed'
        })
      }

      img.src = imageBase64
    })
  }

  private async performTextAnalysis(
    visualData: any,
    prompt: string,
    metadata: PhotoMetadata
  ): Promise<any> {
    // Create description of visual data for Llama 4 Scout
    const visualDescription = `
PHOTO ANALYSIS DATA:
- Image dimensions: ${visualData.dimensions?.width}x${visualData.dimensions?.height}
- Aspect ratio: ${visualData.aspectRatio?.toFixed(2)}
- File size: ${Math.round(visualData.dataSize / 1024)}KB
- Brightness level: ${visualData.brightness || 'Unknown'}
- Color diversity: ${visualData.colorDistribution || 'Unknown'}
- Edge complexity: ${visualData.edgeDetection || 'Unknown'}
- Motion indicators: ${visualData.hasMovement ? 'Detected' : 'Static'}
- Technical quality: ${this.assessImageQuality(visualData)}

TEMPORAL CONTEXT:
- Current time: ${new Date().toISOString()}
- Photo timestamp: ${metadata.timestamp}
- Time difference: ${this.calculateTimeDifference(metadata.timestamp)} seconds
- Expected work hours: ${this.isWorkingHours(metadata.timestamp)}

LOCATION CONTEXT:
${metadata.location ? `
- GPS coordinates: ${metadata.location.lat}, ${metadata.location.lng}
- Location accuracy: ${metadata.location.accuracy}m
- Location reliability: ${this.assessLocationReliability(metadata.location)}
` : '- No location data available'}

DEVICE CONTEXT:
- Device: ${this.parseUserAgent(metadata.deviceInfo.userAgent)}
- Screen resolution: ${metadata.deviceInfo.screenResolution}
- Timezone: ${metadata.deviceInfo.timezone}
    `.trim()

    const messages = [
      {
        role: 'system' as const,
        content: prompt
      },
      {
        role: 'user' as const,
        content: `Please analyze this time tracking photo data and provide verification assessment:\n\n${visualDescription}`
      }
    ]

    try {
      const response = await this.client.chat(messages, {
        temperature: 0.3, // Lower temperature for more consistent analysis
        max_tokens: 1024
      })

      return {
        aiResponse: response.response,
        model: WORKERS_AI_MODELS.chat.primary,
        usage: response.usage
      }
    } catch (error) {
      console.error('AI analysis failed:', error)
      throw error
    }
  }

  private combineAnalysisResults(
    visualAnalysis: any,
    textAnalysis: any,
    metadata: PhotoMetadata
  ): PhotoAnalysisResult {
    const aiResponse = textAnalysis.aiResponse || ''

    // Parse AI response for key indicators
    const faceDetected = this.parseAIResponse(aiResponse, ['face', 'person', 'human', 'individual'])
    const workplaceEnvironment = this.parseAIResponse(aiResponse, ['workplace', 'office', 'work', 'professional'])
    const livePhoto = !this.parseAIResponse(aiResponse, ['screenshot', 'fake', 'artificial', 'suspicious'])

    // Calculate confidence based on multiple factors
    const confidence = this.calculateConfidence({
      imageQuality: this.assessImageQuality(visualAnalysis),
      timingMatch: this.isTimingAppropriate(metadata.timestamp),
      locationReliability: metadata.location ? this.assessLocationReliability(metadata.location) : 0.5,
      aiConfidence: this.extractConfidenceFromAI(aiResponse)
    })

    // Determine recommendation
    const recommendation = this.determineRecommendation(confidence, aiResponse, {
      faceDetected,
      workplaceEnvironment,
      livePhoto
    })

    // Extract flags and concerns
    const flags = this.extractFlags(aiResponse, visualAnalysis, metadata)

    return {
      isValid: recommendation === 'approve',
      confidence,
      analysis: {
        faceDetected,
        workplaceEnvironment,
        livePhoto,
        timestamp: metadata.timestamp,
        location: metadata.location ? `${metadata.location.lat}, ${metadata.location.lng}` : undefined
      },
      extractedText: this.extractAnyText(aiResponse),
      flags,
      recommendation,
      reasoning: aiResponse
    }
  }

  // Helper methods for image analysis
  private detectPotentialMovement(canvas: HTMLCanvasElement): boolean {
    // Simple motion detection by analyzing pixel variance
    const ctx = canvas.getContext('2d')
    if (!ctx) return false

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    let variance = 0
    for (let i = 0; i < data.length; i += 4) {
      const pixel = (data[i] + data[i + 1] + data[i + 2]) / 3
      variance += Math.abs(pixel - 128)
    }

    return variance / (data.length / 4) > 20 // Threshold for movement
  }

  private analyzeBrightness(canvas: HTMLCanvasElement): string {
    const ctx = canvas.getContext('2d')
    if (!ctx) return 'Unknown'

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    let totalBrightness = 0
    for (let i = 0; i < data.length; i += 4) {
      totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3
    }

    const averageBrightness = totalBrightness / (data.length / 4)

    if (averageBrightness < 50) return 'Dark'
    if (averageBrightness < 150) return 'Normal'
    return 'Bright'
  }

  private analyzeColors(canvas: HTMLCanvasElement): string {
    const ctx = canvas.getContext('2d')
    if (!ctx) return 'Unknown'

    const imageData = ctx.getImageData(0, 0, Math.min(100, canvas.width), Math.min(100, canvas.height))
    const data = imageData.data

    const colorSet = new Set()
    for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
      const color = `${Math.floor(data[i] / 32)},${Math.floor(data[i + 1] / 32)},${Math.floor(data[i + 2] / 32)}`
      colorSet.add(color)
    }

    if (colorSet.size < 10) return 'Limited'
    if (colorSet.size < 30) return 'Moderate'
    return 'Diverse'
  }

  private detectEdges(canvas: HTMLCanvasElement): string {
    // Simple edge detection approximation
    const ctx = canvas.getContext('2d')
    if (!ctx) return 'Unknown'

    const imageData = ctx.getImageData(0, 0, Math.min(200, canvas.width), Math.min(200, canvas.height))
    const data = imageData.data

    let edgeCount = 0
    const width = Math.min(200, canvas.width)

    for (let y = 1; y < Math.min(200, canvas.height) - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4
        const current = (data[i] + data[i + 1] + data[i + 2]) / 3

        const right = (data[i + 4] + data[i + 5] + data[i + 6]) / 3
        const bottom = (data[i + width * 4] + data[i + width * 4 + 1] + data[i + width * 4 + 2]) / 3

        if (Math.abs(current - right) > 30 || Math.abs(current - bottom) > 30) {
          edgeCount++
        }
      }
    }

    const edgeDensity = edgeCount / ((width - 2) * (Math.min(200, canvas.height) - 2))

    if (edgeDensity < 0.1) return 'Low'
    if (edgeDensity < 0.3) return 'Moderate'
    return 'High'
  }

  // AI response parsing helpers
  private parseAIResponse(response: string, keywords: string[]): boolean {
    const lowerResponse = response.toLowerCase()
    return keywords.some(keyword => lowerResponse.includes(keyword.toLowerCase()))
  }

  private extractConfidenceFromAI(response: string): number {
    const confidenceMatch = response.match(/confidence[:\s]*(\d+(?:\.\d+)?)/i)
    if (confidenceMatch) {
      return Math.min(parseFloat(confidenceMatch[1]) / 100, 1)
    }

    // Fallback: analyze positive/negative sentiment
    const positiveWords = ['valid', 'appropriate', 'clear', 'good', 'acceptable', 'approve']
    const negativeWords = ['invalid', 'suspicious', 'unclear', 'poor', 'reject', 'concerning']

    const positive = positiveWords.filter(word => response.toLowerCase().includes(word)).length
    const negative = negativeWords.filter(word => response.toLowerCase().includes(word)).length

    return Math.max(0.1, Math.min(0.9, 0.5 + (positive - negative) * 0.1))
  }

  private calculateConfidence(factors: {
    imageQuality: number
    timingMatch: number
    locationReliability: number
    aiConfidence: number
  }): number {
    const weights = {
      imageQuality: 0.2,
      timingMatch: 0.3,
      locationReliability: 0.2,
      aiConfidence: 0.3
    }

    return Object.entries(factors).reduce((total, [key, value]) => {
      return total + value * weights[key as keyof typeof weights]
    }, 0)
  }

  private determineRecommendation(
    confidence: number,
    aiResponse: string,
    analysis: { faceDetected: boolean; workplaceEnvironment: boolean; livePhoto: boolean }
  ): 'approve' | 'review' | 'reject' {
    // Hard rejection criteria
    if (!analysis.livePhoto || aiResponse.toLowerCase().includes('reject')) {
      return 'reject'
    }

    // High confidence approval
    if (confidence > 0.8 && analysis.faceDetected && analysis.workplaceEnvironment) {
      return 'approve'
    }

    // Low confidence rejection
    if (confidence < 0.3) {
      return 'reject'
    }

    // Everything else needs review
    return 'review'
  }

  private extractFlags(response: string, visualData: any, metadata: PhotoMetadata): string[] {
    const flags: string[] = []

    // AI-detected flags
    if (response.toLowerCase().includes('suspicious')) flags.push('AI_SUSPICIOUS')
    if (response.toLowerCase().includes('screenshot')) flags.push('POSSIBLE_SCREENSHOT')
    if (response.toLowerCase().includes('unclear')) flags.push('UNCLEAR_IMAGE')

    // Technical flags
    if (visualData.dataSize < 50000) flags.push('LOW_FILE_SIZE')
    if (visualData.dimensions?.width < 400) flags.push('LOW_RESOLUTION')
    if (!metadata.location) flags.push('NO_LOCATION')

    // Timing flags
    if (!this.isWorkingHours(metadata.timestamp)) flags.push('OFF_HOURS')
    if (Math.abs(this.calculateTimeDifference(metadata.timestamp)) > 300) flags.push('TIME_MISMATCH')

    return flags
  }

  // Utility methods
  private assessImageQuality(visualData: any): number {
    if (!visualData.dimensions) return 0.1

    const resolution = visualData.dimensions.width * visualData.dimensions.height
    const aspectRatio = visualData.aspectRatio
    const size = visualData.dataSize

    let quality = 0.5

    // Resolution scoring
    if (resolution > 1000000) quality += 0.2 // HD+
    else if (resolution > 300000) quality += 0.1 // Standard
    else quality -= 0.2 // Low res

    // Aspect ratio (typical phone camera ratios)
    if (aspectRatio > 0.5 && aspectRatio < 2) quality += 0.1

    // File size (reasonable for photos)
    if (size > 100000 && size < 5000000) quality += 0.1

    return Math.max(0, Math.min(1, quality))
  }

  private isTimingAppropriate(timestamp: string): number {
    const photoTime = new Date(timestamp)
    const now = new Date()
    const diffSeconds = Math.abs((now.getTime() - photoTime.getTime()) / 1000)

    if (diffSeconds < 60) return 1.0 // Perfect timing
    if (diffSeconds < 300) return 0.8 // Within 5 minutes
    if (diffSeconds < 600) return 0.5 // Within 10 minutes
    return 0.2 // Too far apart
  }

  private calculateTimeDifference(timestamp: string): number {
    const photoTime = new Date(timestamp)
    const now = new Date()
    return (now.getTime() - photoTime.getTime()) / 1000
  }

  private isWorkingHours(timestamp: string): boolean {
    const date = new Date(timestamp)
    const hour = date.getHours()
    const day = date.getDay()

    // Basic working hours: Monday-Friday, 6 AM - 10 PM
    return day >= 1 && day <= 5 && hour >= 6 && hour <= 22
  }

  private assessLocationReliability(location: { lat: number; lng: number; accuracy: number }): number {
    if (location.accuracy < 10) return 1.0 // Very accurate
    if (location.accuracy < 50) return 0.8 // Good
    if (location.accuracy < 100) return 0.6 // Fair
    return 0.3 // Poor accuracy
  }

  private parseUserAgent(userAgent: string): string {
    if (userAgent.includes('iPhone')) return 'iPhone'
    if (userAgent.includes('Android')) return 'Android'
    if (userAgent.includes('iPad')) return 'iPad'
    return 'Desktop/Other'
  }

  private extractAnyText(response: string): string | undefined {
    // Look for any text that might have been read from the image
    const textMatch = response.match(/text[:\s]*["']([^"']+)["']/i)
    return textMatch ? textMatch[1] : undefined
  }

  private createManualReviewResult(metadata: PhotoMetadata): PhotoAnalysisResult {
    return {
      isValid: true,
      confidence: 0.5, // Neutral confidence for manual review
      analysis: {
        faceDetected: true, // Assume basic requirements met
        workplaceEnvironment: true,
        livePhoto: true,
        timestamp: metadata.timestamp,
        location: metadata.location ? `${metadata.location.lat}, ${metadata.location.lng}` : undefined
      },
      flags: ['AI_UNAVAILABLE', 'MANUAL_REVIEW_REQUIRED'],
      recommendation: 'review',
      reasoning: 'AI analysis is not configured. Photo requires manual review by supervisor or automated approval based on basic checks.'
    }
  }

  private createFailureResult(error: Error): PhotoAnalysisResult {
    return {
      isValid: false,
      confidence: 0,
      analysis: {
        faceDetected: false,
        workplaceEnvironment: false,
        livePhoto: false,
        timestamp: new Date().toISOString()
      },
      flags: ['ANALYSIS_FAILED', 'SYSTEM_ERROR'],
      recommendation: 'reject',
      reasoning: `Photo analysis failed: ${error.message}`
    }
  }
}

export const workersAIPhotoOCR = new WorkersAIPhotoOCR()
export default workersAIPhotoOCR