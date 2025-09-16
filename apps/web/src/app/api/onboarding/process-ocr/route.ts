import { NextRequest, NextResponse } from 'next/server';
import { ocrService } from '@/lib/ocr-service';
import { IdentityDocumentType } from '@humber/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as IdentityDocumentType;
    const tenantId = formData.get('tenantId') as string;
    const onboardingId = formData.get('onboardingId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!documentType) {
      return NextResponse.json(
        { error: 'Document type is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are supported' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Process the document with OCR
    const startTime = Date.now();
    const ocrResult = await ocrService.processDocument(file, documentType, {
      extractText: true,
      extractStructuredData: true,
      validateDocument: true,
      detectForgery: false // Could implement this later
    });

    const processingTime = Date.now() - startTime;

    // Store the result (you would typically save this to your database)
    const result = {
      success: true,
      data: ocrResult,
      processingTime,
      metadata: {
        tenantId,
        onboardingId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        processedAt: new Date().toISOString()
      }
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('OCR processing error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'OCR processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const onboardingId = searchParams.get('onboardingId');
  const tenantId = searchParams.get('tenantId');

  if (!onboardingId || !tenantId) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    // TODO: Retrieve OCR results from database
    // This would fetch previously processed documents for the onboarding process
    
    const results = {
      onboardingId,
      tenantId,
      documents: [], // Would contain processed document results
      totalDocuments: 0,
      processedDocuments: 0,
      verifiedDocuments: 0,
      failedDocuments: 0
    };

    return NextResponse.json(results);

  } catch (error) {
    console.error('Error retrieving OCR results:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve OCR results' },
      { status: 500 }
    );
  }
}