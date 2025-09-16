import { IdentityDocumentType, OCRExtractedData } from '@humber/types';
export interface OCRProcessingOptions {
    extractText?: boolean;
    extractStructuredData?: boolean;
    validateDocument?: boolean;
    detectForgery?: boolean;
    language?: string;
}
export interface OCRResult {
    confidence: number;
    rawText: string;
    extractedFields: Record<string, any>;
    boundingBoxes?: any[];
    processingTime: number;
    errorLog?: string[];
}
declare class OCRService {
    private worker;
    private isInitialized;
    initialize(language?: string): Promise<void>;
    processDocument(imageFile: File | string, documentType: IdentityDocumentType, options?: OCRProcessingOptions): Promise<OCRExtractedData>;
    private extractStructuredData;
    private extractDriversLicenseData;
    private extractStateIdData;
    private extractPassportData;
    private extractVisaData;
    private extractWorkPermitData;
    private extractGreenCardData;
    private extractSSNData;
    private extractBirthCertificateData;
    private extractGenericData;
    private standardizeDate;
    private validateExtractedData;
    terminate(): Promise<void>;
}
export declare const ocrService: OCRService;
export {};
//# sourceMappingURL=ocr-service.d.ts.map