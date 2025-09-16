'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, CreditCard, Clock, Star, MapPin, Search, Eye, Plus, Minus, X } from 'lucide-react';
export default function CustomerPurchaseInterface({ isOpen, onClose, customerData }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('rating');
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const availableEngineers = [
        {
            id: 'eng_001',
            name: 'Sarah Johnson',
            category: 'Controls',
            experience: 8,
            hourlyRate: 95,
            rating: 4.9,
            location: 'Detroit, MI',
            availability: 'Available',
            skills: ['PLC Programming', 'SCADA', 'HMI Design', 'Allen-Bradley', 'Siemens'],
            certifications: ['Rockwell Certified', 'OSHA 30'],
            previousClients: ['Ford', 'GM', 'Stellantis']
        },
        {
            id: 'eng_002',
            name: 'Michael Chen',
            category: 'Mechanical',
            experience: 12,
            hourlyRate: 105,
            rating: 4.8,
            location: 'Chicago, IL',
            availability: 'Available',
            skills: ['SolidWorks', 'AutoCAD', 'ANSYS', 'GD&T', 'Manufacturing'],
            certifications: ['PE License', 'Six Sigma Black Belt'],
            previousClients: ['Boeing', 'Caterpillar', 'John Deere']
        },
        {
            id: 'eng_003',
            name: 'Emily Rodriguez',
            category: 'Electrical',
            experience: 6,
            hourlyRate: 85,
            rating: 4.7,
            location: 'Houston, TX',
            availability: 'Available',
            skills: ['Power Systems', 'Motor Control', 'VFDs', 'Electrical Design'],
            certifications: ['Licensed Electrician', 'IEEE Member'],
            previousClients: ['ExxonMobil', 'Shell', 'Chevron']
        },
        {
            id: 'eng_004',
            name: 'David Kim',
            category: 'Robotics',
            experience: 10,
            hourlyRate: 115,
            rating: 5.0,
            location: 'San Jose, CA',
            availability: 'Available',
            skills: ['ROS', 'Computer Vision', 'Machine Learning', 'Python', 'C++'],
            certifications: ['Certified Robotics Engineer', 'AWS Certified'],
            previousClients: ['Tesla', 'Apple', 'Google']
        },
        {
            id: 'eng_005',
            name: 'Jennifer Walsh',
            category: 'Piping',
            experience: 15,
            hourlyRate: 120,
            rating: 4.9,
            location: 'Houston, TX',
            availability: 'Available',
            skills: ['Process Piping', 'AutoPIPE', 'CAESAR II', 'ASME B31.3'],
            certifications: ['Professional Engineer', 'ASME Certified'],
            previousClients: ['ExxonMobil', 'Chevron', 'BP']
        }
    ];
    const filteredEngineers = availableEngineers
        .filter(engineer => engineer.availability === 'Available' &&
        (selectedCategory === 'all' || engineer.category === selectedCategory) &&
        (searchTerm === '' ||
            engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            engineer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))))
        .sort((a, b) => {
        switch (sortBy) {
            case 'rate': return a.hourlyRate - b.hourlyRate;
            case 'rating': return b.rating - a.rating;
            case 'experience': return b.experience - a.experience;
            default: return 0;
        }
    });
    const addToCart = (engineer) => {
        const existingItem = cart.find(item => item.engineerId === engineer.id);
        if (existingItem) {
            setCart(prev => prev.map(item => item.engineerId === engineer.id
                ? { ...item, hours: item.hours + 40, totalCost: (item.hours + 40) * engineer.hourlyRate }
                : item));
        }
        else {
            const newItem = {
                engineerId: engineer.id,
                engineer,
                hours: 40,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                totalCost: 40 * engineer.hourlyRate
            };
            setCart(prev => [...prev, newItem]);
        }
    };
    const removeFromCart = (engineerId) => {
        setCart(prev => prev.filter(item => item.engineerId !== engineerId));
    };
    const updateCartItem = (engineerId, field, value) => {
        setCart(prev => prev.map(item => {
            if (item.engineerId === engineerId) {
                const updated = { ...item, [field]: value };
                if (field === 'hours') {
                    updated.totalCost = value * item.engineer.hourlyRate;
                }
                return updated;
            }
            return item;
        }));
    };
    const getTotalCost = () => {
        return cart.reduce((total, item) => total + item.totalCost, 0);
    };
    const handlePurchase = async () => {
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            alert(`Purchase successful! ${cart.length} engineer${cart.length > 1 ? 's' : ''} reserved for $${getTotalCost().toLocaleString()}`);
            setCart([]);
            onClose();
        }
        catch (error) {
            console.error('Purchase error:', error);
            alert('Purchase failed. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4", onClick: onClose, children: _jsxs(motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, className: "bg-slate-800 rounded-2xl border border-slate-700 max-w-7xl w-full max-h-[90vh] overflow-hidden", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-slate-700", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Purchase Engineer Time" }), _jsx("p", { className: "text-slate-400 mt-1", children: "Select engineers from our bull pen for your project" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("button", { onClick: () => setShowCart(!showCart), className: "relative px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2", children: [_jsx(ShoppingCart, { className: "h-4 w-4" }), _jsxs("span", { children: ["Cart (", cart.length, ")"] }), cart.length > 0 && (_jsx("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs", children: cart.length }))] }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-slate-700 rounded-lg transition-colors", children: _jsx(X, { className: "h-5 w-5 text-slate-400" }) })] })] }), _jsxs("div", { className: "flex h-[calc(90vh-120px)]", children: [_jsxs("div", { className: "flex-1 p-6 overflow-y-auto", children: [_jsxs("div", { className: "flex items-center space-x-4 mb-6", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" }), _jsx("input", { type: "text", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: "Search engineers or skills...", className: "w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" })] }), _jsxs("select", { value: selectedCategory, onChange: (e) => setSelectedCategory(e.target.value), className: "px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white", children: [_jsx("option", { value: "all", children: "All Categories" }), _jsx("option", { value: "Controls", children: "Controls" }), _jsx("option", { value: "Mechanical", children: "Mechanical" }), _jsx("option", { value: "Electrical", children: "Electrical" }), _jsx("option", { value: "Piping", children: "Piping" }), _jsx("option", { value: "Robotics", children: "Robotics" })] }), _jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white", children: [_jsx("option", { value: "rating", children: "Sort by Rating" }), _jsx("option", { value: "rate", children: "Sort by Rate" }), _jsx("option", { value: "experience", children: "Sort by Experience" })] })] }), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: filteredEngineers.map((engineer) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-slate-700/30 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-all", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold", children: engineer.name.split(' ').map(n => n[0]).join('') }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-white", children: engineer.name }), _jsxs("p", { className: "text-sm text-slate-400", children: [engineer.category, " Engineer"] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-lg font-bold text-green-400", children: ["$", engineer.hourlyRate, "/hr"] }), _jsxs("div", { className: "flex items-center space-x-1 text-yellow-400", children: [_jsx(Star, { className: "h-3 w-3 fill-current" }), _jsx("span", { className: "text-xs", children: engineer.rating })] })] })] }), _jsxs("div", { className: "space-y-2 mb-4", children: [_jsxs("div", { className: "flex items-center space-x-2 text-sm text-slate-400", children: [_jsx(Clock, { className: "h-4 w-4" }), _jsxs("span", { children: [engineer.experience, " years experience"] })] }), _jsxs("div", { className: "flex items-center space-x-2 text-sm text-slate-400", children: [_jsx(MapPin, { className: "h-4 w-4" }), _jsx("span", { children: engineer.location })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("div", { className: "text-xs text-slate-500 mb-1", children: "Key Skills" }), _jsxs("div", { className: "flex flex-wrap gap-1", children: [engineer.skills.slice(0, 3).map((skill) => (_jsx("span", { className: "px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs", children: skill }, skill))), engineer.skills.length > 3 && (_jsxs("span", { className: "px-2 py-1 bg-slate-600 text-slate-300 rounded text-xs", children: ["+", engineer.skills.length - 3, " more"] }))] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("div", { className: "text-xs text-slate-500 mb-1", children: "Previous Clients" }), _jsx("div", { className: "text-sm text-slate-300", children: engineer.previousClients.join(', ') })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: `px-2 py-1 rounded text-xs font-medium ${engineer.availability === 'Available' ? 'bg-green-500/20 text-green-400' :
                                                            engineer.availability === 'Busy' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                'bg-red-500/20 text-red-400'}`, children: engineer.availability }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs("button", { className: "px-3 py-1 bg-slate-600 text-white rounded text-xs hover:bg-slate-500 transition-colors flex items-center space-x-1", children: [_jsx(Eye, { className: "h-3 w-3" }), _jsx("span", { children: "Details" })] }), _jsxs("button", { onClick: () => addToCart(engineer), disabled: engineer.availability !== 'Available', className: "px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1", children: [_jsx(Plus, { className: "h-3 w-3" }), _jsx("span", { children: "Add to Cart" })] })] })] })] }, engineer.id))) })] }), showCart && (_jsxs(motion.div, { initial: { x: 300, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 300, opacity: 0 }, className: "w-96 bg-slate-900/50 border-l border-slate-700 p-6 overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: "Shopping Cart" }), _jsx("button", { onClick: () => setShowCart(false), className: "p-1 hover:bg-slate-700 rounded transition-colors", children: _jsx(X, { className: "h-4 w-4 text-slate-400" }) })] }), cart.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(ShoppingCart, { className: "h-12 w-12 text-slate-600 mx-auto mb-3" }), _jsx("p", { className: "text-slate-400", children: "Your cart is empty" }), _jsx("p", { className: "text-slate-500 text-sm", children: "Add engineers to get started" })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "space-y-4 mb-6", children: cart.map((item) => (_jsxs("div", { className: "bg-slate-800/50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-white", children: item.engineer.name }), _jsxs("p", { className: "text-sm text-slate-400", children: [item.engineer.category, " Engineer"] })] }), _jsx("button", { onClick: () => removeFromCart(item.engineerId), className: "p-1 hover:bg-slate-700 rounded transition-colors", children: _jsx(X, { className: "h-4 w-4 text-slate-400" }) })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-slate-400 mb-1", children: "Hours" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: () => updateCartItem(item.engineerId, 'hours', Math.max(8, item.hours - 8)), className: "p-1 bg-slate-700 rounded hover:bg-slate-600 transition-colors", children: _jsx(Minus, { className: "h-3 w-3 text-white" }) }), _jsx("input", { type: "number", value: item.hours, onChange: (e) => updateCartItem(item.engineerId, 'hours', parseInt(e.target.value) || 0), className: "w-16 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-center text-sm", min: "8", step: "8" }), _jsx("button", { onClick: () => updateCartItem(item.engineerId, 'hours', item.hours + 8), className: "p-1 bg-slate-700 rounded hover:bg-slate-600 transition-colors", children: _jsx(Plus, { className: "h-3 w-3 text-white" }) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-slate-400 mb-1", children: "Start Date" }), _jsx("input", { type: "date", value: item.startDate, onChange: (e) => updateCartItem(item.engineerId, 'startDate', e.target.value), className: "w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-slate-400 mb-1", children: "End Date" }), _jsx("input", { type: "date", value: item.endDate, onChange: (e) => updateCartItem(item.engineerId, 'endDate', e.target.value), className: "w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs" })] })] }), _jsxs("div", { className: "flex justify-between items-center pt-2 border-t border-slate-600", children: [_jsx("span", { className: "text-sm text-slate-400", children: "Total Cost:" }), _jsxs("span", { className: "font-semibold text-green-400", children: ["$", item.totalCost.toLocaleString()] })] })] })] }, item.engineerId))) }), _jsxs("div", { className: "border-t border-slate-700 pt-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("span", { className: "text-lg font-semibold text-white", children: "Total:" }), _jsxs("span", { className: "text-xl font-bold text-green-400", children: ["$", getTotalCost().toLocaleString()] })] }), _jsx("button", { onClick: handlePurchase, disabled: cart.length === 0 || isSubmitting, className: "w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b border-white" }), _jsx("span", { children: "Processing..." })] })) : (_jsxs(_Fragment, { children: [_jsx(CreditCard, { className: "h-4 w-4" }), _jsx("span", { children: "Purchase Engineers" })] })) })] })] }))] }))] })] }) }));
}
//# sourceMappingURL=CustomerPurchaseInterface.js.map