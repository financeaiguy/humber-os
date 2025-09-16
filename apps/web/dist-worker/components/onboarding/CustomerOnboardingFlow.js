'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, CreditCard, Users, CheckCircle, ArrowRight, Zap, X } from 'lucide-react';
const initialCustomerData = {
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactTitle: '',
    billingAddress: '',
    billingContact: '',
    billingEmail: '',
    taxId: '',
    engineerTypes: [],
    projectDuration: '',
    startDate: '',
    budget: '',
    location: '',
    communicationPreference: 'email',
    reportingFrequency: 'weekly',
    paymentTerms: 'net30',
    specialRequirements: ''
};
const onboardingSteps = [
    {
        id: 1,
        title: 'Company Information',
        description: 'Basic company details and contact information',
        icon: Building,
        color: 'from-blue-500 to-cyan-500'
    },
    {
        id: 2,
        title: 'Billing Setup',
        description: 'Payment information and billing preferences',
        icon: CreditCard,
        color: 'from-green-500 to-emerald-500'
    },
    {
        id: 3,
        title: 'Service Requirements',
        description: 'Define your engineering needs and project scope',
        icon: Users,
        color: 'from-purple-500 to-pink-500'
    },
    {
        id: 4,
        title: 'Preferences & Launch',
        description: 'Communication preferences and go-live setup',
        icon: Zap,
        color: 'from-orange-500 to-red-500'
    }
];
const engineerTypes = [
    { id: 'controls', label: 'Controls Engineers', description: 'PLC, SCADA, HMI programming' },
    { id: 'mechanical', label: 'Mechanical Engineers', description: 'CAD design, analysis, manufacturing' },
    { id: 'electrical', label: 'Electrical Engineers', description: 'Power systems, automation, controls' },
    { id: 'piping', label: 'Piping Engineers', description: 'Process piping, fluid systems' },
    { id: 'robotics', label: 'Robotics Engineers', description: 'Automation, AI, vision systems' }
];
const industries = [
    'Automotive Manufacturing',
    'Aerospace & Defense',
    'Industrial Manufacturing',
    'Energy & Utilities',
    'Chemical Processing',
    'Food & Beverage',
    'Pharmaceuticals',
    'Other'
];
const companySizes = [
    '1-50 employees',
    '51-200 employees',
    '201-1000 employees',
    '1000+ employees'
];
export default function CustomerOnboardingFlow({ isOpen, onClose, onComplete }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [customerData, setCustomerData] = useState(initialCustomerData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const handleInputChange = (field, value) => {
        setCustomerData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };
    const handleEngineerTypeToggle = (typeId) => {
        setCustomerData(prev => ({
            ...prev,
            engineerTypes: prev.engineerTypes.includes(typeId)
                ? prev.engineerTypes.filter(t => t !== typeId)
                : [...prev.engineerTypes, typeId]
        }));
    };
    const validateStep = (step) => {
        const newErrors = {};
        switch (step) {
            case 1:
                if (!customerData.companyName.trim())
                    newErrors.companyName = 'Company name is required';
                if (!customerData.contactName.trim())
                    newErrors.contactName = 'Contact name is required';
                if (!customerData.contactEmail.trim())
                    newErrors.contactEmail = 'Contact email is required';
                if (!customerData.contactPhone.trim())
                    newErrors.contactPhone = 'Contact phone is required';
                break;
            case 2:
                if (!customerData.billingAddress.trim())
                    newErrors.billingAddress = 'Billing address is required';
                if (!customerData.billingContact.trim())
                    newErrors.billingContact = 'Billing contact is required';
                if (!customerData.billingEmail.trim())
                    newErrors.billingEmail = 'Billing email is required';
                break;
            case 3:
                if (customerData.engineerTypes.length === 0)
                    newErrors.engineerTypes = 'Select at least one engineer type';
                if (!customerData.startDate)
                    newErrors.startDate = 'Start date is required';
                if (!customerData.budget.trim())
                    newErrors.budget = 'Budget range is required';
                break;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 4));
        }
    };
    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };
    const handleSubmit = async () => {
        if (!validateStep(currentStep))
            return;
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            onComplete(customerData);
            onClose();
        }
        catch (error) {
            console.error('Error submitting customer onboarding:', error);
            setErrors({ submit: 'Failed to create customer account. Please try again.' });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx(AnimatePresence, { children: _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4", onClick: onClose, children: _jsxs(motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, className: "bg-slate-800 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-hidden", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-slate-700", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Customer Onboarding" }), _jsx("p", { className: "text-slate-400 mt-1", children: "Get started purchasing engineer time from our bull pen" })] }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-slate-700 rounded-lg transition-colors", children: _jsx(X, { className: "h-5 w-5 text-slate-400" }) })] }), _jsxs("div", { className: "px-6 py-4 border-b border-slate-700", children: [_jsx("div", { className: "flex items-center justify-between", children: onboardingSteps.map((step, index) => (_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= step.id
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-slate-700 text-slate-400'}`, children: currentStep > step.id ? (_jsx(CheckCircle, { className: "h-5 w-5" })) : (_jsx(step.icon, { className: "h-5 w-5" })) }), index < onboardingSteps.length - 1 && (_jsx("div", { className: `w-20 h-0.5 mx-3 ${currentStep > step.id ? 'bg-blue-500' : 'bg-slate-700'}` }))] }, step.id))) }), _jsxs("div", { className: "mt-3", children: [_jsx("h3", { className: "font-semibold text-white", children: onboardingSteps[currentStep - 1].title }), _jsx("p", { className: "text-sm text-slate-400", children: onboardingSteps[currentStep - 1].description })] })] }), _jsxs("div", { className: "p-6 overflow-y-auto max-h-[calc(90vh-200px)]", children: [currentStep === 1 && (_jsxs(motion.div, { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 }, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Company Name *" }), _jsx("input", { type: "text", value: customerData.companyName, onChange: (e) => handleInputChange('companyName', e.target.value), className: `w-full px-3 py-2 bg-slate-700 border rounded-lg text-white ${errors.companyName ? 'border-red-500' : 'border-slate-600'}`, placeholder: "Your company name" }), errors.companyName && _jsx("p", { className: "text-red-400 text-sm mt-1", children: errors.companyName })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Industry" }), _jsxs("select", { value: customerData.industry, onChange: (e) => handleInputChange('industry', e.target.value), className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white", children: [_jsx("option", { value: "", children: "Select industry" }), industries.map(industry => (_jsx("option", { value: industry, children: industry }, industry)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Company Size" }), _jsxs("select", { value: customerData.companySize, onChange: (e) => handleInputChange('companySize', e.target.value), className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white", children: [_jsx("option", { value: "", children: "Select company size" }), companySizes.map(size => (_jsx("option", { value: size, children: size }, size)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Website" }), _jsx("input", { type: "url", value: customerData.website, onChange: (e) => handleInputChange('website', e.target.value), className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white", placeholder: "https://yourcompany.com" })] })] }), _jsxs("div", { className: "border-t border-slate-700 pt-6", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "Primary Contact" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Contact Name *" }), _jsx("input", { type: "text", value: customerData.contactName, onChange: (e) => handleInputChange('contactName', e.target.value), className: `w-full px-3 py-2 bg-slate-700 border rounded-lg text-white ${errors.contactName ? 'border-red-500' : 'border-slate-600'}`, placeholder: "Primary contact name" }), errors.contactName && _jsx("p", { className: "text-red-400 text-sm mt-1", children: errors.contactName })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Contact Title" }), _jsx("input", { type: "text", value: customerData.contactTitle, onChange: (e) => handleInputChange('contactTitle', e.target.value), className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white", placeholder: "Job title" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Email *" }), _jsx("input", { type: "email", value: customerData.contactEmail, onChange: (e) => handleInputChange('contactEmail', e.target.value), className: `w-full px-3 py-2 bg-slate-700 border rounded-lg text-white ${errors.contactEmail ? 'border-red-500' : 'border-slate-600'}`, placeholder: "contact@company.com" }), errors.contactEmail && _jsx("p", { className: "text-red-400 text-sm mt-1", children: errors.contactEmail })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Phone *" }), _jsx("input", { type: "tel", value: customerData.contactPhone, onChange: (e) => handleInputChange('contactPhone', e.target.value), className: `w-full px-3 py-2 bg-slate-700 border rounded-lg text-white ${errors.contactPhone ? 'border-red-500' : 'border-slate-600'}`, placeholder: "+1 (555) 123-4567" }), errors.contactPhone && _jsx("p", { className: "text-red-400 text-sm mt-1", children: errors.contactPhone })] })] })] })] }, "step1")), currentStep === 2 && (_jsx(motion.div, { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 }, className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Billing Address *" }), _jsx("textarea", { value: customerData.billingAddress, onChange: (e) => handleInputChange('billingAddress', e.target.value), className: `w-full px-3 py-2 bg-slate-700 border rounded-lg text-white ${errors.billingAddress ? 'border-red-500' : 'border-slate-600'}`, rows: 3, placeholder: "Complete billing address" }), errors.billingAddress && _jsx("p", { className: "text-red-400 text-sm mt-1", children: errors.billingAddress })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Billing Contact *" }), _jsx("input", { type: "text", value: customerData.billingContact, onChange: (e) => handleInputChange('billingContact', e.target.value), className: `w-full px-3 py-2 bg-slate-700 border rounded-lg text-white ${errors.billingContact ? 'border-red-500' : 'border-slate-600'}`, placeholder: "Billing contact name" }), errors.billingContact && _jsx("p", { className: "text-red-400 text-sm mt-1", children: errors.billingContact })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Billing Email *" }), _jsx("input", { type: "email", value: customerData.billingEmail, onChange: (e) => handleInputChange('billingEmail', e.target.value), className: `w-full px-3 py-2 bg-slate-700 border rounded-lg text-white ${errors.billingEmail ? 'border-red-500' : 'border-slate-600'}`, placeholder: "billing@company.com" }), errors.billingEmail && _jsx("p", { className: "text-red-400 text-sm mt-1", children: errors.billingEmail })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Tax ID / EIN" }), _jsx("input", { type: "text", value: customerData.taxId, onChange: (e) => handleInputChange('taxId', e.target.value), className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white", placeholder: "XX-XXXXXXX" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Payment Terms" }), _jsxs("select", { value: customerData.paymentTerms, onChange: (e) => handleInputChange('paymentTerms', e.target.value), className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white", children: [_jsx("option", { value: "net15", children: "Net 15 days" }), _jsx("option", { value: "net30", children: "Net 30 days" }), _jsx("option", { value: "net45", children: "Net 45 days" }), _jsx("option", { value: "net60", children: "Net 60 days" })] })] })] }) }, "step2")), currentStep === 3 && (_jsxs(motion.div, { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 }, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-3", children: "Engineer Types Needed *" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: engineerTypes.map((type) => (_jsxs("div", { onClick: () => handleEngineerTypeToggle(type.id), className: `p-4 rounded-lg border cursor-pointer transition-all ${customerData.engineerTypes.includes(type.id)
                                                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                                        : 'border-slate-600 hover:border-slate-500 text-slate-300'}`, children: [_jsx("div", { className: "font-medium", children: type.label }), _jsx("div", { className: "text-sm opacity-70", children: type.description })] }, type.id))) }), errors.engineerTypes && _jsx("p", { className: "text-red-400 text-sm mt-1", children: errors.engineerTypes })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Project Start Date *" }), _jsx("input", { type: "date", value: customerData.startDate, onChange: (e) => handleInputChange('startDate', e.target.value), className: `w-full px-3 py-2 bg-slate-700 border rounded-lg text-white ${errors.startDate ? 'border-red-500' : 'border-slate-600'}` }), errors.startDate && _jsx("p", { className: "text-red-400 text-sm mt-1", children: errors.startDate })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Project Duration" }), _jsxs("select", { value: customerData.projectDuration, onChange: (e) => handleInputChange('projectDuration', e.target.value), className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white", children: [_jsx("option", { value: "", children: "Select duration" }), _jsx("option", { value: "1-3 months", children: "1-3 months" }), _jsx("option", { value: "3-6 months", children: "3-6 months" }), _jsx("option", { value: "6-12 months", children: "6-12 months" }), _jsx("option", { value: "12+ months", children: "12+ months" }), _jsx("option", { value: "ongoing", children: "Ongoing" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Budget Range *" }), _jsxs("select", { value: customerData.budget, onChange: (e) => handleInputChange('budget', e.target.value), className: `w-full px-3 py-2 bg-slate-700 border rounded-lg text-white ${errors.budget ? 'border-red-500' : 'border-slate-600'}`, children: [_jsx("option", { value: "", children: "Select budget range" }), _jsx("option", { value: "$50K-$100K", children: "$50K - $100K" }), _jsx("option", { value: "$100K-$250K", children: "$100K - $250K" }), _jsx("option", { value: "$250K-$500K", children: "$250K - $500K" }), _jsx("option", { value: "$500K-$1M", children: "$500K - $1M" }), _jsx("option", { value: "$1M+", children: "$1M+" })] }), errors.budget && _jsx("p", { className: "text-red-400 text-sm mt-1", children: errors.budget })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Location" }), _jsx("input", { type: "text", value: customerData.location, onChange: (e) => handleInputChange('location', e.target.value), className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white", placeholder: "Project location" })] })] })] }, "step3")), currentStep === 4 && (_jsxs(motion.div, { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 }, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Communication Preference" }), _jsxs("select", { value: customerData.communicationPreference, onChange: (e) => handleInputChange('communicationPreference', e.target.value), className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white", children: [_jsx("option", { value: "email", children: "Email" }), _jsx("option", { value: "phone", children: "Phone" }), _jsx("option", { value: "slack", children: "Slack" }), _jsx("option", { value: "teams", children: "Microsoft Teams" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Reporting Frequency" }), _jsxs("select", { value: customerData.reportingFrequency, onChange: (e) => handleInputChange('reportingFrequency', e.target.value), className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white", children: [_jsx("option", { value: "daily", children: "Daily" }), _jsx("option", { value: "weekly", children: "Weekly" }), _jsx("option", { value: "biweekly", children: "Bi-weekly" }), _jsx("option", { value: "monthly", children: "Monthly" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Special Requirements" }), _jsx("textarea", { value: customerData.specialRequirements, onChange: (e) => handleInputChange('specialRequirements', e.target.value), className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white", rows: 4, placeholder: "Any special requirements, certifications needed, or project specifics..." })] }), _jsxs("div", { className: "bg-slate-700/30 rounded-lg p-4", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-3", children: "Onboarding Summary" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-400", children: "Company:" }), _jsx("span", { className: "text-white", children: customerData.companyName || 'Not specified' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-400", children: "Engineer Types:" }), _jsxs("span", { className: "text-white", children: [customerData.engineerTypes.length, " selected"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-400", children: "Budget:" }), _jsx("span", { className: "text-white", children: customerData.budget || 'Not specified' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-400", children: "Start Date:" }), _jsx("span", { className: "text-white", children: customerData.startDate || 'Not specified' })] })] })] })] }, "step4")), errors.submit && (_jsx("div", { className: "mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg", children: _jsx("p", { className: "text-red-400 text-sm", children: errors.submit }) }))] }), _jsxs("div", { className: "flex items-center justify-between p-6 border-t border-slate-700", children: [_jsx("button", { onClick: handlePrevious, disabled: currentStep === 1 || isSubmitting, className: "px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: "Previous" }), _jsxs("div", { className: "flex space-x-3", children: [_jsx("button", { onClick: onClose, disabled: isSubmitting, className: "px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50", children: "Cancel" }), currentStep < 4 ? (_jsxs("button", { onClick: handleNext, disabled: isSubmitting, className: "px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2", children: [_jsx("span", { children: "Next" }), _jsx(ArrowRight, { className: "h-4 w-4" })] })) : (_jsx("button", { onClick: handleSubmit, disabled: isSubmitting, className: "px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center space-x-2", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b border-white" }), _jsx("span", { children: "Creating Account..." })] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsx("span", { children: "Complete Onboarding" })] })) }))] })] })] }) }) }));
}
//# sourceMappingURL=CustomerOnboardingFlow.js.map