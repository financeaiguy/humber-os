'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Calendar, MapPin, Hash, Clock, CheckCircle, ArrowRight, ArrowLeft, FileText, Shield, Briefcase, Building, Phone, Mail, Flag, Plane, Key, AlertCircle, Loader2, WifiOff, RefreshCw, DollarSign, Target, Award, Sparkles, Eye, Download } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { onboardingApi, getErrorMessage, getFieldErrors, ApiValidationError, ApiNetworkError } from '@/lib/api/onboarding';
import { useFormValidation, formatLegalIdentifier } from '@/hooks/useFormValidation';
export default function NewOnboardingModal({ isOpen, onClose, recruitId }) {
    const [currentPhase, setCurrentPhase] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [networkError, setNetworkError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const { errors, validateField, validateForm, clearFieldError, setFieldError, clearErrors } = useFormValidation();
    const [onboardingData, setOnboardingData] = useState({
        recruitmentDate: '',
        visaStatus: '',
        travelLimitations: '',
        specialtyKeywords: [],
        legalIdentifier: {
            type: 'SSN',
            number: ''
        },
        totalExperience: 0,
        employeeType: 'full-time',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        currentLocation: '',
        desiredSalary: 0,
        availableStartDate: ''
    });
    const [offerDetails, setOfferDetails] = useState({
        jobTitle: '',
        department: '',
        hourlyRate: '',
        hoursPerWeek: 40,
        startDate: '',
        responsibilities: '',
        requirements: '',
        expectations: '',
        contractType: '',
        workLocation: '',
        enableSmartContract: false
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [offerLetterGenerated, setOfferLetterGenerated] = useState(false);
    const [offerLetterPDF, setOfferLetterPDF] = useState(null);
    useEffect(() => {
        if (recruitId && isOpen) {
            fetchRecruitmentData();
        }
    }, [recruitId, isOpen]);
    const fetchRecruitmentData = async () => {
        setIsLoading(true);
        setApiError(null);
        setNetworkError(false);
        try {
            const data = await onboardingApi.fetchRecruitmentData(recruitId);
            setOnboardingData(prev => ({
                ...prev,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                currentLocation: data.currentLocation,
                desiredSalary: data.desiredSalary,
                availableStartDate: data.availableStartDate,
                totalExperience: data.totalExperience,
                recruitmentDate: data.recruitmentDate,
                specialtyKeywords: data.skills || [],
                visaStatus: data.visaStatus || ''
            }));
            setRetryCount(0);
        }
        catch (error) {
            console.error('Error fetching recruitment data:', error);
            if (error instanceof ApiNetworkError) {
                setNetworkError(true);
                setApiError('Unable to connect to recruitment system. Please check your internet connection.');
            }
            else {
                setApiError(getErrorMessage(error));
            }
        }
        finally {
            setIsLoading(false);
        }
    };
    const retryFetchData = () => {
        setRetryCount(prev => prev + 1);
        fetchRecruitmentData();
    };
    const handleInputChange = (field, value) => {
        clearFieldError(field);
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setOnboardingData(prev => {
                const newData = {
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value
                    }
                };
                if (parent === 'legalIdentifier' && child === 'number') {
                    const type = newData.legalIdentifier.type;
                    newData.legalIdentifier.number = formatLegalIdentifier(type, value);
                }
                return newData;
            });
        }
        else {
            setOnboardingData(prev => ({
                ...prev,
                [field]: value
            }));
        }
        setTimeout(() => {
            const error = validateField(field, value, onboardingData);
            if (error) {
                setFieldError(field, error);
            }
        }, 500);
    };
    const addKeyword = (keyword) => {
        if (keyword.trim() && !onboardingData.specialtyKeywords.includes(keyword.trim())) {
            setOnboardingData(prev => ({
                ...prev,
                specialtyKeywords: [...prev.specialtyKeywords, keyword.trim()]
            }));
        }
    };
    const removeKeyword = (index) => {
        setOnboardingData(prev => ({
            ...prev,
            specialtyKeywords: prev.specialtyKeywords.filter((_, i) => i !== index)
        }));
    };
    const handleNext = () => {
        if (currentPhase < 3) {
            setCurrentPhase(currentPhase + 1);
        }
    };
    const handleBack = () => {
        if (currentPhase > 1) {
            setCurrentPhase(currentPhase - 1);
        }
    };
    const handleGenerateOfferLetter = async () => {
        setIsGenerating(true);
        try {
            const offerData = {
                ...onboardingData,
                ...offerDetails,
                candidateName: `${onboardingData.firstName} ${onboardingData.lastName}`,
                candidateEmail: onboardingData.email,
                candidatePhone: onboardingData.phone
            };
            const response = await fetch('/api/onboarding/generate-offer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(offerData)
            });
            if (!response.ok)
                throw new Error('Failed to generate offer letter');
            const { pdfUrl, contractAddress } = await response.json();
            setOfferLetterPDF(pdfUrl);
            setOfferLetterGenerated(true);
            if (offerDetails.enableSmartContract && contractAddress) {
                setOfferDetails({ ...offerDetails, contractAddress });
            }
        }
        catch (error) {
            console.error('Error generating offer letter:', error);
            setApiError('Failed to generate offer letter. Please try again.');
        }
        finally {
            setIsGenerating(false);
        }
    };
    const handlePreviewPDF = () => {
        if (offerLetterPDF) {
            window.open(offerLetterPDF, '_blank');
        }
    };
    const handleDownloadPDF = () => {
        if (offerLetterPDF) {
            const link = document.createElement('a');
            link.href = offerLetterPDF;
            link.download = `offer-letter-${onboardingData.firstName}-${onboardingData.lastName}.pdf`;
            link.click();
        }
    };
    const handleSubmit = async () => {
        if (!validateForm(onboardingData)) {
            setApiError('Please fix the validation errors before submitting.');
            return;
        }
        setIsSubmitting(true);
        setApiError(null);
        clearErrors();
        try {
            const response = await onboardingApi.submitOnboarding({
                ...onboardingData,
                recruitId,
                phase: currentPhase
            });
            console.log('Onboarding submission successful:', response);
            setSubmitSuccess(true);
            setTimeout(() => {
                onClose();
                setSubmitSuccess(false);
            }, 2000);
        }
        catch (error) {
            console.error('Error submitting onboarding:', error);
            if (error instanceof ApiValidationError) {
                const fieldErrors = getFieldErrors(error);
                Object.entries(fieldErrors).forEach(([field, message]) => {
                    setFieldError(field, message);
                });
                setApiError('Please fix the validation errors and try again.');
            }
            else {
                setApiError(getErrorMessage(error));
            }
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx(AnimatePresence, { children: _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: onClose, className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, onClick: (e) => e.stopPropagation(), className: "bg-slate-900 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "p-6 border-b border-slate-700", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "New Employee Onboarding" }), _jsxs("p", { className: "text-slate-400", children: ["Phase ", currentPhase, " of 3 - Setting up new hire"] })] }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-slate-800 rounded-lg transition-colors", children: _jsx(X, { className: "h-5 w-5 text-slate-400" }) })] }), _jsx("div", { className: "mt-6 flex items-center space-x-4", children: [1, 2, 3].map((phase) => (_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${phase < currentPhase
                                                ? 'bg-green-500 text-white'
                                                : phase === currentPhase
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-slate-700 text-slate-400'}`, children: phase < currentPhase ? _jsx(CheckCircle, { className: "h-4 w-4" }) : phase }), phase < 3 && (_jsx("div", { className: `w-12 h-1 rounded-full mx-2 ${phase < currentPhase ? 'bg-green-500' : 'bg-slate-700'}` }))] }, phase))) })] }), isLoading ? (_jsxs("div", { className: "p-12 text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" }), _jsx("p", { className: "text-slate-400", children: "Loading recruitment data..." }), retryCount > 0 && (_jsxs("p", { className: "text-xs text-slate-500 mt-2", children: ["Retry attempt ", retryCount] }))] })) : apiError ? (_jsxs("div", { className: "p-12 text-center", children: [_jsx("div", { className: "mb-4", children: networkError ? (_jsx(WifiOff, { className: "h-12 w-12 text-red-400 mx-auto mb-4" })) : (_jsx(AlertCircle, { className: "h-12 w-12 text-red-400 mx-auto mb-4" })) }), _jsx("h3", { className: "text-lg font-semibold text-white mb-2", children: networkError ? 'Connection Error' : 'Error Loading Data' }), _jsx("p", { className: "text-slate-400 mb-4", children: apiError }), _jsxs("button", { onClick: retryFetchData, className: "px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2 mx-auto", children: [_jsx(RefreshCw, { className: "h-4 w-4" }), _jsx("span", { children: "Retry" })] })] })) : (_jsxs("div", { className: "p-6", children: [currentPhase === 1 && (_jsx(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, className: "space-y-6", children: _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "Basic Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(User, { className: "h-4 w-4 inline mr-1" }), "First Name"] }), _jsx("input", { type: "text", value: onboardingData.firstName, onChange: (e) => handleInputChange('firstName', e.target.value), className: `w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none ${errors.firstName
                                                                ? 'border-red-500 focus:border-red-500'
                                                                : 'border-slate-700 focus:border-blue-500'}`, placeholder: "John" }), errors.firstName && (_jsxs("p", { className: "mt-1 text-sm text-red-400 flex items-center space-x-1", children: [_jsx(AlertCircle, { className: "h-3 w-3" }), _jsx("span", { children: errors.firstName })] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Last Name" }), _jsx("input", { type: "text", value: onboardingData.lastName, onChange: (e) => handleInputChange('lastName', e.target.value), className: `w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none ${errors.lastName
                                                                ? 'border-red-500 focus:border-red-500'
                                                                : 'border-slate-700 focus:border-blue-500'}`, placeholder: "Smith" }), errors.lastName && (_jsxs("p", { className: "mt-1 text-sm text-red-400 flex items-center space-x-1", children: [_jsx(AlertCircle, { className: "h-3 w-3" }), _jsx("span", { children: errors.lastName })] }))] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(Mail, { className: "h-4 w-4 inline mr-1" }), "Email"] }), _jsx("input", { type: "email", value: onboardingData.email, onChange: (e) => handleInputChange('email', e.target.value), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none", placeholder: "john.smith@email.com" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(Phone, { className: "h-4 w-4 inline mr-1" }), "Phone"] }), _jsx("input", { type: "tel", value: onboardingData.phone, onChange: (e) => handleInputChange('phone', e.target.value), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none", placeholder: "+1 (555) 123-4567" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(Calendar, { className: "h-4 w-4 inline mr-1" }), "Recruitment Date"] }), _jsx("input", { type: "date", value: onboardingData.recruitmentDate, onChange: (e) => handleInputChange('recruitmentDate', e.target.value), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(Clock, { className: "h-4 w-4 inline mr-1" }), "Total Experience (Years)"] }), _jsx("input", { type: "number", value: onboardingData.totalExperience, onChange: (e) => handleInputChange('totalExperience', parseInt(e.target.value) || 0), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none", placeholder: "7", min: "0" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(Flag, { className: "h-4 w-4 inline mr-1" }), "Visa Status"] }), _jsxs("select", { value: onboardingData.visaStatus, onChange: (e) => handleInputChange('visaStatus', e.target.value), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none", children: [_jsx("option", { value: "", children: "Select Visa Status" }), _jsx("option", { value: "US_CITIZEN", children: "US Citizen" }), _jsx("option", { value: "PERMANENT_RESIDENT", children: "Permanent Resident" }), _jsx("option", { value: "H1B", children: "H-1B Visa" }), _jsx("option", { value: "L1", children: "L-1 Visa" }), _jsx("option", { value: "TN", children: "TN Visa" }), _jsx("option", { value: "F1_OPT", children: "F-1 OPT" }), _jsx("option", { value: "OTHER", children: "Other" })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(Briefcase, { className: "h-4 w-4 inline mr-1" }), "Employee Type"] }), _jsxs("select", { value: onboardingData.employeeType, onChange: (e) => handleInputChange('employeeType', e.target.value), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none", children: [_jsx("option", { value: "full-time", children: "Full-time Employee" }), _jsx("option", { value: "contractor", children: "Contractor" }), _jsx("option", { value: "part-time", children: "Part-time" }), _jsx("option", { value: "intern", children: "Intern" })] })] })] }), _jsxs("div", { className: "mb-6", children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(Key, { className: "h-4 w-4 inline mr-1" }), "Legal Identifier for Payroll"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("select", { value: onboardingData.legalIdentifier.type, onChange: (e) => handleInputChange('legalIdentifier.type', e.target.value), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none", children: [_jsx("option", { value: "SSN", children: "SSN" }), _jsx("option", { value: "TIN", children: "TIN" }), _jsx("option", { value: "ITIN", children: "ITIN" }), _jsx("option", { value: "EIN", children: "EIN" })] }), _jsx("div", { className: "md:col-span-2", children: _jsx("input", { type: "text", value: onboardingData.legalIdentifier.number, onChange: (e) => handleInputChange('legalIdentifier.number', e.target.value), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none", placeholder: "XXX-XX-XXXX" }) })] })] }), _jsxs("div", { className: "mb-6", children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(Plane, { className: "h-4 w-4 inline mr-1" }), "Travel Limitations"] }), _jsx("textarea", { value: onboardingData.travelLimitations, onChange: (e) => handleInputChange('travelLimitations', e.target.value), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none", rows: 3, placeholder: "Any travel restrictions, passport limitations, or geographic constraints..." })] }), _jsxs("div", { className: "mb-6", children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(Hash, { className: "h-4 w-4 inline mr-1" }), "Specialty Keywords for Tracking"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex space-x-2", children: [_jsx("input", { type: "text", placeholder: "Add keyword (e.g., PLC, SCADA, Automation)", className: "flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none", onKeyPress: (e) => {
                                                                        if (e.key === 'Enter') {
                                                                            addKeyword(e.target.value);
                                                                            e.target.value = '';
                                                                        }
                                                                    } }), _jsx("button", { onClick: () => {
                                                                        const input = document.querySelector('input[placeholder*="Add keyword"]');
                                                                        if (input?.value) {
                                                                            addKeyword(input.value);
                                                                            input.value = '';
                                                                        }
                                                                    }, className: "px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors", children: "Add" })] }), onboardingData.specialtyKeywords.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2", children: onboardingData.specialtyKeywords.map((keyword, index) => (_jsxs("span", { className: "px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm flex items-center space-x-1", children: [_jsx("span", { children: keyword }), _jsx("button", { onClick: () => removeKeyword(index), className: "hover:text-red-300", children: _jsx(X, { className: "h-3 w-3" }) })] }, index))) }))] })] })] }) })), currentPhase === 2 && (_jsx(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, className: "space-y-6", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-lg font-semibold text-white mb-4 flex items-center", children: [_jsx(FileText, { className: "h-5 w-5 mr-2 text-blue-400" }), "Offer Letter Details"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(Briefcase, { className: "h-4 w-4 inline mr-1" }), "Job Title *"] }), _jsx("input", { type: "text", value: offerDetails.jobTitle || '', onChange: (e) => setOfferDetails({ ...offerDetails, jobTitle: e.target.value }), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none", placeholder: "Senior Controls Engineer" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(Building, { className: "h-4 w-4 inline mr-1" }), "Department *"] }), _jsxs("select", { value: offerDetails.department || '', onChange: (e) => setOfferDetails({ ...offerDetails, department: e.target.value }), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none", children: [_jsx("option", { value: "", children: "Select Department" }), _jsx("option", { value: "controls", children: "Controls Engineering" }), _jsx("option", { value: "mechanical", children: "Mechanical Engineering" }), _jsx("option", { value: "electrical", children: "Electrical Engineering" }), _jsx("option", { value: "robotics", children: "Robotics" }), _jsx("option", { value: "software", children: "Software Engineering" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(DollarSign, { className: "h-4 w-4 inline mr-1" }), "Hourly Rate *"] }), _jsx("input", { type: "number", value: offerDetails.hourlyRate || '', onChange: (e) => setOfferDetails({ ...offerDetails, hourlyRate: e.target.value }), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none", placeholder: "85", min: "0" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(Clock, { className: "h-4 w-4 inline mr-1" }), "Hours per Week"] }), _jsx("input", { type: "number", value: offerDetails.hoursPerWeek || 40, onChange: (e) => setOfferDetails({ ...offerDetails, hoursPerWeek: parseInt(e.target.value) }), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none", placeholder: "40", min: "0", max: "60" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(Calendar, { className: "h-4 w-4 inline mr-1" }), "Start Date *"] }), _jsx("input", { type: "date", value: offerDetails.startDate || '', onChange: (e) => setOfferDetails({ ...offerDetails, startDate: e.target.value }), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none" })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(Target, { className: "h-4 w-4 inline mr-1" }), "Key Responsibilities *"] }), _jsx("textarea", { value: offerDetails.responsibilities || '', onChange: (e) => setOfferDetails({ ...offerDetails, responsibilities: e.target.value }), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none", rows: 4, placeholder: "\u2022 Design and implement control systems\n\u2022 Collaborate with cross-functional teams\n\u2022 Troubleshoot and optimize automation processes" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(CheckCircle, { className: "h-4 w-4 inline mr-1" }), "Requirements *"] }), _jsx("textarea", { value: offerDetails.requirements || '', onChange: (e) => setOfferDetails({ ...offerDetails, requirements: e.target.value }), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none", rows: 4, placeholder: "\u2022 Bachelor's degree in relevant field\n\u2022 5+ years of experience\n\u2022 Proficiency in PLC programming" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(Award, { className: "h-4 w-4 inline mr-1" }), "Expectations"] }), _jsx("textarea", { value: offerDetails.expectations || '', onChange: (e) => setOfferDetails({ ...offerDetails, expectations: e.target.value }), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none", rows: 3, placeholder: "Performance expectations and goals for the first 90 days" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(FileText, { className: "h-4 w-4 inline mr-1" }), "Contract Type *"] }), _jsxs("select", { value: offerDetails.contractType || '', onChange: (e) => setOfferDetails({ ...offerDetails, contractType: e.target.value }), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none", children: [_jsx("option", { value: "", children: "Select Contract Type" }), _jsx("option", { value: "w2", children: "W-2 Employee" }), _jsx("option", { value: "1099", children: "1099 Contractor" }), _jsx("option", { value: "c2c", children: "Corp-to-Corp" })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(MapPin, { className: "h-4 w-4 inline mr-1" }), "Work Location *"] }), _jsx("input", { type: "text", value: offerDetails.workLocation || '', onChange: (e) => setOfferDetails({ ...offerDetails, workLocation: e.target.value }), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none", placeholder: "Chicago, IL (Remote/Hybrid/Onsite)" })] })] }), _jsxs("div", { className: "p-4 bg-slate-800/50 border border-slate-700 rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("label", { className: "flex items-center text-sm font-medium text-slate-300", children: [_jsx(Shield, { className: "h-4 w-4 mr-2 text-green-400" }), "Enable Blockchain Contract (Polygon)"] }), _jsx(Switch, { checked: offerDetails.enableSmartContract || false, onCheckedChange: (checked) => setOfferDetails({ ...offerDetails, enableSmartContract: checked }) })] }), offerDetails.enableSmartContract && (_jsxs("div", { className: "text-xs text-slate-400 space-y-1", children: [_jsx("p", { children: "\u2022 Contract will be deployed on Polygon network" }), _jsx("p", { children: "\u2022 Automated milestone-based payments" }), _jsx("p", { children: "\u2022 Immutable contract terms" }), _jsx("p", { children: "\u2022 Multi-signature approval required" })] }))] }), _jsxs("div", { className: "flex items-center justify-between pt-4", children: [_jsx("button", { onClick: handleGenerateOfferLetter, className: "flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors", disabled: isGenerating, children: isGenerating ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Generating..."] })) : (_jsxs(_Fragment, { children: [_jsx(Sparkles, { className: "h-4 w-4 mr-2" }), "Generate Offer Letter"] })) }), offerLetterGenerated && (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("button", { onClick: handlePreviewPDF, className: "flex items-center px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors", children: [_jsx(Eye, { className: "h-4 w-4 mr-2" }), "Preview"] }), _jsxs("button", { onClick: handleDownloadPDF, className: "flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Download PDF"] })] }))] })] }) })), currentPhase === 3 && (_jsx(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, className: "space-y-6", children: _jsxs("div", { className: "text-center py-12", children: [_jsx(FileText, { className: "h-16 w-16 text-slate-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-white mb-2", children: "Phase 3: Coming Soon" }), _jsx("p", { className: "text-slate-400", children: "Documentation and compliance setup" })] }) }))] })), (apiError || submitSuccess) && (_jsx("div", { className: "px-6 py-3 border-t border-slate-700 bg-slate-800/50", children: submitSuccess ? (_jsxs("div", { className: "flex items-center space-x-2 text-green-400", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsx("span", { className: "text-sm font-medium", children: "Onboarding submitted successfully!" })] })) : apiError ? (_jsxs("div", { className: "flex items-start space-x-2 text-red-400", children: [_jsx(AlertCircle, { className: "h-4 w-4 mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: "Submission Error" }), _jsx("p", { className: "text-xs text-red-300 mt-1", children: apiError })] })] })) : null })), _jsxs("div", { className: "p-6 border-t border-slate-700 flex justify-between", children: [_jsxs("button", { onClick: handleBack, disabled: currentPhase === 1 || isSubmitting, className: "px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), _jsx("span", { children: "Back" })] }), _jsxs("div", { className: "flex space-x-3", children: [_jsx("button", { onClick: onClose, disabled: isSubmitting, className: "px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50", children: "Cancel" }), currentPhase < 3 ? (_jsxs("button", { onClick: handleNext, disabled: isSubmitting, className: "px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50", children: [_jsx("span", { children: "Next" }), _jsx(ArrowRight, { className: "h-4 w-4" })] })) : (_jsx("button", { onClick: handleSubmit, disabled: isSubmitting || submitSuccess, className: "px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 animate-spin" }), _jsx("span", { children: "Submitting..." })] })) : submitSuccess ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsx("span", { children: "Submitted!" })] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsx("span", { children: "Complete Onboarding" })] })) }))] })] })] }) }) }));
}
//# sourceMappingURL=NewOnboardingModal.js.map