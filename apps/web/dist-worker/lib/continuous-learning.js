import { EventEmitter } from 'events';
class ContinuousLearningSystem extends EventEmitter {
    constructor() {
        super();
        this.knowledgeBase = new Map();
        this.learningQueue = [];
        this.patterns = new Map();
        this.isProcessing = false;
        this.learningRate = 0.1;
        this.confidenceThreshold = 0.7;
        this.config = {
            batchSize: 100,
            processingInterval: 5000,
            minConfidence: 0.5,
            maxQueueSize: 10000,
            retentionPeriod: 90 * 24 * 60 * 60 * 1000,
            learningModes: ['supervised', 'unsupervised', 'reinforcement'],
            autoIndexing: true,
            semanticAnalysis: true,
            patternRecognition: true,
            anomalyDetection: true
        };
        this.initializeLearningSystem();
    }
    static getInstance() {
        if (!ContinuousLearningSystem.instance) {
            ContinuousLearningSystem.instance = new ContinuousLearningSystem();
        }
        return ContinuousLearningSystem.instance;
    }
    initializeLearningSystem() {
        setInterval(() => this.processLearningQueue(), this.config.processingInterval);
        this.setupDataCollectors();
        this.initializePatternRecognition();
        console.log('🧠 Continuous Learning System initialized');
    }
    setupDataCollectors() {
        if (typeof window !== 'undefined') {
            document.addEventListener('click', (e) => {
                this.captureInteraction('click', {
                    element: e.target?.tagName,
                    text: e.target?.textContent?.substring(0, 100),
                    path: e.composedPath().map((el) => el.tagName).filter(Boolean).join(' > ')
                });
            });
            document.addEventListener('submit', (e) => {
                const form = e.target;
                this.captureInteraction('form_submit', {
                    formId: form.id,
                    action: form.action,
                    method: form.method
                });
            });
            document.addEventListener('input', (e) => {
                const input = e.target;
                if (input.type === 'search' || input.name?.includes('search')) {
                    this.captureInteraction('search', {
                        query: input.value,
                        field: input.name
                    });
                }
            });
            window.addEventListener('popstate', () => {
                this.captureInteraction('navigation', {
                    url: window.location.href,
                    title: document.title
                });
            });
            window.addEventListener('error', (e) => {
                this.captureError(e.error);
            });
        }
    }
    initializePatternRecognition() {
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
    async learn(data, type = 'interaction', metadata) {
        try {
            const event = {
                id: this.generateId(),
                timestamp: new Date(),
                type,
                source: this.detectSource(data),
                data,
                metadata,
                confidence: this.calculateConfidence(data)
            };
            this.learningQueue.push(event);
            this.emit('learning', event);
            if (this.learningQueue.length >= this.config.batchSize) {
                this.processLearningQueue();
            }
        }
        catch (error) {
            console.debug('Learning error:', error);
        }
    }
    async processLearningQueue() {
        if (this.isProcessing || this.learningQueue.length === 0)
            return;
        this.isProcessing = true;
        const batch = this.learningQueue.splice(0, this.config.batchSize);
        try {
            for (const event of batch) {
                await this.processLearningEvent(event);
            }
            this.updatePatterns(batch);
            this.consolidateKnowledge();
            this.emit('batch_processed', { count: batch.length });
        }
        catch (error) {
            console.error('Error processing learning batch:', error);
            this.emit('error', error);
        }
        finally {
            this.isProcessing = false;
        }
    }
    async processLearningEvent(event) {
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
        const entities = this.extractEntities(event);
        entities.forEach(entity => this.updateKnowledgeBase(entity));
        this.detectPatterns(event);
    }
    async processInteraction(event) {
        const { data } = event;
        if (data.element === 'BUTTON' || data.element === 'A') {
            this.learnUserPreference('navigation', data.text, event.userId);
        }
        if (data.sequence) {
            this.learnWorkflow(data.sequence, event.userId);
        }
        this.updateInteractionPattern(event);
    }
    async processDocument(event) {
        const { data } = event;
        const concepts = this.extractConcepts(data.content || data.text);
        concepts.forEach(concept => {
            const entity = {
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
        if (this.config.autoIndexing) {
            await this.indexDocument(data);
        }
    }
    async processQuery(event) {
        const { data } = event;
        this.learnQueryPattern(data.query, data.results);
        if (data.successful) {
            this.improveQueryUnderstanding(data.query, data.results);
        }
        this.storeQueryExample(event);
    }
    async processFeedback(event) {
        const { data } = event;
        if (data.targetId && data.rating) {
            const entity = this.knowledgeBase.get(data.targetId);
            if (entity) {
                entity.confidence = this.adjustConfidence(entity.confidence, data.rating);
                this.knowledgeBase.set(data.targetId, entity);
            }
        }
        if (data.correction) {
            this.learnFromCorrection(data.original, data.correction);
        }
    }
    async processPerformance(event) {
        const { data } = event;
        if (data.metric && data.value) {
            this.trackPerformancePattern(data.metric, data.value);
        }
        if (data.slow) {
            this.identifyOptimizationOpportunity(data);
        }
    }
    async processError(event) {
        const { data } = event;
        this.learnFromError(data);
        this.updateErrorPattern(data);
        const prevention = this.generatePreventiveKnowledge(data);
        if (prevention) {
            this.updateKnowledgeBase(prevention);
        }
    }
    extractEntities(event) {
        const entities = [];
        const data = event.data;
        if (typeof data === 'string') {
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
        }
        else if (typeof data === 'object') {
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
    extractConcepts(text) {
        if (!text)
            return [];
        const concepts = [];
        const capitalizedPhrases = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
        concepts.push(...capitalizedPhrases);
        const technicalTerms = text.match(/\b(?:API|SDK|UI|UX|AI|ML|RBAC|CRUD|REST|SQL)\b/gi) || [];
        concepts.push(...technicalTerms);
        const quotedText = text.match(/"([^"]+)"|'([^']+)'/g) || [];
        concepts.push(...quotedText.map(q => q.replace(/["']/g, '')));
        return [...new Set(concepts)];
    }
    detectPatterns(event) {
        const eventStr = JSON.stringify(event.data).toLowerCase();
        this.patterns.forEach((pattern, name) => {
            const regex = new RegExp(pattern.pattern, 'i');
            if (regex.test(eventStr)) {
                pattern.occurrences++;
                pattern.lastSeen = new Date();
                pattern.examples.push(event.data);
                if (pattern.examples.length > 10) {
                    pattern.examples = pattern.examples.slice(-10);
                }
                pattern.confidence = Math.min(0.95, pattern.occurrences / 100);
                this.patterns.set(name, pattern);
                this.emit('pattern_detected', { name, pattern, event });
            }
        });
    }
    updateKnowledgeBase(entity) {
        const existing = this.knowledgeBase.get(entity.id);
        if (existing) {
            existing.frequency++;
            existing.confidence = this.adjustConfidence(existing.confidence, entity.confidence);
            existing.lastUpdated = new Date();
            existing.sources = [...new Set([...existing.sources, ...entity.sources])];
            existing.relationships = [...new Set([...existing.relationships, ...entity.relationships])];
            Object.assign(existing.metadata, entity.metadata);
            this.knowledgeBase.set(entity.id, existing);
        }
        else {
            this.knowledgeBase.set(entity.id, entity);
        }
        this.emit('knowledge_updated', entity);
    }
    consolidateKnowledge() {
        this.knowledgeBase.forEach((entity, id) => {
            if (entity.confidence < this.config.minConfidence) {
                this.knowledgeBase.delete(id);
            }
        });
        const entities = Array.from(this.knowledgeBase.values());
        entities.forEach((entity1, i) => {
            entities.slice(i + 1).forEach(entity2 => {
                if (this.areSimilar(entity1, entity2)) {
                    this.mergeEntities(entity1, entity2);
                }
            });
        });
        this.updateRelationships();
    }
    updatePatterns(batch) {
        const sequences = [];
        batch.forEach((event, i) => {
            if (i < batch.length - 1) {
                const sequence = [event.type, batch[i + 1].type];
                sequences.push(sequence);
            }
        });
        const frequentSequences = this.findFrequentSequences(sequences);
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
    learnUserPreference(type, value, userId) {
        const preferenceId = `pref_${type}_${userId || 'anonymous'}`;
        const entity = {
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
    learnWorkflow(sequence, userId) {
        const workflowId = `workflow_${sequence.join('_')}`;
        const entity = {
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
    async query(question, context) {
        await this.learn({ query: question, context }, 'query');
        const results = [];
        const queryLower = question.toLowerCase();
        this.knowledgeBase.forEach(entity => {
            const contentLower = entity.content.toLowerCase();
            if (contentLower.includes(queryLower) || this.isRelevant(question, entity)) {
                results.push(entity);
            }
        });
        results.sort((a, b) => {
            const scoreA = a.confidence * a.frequency;
            const scoreB = b.confidence * b.frequency;
            return scoreB - scoreA;
        });
        const response = this.generateResponse(question, results.slice(0, 5));
        await this.learn({
            query: question,
            results: response,
            successful: results.length > 0
        }, 'query');
        return response;
    }
    generateResponse(question, entities) {
        if (entities.length === 0) {
            return {
                answer: "I don't have enough information to answer that question yet, but I'm learning!",
                confidence: 0,
                sources: []
            };
        }
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
    captureInteraction(type, data) {
        this.learn({
            interactionType: type,
            ...data,
            timestamp: new Date().toISOString(),
            url: window.location.href
        }, 'interaction');
    }
    captureError(error) {
        this.learn({
            message: error?.message || 'Unknown error',
            stack: error?.stack,
            timestamp: new Date().toISOString(),
            url: window.location.href
        }, 'error');
    }
    generateId() {
        return `kn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    detectSource(data) {
        if (data.source)
            return data.source;
        if (data.url) {
            try {
                if (typeof data.url === 'string') {
                    if (data.url.startsWith('/')) {
                        return data.url;
                    }
                    const url = new URL(data.url, window.location.origin);
                    return url.pathname;
                }
            }
            catch (error) {
                console.warn('Invalid URL in continuous learning:', data.url);
                if (typeof data.url === 'string' && data.url.includes('/')) {
                    return data.url.split('/').pop() || 'unknown';
                }
            }
        }
        if (data.type)
            return data.type;
        return 'unknown';
    }
    calculateConfidence(data) {
        let confidence = this.config.minConfidence;
        if (data.verified)
            confidence += 0.2;
        if (data.source)
            confidence += 0.1;
        if (data.timestamp)
            confidence += 0.1;
        if (data.userId)
            confidence += 0.1;
        return Math.min(1, confidence);
    }
    adjustConfidence(current, adjustment) {
        const newConfidence = current + (adjustment * this.learningRate);
        return Math.max(0, Math.min(1, newConfidence));
    }
    isSignificant(key, value) {
        const insignificantKeys = ['id', 'timestamp', 'created', 'updated', '_id'];
        if (insignificantKeys.includes(key.toLowerCase()))
            return false;
        if (value === null || value === undefined || value === '')
            return false;
        if (typeof value === 'string' && value.length < 3)
            return false;
        return true;
    }
    isRelevant(question, entity) {
        const questionWords = question.toLowerCase().split(/\s+/);
        const entityWords = entity.content.toLowerCase().split(/\s+/);
        const commonWords = questionWords.filter(word => entityWords.includes(word));
        const relevanceScore = commonWords.length / questionWords.length;
        return relevanceScore > 0.3;
    }
    areSimilar(entity1, entity2) {
        if (entity1.type !== entity2.type)
            return false;
        const content1 = entity1.content.toLowerCase();
        const content2 = entity2.content.toLowerCase();
        const words1 = new Set(content1.split(/\s+/));
        const words2 = new Set(content2.split(/\s+/));
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        const similarity = intersection.size / union.size;
        return similarity > 0.7;
    }
    mergeEntities(entity1, entity2) {
        entity1.frequency += entity2.frequency;
        entity1.confidence = Math.max(entity1.confidence, entity2.confidence);
        entity1.sources = [...new Set([...entity1.sources, ...entity2.sources])];
        entity1.relationships = [...new Set([...entity1.relationships, ...entity2.relationships])];
        Object.assign(entity1.metadata, entity2.metadata);
        entity1.lastUpdated = new Date();
        this.knowledgeBase.delete(entity2.id);
    }
    updateRelationships() {
        const entities = Array.from(this.knowledgeBase.values());
        entities.forEach(entity => {
            const related = entities.filter(e => e.id !== entity.id &&
                this.areRelated(entity, e));
            entity.relationships = related.map(e => e.id);
        });
    }
    areRelated(entity1, entity2) {
        if (entity1.sources.some(s => entity2.sources.includes(s)))
            return true;
        if (entity1.content.includes(entity2.content) || entity2.content.includes(entity1.content))
            return true;
        return false;
    }
    findFrequentSequences(sequences) {
        const sequenceCount = new Map();
        sequences.forEach(seq => {
            const key = seq.join('->');
            sequenceCount.set(key, (sequenceCount.get(key) || 0) + 1);
        });
        return Array.from(sequenceCount.entries())
            .filter(([_, count]) => count > 1)
            .map(([key, _]) => key.split('->'));
    }
    learnQueryPattern(query, results) {
        const patternId = `query_pattern_${this.generateId()}`;
        const entity = {
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
    improveQueryUnderstanding(query, results) {
        const features = this.extractQueryFeatures(query);
        features.forEach(feature => {
            const entity = {
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
    extractQueryFeatures(query) {
        const features = [];
        if (query.length < 20)
            features.push('short_query');
        else if (query.length > 100)
            features.push('long_query');
        else
            features.push('medium_query');
        if (/^(what|who|when|where|why|how)/i.test(query))
            features.push('question_word');
        if (/\b(API|database|function|class|method)\b/i.test(query))
            features.push('technical_query');
        return features;
    }
    storeQueryExample(event) {
        if (event.data.successful) {
            const exampleId = `query_example_${this.generateId()}`;
            const entity = {
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
    learnFromCorrection(original, correction) {
        const correctionId = `correction_${this.generateId()}`;
        const entity = {
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
    trackPerformancePattern(metric, value) {
        const patternId = `perf_${metric}`;
        const entity = {
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
    identifyOptimizationOpportunity(data) {
        const optimizationId = `optimization_${this.generateId()}`;
        const entity = {
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
    learnFromError(errorData) {
        const errorId = `error_${this.generateId()}`;
        const entity = {
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
    updateErrorPattern(errorData) {
        const patternId = `error_pattern_${errorData.type || 'unknown'}`;
        const existing = this.patterns.get(patternId);
        if (existing) {
            existing.occurrences++;
            existing.lastSeen = new Date();
            existing.examples.push(errorData);
            if (existing.examples.length > 10) {
                existing.examples = existing.examples.slice(-10);
            }
        }
        else {
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
    generatePreventiveKnowledge(errorData) {
        if (!errorData.message)
            return null;
        const preventionId = `prevention_${this.generateId()}`;
        let preventionContent = `To prevent: ${errorData.message}`;
        if (errorData.message.includes('null')) {
            preventionContent += ' - Always check for null values';
        }
        else if (errorData.message.includes('undefined')) {
            preventionContent += ' - Ensure variables are defined before use';
        }
        else if (errorData.message.includes('timeout')) {
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
    updateInteractionPattern(event) {
        const patternId = `interaction_${event.data.interactionType || 'unknown'}`;
        const entity = {
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
    async indexDocument(documentData) {
        const indexId = `index_${documentData.id || this.generateId()}`;
        const entity = {
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
    calculateAverageConfidence() {
        if (this.knowledgeBase.size === 0)
            return 0;
        let totalConfidence = 0;
        this.knowledgeBase.forEach(entity => {
            totalConfidence += entity.confidence;
        });
        return totalConfidence / this.knowledgeBase.size;
    }
    getTopPatterns(limit) {
        return Array.from(this.patterns.values())
            .sort((a, b) => b.occurrences - a.occurrences)
            .slice(0, limit);
    }
    getRecentLearning(limit) {
        return Array.from(this.knowledgeBase.values())
            .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
            .slice(0, limit);
    }
    exportKnowledge() {
        return JSON.stringify({
            entities: Array.from(this.knowledgeBase.values()),
            patterns: Array.from(this.patterns.values()),
            stats: this.getKnowledgeStats(),
            timestamp: new Date().toISOString()
        }, null, 2);
    }
    importKnowledge(data) {
        try {
            const imported = JSON.parse(data);
            if (imported.entities) {
                imported.entities.forEach((entity) => {
                    this.knowledgeBase.set(entity.id, {
                        ...entity,
                        lastUpdated: new Date(entity.lastUpdated)
                    });
                });
            }
            if (imported.patterns) {
                imported.patterns.forEach((pattern) => {
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
        }
        catch (error) {
            console.error('Error importing knowledge:', error);
            throw error;
        }
    }
}
export const continuousLearning = ContinuousLearningSystem.getInstance();
export function useContinuousLearning() {
    return {
        learn: (data, type, metadata) => continuousLearning.learn(data, type, metadata),
        query: (question, context) => continuousLearning.query(question, context),
        getStats: () => continuousLearning.getKnowledgeStats(),
        exportKnowledge: () => continuousLearning.exportKnowledge(),
        importKnowledge: (data) => continuousLearning.importKnowledge(data)
    };
}
//# sourceMappingURL=continuous-learning.js.map