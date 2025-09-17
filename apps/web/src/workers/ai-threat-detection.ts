/**
 * Workers AI Enhanced Threat Detection
 * Advanced AI-powered security analysis using Cloudflare Workers AI
 */

interface Env {
  AI: any; // Cloudflare Workers AI binding
  THREAT_DB: D1Database;
  SECURITY_KV: KVNamespace;
}

interface ThreatAnalysisRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  clientIP: string;
  userAgent: string;
  country: string;
  timestamp: number;
}

interface ThreatAnalysisResult {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  threats: ThreatType[];
  recommendation: 'allow' | 'challenge' | 'block' | 'monitor';
  reasoning: string;
  aiModel: string;
  processingTime: number;
}

interface ThreatType {
  type: string;
  severity: number; // 1-10
  indicators: string[];
  mitigations: string[];
}

export class AIThreatDetector {
  private env: Env;
  
  constructor(env: Env) {
    this.env = env;
  }
  
  async analyzeRequest(request: ThreatAnalysisRequest): Promise<ThreatAnalysisResult> {
    const startTime = Date.now();
    
    try {
      // Run multiple AI models for comprehensive analysis
      const [
        sqlInjectionAnalysis,
        xssAnalysis,
        botDetection,
        anomalyDetection,
        behaviorAnalysis
      ] = await Promise.all([
        this.detectSQLInjection(request),
        this.detectXSS(request),
        this.detectBotActivity(request),
        this.detectAnomalies(request),
        this.analyzeBehavior(request)
      ]);
      
      // Combine results
      const combinedResult = this.combineAnalysisResults([
        sqlInjectionAnalysis,
        xssAnalysis,
        botDetection,
        anomalyDetection,
        behaviorAnalysis
      ]);
      
      // Store analysis for learning
      await this.storeAnalysisResult(request, combinedResult);
      
      return {
        ...combinedResult,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error('AI threat analysis failed:', error);
      return {
        threatLevel: 'low',
        confidence: 0,
        threats: [],
        recommendation: 'allow',
        reasoning: 'AI analysis unavailable',
        aiModel: 'fallback',
        processingTime: Date.now() - startTime
      };
    }
  }
  
  private async detectSQLInjection(request: ThreatAnalysisRequest): Promise<Partial<ThreatAnalysisResult>> {
    const prompt = `Analyze this HTTP request for SQL injection attacks:
      URL: ${request.url}
      Method: ${request.method}
      Body: ${request.body || 'N/A'}
      
      Look for patterns like:
      - UNION SELECT statements
      - DROP TABLE commands
      - Boolean-based injection (OR 1=1)
      - Time-based injection
      - Error-based injection
      
      Respond with: THREAT_LEVEL (low/medium/high/critical), CONFIDENCE (0-100), REASONING`;
    
    try {
      const response = await this.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
        prompt,
        max_tokens: 150
      });
      
      return this.parseAIResponse(response.response, 'sql_injection');
    } catch (error) {
      return { threatLevel: 'low', confidence: 0, threats: [] };
    }
  }
  
  private async detectXSS(request: ThreatAnalysisRequest): Promise<Partial<ThreatAnalysisResult>> {
    const prompt = `Analyze this HTTP request for Cross-Site Scripting (XSS) attacks:
      URL: ${request.url}
      Headers: ${JSON.stringify(request.headers)}
      Body: ${request.body || 'N/A'}
      
      Look for patterns like:
      - <script> tags
      - javascript: protocols
      - Event handlers (onload, onerror, etc.)
      - DOM manipulation attempts
      - Encoded payloads
      
      Respond with: THREAT_LEVEL (low/medium/high/critical), CONFIDENCE (0-100), REASONING`;
    
    try {
      const response = await this.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
        prompt,
        max_tokens: 150
      });
      
      return this.parseAIResponse(response.response, 'xss');
    } catch (error) {
      return { threatLevel: 'low', confidence: 0, threats: [] };
    }
  }
  
  private async detectBotActivity(request: ThreatAnalysisRequest): Promise<Partial<ThreatAnalysisResult>> {
    const prompt = `Analyze this HTTP request to determine if it's from a bot or automated tool:
      User-Agent: ${request.userAgent}
      Method: ${request.method}
      URL: ${request.url}
      Country: ${request.country}
      
      Look for indicators of:
      - Security scanners (Nmap, Nessus, etc.)
      - Web crawlers/scrapers
      - Attack tools (sqlmap, Burp Suite, etc.)
      - Unusual request patterns
      - Missing or suspicious headers
      
      Respond with: THREAT_LEVEL (low/medium/high/critical), CONFIDENCE (0-100), REASONING`;
    
    try {
      const response = await this.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
        prompt,
        max_tokens: 150
      });
      
      return this.parseAIResponse(response.response, 'bot_activity');
    } catch (error) {
      return { threatLevel: 'low', confidence: 0, threats: [] };
    }
  }
  
  private async detectAnomalies(request: ThreatAnalysisRequest): Promise<Partial<ThreatAnalysisResult>> {
    // Get historical patterns for this IP/User-Agent combination
    const historicalData = await this.getHistoricalPatterns(request.clientIP, request.userAgent);
    
    const prompt = `Analyze this HTTP request for anomalous behavior:
      Current Request: ${JSON.stringify(request)}
      Historical Patterns: ${JSON.stringify(historicalData)}
      
      Look for:
      - Unusual request frequency
      - Abnormal geographic patterns
      - Unexpected endpoint access
      - Parameter fuzzing
      - Reconnaissance behavior
      
      Respond with: THREAT_LEVEL (low/medium/high/critical), CONFIDENCE (0-100), REASONING`;
    
    try {
      const response = await this.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
        prompt,
        max_tokens: 150
      });
      
      return this.parseAIResponse(response.response, 'anomaly_detection');
    } catch (error) {
      return { threatLevel: 'low', confidence: 0, threats: [] };
    }
  }
  
  private async analyzeBehavior(request: ThreatAnalysisRequest): Promise<Partial<ThreatAnalysisResult>> {
    const prompt = `Analyze the overall behavior pattern of this HTTP request:
      ${JSON.stringify(request)}
      
      Consider:
      - Request context and legitimacy
      - Business logic bypass attempts
      - Authentication/authorization bypasses
      - Data exfiltration patterns
      - Overall threat posture
      
      Respond with: THREAT_LEVEL (low/medium/high/critical), CONFIDENCE (0-100), REASONING`;
    
    try {
      const response = await this.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
        prompt,
        max_tokens: 150
      });
      
      return this.parseAIResponse(response.response, 'behavior_analysis');
    } catch (error) {
      return { threatLevel: 'low', confidence: 0, threats: [] };
    }
  }
  
  private parseAIResponse(response: string, threatType: string): Partial<ThreatAnalysisResult> {
    try {
      // Extract threat level
      let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      const threatMatch = response.match(/THREAT_LEVEL:\s*(low|medium|high|critical)/i);
      if (threatMatch) {
        threatLevel = threatMatch[1].toLowerCase() as any;
      }
      
      // Extract confidence
      let confidence = 50;
      const confidenceMatch = response.match(/CONFIDENCE:\s*(\d+)/i);
      if (confidenceMatch) {
        confidence = parseInt(confidenceMatch[1]);
      }
      
      // Extract reasoning
      const reasoningMatch = response.match(/REASONING:\s*(.+)/i);
      const reasoning = reasoningMatch ? reasoningMatch[1].trim() : 'AI analysis completed';
      
      // Create threat object
      const threat: ThreatType = {
        type: threatType,
        severity: this.threatLevelToSeverity(threatLevel),
        indicators: this.extractIndicators(response),
        mitigations: this.getMitigations(threatType, threatLevel)
      };
      
      return {
        threatLevel,
        confidence,
        threats: [threat],
        reasoning,
        aiModel: 'llama-2-7b-chat-int8'
      };
      
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return {
        threatLevel: 'low',
        confidence: 0,
        threats: [],
        reasoning: 'Failed to parse AI analysis'
      };
    }
  }
  
  private combineAnalysisResults(results: Partial<ThreatAnalysisResult>[]): Omit<ThreatAnalysisResult, 'processingTime'> {
    // Find highest threat level
    const threatLevels = results.map(r => r.threatLevel || 'low');
    const maxThreatLevel = this.getMaxThreatLevel(threatLevels);
    
    // Calculate average confidence
    const confidences = results.map(r => r.confidence || 0).filter(c => c > 0);
    const avgConfidence = confidences.length > 0 ? Math.round(confidences.reduce((a, b) => a + b) / confidences.length) : 0;
    
    // Combine all threats
    const allThreats = results.flatMap(r => r.threats || []);
    
    // Determine recommendation
    const recommendation = this.determineRecommendation(maxThreatLevel, avgConfidence);
    
    // Combine reasoning
    const validReasonings = results.map(r => r.reasoning).filter(Boolean);
    const combinedReasoning = validReasonings.join('; ');
    
    return {
      threatLevel: maxThreatLevel,
      confidence: avgConfidence,
      threats: allThreats,
      recommendation,
      reasoning: combinedReasoning || 'No specific threats detected',
      aiModel: 'multi-model-ensemble'
    };
  }
  
  private getMaxThreatLevel(levels: string[]): 'low' | 'medium' | 'high' | 'critical' {
    if (levels.includes('critical')) return 'critical';
    if (levels.includes('high')) return 'high';
    if (levels.includes('medium')) return 'medium';
    return 'low';
  }
  
  private threatLevelToSeverity(level: string): number {
    switch (level) {
      case 'critical': return 10;
      case 'high': return 7;
      case 'medium': return 4;
      case 'low': return 1;
      default: return 1;
    }
  }
  
  private extractIndicators(response: string): string[] {
    // Extract specific indicators mentioned in the AI response
    const indicators: string[] = [];
    
    const commonIndicators = [
      'union select', 'drop table', 'script tag', 'javascript protocol',
      'sql injection', 'xss', 'scanner', 'bot', 'automation'
    ];
    
    for (const indicator of commonIndicators) {
      if (response.toLowerCase().includes(indicator)) {
        indicators.push(indicator);
      }
    }
    
    return indicators;
  }
  
  private getMitigations(threatType: string, threatLevel: string): string[] {
    const mitigations: Record<string, string[]> = {
      sql_injection: ['Input validation', 'Parameterized queries', 'WAF blocking'],
      xss: ['Content Security Policy', 'Input sanitization', 'Output encoding'],
      bot_activity: ['Rate limiting', 'Challenge responses', 'Bot management'],
      anomaly_detection: ['Behavioral analysis', 'Threshold monitoring', 'Alert generation'],
      behavior_analysis: ['Session tracking', 'Risk scoring', 'Adaptive security']
    };
    
    return mitigations[threatType] || ['General monitoring'];
  }
  
  private determineRecommendation(threatLevel: string, confidence: number): 'allow' | 'challenge' | 'block' | 'monitor' {
    if (threatLevel === 'critical' && confidence > 70) return 'block';
    if (threatLevel === 'high' && confidence > 60) return 'block';
    if (threatLevel === 'high' || (threatLevel === 'medium' && confidence > 70)) return 'challenge';
    if (threatLevel === 'medium' && confidence > 40) return 'monitor';
    return 'allow';
  }
  
  private async getHistoricalPatterns(clientIP: string, userAgent: string): Promise<any> {
    try {
      // Get recent request patterns for this client
      const patterns = await this.env.THREAT_DB.prepare(`
        SELECT COUNT(*) as request_count, 
               AVG(response_time) as avg_response_time,
               COUNT(DISTINCT url) as unique_urls,
               MAX(timestamp) as last_seen
        FROM security_logs 
        WHERE client_ip = ? 
          AND user_agent = ?
          AND timestamp > datetime('now', '-1 hour')
      `).bind(clientIP, userAgent).first();
      
      return patterns || {};
    } catch (error) {
      console.error('Failed to get historical patterns:', error);
      return {};
    }
  }
  
  private async storeAnalysisResult(request: ThreatAnalysisRequest, result: ThreatAnalysisResult): Promise<void> {
    try {
      // Store in KV for quick access
      const key = `ai_analysis:${request.clientIP}:${Date.now()}`;
      await this.env.SECURITY_KV.put(key, JSON.stringify({
        request: request,
        result: result
      }), { expirationTtl: 86400 }); // 24 hours
      
      // Store in D1 for long-term analysis and learning
      await this.env.THREAT_DB.prepare(`
        INSERT INTO ai_threat_analysis 
        (timestamp, client_ip, user_agent, url, method, threat_level, confidence, threats, recommendation, reasoning, ai_model, processing_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        new Date(request.timestamp).toISOString(),
        request.clientIP,
        request.userAgent,
        request.url,
        request.method,
        result.threatLevel,
        result.confidence,
        JSON.stringify(result.threats),
        result.recommendation,
        result.reasoning,
        result.aiModel,
        result.processingTime
      ).run();
      
    } catch (error) {
      console.error('Failed to store AI analysis result:', error);
    }
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const detector = new AIThreatDetector(env);
    
    const analysisRequest: ThreatAnalysisRequest = {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.method !== 'GET' ? await request.text() : undefined,
      clientIP: request.headers.get('CF-Connecting-IP') || 'unknown',
      userAgent: request.headers.get('User-Agent') || '',
      country: request.cf?.country || 'unknown',
      timestamp: Date.now()
    };
    
    const result = await detector.analyzeRequest(analysisRequest);
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};