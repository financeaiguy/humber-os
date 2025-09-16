import { createWorker } from 'tesseract.js';
class OCRService {
    constructor() {
        this.worker = null;
        this.isInitialized = false;
    }
    async initialize(language = 'eng') {
        if (this.isInitialized && this.worker)
            return;
        try {
            this.worker = await createWorker(language);
            this.isInitialized = true;
            console.log('OCR Worker initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize OCR worker:', error);
            throw new Error('OCR service initialization failed');
        }
    }
    async processDocument(imageFile, documentType, options = {}) {
        const startTime = Date.now();
        const errors = [];
        try {
            if (!this.worker || !this.isInitialized) {
                await this.initialize();
            }
            if (!this.worker) {
                throw new Error('OCR worker not initialized');
            }
            const result = await this.worker.recognize(imageFile);
            const processingTime = Date.now() - startTime;
            const rawText = result.data.text.trim();
            const confidence = result.data.confidence / 100;
            const extractedFields = this.extractStructuredData(rawText, documentType);
            if (options.validateDocument) {
                const validationErrors = this.validateExtractedData(extractedFields, documentType);
                errors.push(...validationErrors);
            }
            const ocrData = {
                documentType,
                confidence,
                rawText,
                extractedFields,
                processingDate: Date.now(),
                originalImageUrl: typeof imageFile === 'string' ? imageFile : URL.createObjectURL(imageFile),
                errorLog: errors.length > 0 ? errors : undefined
            };
            return ocrData;
        }
        catch (error) {
            console.error('OCR processing error:', error);
            throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    extractStructuredData(text, documentType) {
        const fields = {};
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
    extractDriversLicenseData(text) {
        const fields = {};
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
        const dobPatterns = [
            /(?:DOB|BIRTH|BD)[:]*\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
            /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g
        ];
        for (const pattern of dobPatterns) {
            const match = text.match(pattern);
            if (match) {
                fields.dateOfBirth = this.standardizeDate((match[1] || match[0]));
                break;
            }
        }
        const licensePatterns = [
            /(?:LIC|LICENSE|DL)[:]*\s*([A-Z0-9]{5,15})/gi,
            /^([A-Z]\d{8,12})$/gm
        ];
        for (const pattern of licensePatterns) {
            const match = text.match(pattern);
            if (match) {
                fields.documentNumber = (match[1] || match[0]);
                break;
            }
        }
        const addressPattern = /(\d+\s+[A-Z\s]+(?:ST|STREET|AVE|AVENUE|RD|ROAD|BLVD|BOULEVARD|LN|LANE|CT|COURT|DR|DRIVE))/gi;
        const addressMatch = text.match(addressPattern);
        if (addressMatch) {
            fields.address = addressMatch[0];
        }
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
        const sexPattern = /(?:SEX|GENDER)[:]*\s*([MF])/gi;
        const sexMatch = text.match(sexPattern);
        if (sexMatch) {
            fields.sex = sexMatch[1];
        }
        const heightPattern = /(?:HGT|HEIGHT)[:]*\s*(\d+(?:'\d+"?|\s*\d+))/gi;
        const heightMatch = text.match(heightPattern);
        if (heightMatch) {
            fields.height = heightMatch[1];
        }
        const expPattern = /(?:EXP|EXPIRES?)[:]*\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi;
        const expMatch = text.match(expPattern);
        if (expMatch) {
            fields.expirationDate = this.standardizeDate(expMatch[1] || expMatch[0]);
        }
        return fields;
    }
    extractStateIdData(text) {
        return this.extractDriversLicenseData(text);
    }
    extractPassportData(text) {
        const fields = {};
        const passportNumPattern = /(?:PASSPORT|NO)[:]*\s*([A-Z0-9]{6,12})/gi;
        const passportMatch = text.match(passportNumPattern);
        if (passportMatch) {
            fields.documentNumber = passportMatch[1];
        }
        const namePattern = /^([A-Z]+),?\s*([A-Z\s]+)$/gm;
        const nameMatch = text.match(namePattern);
        if (nameMatch) {
            const parts = nameMatch[0].split(/,\s*/);
            if (parts.length >= 2) {
                fields.lastName = parts[0];
                fields.firstName = parts[1];
            }
        }
        const countryPattern = /(?:COUNTRY|ISSUING)[:]*\s*([A-Z\s]{3,})/gi;
        const countryMatch = text.match(countryPattern);
        if (countryMatch) {
            fields.issuingAuthority = countryMatch[1];
            fields.country = countryMatch[1];
        }
        const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g;
        const dates = text.match(datePattern);
        if (dates && dates.length >= 2) {
            fields.issueDate = this.standardizeDate(dates[0]);
            fields.expirationDate = this.standardizeDate(dates[1]);
        }
        return fields;
    }
    extractVisaData(text) {
        const fields = {};
        const visaNumPattern = /(?:VISA|NO)[:]*\s*([A-Z0-9]{8,15})/gi;
        const visaMatch = text.match(visaNumPattern);
        if (visaMatch) {
            fields.documentNumber = visaMatch[1];
        }
        const visaTypePattern = /(?:TYPE|CATEGORY|CLASS)[:]*\s*([A-Z0-9\-]{1,10})/gi;
        const typeMatch = text.match(visaTypePattern);
        if (typeMatch) {
            fields.visaType = typeMatch[1];
        }
        const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g;
        const dates = text.match(datePattern);
        if (dates && dates.length >= 2) {
            fields.issueDate = this.standardizeDate(dates[0]);
            fields.expirationDate = this.standardizeDate(dates[1]);
        }
        return fields;
    }
    extractWorkPermitData(text) {
        const fields = {};
        const uscisPattern = /(?:USCIS|A)[:]*\s*(\d{8,9})/gi;
        const uscisMatch = text.match(uscisPattern);
        if (uscisMatch) {
            fields.documentNumber = uscisMatch[1];
        }
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
    extractGreenCardData(text) {
        const fields = {};
        const anumberPattern = /A\s*(\d{8,9})/gi;
        const anumberMatch = text.match(anumberPattern);
        if (anumberMatch) {
            fields.documentNumber = anumberMatch[1];
        }
        return fields;
    }
    extractSSNData(text) {
        const fields = {};
        const ssnPattern = /(\d{3}[\-\s]?\d{2}[\-\s]?\d{4})/g;
        const ssnMatch = text.match(ssnPattern);
        if (ssnMatch) {
            fields.documentNumber = ssnMatch[0].replace(/[\-\s]/g, '');
        }
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
    extractBirthCertificateData(text) {
        const fields = {};
        const birthDatePattern = /(?:BORN|BIRTH)[:]*\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi;
        const birthMatch = text.match(birthDatePattern);
        if (birthMatch) {
            fields.dateOfBirth = this.standardizeDate(birthMatch[1]);
        }
        const placePattern = /(?:PLACE|BORN)[:]*\s*([A-Z\s,]+)/gi;
        const placeMatch = text.match(placePattern);
        if (placeMatch) {
            fields.birthPlace = placeMatch[1];
        }
        return fields;
    }
    extractGenericData(text) {
        const fields = {};
        const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g;
        const dates = text.match(datePattern);
        if (dates) {
            fields.detectedDates = dates.map(d => this.standardizeDate(d));
        }
        const idPattern = /([A-Z0-9]{6,15})/g;
        const ids = text.match(idPattern);
        if (ids) {
            fields.detectedNumbers = ids;
        }
        const namePattern = /([A-Z][a-z]+\s+[A-Z][a-z]+)/g;
        const names = text.match(namePattern);
        if (names) {
            fields.detectedNames = names;
        }
        return fields;
    }
    standardizeDate(dateStr) {
        const cleaned = dateStr.replace(/[\-\/]/g, '/');
        const date = new Date(cleaned);
        if (isNaN(date.getTime())) {
            return dateStr;
        }
        return date.toISOString().split('T')[0];
    }
    validateExtractedData(fields, documentType) {
        const errors = [];
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
    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
            this.isInitialized = false;
        }
    }
}
export const ocrService = new OCRService();
//# sourceMappingURL=ocr-service.js.map