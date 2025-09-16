import { EventEmitter } from 'events';

// Continuous Learning Knowledge Base System
// Automatically learns from all application data and user interactions

export interface LearningEvent {
  id: string;
  timestamp: Date;
  type: 'interaction' | 'document' | 'query' | 'feedback' | 'performance' | 'error';
  source: string;
  userId?: string;
  sessionId?: string;
  data: any;
  metadata?: Record<string, any>;
  confidence?: number;
  tags?: string[];
}

export interface KnowledgeEntity {
  id: string;
  type: 'concept' | 'procedure' | 'fact' | 'relationship' | 'pattern';
  content: string;
  embedding?: number[];
  confidence: number;
  frequency: number;
  lastUpdated: Date;
  sources: string[];
  relationships: string[];
  metadata: Record<string, any>;
}

export interface LearningPattern {
  id: string;
  pattern: string;
  occurrences: number;
  confidence: number;
  examples: any[];
  predictions?: string[];
  lastSeen: Date;
}

class ContinuousLearningSystem extends EventEmitter {
  private static instance: ContinuousLearningSystem;
  private knowledgeBase: Map<string, KnowledgeEntity> = new Map();
  private learningQueue: LearningEvent[] = [];
  private patterns: Map<string, LearningPattern> = new Map();
  private isProcessing: boolean = false;
  private learningRate: number = 0.1;
  private confidenceThreshold: number = 0.7;

  // Configurable learning parameters
  private config = {
    batchSize: 100,
    processingInterval: 5000, // 5 seconds
    minConfidence: 0.5,
    maxQueueSize: 10000,
    retentionPeriod: 90 * 24 * 60 * 60 * 1000, // 90 days
    learningModes: ['supervised', 'unsupervised', 'reinforcement'],
    autoIndexing: true,
    semanticAnalysis: true,
    patternRecognition: true,
    anomalyDetection: true
  };

  private constructor() {
    super();
    this.initializeLearningSystem();
  }

  static getInstance(): ContinuousLearningSystem {
    if (!ContinuousLearningSystem.instance) {
      ContinuousLearningSystem.instance = new ContinuousLearningSystem();
    }
    return ContinuousLearningSystem.instance;
  }

  private initializeLearningSystem() {
    // Start continuous processing
    setInterval(() => this.processLearningQueue(), this.config.processingInterval);
    
    // Setup automatic data collectors
    this.setupDataCollectors();
    
    // Initialize pattern recognition
    this.initializePatternRecognition();
    
    console.log('🧠 Continuous Learning System initialized');
  }

  // Collect data from various sources
  private setupDataCollectors() {
    // Collect from user interactions
    if (typeof window !== 'undefined') {
      // Click events
      document.addEventListener('click', (e) => {
        this.captureInteraction('click', {
          element: (e.target as Element)?.tagName,
          text: (e.target as Element)?.textContent?.substring(0, 100),
          path: e.composedPath().map((el: any) => el.tagName).filter(Boolean).join(' > ')
        });
      });

      // Form submissions
      document.addEventListener('submit', (e) => {
        const form = e.target as HTMLFormElement;
        this.captureInteraction('form_submit', {
          formId: form.id,
          action: form.action,
          method: form.method
        });
      });

      // Search queries
      document.addEventListener('input', (e) => {
        const input = e.target as HTMLInputElement;
        if (input.type === 'search' || input.name?.includes('search')) {
          this.captureInteraction('search', {
            query: input.value,
            field: input.name
          });
        }
      });

      // Page navigation
      window.addEventListener('popstate', () => {
        this.captureInteraction('navigation', {
          url: window.location.href,
          title: document.title
        });
      });

      // Errors
      window.addEventListener('error', (e) => {
        this.captureError(e.error);
      });
    }
  }

  // Initialize pattern recognition
  private initializePatternRecognition() {
    // Common patterns to detect
    const patterns = [
      { name: 'repeated_query', regex: /similar queries/i },
      { name: 'workflow_sequence', regex: /step \d+ of \d+/i },
      { name: 'error_pattern', regex: /error.*occurred/i },
      { name: 'success_pattern', regex: /successfully completed/i },
      { name: 'user_preference', regex: /prefer|favorite|always/i }
    ];

    patterns.forEach(p => {
      this.patterns.set(p.name, {
        id: p.name,
        pattern: p.regex.source,
        occurrences: 0,
        confidence: 0.5,
        examples: [],
        lastSeen: new Date()
      });
    });
  }

  // Main learning method - ingests any type of data
  async learn(data: any, type: LearningEvent['type'] = 'interaction', metadata?: any): Promise<void> {
    try {
      const event: LearningEvent = {
        id: this.generateId(),
        timestamp: new Date(),
        type,
        source: this.detectSource(data),
        data,
        metadata,
        confidence: this.calculateConfidence(data)
      };

      // Add to learning queue
      this.learningQueue.push(event);

      // Emit event for real-time processing
      this.emit('learning', event);

      // Process immediately if queue is getting full
      if (this.learningQueue.length >= this.config.batchSize) {
        this.processLearningQueue();
      }
    } catch (error) {
      // Silently handle learning errors to prevent disrupting the app
      console.debug('Learning error:', error);
    }
  }

  // Process queued learning events
  private async processLearningQueue() {
    if (this.isProcessing || this.learningQueue.length === 0) return;

    this.isProcessing = true;
    const batch = this.learningQueue.splice(0, this.config.batchSize);

    try {
      for (const event of batch) {
        await this.processLearningEvent(event);
      }

      // Update patterns
      this.updatePatterns(batch);

      // Perform knowledge consolidation
      this.consolidateKnowledge();

      // Emit batch processed event
      this.emit('batch_processed', { count: batch.length });
    } catch (error) {
      console.error('Error processing learning batch:', error);
      this.emit('error', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Process individual learning event
  private async processLearningEvent(event: LearningEvent) {
    switch (event.type) {
      case 'interaction':
        await this.processInteraction(event);
        break;
      case 'document':
        await this.processDocument(event);
        break;
      case 'query':
        await this.processQuery(event);
        break;
      case 'feedback':
        await this.processFeedback(event);
        break;
      case 'performance':
        await this.processPerformance(event);
        break;
      case 'error':
        await this.processError(event);
        break;
    }

    // Extract entities and relationships
    const entities = this.extractEntities(event);
    entities.forEach(entity => this.updateKnowledgeBase(entity));

    // Detect patterns
    this.detectPatterns(event);
  }

  // Process user interactions
  private async processInteraction(event: LearningEvent) {
    const { data } = event;
    
    // Learn user preferences
    if (data.element === 'BUTTON' || data.element === 'A') {
      this.learnUserPreference('navigation', data.text, event.userId);
    }

    // Learn common workflows
    if (data.sequence) {
      this.learnWorkflow(data.sequence, event.userId);
    }

    // Update interaction patterns
    this.updateInteractionPattern(event);
  }

  // Process documents
  private async processDocument(event: LearningEvent) {
    const { data } = event;
    
    // Extract key concepts
    const concepts = this.extractConcepts(data.content || data.text);
    
    // Create knowledge entities
    concepts.forEach(concept => {
      const entity: KnowledgeEntity = {
        id: this.generateId(),
        type: 'concept',
        content: concept,
        confidence: event.confidence || 0.7,
        frequency: 1,
        lastUpdated: new Date(),
        sources: [event.source],
        relationships: [],
        metadata: {
          documentId: data.id,
          documentType: data.type
        }
      };
      
      this.updateKnowledgeBase(entity);
    });

    // Index for search
    if (this.config.autoIndexing) {
      await this.indexDocument(data);
    }
  }

  // Process queries
  private async processQuery(event: LearningEvent) {
    const { data } = event;
    
    // Learn from query patterns
    this.learnQueryPattern(data.query, data.results);
    
    // Update query understanding
    if (data.successful) {
      this.improveQueryUnderstanding(data.query, data.results);
    }

    // Store for future similar queries
    this.storeQueryExample(event);
  }

  // Process feedback
  private async processFeedback(event: LearningEvent) {
    const { data } = event;
    
    // Adjust confidence based on feedback
    if (data.targetId && data.rating) {
      const entity = this.knowledgeBase.get(data.targetId);
      if (entity) {
        entity.confidence = this.adjustConfidence(entity.confidence, data.rating);
        this.knowledgeBase.set(data.targetId, entity);
      }
    }

    // Learn from corrections
    if (data.correction) {
      this.learnFromCorrection(data.original, data.correction);
    }
  }

  // Process performance metrics
  private async processPerformance(event: LearningEvent) {
    const { data } = event;
    
    // Identify performance patterns
    if (data.metric && data.value) {
      this.trackPerformancePattern(data.metric, data.value);
    }

    // Optimize based on performance
    if (data.slow) {
      this.identifyOptimizationOpportunity(data);
    }
  }

  // Process errors
  private async processError(event: LearningEvent) {
    const { data } = event;
    
    // Learn from errors to prevent future occurrences
    this.learnFromError(data);
    
    // Update error patterns
    this.updateErrorPattern(data);
    
    // Generate preventive knowledge
    const prevention = this.generatePreventiveKnowledge(data);
    if (prevention) {
      this.updateKnowledgeBase(prevention);
    }
  }

  // Extract entities from events
  private extractEntities(event: LearningEvent): KnowledgeEntity[] {
    const entities: KnowledgeEntity[] = [];
    const data = event.data;

    // Extract based on event type
    if (typeof data === 'string') {
      // Simple text extraction
      const concepts = this.extractConcepts(data);
      concepts.forEach(concept => {
        entities.push({
          id: this.generateId(),
          type: 'concept',
          content: concept,
          confidence: 0.6,
          frequency: 1,
          lastUpdated: new Date(),
          sources: [event.source],
          relationships: [],
          metadata: {}
        });
      });
    } else if (typeof data === 'object') {
      // Complex object extraction
      Object.entries(data).forEach(([key, value]) => {
        if (this.isSignificant(key, value)) {
          entities.push({
            id: this.generateId(),
            type: 'fact',
            content: `${key}: ${value}`,
            confidence: 0.7,
            frequency: 1,
            lastUpdated: new Date(),
            sources: [event.source],
            relationships: [],
            metadata: { key, value }
          });
        }
      });
    }

    return entities;
  }

  // Extract concepts from text
  private extractConcepts(text: string): string[] {
    if (!text) return [];
    
    // Simple concept extraction (can be enhanced with NLP)
    const concepts: string[] = [];
    
    // Extract capitalized phrases (likely important)
    const capitalizedPhrases = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
    concepts.push(...capitalizedPhrases);
    
    // Extract technical terms
    const technicalTerms = text.match(/\b(?:API|SDK|UI|UX|AI|ML|RBAC|CRUD|REST|SQL)\b/gi) || [];
    concepts.push(...technicalTerms);
    
    // Extract quoted text
    const quotedText = text.match(/"([^"]+)"|'([^']+)'/g) || [];
    concepts.push(...quotedText.map(q => q.replace(/["']/g, '')));
    
    return [...new Set(concepts)]; // Remove duplicates
  }

  // Detect patterns in events
  private detectPatterns(event: LearningEvent) {
    const eventStr = JSON.stringify(event.data).toLowerCase();
    
    this.patterns.forEach((pattern, name) => {
      const regex = new RegExp(pattern.pattern, 'i');
      if (regex.test(eventStr)) {
        pattern.occurrences++;
        pattern.lastSeen = new Date();
        pattern.examples.push(event.data);
        
        // Keep only recent examples
        if (pattern.examples.length > 10) {
          pattern.examples = pattern.examples.slice(-10);
        }
        
        // Update confidence based on occurrences
        pattern.confidence = Math.min(0.95, pattern.occurrences / 100);
        
        this.patterns.set(name, pattern);
        this.emit('pattern_detected', { name, pattern, event });
      }
    });
  }

  // Update knowledge base with new entity
  private updateKnowledgeBase(entity: KnowledgeEntity) {
    const existing = this.knowledgeBase.get(entity.id);
    
    if (existing) {
      // Merge with existing knowledge
      existing.frequency++;
      existing.confidence = this.adjustConfidence(existing.confidence, entity.confidence);
      existing.lastUpdated = new Date();
      existing.sources = [...new Set([...existing.sources, ...entity.sources])];
      existing.relationships = [...new Set([...existing.relationships, ...entity.relationships])];
      Object.assign(existing.metadata, entity.metadata);
      
      this.knowledgeBase.set(entity.id, existing);
    } else {
      // Add new knowledge
      this.knowledgeBase.set(entity.id, entity);
    }
    
    this.emit('knowledge_updated', entity);
  }

  // Consolidate and optimize knowledge
  private consolidateKnowledge() {
    // Remove low-confidence entries
    this.knowledgeBase.forEach((entity, id) => {
      if (entity.confidence < this.config.minConfidence) {
        this.knowledgeBase.delete(id);
      }
    });
    
    // Merge similar entities
    const entities = Array.from(this.knowledgeBase.values());
    entities.forEach((entity1, i) => {
      entities.slice(i + 1).forEach(entity2 => {
        if (this.areSimilar(entity1, entity2)) {
          this.mergeEntities(entity1, entity2);
        }
      });
    });
    
    // Update relationships
    this.updateRelationships();
  }

  // Update patterns based on batch
  private updatePatterns(batch: LearningEvent[]) {
    // Analyze batch for common patterns
    const sequences: string[][] = [];
    
    batch.forEach((event, i) => {
      if (i < batch.length - 1) {
        const sequence = [event.type, batch[i + 1].type];
        sequences.push(sequence);
      }
    });
    
    // Find frequent sequences
    const frequentSequences = this.findFrequentSequences(sequences);
    
    // Create new patterns
    frequentSequences.forEach(seq => {
      const patternId = seq.join('->');
      if (!this.patterns.has(patternId)) {
        this.patterns.set(patternId, {
          id: patternId,
          pattern: seq.join('->'),
          occurrences: 1,
          confidence: 0.5,
          examples: [],
          lastSeen: new Date()
        });
      }
    });
  }

  // Learn user preferences
  private learnUserPreference(type: string, value: any, userId?: string) {
    const preferenceId = `pref_${type}_${userId || 'anonymous'}`;
    const entity: KnowledgeEntity = {
      id: preferenceId,
      type: 'pattern',
      content: `User preference: ${type} = ${value}`,
      confidence: 0.8,
      frequency: 1,
      lastUpdated: new Date(),
      sources: ['user_interaction'],
      relationships: [],
      metadata: {
        userId,
        preferenceType: type,
        value
      }
    };
    
    this.updateKnowledgeBase(entity);
  }

  // Learn workflows
  private learnWorkflow(sequence: string[], userId?: string) {
    const workflowId = `workflow_${sequence.join('_')}`;
    const entity: KnowledgeEntity = {
      id: workflowId,
      type: 'procedure',
      content: `Workflow: ${sequence.join(' → ')}`,
      confidence: 0.75,
      frequency: 1,
      lastUpdated: new Date(),
      sources: ['workflow_detection'],
      relationships: sequence,
      metadata: {
        userId,
        steps: sequence,
        duration: null
      }
    };
    
    this.updateKnowledgeBase(entity);
  }

  // Query the knowledge base
  async query(question: string, context?: any): Promise<any> {
    // Track the query
    await this.learn({ query: question, context }, 'query');
    
    // Search knowledge base
    const results: KnowledgeEntity[] = [];
    const queryLower = question.toLowerCase();
    
    this.knowledgeBase.forEach(entity => {
      const contentLower = entity.content.toLowerCase();
      if (contentLower.includes(queryLower) || this.isRelevant(question, entity)) {
        results.push(entity);
      }
    });
    
    // Sort by relevance and confidence
    results.sort((a, b) => {
      const scoreA = a.confidence * a.frequency;
      const scoreB = b.confidence * b.frequency;
      return scoreB - scoreA;
    });
    
    // Generate response
    const response = this.generateResponse(question, results.slice(0, 5));
    
    // Learn from this query
    await this.learn({
      query: question,
      results: response,
      successful: results.length > 0
    }, 'query');
    
    return response;
  }

  // Generate response from knowledge
  private generateResponse(question: string, entities: KnowledgeEntity[]): any {
    if (entities.length === 0) {
      return {
        answer: "I don't have enough information to answer that question yet, but I'm learning!",
        confidence: 0,
        sources: []
      };
    }
    
    // Combine knowledge from entities
    const combinedKnowledge = entities.map(e => e.content).join('\n');
    const sources = [...new Set(entities.flatMap(e => e.sources))];
    const avgConfidence = entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length;
    
    return {
      answer: combinedKnowledge,
      confidence: avgConfidence,
      sources,
      entities: entities.map(e => ({
        id: e.id,
        type: e.type,
        content: e.content,
        confidence: e.confidence
      }))
    };
  }

  // Capture interactions
  private captureInteraction(type: string, data: any) {
    this.learn({
      interactionType: type,
      ...data,
      timestamp: new Date().toISOString(),
      url: window.location.href
    }, 'interaction');
  }

  // Capture errors
  private captureError(error: any) {
    this.learn({
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    }, 'error');
  }

  // Helper methods
  private generateId(): string {
    return `kn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private detectSource(data: any): string {
    if (data.source) return data.source;
    
    if (data.url) {
      try {
        // Handle relative URLs and invalid URLs gracefully
        if (typeof data.url === 'string') {
          // If it's already a pathname (starts with /), return it
          if (data.url.startsWith('/')) {
            return data.url;
          }
          // Try to parse as full URL
          const url = new URL(data.url, window.location.origin);
          return url.pathname;
        }
      } catch (error) {
        // If URL parsing fails, try to extract meaningful info
        console.warn('Invalid URL in continuous learning:', data.url);
        if (typeof data.url === 'string' && data.url.includes('/')) {
          // Return the last part of the path-like string
          return data.url.split('/').pop() || 'unknown';
        }
      }
    }
    
    if (data.type) return data.type;
    return 'unknown';
  }

  private calculateConfidence(data: any): number {
    let confidence = this.config.minConfidence;
    
    // Increase confidence based on data quality
    if (data.verified) confidence += 0.2;
    if (data.source) confidence += 0.1;
    if (data.timestamp) confidence += 0.1;
    if (data.userId) confidence += 0.1;
    
    return Math.min(1, confidence);
  }

  private adjustConfidence(current: number, adjustment: number): number {
    const newConfidence = current + (adjustment * this.learningRate);
    return Math.max(0, Math.min(1, newConfidence));
  }

  private isSignificant(key: string, value: any): boolean {
    // Determine if a key-value pair is significant enough to learn
    const insignificantKeys = ['id', 'timestamp', 'created', 'updated', '_id'];
    if (insignificantKeys.includes(key.toLowerCase())) return false;
    
    // Check value significance
    if (value === null || value === undefined || value === '') return false;
    if (typeof value === 'string' && value.length < 3) return false;
    
    return true;
  }

  private isRelevant(question: string, entity: KnowledgeEntity): boolean {
    // Simple relevance check (can be enhanced with semantic similarity)
    const questionWords = question.toLowerCase().split(/\s+/);
    const entityWords = entity.content.toLowerCase().split(/\s+/);
    
    const commonWords = questionWords.filter(word => entityWords.includes(word));
    const relevanceScore = commonWords.length / questionWords.length;
    
    return relevanceScore > 0.3;
  }

  private areSimilar(entity1: KnowledgeEntity, entity2: KnowledgeEntity): boolean {
    // Check if two entities are similar enough to merge
    if (entity1.type !== entity2.type) return false;
    
    const content1 = entity1.content.toLowerCase();
    const content2 = entity2.content.toLowerCase();
    
    // Simple similarity check (can be enhanced with embeddings)
    const words1 = new Set(content1.split(/\s+/));
    const words2 = new Set(content2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    const similarity = intersection.size / union.size;
    return similarity > 0.7;
  }

  private mergeEntities(entity1: KnowledgeEntity, entity2: KnowledgeEntity) {
    // Merge entity2 into entity1
    entity1.frequency += entity2.frequency;
    entity1.confidence = Math.max(entity1.confidence, entity2.confidence);
    entity1.sources = [...new Set([...entity1.sources, ...entity2.sources])];
    entity1.relationships = [...new Set([...entity1.relationships, ...entity2.relationships])];
    Object.assign(entity1.metadata, entity2.metadata);
    entity1.lastUpdated = new Date();
    
    // Remove entity2
    this.knowledgeBase.delete(entity2.id);
  }

  private updateRelationships() {
    // Analyze and update relationships between entities
    const entities = Array.from(this.knowledgeBase.values());
    
    entities.forEach(entity => {
      // Find related entities
      const related = entities.filter(e => 
        e.id !== entity.id && 
        this.areRelated(entity, e)
      );
      
      // Update relationships
      entity.relationships = related.map(e => e.id);
    });
  }

  private areRelated(entity1: KnowledgeEntity, entity2: KnowledgeEntity): boolean {
    // Check if entities are related
    if (entity1.sources.some(s => entity2.sources.includes(s))) return true;
    if (entity1.content.includes(entity2.content) || entity2.content.includes(entity1.content)) return true;
    
    return false;
  }

  private findFrequentSequences(sequences: string[][]): string[][] {
    // Find sequences that occur frequently
    const sequenceCount = new Map<string, number>();
    
    sequences.forEach(seq => {
      const key = seq.join('->');
      sequenceCount.set(key, (sequenceCount.get(key) || 0) + 1);
    });
    
    // Return sequences that occur more than once
    return Array.from(sequenceCount.entries())
      .filter(([_, count]) => count > 1)
      .map(([key, _]) => key.split('->'));
  }

  private learnQueryPattern(query: string, results: any) {
    const patternId = `query_pattern_${this.generateId()}`;
    const entity: KnowledgeEntity = {
      id: patternId,
      type: 'pattern',
      content: `Query pattern: "${query}" → ${results?.length || 0} results`,
      confidence: results?.length > 0 ? 0.8 : 0.3,
      frequency: 1,
      lastUpdated: new Date(),
      sources: ['query_analysis'],
      relationships: [],
      metadata: {
        query,
        resultCount: results?.length || 0,
        successful: results?.length > 0
      }
    };
    
    this.updateKnowledgeBase(entity);
  }

  private improveQueryUnderstanding(query: string, results: any) {
    // Learn what makes queries successful
    const features = this.extractQueryFeatures(query);
    features.forEach(feature => {
      const entity: KnowledgeEntity = {
        id: `query_feature_${feature}`,
        type: 'pattern',
        content: `Successful query feature: ${feature}`,
        confidence: 0.7,
        frequency: 1,
        lastUpdated: new Date(),
        sources: ['query_optimization'],
        relationships: [],
        metadata: { feature, query }
      };
      
      this.updateKnowledgeBase(entity);
    });
  }

  private extractQueryFeatures(query: string): string[] {
    const features: string[] = [];
    
    // Query length
    if (query.length < 20) features.push('short_query');
    else if (query.length > 100) features.push('long_query');
    else features.push('medium_query');
    
    // Question words
    if (/^(what|who|when|where|why|how)/i.test(query)) features.push('question_word');
    
    // Technical terms
    if (/\b(API|database|function|class|method)\b/i.test(query)) features.push('technical_query');
    
    return features;
  }

  private storeQueryExample(event: LearningEvent) {
    // Store successful queries as examples
    if (event.data.successful) {
      const exampleId = `query_example_${this.generateId()}`;
      const entity: KnowledgeEntity = {
        id: exampleId,
        type: 'fact',
        content: `Example query: "${event.data.query}"`,
        confidence: 0.9,
        frequency: 1,
        lastUpdated: new Date(),
        sources: ['query_examples'],
        relationships: [],
        metadata: event.data
      };
      
      this.updateKnowledgeBase(entity);
    }
  }

  private learnFromCorrection(original: any, correction: any) {
    const correctionId = `correction_${this.generateId()}`;
    const entity: KnowledgeEntity = {
      id: correctionId,
      type: 'fact',
      content: `Correction: "${original}" should be "${correction}"`,
      confidence: 0.95,
      frequency: 1,
      lastUpdated: new Date(),
      sources: ['user_correction'],
      relationships: [],
      metadata: { original, correction }
    };
    
    this.updateKnowledgeBase(entity);
  }

  private trackPerformancePattern(metric: string, value: number) {
    const patternId = `perf_${metric}`;
    const entity: KnowledgeEntity = {
      id: patternId,
      type: 'pattern',
      content: `Performance: ${metric} = ${value}`,
      confidence: 0.8,
      frequency: 1,
      lastUpdated: new Date(),
      sources: ['performance_monitoring'],
      relationships: [],
      metadata: { metric, value, timestamp: new Date() }
    };
    
    this.updateKnowledgeBase(entity);
  }

  private identifyOptimizationOpportunity(data: any) {
    const optimizationId = `optimization_${this.generateId()}`;
    const entity: KnowledgeEntity = {
      id: optimizationId,
      type: 'procedure',
      content: `Optimization needed: ${data.operation} is slow (${data.duration}ms)`,
      confidence: 0.7,
      frequency: 1,
      lastUpdated: new Date(),
      sources: ['performance_analysis'],
      relationships: [],
      metadata: data
    };
    
    this.updateKnowledgeBase(entity);
  }

  private learnFromError(errorData: any) {
    const errorId = `error_${this.generateId()}`;
    const entity: KnowledgeEntity = {
      id: errorId,
      type: 'fact',
      content: `Error: ${errorData.message || 'Unknown error'}`,
      confidence: 0.9,
      frequency: 1,
      lastUpdated: new Date(),
      sources: ['error_tracking'],
      relationships: [],
      metadata: errorData
    };
    
    this.updateKnowledgeBase(entity);
  }

  private updateErrorPattern(errorData: any) {
    const patternId = `error_pattern_${errorData.type || 'unknown'}`;
    const existing = this.patterns.get(patternId);
    
    if (existing) {
      existing.occurrences++;
      existing.lastSeen = new Date();
      existing.examples.push(errorData);
      if (existing.examples.length > 10) {
        existing.examples = existing.examples.slice(-10);
      }
    } else {
      this.patterns.set(patternId, {
        id: patternId,
        pattern: errorData.message || 'Unknown error pattern',
        occurrences: 1,
        confidence: 0.6,
        examples: [errorData],
        lastSeen: new Date()
      });
    }
  }

  private generatePreventiveKnowledge(errorData: any): KnowledgeEntity | null {
    // Generate knowledge to prevent similar errors
    if (!errorData.message) return null;
    
    const preventionId = `prevention_${this.generateId()}`;
    let preventionContent = `To prevent: ${errorData.message}`;
    
    // Add specific prevention based on error type
    if (errorData.message.includes('null')) {
      preventionContent += ' - Always check for null values';
    } else if (errorData.message.includes('undefined')) {
      preventionContent += ' - Ensure variables are defined before use';
    } else if (errorData.message.includes('timeout')) {
      preventionContent += ' - Increase timeout or optimize operation';
    }
    
    return {
      id: preventionId,
      type: 'procedure',
      content: preventionContent,
      confidence: 0.7,
      frequency: 1,
      lastUpdated: new Date(),
      sources: ['error_prevention'],
      relationships: [],
      metadata: { originalError: errorData }
    };
  }

  private updateInteractionPattern(event: LearningEvent) {
    const patternId = `interaction_${event.data.interactionType || 'unknown'}`;
    const entity: KnowledgeEntity = {
      id: patternId,
      type: 'pattern',
      content: `User interaction: ${event.data.interactionType}`,
      confidence: 0.6,
      frequency: 1,
      lastUpdated: new Date(),
      sources: ['interaction_tracking'],
      relationships: [],
      metadata: event.data
    };
    
    this.updateKnowledgeBase(entity);
  }

  private async indexDocument(documentData: any) {
    // Index document for future search
    const indexId = `index_${documentData.id || this.generateId()}`;
    const entity: KnowledgeEntity = {
      id: indexId,
      type: 'fact',
      content: documentData.title || documentData.name || 'Untitled document',
      confidence: 0.8,
      frequency: 1,
      lastUpdated: new Date(),
      sources: ['document_index'],
      relationships: [],
      metadata: {
        documentId: documentData.id,
        path: documentData.path,
        type: documentData.type,
        size: documentData.size
      }
    };
    
    this.updateKnowledgeBase(entity);
  }

  // Public API methods
  getKnowledgeStats() {
    return {
      totalEntities: this.knowledgeBase.size,
      totalPatterns: this.patterns.size,
      queueSize: this.learningQueue.length,
      averageConfidence: this.calculateAverageConfidence(),
      topPatterns: this.getTopPatterns(5),
      recentLearning: this.getRecentLearning(10)
    };
  }

  private calculateAverageConfidence(): number {
    if (this.knowledgeBase.size === 0) return 0;
    
    let totalConfidence = 0;
    this.knowledgeBase.forEach(entity => {
      totalConfidence += entity.confidence;
    });
    
    return totalConfidence / this.knowledgeBase.size;
  }

  private getTopPatterns(limit: number): LearningPattern[] {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, limit);
  }

  private getRecentLearning(limit: number): KnowledgeEntity[] {
    return Array.from(this.knowledgeBase.values())
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
      .slice(0, limit);
  }

  exportKnowledge(): string {
    return JSON.stringify({
      entities: Array.from(this.knowledgeBase.values()),
      patterns: Array.from(this.patterns.values()),
      stats: this.getKnowledgeStats(),
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  importKnowledge(data: string) {
    try {
      const imported = JSON.parse(data);
      
      // Import entities
      if (imported.entities) {
        imported.entities.forEach((entity: KnowledgeEntity) => {
          this.knowledgeBase.set(entity.id, {
            ...entity,
            lastUpdated: new Date(entity.lastUpdated)
          });
        });
      }
      
      // Import patterns
      if (imported.patterns) {
        imported.patterns.forEach((pattern: LearningPattern) => {
          this.patterns.set(pattern.id, {
            ...pattern,
            lastSeen: new Date(pattern.lastSeen)
          });
        });
      }
      
      this.emit('knowledge_imported', {
        entities: imported.entities?.length || 0,
        patterns: imported.patterns?.length || 0
      });
    } catch (error) {
      console.error('Error importing knowledge:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const continuousLearning = ContinuousLearningSystem.getInstance();

// React hook for easy integration
export function useContinuousLearning() {
  return {
    learn: (data: any, type?: LearningEvent['type'], metadata?: any) => 
      continuousLearning.learn(data, type, metadata),
    query: (question: string, context?: any) => 
      continuousLearning.query(question, context),
    getStats: () => continuousLearning.getKnowledgeStats(),
    exportKnowledge: () => continuousLearning.exportKnowledge(),
    importKnowledge: (data: string) => continuousLearning.importKnowledge(data)
  };
}