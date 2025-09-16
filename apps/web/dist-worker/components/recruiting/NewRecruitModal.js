'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Briefcase, Calendar, FileText, ChevronRight, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { recruitsApi, getFieldErrors, getErrorMessage, ApiValidationError } from '@/lib/api/recruits';
const initialRecruitData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentLocation: '',
    jobTitle: '',
    yearsExperience: 0,
    currentCompany: '',
    desiredSalary: '',
    skills: [],
    education: '',
    certifications: [],
    availableStartDate: '',
    workAuthorization: 'US Citizen',
    willingToRelocate: false,
    travelWillingness: 'None',
    source: 'Direct Application',
    recruiterName: '',
    recruiterAgency: '',
    notes: ''
};
const workAuthOptions = [
    'US Citizen',
    'Green Card Holder',
    'H1-B Visa',
    'L1 Visa',
    'OPT/F1',
    'TN Visa',
    'Other'
];
const travelOptions = [
    'None',
    'Minimal (< 10%)',
    'Moderate (10-25%)',
    'Frequent (25-50%)',
    'Extensive (> 50%)'
];
const sourceOptions = [
    'Direct Application',
    'LinkedIn',
    'Indeed',
    'Referral',
    'Recruiting Agency',
    'Career Fair',
    'Company Website',
    'Other'
];
export default function NewRecruitModal({ isOpen, onClose, onRecruitAdded }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [recruitData, setRecruitData] = useState(initialRecruitData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [errors, setErrors] = useState({});
    const [newSkill, setNewSkill] = useState('');
    const [newCertification, setNewCertification] = useState('');
    const totalSteps = 4;
    const handleInputChange = (field, value) => {
        setRecruitData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };
    const addSkill = () => {
        if (newSkill.trim() && !recruitData.skills.includes(newSkill.trim())) {
            setRecruitData(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }));
            setNewSkill('');
        }
    };
    const removeSkill = (skillToRemove) => {
        setRecruitData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };
    const addCertification = () => {
        if (newCertification.trim() && !recruitData.certifications.includes(newCertification.trim())) {
            setRecruitData(prev => ({
                ...prev,
                certifications: [...prev.certifications, newCertification.trim()]
            }));
            setNewCertification('');
        }
    };
    const removeCertification = (certToRemove) => {
        setRecruitData(prev => ({
            ...prev,
            certifications: prev.certifications.filter(cert => cert !== certToRemove)
        }));
    };
    const validateStep = (step) => {
        const newErrors = {};
        switch (step) {
            case 1:
                if (!recruitData.firstName.trim())
                    newErrors.firstName = 'First name is required';
                if (!recruitData.lastName.trim())
                    newErrors.lastName = 'Last name is required';
                if (!recruitData.email.trim())
                    newErrors.email = 'Email is required';
                else if (!/\S+@\S+\.\S+/.test(recruitData.email))
                    newErrors.email = 'Invalid email format';
                if (!recruitData.phone.trim())
                    newErrors.phone = 'Phone number is required';
                if (!recruitData.currentLocation.trim())
                    newErrors.currentLocation = 'Current location is required';
                break;
            case 2:
                if (!recruitData.jobTitle.trim())
                    newErrors.jobTitle = 'Job title is required';
                if (recruitData.yearsExperience < 0)
                    newErrors.yearsExperience = 'Years of experience cannot be negative';
                break;
            case 3:
                if (!recruitData.availableStartDate)
                    newErrors.availableStartDate = 'Available start date is required';
                break;
            case 4:
                if (!recruitData.source.trim())
                    newErrors.source = 'Recruiting source is required';
                break;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    };
    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };
    const handleSubmit = async () => {
        if (!validateStep(currentStep))
            return;
        setIsSubmitting(true);
        setErrors({});
        try {
            const response = await recruitsApi.submitRecruit(recruitData);
            console.log('Recruit submission successful:', response);
            setSubmitSuccess(true);
            setTimeout(() => {
                onClose();
                setSubmitSuccess(false);
                setCurrentStep(1);
                setRecruitData(initialRecruitData);
                setErrors({});
                onRecruitAdded?.();
            }, 2000);
        }
        catch (error) {
            console.error('Error submitting recruit:', error);
            if (error instanceof ApiValidationError) {
                const fieldErrors = getFieldErrors(error);
                setErrors(fieldErrors);
            }
            else {
                setErrors({ submit: getErrorMessage(error) });
            }
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
            setCurrentStep(1);
            setRecruitData(initialRecruitData);
            setErrors({});
            setSubmitSuccess(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx(AnimatePresence, { children: _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4", onClick: handleClose, children: _jsxs(motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, className: "bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-hidden", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-slate-700", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Add New Recruit" }), _jsxs("p", { className: "text-slate-400 mt-1", children: ["Step ", currentStep, " of ", totalSteps] })] }), _jsx("button", { onClick: handleClose, disabled: isSubmitting, className: "p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50", children: _jsx(X, { className: "h-5 w-5 text-slate-400" }) })] }), _jsx("div", { className: "px-6 py-4 border-b border-slate-700", children: _jsx("div", { className: "flex items-center space-x-2", children: Array.from({ length: totalSteps }, (_, i) => (_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${i + 1 <= currentStep
                                            ? 'bg-green-500 text-white'
                                            : 'bg-slate-700 text-slate-400'}`, children: i + 1 <= currentStep ? _jsx(CheckCircle, { className: "h-4 w-4" }) : i + 1 }), i < totalSteps - 1 && (_jsx("div", { className: `w-12 h-0.5 mx-2 ${i + 1 < currentStep ? 'bg-green-500' : 'bg-slate-700'}` }))] }, i))) }) }), _jsxs("div", { className: "p-6 overflow-y-auto max-h-[calc(90vh-200px)]", children: [submitSuccess ? (_jsxs(motion.div, { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, className: "text-center py-8", children: [_jsx(CheckCircle, { className: "h-16 w-16 text-green-500 mx-auto mb-4" }), _jsx("h3", { className: "text-xl font-bold text-white mb-2", children: "Recruit Added Successfully!" }), _jsx("p", { className: "text-slate-400", children: "The recruit has been added to the pipeline and can now be moved to onboarding." })] })) : (_jsxs(_Fragment, { children: [currentStep === 1 && (_jsx(motion.div, { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 }, className: "space-y-6", children: _jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold text-white mb-4 flex items-center", children: [_jsx(User, { className: "h-5 w-5 mr-2" }), "Personal Information"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "First Name *" }), _jsx("input", { type: "text", value: recruitData.firstName, onChange: (e) => handleInputChange('firstName', e.target.value), className: `w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.firstName ? 'border-red-500' : 'border-slate-600'}`, placeholder: "Enter first name" }), errors.firstName && (_jsxs("p", { className: "text-red-400 text-sm mt-1 flex items-center", children: [_jsx(AlertCircle, { className: "h-4 w-4 mr-1" }), errors.firstName] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Last Name *" }), _jsx("input", { type: "text", value: recruitData.lastName, onChange: (e) => handleInputChange('lastName', e.target.value), className: `w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.lastName ? 'border-red-500' : 'border-slate-600'}`, placeholder: "Enter last name" }), errors.lastName && (_jsxs("p", { className: "text-red-400 text-sm mt-1 flex items-center", children: [_jsx(AlertCircle, { className: "h-4 w-4 mr-1" }), errors.lastName] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Email *" }), _jsx("input", { type: "email", value: recruitData.email, onChange: (e) => handleInputChange('email', e.target.value), className: `w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-slate-600'}`, placeholder: "Enter email address" }), errors.email && (_jsxs("p", { className: "text-red-400 text-sm mt-1 flex items-center", children: [_jsx(AlertCircle, { className: "h-4 w-4 mr-1" }), errors.email] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Phone *" }), _jsx("input", { type: "tel", value: recruitData.phone, onChange: (e) => handleInputChange('phone', e.target.value), className: `w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-slate-600'}`, placeholder: "Enter phone number" }), errors.phone && (_jsxs("p", { className: "text-red-400 text-sm mt-1 flex items-center", children: [_jsx(AlertCircle, { className: "h-4 w-4 mr-1" }), errors.phone] }))] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Current Location *" }), _jsx("input", { type: "text", value: recruitData.currentLocation, onChange: (e) => handleInputChange('currentLocation', e.target.value), className: `w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.currentLocation ? 'border-red-500' : 'border-slate-600'}`, placeholder: "Enter current city, state" }), errors.currentLocation && (_jsxs("p", { className: "text-red-400 text-sm mt-1 flex items-center", children: [_jsx(AlertCircle, { className: "h-4 w-4 mr-1" }), errors.currentLocation] }))] })] })] }) }, "step1")), currentStep === 2 && (_jsx(motion.div, { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 }, className: "space-y-6", children: _jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold text-white mb-4 flex items-center", children: [_jsx(Briefcase, { className: "h-5 w-5 mr-2" }), "Professional Information"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Job Title *" }), _jsx("input", { type: "text", value: recruitData.jobTitle, onChange: (e) => handleInputChange('jobTitle', e.target.value), className: `w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.jobTitle ? 'border-red-500' : 'border-slate-600'}`, placeholder: "e.g., Senior Mechanical Engineer" }), errors.jobTitle && (_jsxs("p", { className: "text-red-400 text-sm mt-1 flex items-center", children: [_jsx(AlertCircle, { className: "h-4 w-4 mr-1" }), errors.jobTitle] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Years of Experience" }), _jsx("input", { type: "number", min: "0", value: recruitData.yearsExperience, onChange: (e) => handleInputChange('yearsExperience', parseInt(e.target.value) || 0), className: `w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.yearsExperience ? 'border-red-500' : 'border-slate-600'}`, placeholder: "0" }), errors.yearsExperience && (_jsxs("p", { className: "text-red-400 text-sm mt-1 flex items-center", children: [_jsx(AlertCircle, { className: "h-4 w-4 mr-1" }), errors.yearsExperience] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Current Company" }), _jsx("input", { type: "text", value: recruitData.currentCompany, onChange: (e) => handleInputChange('currentCompany', e.target.value), className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Enter current employer" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Desired Salary" }), _jsx("input", { type: "text", value: recruitData.desiredSalary, onChange: (e) => handleInputChange('desiredSalary', e.target.value), className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "e.g., $85,000 or $40/hr" })] })] }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Technical Skills" }), _jsx("div", { className: "flex flex-wrap gap-2 mb-3", children: recruitData.skills.map((skill, index) => (_jsxs("span", { className: "inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm", children: [skill, _jsx("button", { type: "button", onClick: () => removeSkill(skill), className: "ml-2 hover:text-blue-100", children: _jsx(X, { className: "h-3 w-3" }) })] }, index))) }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: newSkill, onChange: (e) => setNewSkill(e.target.value), onKeyPress: (e) => e.key === 'Enter' && addSkill(), className: "flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Add a skill and press Enter" }), _jsx("button", { type: "button", onClick: addSkill, className: "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors", children: "Add" })] })] }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Education" }), _jsx("input", { type: "text", value: recruitData.education, onChange: (e) => handleInputChange('education', e.target.value), className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "e.g., BS Mechanical Engineering - University of Michigan" })] }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Certifications" }), _jsx("div", { className: "flex flex-wrap gap-2 mb-3", children: recruitData.certifications.map((cert, index) => (_jsxs("span", { className: "inline-flex items-center px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm", children: [cert, _jsx("button", { type: "button", onClick: () => removeCertification(cert), className: "ml-2 hover:text-green-100", children: _jsx(X, { className: "h-3 w-3" }) })] }, index))) }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: newCertification, onChange: (e) => setNewCertification(e.target.value), onKeyPress: (e) => e.key === 'Enter' && addCertification(), className: "flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Add a certification and press Enter" }), _jsx("button", { type: "button", onClick: addCertification, className: "px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors", children: "Add" })] })] })] }) }, "step2")), currentStep === 3 && (_jsx(motion.div, { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 }, className: "space-y-6", children: _jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold text-white mb-4 flex items-center", children: [_jsx(Calendar, { className: "h-5 w-5 mr-2" }), "Availability & Preferences"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Available Start Date *" }), _jsx("input", { type: "date", value: recruitData.availableStartDate, onChange: (e) => handleInputChange('availableStartDate', e.target.value), className: `w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.availableStartDate ? 'border-red-500' : 'border-slate-600'}` }), errors.availableStartDate && (_jsxs("p", { className: "text-red-400 text-sm mt-1 flex items-center", children: [_jsx(AlertCircle, { className: "h-4 w-4 mr-1" }), errors.availableStartDate] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Work Authorization" }), _jsx("select", { value: recruitData.workAuthorization, onChange: (e) => handleInputChange('workAuthorization', e.target.value), className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500", children: workAuthOptions.map(option => (_jsx("option", { value: option, children: option }, option))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Travel Willingness" }), _jsx("select", { value: recruitData.travelWillingness, onChange: (e) => handleInputChange('travelWillingness', e.target.value), className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500", children: travelOptions.map(option => (_jsx("option", { value: option, children: option }, option))) })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("input", { type: "checkbox", id: "willingToRelocate", checked: recruitData.willingToRelocate, onChange: (e) => handleInputChange('willingToRelocate', e.target.checked), className: "w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500" }), _jsx("label", { htmlFor: "willingToRelocate", className: "text-sm text-slate-300", children: "Willing to relocate" })] })] })] }) }, "step3")), currentStep === 4 && (_jsx(motion.div, { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 }, className: "space-y-6", children: _jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold text-white mb-4 flex items-center", children: [_jsx(FileText, { className: "h-5 w-5 mr-2" }), "Recruiting Source & Notes"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Source *" }), _jsx("select", { value: recruitData.source, onChange: (e) => handleInputChange('source', e.target.value), className: `w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.source ? 'border-red-500' : 'border-slate-600'}`, children: sourceOptions.map(option => (_jsx("option", { value: option, children: option }, option))) }), errors.source && (_jsxs("p", { className: "text-red-400 text-sm mt-1 flex items-center", children: [_jsx(AlertCircle, { className: "h-4 w-4 mr-1" }), errors.source] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Recruiter Name" }), _jsx("input", { type: "text", value: recruitData.recruiterName, onChange: (e) => handleInputChange('recruiterName', e.target.value), className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Enter recruiter name" })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Recruiting Agency" }), _jsx("input", { type: "text", value: recruitData.recruiterAgency, onChange: (e) => handleInputChange('recruiterAgency', e.target.value), className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Enter recruiting agency name" })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Notes" }), _jsx("textarea", { value: recruitData.notes, onChange: (e) => handleInputChange('notes', e.target.value), rows: 4, className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none", placeholder: "Any additional notes about this recruit..." })] })] })] }) }, "step4"))] })), errors.submit && (_jsx("div", { className: "mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg", children: _jsxs("p", { className: "text-red-400 text-sm flex items-center", children: [_jsx(AlertCircle, { className: "h-4 w-4 mr-2" }), errors.submit] }) }))] }), !submitSuccess && (_jsxs("div", { className: "flex items-center justify-between p-6 border-t border-slate-700", children: [_jsx("button", { onClick: handlePrevious, disabled: currentStep === 1 || isSubmitting, className: "px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: "Previous" }), _jsxs("div", { className: "flex space-x-3", children: [_jsx("button", { onClick: handleClose, disabled: isSubmitting, className: "px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50", children: "Cancel" }), currentStep < totalSteps ? (_jsxs("button", { onClick: handleNext, disabled: isSubmitting, className: "px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2", children: [_jsx("span", { children: "Next" }), _jsx(ChevronRight, { className: "h-4 w-4" })] })) : (_jsx("button", { onClick: handleSubmit, disabled: isSubmitting, className: "px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center space-x-2", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader, { className: "h-4 w-4 animate-spin" }), _jsx("span", { children: "Adding Recruit..." })] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsx("span", { children: "Add Recruit" })] })) }))] })] }))] }) }) }));
}
//# sourceMappingURL=NewRecruitModal.js.map