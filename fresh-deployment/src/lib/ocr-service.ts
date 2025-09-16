import { createWorker } from 'tesseract.js';
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

class OCRService {
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;

  async initialize(language = 'eng'): Promise<void> {
    if (this.isInitialized && this.worker) return;

    try {
      this.worker = await createWorker(language);
      this.isInitialized = true;
      console.log('OCR Worker initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      throw new Error('OCR service initialization failed');
    }
  }

  async processDocument(
    imageFile: File | string,
    documentType: IdentityDocumentType,
    options: OCRProcessingOptions = {}
  ): Promise<OCRExtractedData> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      if (!this.worker || !this.isInitialized) {
        await this.initialize();
      }

      if (!this.worker) {
        throw new Error('OCR worker not initialized');
      }

      // Process the image
      const result = await this.worker.recognize(imageFile);
      const processingTime = Date.now() - startTime;

      // Extract raw text
      const rawText = result.data.text.trim();
      const confidence = result.data.confidence / 100; // Convert to 0-1 scale

      // Extract structured data based on document type
      const extractedFields = this.extractStructuredData(rawText, documentType);

      // Validate extracted data if requested
      if (options.validateDocument) {
        const validationErrors = this.validateExtractedData(extractedFields, documentType);
        errors.push(...validationErrors);
      }

      // Create OCR result
      const ocrData: OCRExtractedData = {
        documentType,
        confidence,
        rawText,
        extractedFields,
        processingDate: Date.now(),
        originalImageUrl: typeof imageFile === 'string' ? imageFile : URL.createObjectURL(imageFile),
        errorLog: errors.length > 0 ? errors : undefined
      };

      return ocrData;

    } catch (error) {
      console.error('OCR processing error:', error);
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractStructuredData(text: string, documentType: IdentityDocumentType): Record<string, any> {
    const fields: Record<string, any> = {};

    switch (documentType) {
      case 'drivers_license':
        return this.extractDriversLicenseData(text);
      case 'state_id':
        return this.extractStateIdData(text);
      case 'passport':
        return this.extractPassportData(text);
      case 'visa':
        return this.extractVisaData(text);
      case 'work_permit':
        return this.extractWorkPermitData(text);
      case 'green_card':
        return this.extractGreenCardData(text);
      case 'social_security_card':
        return this.extractSSNData(text);
      case 'birth_certificate':
        return this.extractBirthCertificateData(text);
      default:
        return this.extractGenericData(text);
    }
  }

  private extractDriversLicenseData(text: string): Record<string, any> {
    const fields: Record<string, any> = {};

    // Extract name patterns
    const namePatterns = [
      /(?:NAME|FIRST|LAST)[:]*\s*([A-Z][A-Z\s]+)/gi,
      /^([A-Z][A-Z\s]+)$/gm
    ];

    for (const pattern of namePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        const nameParts = matches[0].replace(/^(NAME|FIRST|LAST)[:]*\s*/i, '').split(/\s+/);
        if (nameParts.length >= 2) {
          fields.firstName = nameParts[0];
          fields.lastName = nameParts.slice(1).join(' ');
        }
        break;
      }
    }

    // Extract date of birth
    const dobPatterns = [
      /(?:DOB|BIRTH|BD)[:]*\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g
    ];

    for (const pattern of dobPatterns) {
      const match = text.match(pattern);
      if (match) {
        fields.dateOfBirth = this.standardizeDate((match[1] || match[0]) as string);
        break;
      }
    }

    // Extract license number
    const licensePatterns = [
      /(?:LIC|LICENSE|DL)[:]*\s*([A-Z0-9]{5,15})/gi,
      /^([A-Z]\d{8,12})$/gm
    ];

    for (const pattern of licensePatterns) {
      const match = text.match(pattern);
      if (match) {
        fields.documentNumber = (match[1] || match[0]) as string;
        break;
      }
    }

    // Extract address
    const addressPattern = /(\d+\s+[A-Z\s]+(?:ST|STREET|AVE|AVENUE|RD|ROAD|BLVD|BOULEVARD|LN|LANE|CT|COURT|DR|DRIVE))/gi;
    const addressMatch = text.match(addressPattern);
    if (addressMatch) {
      fields.address = addressMatch[0];
    }

    // Extract city, state, zip
    const cityStateZipPattern = /([A-Z\s]+),?\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)/gi;
    const cityStateZipMatch = text.match(cityStateZipPattern);
    if (cityStateZipMatch) {
      const parts = cityStateZipMatch[0].split(/,?\s+/);
      if (parts.length >= 3) {
        fields.city = parts[0];
        fields.state = parts[parts.length - 2];
        fields.zipCode = parts[parts.length - 1];
      }
    }

    // Extract sex
    const sexPattern = /(?:SEX|GENDER)[:]*\s*([MF])/gi;
    const sexMatch = text.match(sexPattern);
    if (sexMatch) {
      fields.sex = sexMatch[1] as string;
    }

    // Extract height
    const heightPattern = /(?:HGT|HEIGHT)[:]*\s*(\d+(?:'\d+"?|\s*\d+))/gi;
    const heightMatch = text.match(heightPattern);
    if (heightMatch) {
      fields.height = heightMatch[1] as string;
    }

    // Extract expiration date
    const expPattern = /(?:EXP|EXPIRES?)[:]*\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi;
    const expMatch = text.match(expPattern);
    if (expMatch) {
      fields.expirationDate = this.standardizeDate(expMatch[1] || expMatch[0]);
    }

    return fields;
  }

  private extractStateIdData(text: string): Record<string, any> {
    // Similar to driver's license but without driving-specific fields
    return this.extractDriversLicenseData(text);
  }

  private extractPassportData(text: string): Record<string, any> {
    const fields: Record<string, any> = {};

    // Extract passport number
    const passportNumPattern = /(?:PASSPORT|NO)[:]*\s*([A-Z0-9]{6,12})/gi;
    const passportMatch = text.match(passportNumPattern);
    if (passportMatch) {
      fields.documentNumber = passportMatch[1];
    }

    // Extract name from passport (usually in specific format)
    const namePattern = /^([A-Z]+),?\s*([A-Z\s]+)$/gm;
    const nameMatch = text.match(namePattern);
    if (nameMatch) {
      const parts = nameMatch[0].split(/,\s*/);
      if (parts.length >= 2) {
        fields.lastName = parts[0];
        fields.firstName = parts[1];
      }
    }

    // Extract country of issue
    const countryPattern = /(?:COUNTRY|ISSUING)[:]*\s*([A-Z\s]{3,})/gi;
    const countryMatch = text.match(countryPattern);
    if (countryMatch) {
      fields.issuingAuthority = countryMatch[1];
      fields.country = countryMatch[1];
    }

    // Extract dates
    const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g;
    const dates = text.match(datePattern);
    if (dates && dates.length >= 2) {
      fields.issueDate = this.standardizeDate(dates[0]);
      fields.expirationDate = this.standardizeDate(dates[1]);
    }

    return fields;
  }

  private extractVisaData(text: string): Record<string, any> {
    const fields: Record<string, any> = {};

    // Extract visa number
    const visaNumPattern = /(?:VISA|NO)[:]*\s*([A-Z0-9]{8,15})/gi;
    const visaMatch = text.match(visaNumPattern);
    if (visaMatch) {
      fields.documentNumber = visaMatch[1];
    }

    // Extract visa type/category
    const visaTypePattern = /(?:TYPE|CATEGORY|CLASS)[:]*\s*([A-Z0-9\-]{1,10})/gi;
    const typeMatch = text.match(visaTypePattern);
    if (typeMatch) {
      fields.visaType = typeMatch[1];
    }

    // Extract dates
    const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g;
    const dates = text.match(datePattern);
    if (dates && dates.length >= 2) {
      fields.issueDate = this.standardizeDate(dates[0]);
      fields.expirationDate = this.standardizeDate(dates[1]);
    }

    return fields;
  }

  private extractWorkPermitData(text: string): Record<string, any> {
    const fields: Record<string, any> = {};

    // Extract USCIS number
    const uscisPattern = /(?:USCIS|A)[:]*\s*(\d{8,9})/gi;
    const uscisMatch = text.match(uscisPattern);
    if (uscisMatch) {
      fields.documentNumber = uscisMatch[1];
    }

    // Extract name
    const namePattern = /([A-Z][A-Z\s]+)/g;
    const nameMatches = text.match(namePattern);
    if (nameMatches && nameMatches.length >= 1) {
      const nameParts = nameMatches[0].split(/\s+/);
      if (nameParts.length >= 2) {
        fields.firstName = nameParts[0];
        fields.lastName = nameParts.slice(1).join(' ');
      }
    }

    return fields;
  }

  private extractGreenCardData(text: string): Record<string, any> {
    const fields: Record<string, any> = {};

    // Extract USCIS number (A-number)
    const anumberPattern = /A\s*(\d{8,9})/gi;
    const anumberMatch = text.match(anumberPattern);
    if (anumberMatch) {
      fields.documentNumber = anumberMatch[1];
    }

    return fields;
  }

  private extractSSNData(text: string): Record<string, any> {
    const fields: Record<string, any> = {};

    // Extract SSN
    const ssnPattern = /(\d{3}[\-\s]?\d{2}[\-\s]?\d{4})/g;
    const ssnMatch = text.match(ssnPattern);
    if (ssnMatch) {
      fields.documentNumber = ssnMatch[0].replace(/[\-\s]/g, '');
    }

    // Extract name
    const namePattern = /([A-Z][A-Z\s]+)/g;
    const nameMatches = text.match(namePattern);
    if (nameMatches && nameMatches.length >= 1) {
      const nameParts = nameMatches[0].split(/\s+/);
      if (nameParts.length >= 2) {
        fields.firstName = nameParts[0];
        fields.lastName = nameParts.slice(1).join(' ');
      }
    }

    return fields;
  }

  private extractBirthCertificateData(text: string): Record<string, any> {
    const fields: Record<string, any> = {};

    // Extract birth date
    const birthDatePattern = /(?:BORN|BIRTH)[:]*\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi;
    const birthMatch = text.match(birthDatePattern);
    if (birthMatch) {
      fields.dateOfBirth = this.standardizeDate(birthMatch[1]);
    }

    // Extract place of birth
    const placePattern = /(?:PLACE|BORN)[:]*\s*([A-Z\s,]+)/gi;
    const placeMatch = text.match(placePattern);
    if (placeMatch) {
      fields.birthPlace = placeMatch[1];
    }

    return fields;
  }

  private extractGenericData(text: string): Record<string, any> {
    const fields: Record<string, any> = {};

    // Extract any dates
    const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g;
    const dates = text.match(datePattern);
    if (dates) {
      fields.detectedDates = dates.map(d => this.standardizeDate(d));
    }

    // Extract any numbers that might be IDs
    const idPattern = /([A-Z0-9]{6,15})/g;
    const ids = text.match(idPattern);
    if (ids) {
      fields.detectedNumbers = ids;
    }

    // Extract potential names (capitalized words)
    const namePattern = /([A-Z][a-z]+\s+[A-Z][a-z]+)/g;
    const names = text.match(namePattern);
    if (names) {
      fields.detectedNames = names;
    }

    return fields;
  }

  private standardizeDate(dateStr: string): string {
    // Convert various date formats to YYYY-MM-DD
    const cleaned = dateStr.replace(/[\-\/]/g, '/');
    const date = new Date(cleaned);
    
    if (isNaN(date.getTime())) {
      return dateStr; // Return original if can't parse
    }

    return date.toISOString().split('T')[0];
  }

  private validateExtractedData(fields: Record<string, any>, documentType: IdentityDocumentType): string[] {
    const errors: string[] = [];

    // Common validations
    if (fields.dateOfBirth) {
      const birthDate = new Date(fields.dateOfBirth);
      const now = new Date();
      const age = now.getFullYear() - birthDate.getFullYear();
      
      if (age < 16 || age > 100) {
        errors.push('Unusual age detected - please verify date of birth');
      }
    }

    if (fields.expirationDate) {
      const expDate = new Date(fields.expirationDate);
      const now = new Date();
      
      if (expDate < now) {
        errors.push('Document appears to be expired');
      }
    }

    // Document-specific validations
    switch (documentType) {
      case 'drivers_license':
      case 'state_id':
        if (!fields.firstName || !fields.lastName) {
          errors.push('Name not clearly detected - please verify image quality');
        }
        if (!fields.documentNumber) {
          errors.push('License/ID number not detected');
        }
        break;

      case 'passport':
        if (!fields.documentNumber || fields.documentNumber.length < 6) {
          errors.push('Passport number not properly detected');
        }
        break;

      case 'social_security_card':
        if (!fields.documentNumber || !/^\d{9}$/.test(fields.documentNumber.replace(/[\-\s]/g, ''))) {
          errors.push('SSN format appears invalid');
        }
        break;
    }

    return errors;
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

export const ocrService = new OCRService();