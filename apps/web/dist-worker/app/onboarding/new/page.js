'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { User, MapPin, FileText, Upload, Globe, Clock, Shield, CheckCircle, Scan, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
const documentTypes = [
    { value: 'drivers_license', label: 'Driver\'s License' },
    { value: 'state_id', label: 'State ID' },
    { value: 'passport', label: 'Passport' },
    { value: 'visa', label: 'Visa' },
    { value: 'work_permit', label: 'Work Permit' },
    { value: 'green_card', label: 'Green Card' },
    { value: 'social_security_card', label: 'Social Security Card' },
    { value: 'birth_certificate', label: 'Birth Certificate' }
];
const visaStatuses = [
    { value: 'citizen', label: 'Citizen' },
    { value: 'permanent_resident', label: 'Permanent Resident' },
    { value: 'work_visa', label: 'Work Visa' },
    { value: 'student_visa', label: 'Student Visa' },
    { value: 'tourist_visa', label: 'Tourist Visa' },
    { value: 'asylum', label: 'Asylum' },
    { value: 'refugee', label: 'Refugee' },
    { value: 'pending', label: 'Pending' },
    { value: 'expired', label: 'Expired' },
    { value: 'none_required', label: 'None Required' }
];
const engineerCategories = [
    { value: 'ELECTRICAL_ENGINEER', label: 'Electrical Engineer' },
    { value: 'MECHANICAL_ENGINEER', label: 'Mechanical Engineer' },
    { value: 'SOFTWARE_ENGINEER', label: 'Software Engineer' },
    { value: 'SYSTEMS_ENGINEER', label: 'Systems Engineer' },
    { value: 'PROJECT_ENGINEER', label: 'Project Engineer' }
];
export default function NewOnboardingPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [uploadedDocuments, setUploadedDocuments] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        identityDocuments: [],
        skills: [],
        previousEmployers: []
    });
    const handleFileUpload = useCallback((files, documentType) => {
        if (!files)
            return;
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const newDocument = {
                        id: Math.random().toString(36).substr(2, 9),
                        file,
                        type: documentType,
                        preview: e.target?.result,
                        ocrProcessed: false
                    };
                    setUploadedDocuments(prev => [...prev, newDocument]);
                };
                reader.readAsDataURL(file);
            }
        });
    }, []);
    const processOCR = async (documentId) => {
        setIsProcessing(true);
        try {
            const document = uploadedDocuments.find(doc => doc.id === documentId);
            if (!document) {
                throw new Error('Document not found');
            }
            const formData = new FormData();
            formData.append('file', document.file);
            formData.append('documentType', document.type);
            formData.append('tenantId', 'default');
            formData.append('onboardingId', 'temp-' + Date.now());
            const response = await fetch('/api/onboarding/process-ocr', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                throw new Error('OCR processing failed');
            }
            const result = await response.json();
            if (result.success) {
                setUploadedDocuments(prev => prev.map(doc => doc.id === documentId
                    ? {
                        ...doc,
                        ocrProcessed: true,
                        ocrData: result.data
                    }
                    : doc));
                if (result.data.extractedFields) {
                    const fields = result.data.extractedFields;
                    setFormData(prev => ({
                        ...prev,
                        firstName: prev.firstName || fields.firstName,
                        lastName: prev.lastName || fields.lastName,
                        dateOfBirth: prev.dateOfBirth || fields.dateOfBirth,
                        currentLocation: {
                            ...prev.currentLocation,
                            address: prev.currentLocation?.address || fields.address,
                            city: prev.currentLocation?.city || fields.city,
                            state: prev.currentLocation?.state || fields.state,
                            zipCode: prev.currentLocation?.zipCode || fields.zipCode,
                            country: prev.currentLocation?.country || fields.country || 'US'
                        }
                    }));
                }
            }
            else {
                throw new Error(result.error || 'OCR processing failed');
            }
        }
        catch (error) {
            console.error('OCR processing failed:', error);
            alert('OCR processing failed. Please try again or enter information manually.');
        }
        setIsProcessing(false);
    };
    const removeDocument = (documentId) => {
        setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
    };
    const steps = [
        { number: 1, title: 'Personal Information', icon: User },
        { number: 2, title: 'Location & Travel', icon: MapPin },
        { number: 3, title: 'Passport & Visa', icon: Globe },
        { number: 4, title: 'Identity Documents', icon: FileText },
        { number: 5, title: 'Skills & Experience', icon: Shield },
        { number: 6, title: 'Availability', icon: Clock },
        { number: 7, title: 'Review & Submit', icon: CheckCircle }
    ];
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "First Name" }), _jsx(Input, { placeholder: "Enter first name", className: "bg-slate-800 border-slate-600 text-white", value: formData.firstName || '', onChange: (e) => setFormData(prev => ({ ...prev, firstName: e.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Last Name" }), _jsx(Input, { placeholder: "Enter last name", className: "bg-slate-800 border-slate-600 text-white", value: formData.lastName || '', onChange: (e) => setFormData(prev => ({ ...prev, lastName: e.target.value })) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Email" }), _jsx(Input, { type: "email", placeholder: "Enter email address", className: "bg-slate-800 border-slate-600 text-white", value: formData.email || '', onChange: (e) => setFormData(prev => ({ ...prev, email: e.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Phone" }), _jsx(Input, { placeholder: "Enter phone number", className: "bg-slate-800 border-slate-600 text-white", value: formData.phone || '', onChange: (e) => setFormData(prev => ({ ...prev, phone: e.target.value })) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Date of Birth" }), _jsx(Input, { type: "date", className: "bg-slate-800 border-slate-600 text-white", value: formData.dateOfBirth || '', onChange: (e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Engineer Category" }), _jsxs(Select, { value: formData.category, onValueChange: (value) => setFormData(prev => ({ ...prev, category: value })), children: [_jsx(SelectTrigger, { className: "bg-slate-800 border-slate-600 text-white", children: _jsx(SelectValue, { placeholder: "Select category" }) }), _jsx(SelectContent, { children: engineerCategories.map(cat => (_jsx(SelectItem, { value: cat.value, children: cat.label }, cat.value))) })] })] })] })] }));
            case 2:
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "Current Location" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Address" }), _jsx(Input, { placeholder: "Street address", className: "bg-slate-800 border-slate-600 text-white", value: formData.currentLocation?.address || '', onChange: (e) => setFormData(prev => ({
                                                        ...prev,
                                                        currentLocation: { ...prev.currentLocation, address: e.target.value }
                                                    })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "City" }), _jsx(Input, { placeholder: "City", className: "bg-slate-800 border-slate-600 text-white", value: formData.currentLocation?.city || '', onChange: (e) => setFormData(prev => ({
                                                        ...prev,
                                                        currentLocation: { ...prev.currentLocation, city: e.target.value }
                                                    })) })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4 mt-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "State/Province" }), _jsx(Input, { placeholder: "State", className: "bg-slate-800 border-slate-600 text-white", value: formData.currentLocation?.state || '', onChange: (e) => setFormData(prev => ({
                                                        ...prev,
                                                        currentLocation: { ...prev.currentLocation, state: e.target.value }
                                                    })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "ZIP Code" }), _jsx(Input, { placeholder: "ZIP Code", className: "bg-slate-800 border-slate-600 text-white", value: formData.currentLocation?.zipCode || '', onChange: (e) => setFormData(prev => ({
                                                        ...prev,
                                                        currentLocation: { ...prev.currentLocation, zipCode: e.target.value }
                                                    })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Country" }), _jsx(Input, { placeholder: "Country", className: "bg-slate-800 border-slate-600 text-white", value: formData.currentLocation?.country || '', onChange: (e) => setFormData(prev => ({
                                                        ...prev,
                                                        currentLocation: { ...prev.currentLocation, country: e.target.value }
                                                    })) })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { className: "text-sm font-medium text-slate-300", children: "Willing to Relocate" }), _jsx(Switch, { checked: formData.willingToRelocate || false, onCheckedChange: (checked) => setFormData(prev => ({ ...prev, willingToRelocate: checked })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Maximum Travel Distance (miles)" }), _jsx(Input, { type: "number", placeholder: "Enter max travel distance", className: "bg-slate-800 border-slate-600 text-white", value: formData.maxTravelDistance || '', onChange: (e) => setFormData(prev => ({ ...prev, maxTravelDistance: parseInt(e.target.value) })) })] })] })] }));
            case 3:
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "Passport Information" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Passport Number" }), _jsx(Input, { placeholder: "Enter passport number", className: "bg-slate-800 border-slate-600 text-white", value: formData.passport?.passportNumber || '', onChange: (e) => setFormData(prev => ({
                                                        ...prev,
                                                        passport: { ...prev.passport, passportNumber: e.target.value }
                                                    })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Issuing Country" }), _jsx(Input, { placeholder: "Issuing country", className: "bg-slate-800 border-slate-600 text-white", value: formData.passport?.issuingCountry || '', onChange: (e) => setFormData(prev => ({
                                                        ...prev,
                                                        passport: { ...prev.passport, issuingCountry: e.target.value }
                                                    })) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mt-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Issue Date" }), _jsx(Input, { type: "date", className: "bg-slate-800 border-slate-600 text-white", value: formData.passport?.issueDate || '', onChange: (e) => setFormData(prev => ({
                                                        ...prev,
                                                        passport: { ...prev.passport, issueDate: e.target.value }
                                                    })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Expiration Date" }), _jsx(Input, { type: "date", className: "bg-slate-800 border-slate-600 text-white", value: formData.passport?.expirationDate || '', onChange: (e) => setFormData(prev => ({
                                                        ...prev,
                                                        passport: { ...prev.passport, expirationDate: e.target.value }
                                                    })) })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "Visa Status" }), ['US', 'Canada', 'Mexico'].map(country => (_jsxs("div", { className: "mb-4 p-4 bg-slate-800/50 rounded-lg", children: [_jsx("h4", { className: "font-medium text-white mb-3", children: country }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Status" }), _jsxs(Select, { children: [_jsx(SelectTrigger, { className: "bg-slate-800 border-slate-600 text-white", children: _jsx(SelectValue, { placeholder: "Select visa status" }) }), _jsx(SelectContent, { children: visaStatuses.map(status => (_jsx(SelectItem, { value: status.value, children: status.label }, status.value))) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Visa Number (if applicable)" }), _jsx(Input, { placeholder: "Enter visa number", className: "bg-slate-800 border-slate-600 text-white" })] })] })] }, country)))] })] }));
            case 4:
                return (_jsx("div", { className: "space-y-6", children: _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "Identity Documents" }), _jsx("p", { className: "text-slate-400 mb-6", children: "Upload clear photos of your identity documents. Our OCR system will automatically extract information." }), _jsx("div", { className: "grid grid-cols-2 gap-4 mb-6", children: documentTypes.map(docType => (_jsxs("div", { className: "p-4 bg-slate-800/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "font-medium text-white", children: docType.label }), _jsx(FileText, { className: "h-5 w-5 text-slate-400" })] }), _jsx("input", { type: "file", accept: "image/*", multiple: true, onChange: (e) => handleFileUpload(e.target.files, docType.value), className: "hidden", id: `upload-${docType.value}` }), _jsxs("label", { htmlFor: `upload-${docType.value}`, className: "flex items-center justify-center w-full py-2 px-4 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30 hover:bg-blue-500/30 cursor-pointer transition-colors", children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), "Upload"] })] }, docType.value))) }), uploadedDocuments.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-white mb-4", children: "Uploaded Documents" }), _jsx("div", { className: "space-y-4", children: uploadedDocuments.map(doc => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-600", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("img", { src: doc.preview, alt: "Document preview", className: "w-16 h-16 object-cover rounded" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-white", children: documentTypes.find(t => t.value === doc.type)?.label }), _jsx("p", { className: "text-sm text-slate-400", children: doc.file.name }), doc.ocrProcessed ? (_jsxs(Badge, { className: "bg-green-500/20 text-green-400 mt-1", children: [_jsx(CheckCircle, { className: "h-3 w-3 mr-1" }), "Processed"] })) : (_jsxs(Badge, { className: "bg-yellow-500/20 text-yellow-400 mt-1", children: [_jsx(Clock, { className: "h-3 w-3 mr-1" }), "Pending"] }))] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [!doc.ocrProcessed && (_jsxs(Button, { size: "sm", onClick: () => processOCR(doc.id), disabled: isProcessing, className: "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30", children: [_jsx(Scan, { className: "h-4 w-4 mr-1" }), "Process"] })), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => removeDocument(doc.id), className: "text-red-400 hover:text-red-300 hover:bg-red-500/20", children: _jsx(X, { className: "h-4 w-4" }) })] })] }, doc.id))) })] }))] }) }));
            case 5:
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Years of Experience" }), _jsx(Input, { type: "number", placeholder: "Enter years of experience", className: "bg-slate-800 border-slate-600 text-white", value: formData.yearsOfExperience || '', onChange: (e) => setFormData(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Skills (one per line)" }), _jsx(Textarea, { placeholder: "Enter your skills...", rows: 6, className: "bg-slate-800 border-slate-600 text-white", value: formData.skills?.join('\n') || '', onChange: (e) => setFormData(prev => ({ ...prev, skills: e.target.value.split('\n').filter(s => s.trim()) })) })] })] }));
            case 6:
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Available Start Date" }), _jsx(Input, { type: "date", className: "bg-slate-800 border-slate-600 text-white", value: formData.availability?.startDate || '', onChange: (e) => setFormData(prev => ({
                                                ...prev,
                                                availability: { ...prev.availability, startDate: e.target.value }
                                            })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Hours Per Week" }), _jsx(Input, { type: "number", placeholder: "40", className: "bg-slate-800 border-slate-600 text-white", value: formData.availability?.hoursPerWeek || '', onChange: (e) => setFormData(prev => ({
                                                ...prev,
                                                availability: { ...prev.availability, hoursPerWeek: parseInt(e.target.value) }
                                            })) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Shift Preference" }), _jsxs(Select, { value: formData.availability?.shiftPreference, onValueChange: (value) => setFormData(prev => ({
                                        ...prev,
                                        availability: { ...prev.availability, shiftPreference: value }
                                    })), children: [_jsx(SelectTrigger, { className: "bg-slate-800 border-slate-600 text-white", children: _jsx(SelectValue, { placeholder: "Select shift preference" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "day", children: "Day Shift" }), _jsx(SelectItem, { value: "night", children: "Night Shift" }), _jsx(SelectItem, { value: "flexible", children: "Flexible" })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { className: "text-sm font-medium text-slate-300", children: "Available for Weekend Work" }), _jsx(Switch, { checked: formData.availability?.weekendAvailable || false, onCheckedChange: (checked) => setFormData(prev => ({
                                                ...prev,
                                                availability: { ...prev.availability, weekendAvailable: checked }
                                            })) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { className: "text-sm font-medium text-slate-300", children: "Willing to Travel" }), _jsx(Switch, { checked: formData.travelRequirements?.willTravel || false, onCheckedChange: (checked) => setFormData(prev => ({
                                                ...prev,
                                                travelRequirements: { ...prev.travelRequirements, willTravel: checked }
                                            })) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { className: "text-sm font-medium text-slate-300", children: "Have Valid Driver's License" }), _jsx(Switch, { checked: formData.travelRequirements?.hasValidDriversLicense || false, onCheckedChange: (checked) => setFormData(prev => ({
                                                ...prev,
                                                travelRequirements: { ...prev.travelRequirements, hasValidDriversLicense: checked }
                                            })) })] })] })] }));
            case 7:
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "text-xl font-semibold text-white mb-4", children: "Review Your Information" }), _jsx("p", { className: "text-slate-400 mb-6", children: "Please review all information before submitting your onboarding form." })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { className: "bg-slate-800/50 border-slate-600", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-white", children: "Personal Information" }) }), _jsxs(CardContent, { className: "text-slate-300", children: [_jsxs("p", { children: [_jsx("strong", { children: "Name:" }), " ", formData.firstName, " ", formData.lastName] }), _jsxs("p", { children: [_jsx("strong", { children: "Email:" }), " ", formData.email] }), _jsxs("p", { children: [_jsx("strong", { children: "Phone:" }), " ", formData.phone] }), _jsxs("p", { children: [_jsx("strong", { children: "Category:" }), " ", formData.category] })] })] }), _jsxs(Card, { className: "bg-slate-800/50 border-slate-600", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-white", children: "Location" }) }), _jsxs(CardContent, { className: "text-slate-300", children: [_jsxs("p", { children: [_jsx("strong", { children: "City:" }), " ", formData.currentLocation?.city] }), _jsxs("p", { children: [_jsx("strong", { children: "Country:" }), " ", formData.currentLocation?.country] }), _jsxs("p", { children: [_jsx("strong", { children: "Willing to Relocate:" }), " ", formData.willingToRelocate ? 'Yes' : 'No'] })] })] }), _jsxs(Card, { className: "bg-slate-800/50 border-slate-600", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-white", children: "Documents" }) }), _jsxs(CardContent, { className: "text-slate-300", children: [_jsxs("p", { children: [_jsx("strong", { children: "Uploaded:" }), " ", uploadedDocuments.length, " documents"] }), _jsxs("p", { children: [_jsx("strong", { children: "Processed:" }), " ", uploadedDocuments.filter(d => d.ocrProcessed).length, " documents"] })] })] }), _jsxs(Card, { className: "bg-slate-800/50 border-slate-600", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-white", children: "Availability" }) }), _jsxs(CardContent, { className: "text-slate-300", children: [_jsxs("p", { children: [_jsx("strong", { children: "Start Date:" }), " ", formData.availability?.startDate] }), _jsxs("p", { children: [_jsx("strong", { children: "Hours/Week:" }), " ", formData.availability?.hoursPerWeek] }), _jsxs("p", { children: [_jsx("strong", { children: "Travel:" }), " ", formData.travelRequirements?.willTravel ? 'Yes' : 'No'] })] })] })] })] }));
            default:
                return null;
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-white mb-2", children: "Engineer Onboarding" }), _jsx("p", { className: "text-slate-400", children: "Complete your onboarding process to join our engineering team" })] }), _jsxs("div", { className: "mb-8", children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: steps.map((step, index) => (_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: `
                  h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold
                  ${currentStep >= step.number
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-slate-700 text-slate-400'}
                `, children: currentStep > step.number ? (_jsx(CheckCircle, { className: "h-5 w-5" })) : (step.number) }), _jsx("div", { className: "text-xs text-slate-400 mt-2 text-center max-w-[80px]", children: step.title }), index < steps.length - 1 && (_jsx("div", { className: `
                    h-0.5 w-16 mt-5 absolute
                    ${currentStep > step.number ? 'bg-blue-500' : 'bg-slate-700'}
                  `, style: { left: `${(index + 1) * (100 / steps.length)}%` } }))] }, step.number))) }), _jsx("div", { className: "w-full bg-slate-700 rounded-full h-2", children: _jsx("div", { className: "bg-blue-500 h-2 rounded-full transition-all duration-300", style: { width: `${(currentStep / steps.length) * 100}%` } }) })] }), _jsxs(Card, { className: "bg-slate-800/50 backdrop-blur-xl border-slate-700/50 mb-8", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-white flex items-center", children: [(() => {
                                        const StepIcon = steps[currentStep - 1].icon;
                                        return _jsx(StepIcon, { className: "h-6 w-6 mr-2" });
                                    })(), steps[currentStep - 1].title] }) }), _jsx(CardContent, { children: renderStepContent() })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx(Button, { variant: "outline", onClick: () => setCurrentStep(prev => Math.max(1, prev - 1)), disabled: currentStep === 1, className: "bg-slate-700 text-white border-slate-600 hover:bg-slate-600", children: "Previous" }), currentStep < steps.length ? (_jsx(Button, { onClick: () => setCurrentStep(prev => Math.min(steps.length, prev + 1)), className: "bg-blue-500 text-white hover:bg-blue-600", children: "Next" })) : (_jsx(Button, { onClick: () => {
                                console.log('Submitting onboarding form:', formData);
                            }, className: "bg-green-500 text-white hover:bg-green-600", children: "Submit Application" }))] })] }) }));
}
//# sourceMappingURL=page.js.map