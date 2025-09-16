import { EventEmitter } from 'events';
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
declare class ContinuousLearningSystem extends EventEmitter {
    private static instance;
    private knowledgeBase;
    private learningQueue;
    private patterns;
    private isProcessing;
    private learningRate;
    private confidenceThreshold;
    private config;
    private constructor();
    static getInstance(): ContinuousLearningSystem;
    private initializeLearningSystem;
    private setupDataCollectors;
    private initializePatternRecognition;
    learn(data: any, type?: LearningEvent['type'], metadata?: any): Promise<void>;
    private processLearningQueue;
    private processLearningEvent;
    private processInteraction;
    private processDocument;
    private processQuery;
    private processFeedback;
    private processPerformance;
    private processError;
    private extractEntities;
    private extractConcepts;
    private detectPatterns;
    private updateKnowledgeBase;
    private consolidateKnowledge;
    private updatePatterns;
    private learnUserPreference;
    private learnWorkflow;
    query(question: string, context?: any): Promise<any>;
    private generateResponse;
    private captureInteraction;
    private captureError;
    private generateId;
    private detectSource;
    private calculateConfidence;
    private adjustConfidence;
    private isSignificant;
    private isRelevant;
    private areSimilar;
    private mergeEntities;
    private updateRelationships;
    private areRelated;
    private findFrequentSequences;
    private learnQueryPattern;
    private improveQueryUnderstanding;
    private extractQueryFeatures;
    private storeQueryExample;
    private learnFromCorrection;
    private trackPerformancePattern;
    private identifyOptimizationOpportunity;
    private learnFromError;
    private updateErrorPattern;
    private generatePreventiveKnowledge;
    private updateInteractionPattern;
    private indexDocument;
    getKnowledgeStats(): {
        totalEntities: number;
        totalPatterns: number;
        queueSize: number;
        averageConfidence: number;
        topPatterns: LearningPattern[];
        recentLearning: KnowledgeEntity[];
    };
    private calculateAverageConfidence;
    private getTopPatterns;
    private getRecentLearning;
    exportKnowledge(): string;
    importKnowledge(data: string): void;
}
export declare const continuousLearning: ContinuousLearningSystem;
export declare function useContinuousLearning(): {
    learn: (data: any, type?: LearningEvent["type"], metadata?: any) => Promise<void>;
    query: (question: string, context?: any) => Promise<any>;
    getStats: () => {
        totalEntities: number;
        totalPatterns: number;
        queueSize: number;
        averageConfidence: number;
        topPatterns: LearningPattern[];
        recentLearning: KnowledgeEntity[];
    };
    exportKnowledge: () => string;
    importKnowledge: (data: string) => void;
};
export {};
//# sourceMappingURL=continuous-learning.d.ts.map