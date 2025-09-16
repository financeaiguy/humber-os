'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, FileText, Camera, Plus, Trash2 } from 'lucide-react';
export default function ExpenseTrackingModal({ isOpen, onClose, selectedEngineer, selectedProject }) {
    const [expenses, setExpenses] = useState([
        {
            id: '1',
            category: 'meals',
            amount: 45.50,
            description: 'Dinner with client team',
            date: '2024-01-15',
            receipt: true
        }
    ]);
    const [newExpense, setNewExpense] = useState({
        category: 'meals',
        amount: '',
        description: '',
        date: ''
    });
    const expenseCategories = [
        { value: 'meals', label: 'Meals & Entertainment' },
        { value: 'travel', label: 'Travel & Transportation' },
        { value: 'lodging', label: 'Lodging' },
        { value: 'supplies', label: 'Supplies & Materials' },
        { value: 'equipment', label: 'Equipment Rental' },
        { value: 'other', label: 'Other' }
    ];
    const addExpense = () => {
        if (newExpense.amount && newExpense.description && newExpense.date) {
            const expense = {
                id: Date.now().toString(),
                category: newExpense.category,
                amount: parseFloat(newExpense.amount),
                description: newExpense.description,
                date: newExpense.date,
                receipt: false
            };
            setExpenses([...expenses, expense]);
            setNewExpense({ category: 'meals', amount: '', description: '', date: '' });
        }
    };
    const removeExpense = (id) => {
        setExpenses(expenses.filter(e => e.id !== id));
    };
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    if (!isOpen)
        return null;
    return (_jsx(AnimatePresence, { children: _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: onClose, className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, onClick: (e) => e.stopPropagation(), className: "bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto", children: [_jsx("div", { className: "p-4 sm:p-6 border-b border-slate-700", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-xl sm:text-2xl font-bold text-white flex items-center", children: [_jsx(DollarSign, { className: "h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-green-400" }), "Expense Tracking"] }), _jsx("p", { className: "text-slate-400", children: "Track and manage project expenses" })] }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-slate-800 rounded-lg transition-colors", children: _jsx(X, { className: "h-5 w-5 text-slate-400" }) })] }) }), _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [selectedEngineer && (_jsxs("div", { className: "p-4 bg-slate-800 rounded-lg border border-slate-700", children: [_jsx("h3", { className: "font-medium text-white mb-2", children: "Engineer" }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center", children: _jsx("span", { className: "text-white font-bold text-sm", children: selectedEngineer.avatar }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-white", children: selectedEngineer.name }), _jsx("p", { className: "text-xs text-slate-400", children: selectedEngineer.role })] })] })] })), selectedProject && (_jsxs("div", { className: "p-4 bg-slate-800 rounded-lg border border-slate-700", children: [_jsx("h3", { className: "font-medium text-white mb-2", children: "Project" }), _jsx("p", { className: "text-sm font-medium text-white", children: selectedProject.name }), _jsx("p", { className: "text-xs text-slate-400", children: selectedProject.client })] }))] }), _jsx("div", { className: "p-4 bg-green-500/10 rounded-lg border border-green-500/30", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium text-white", children: "Total Expenses" }), _jsxs("p", { className: "text-sm text-slate-400", children: [expenses.length, " items"] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-2xl font-bold text-green-400", children: ["$", totalExpenses.toFixed(2)] }), _jsx("p", { className: "text-xs text-slate-500", children: "This period" })] })] }) }), _jsxs("div", { className: "p-4 bg-slate-800/50 rounded-lg border border-slate-700", children: [_jsx("h3", { className: "font-medium text-white mb-4", children: "Add New Expense" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-slate-400 mb-1", children: "Category" }), _jsx("select", { value: newExpense.category, onChange: (e) => setNewExpense(prev => ({ ...prev, category: e.target.value })), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none", children: expenseCategories.map(cat => (_jsx("option", { value: cat.value, children: cat.label }, cat.value))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-slate-400 mb-1", children: "Amount" }), _jsx("input", { type: "number", step: "0.01", placeholder: "0.00", value: newExpense.amount, onChange: (e) => setNewExpense(prev => ({ ...prev, amount: e.target.value })), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-slate-400 mb-1", children: "Date" }), _jsx("input", { type: "date", value: newExpense.date, onChange: (e) => setNewExpense(prev => ({ ...prev, date: e.target.value })), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" })] }), _jsx("div", { className: "flex items-end", children: _jsxs("button", { onClick: addExpense, className: "w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2", children: [_jsx(Plus, { className: "h-4 w-4" }), _jsx("span", { children: "Add" })] }) })] }), _jsxs("div", { className: "mt-3", children: [_jsx("label", { className: "block text-xs font-medium text-slate-400 mb-1", children: "Description" }), _jsx("input", { type: "text", placeholder: "Expense description...", value: newExpense.description, onChange: (e) => setNewExpense(prev => ({ ...prev, description: e.target.value })), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none" })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-white mb-4", children: "Expense Items" }), _jsx("div", { className: "space-y-3", children: expenses.map(expense => (_jsx("div", { className: "p-4 bg-slate-800 rounded-lg border border-slate-700", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm font-medium text-white", children: expenseCategories.find(c => c.value === expense.category)?.label }), expense.receipt && (_jsx("span", { className: "text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full", children: "Receipt" }))] }), _jsxs("span", { className: "text-lg font-bold text-green-400", children: ["$", expense.amount.toFixed(2)] })] }), _jsx("p", { className: "text-sm text-slate-300 mt-1", children: expense.description }), _jsxs("p", { className: "text-xs text-slate-500 mt-1", children: [_jsx(Calendar, { className: "h-3 w-3 inline mr-1" }), new Date(expense.date).toLocaleDateString()] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { className: "p-2 hover:bg-slate-700 rounded-lg transition-colors", children: _jsx(Camera, { className: "h-4 w-4 text-slate-400" }) }), _jsx("button", { onClick: () => removeExpense(expense.id), className: "p-2 hover:bg-red-500/20 rounded-lg transition-colors", children: _jsx(Trash2, { className: "h-4 w-4 text-red-400" }) })] })] }) }, expense.id))) })] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: expenseCategories.map(category => {
                                    const categoryTotal = expenses
                                        .filter(e => e.category === category.value)
                                        .reduce((sum, e) => sum + e.amount, 0);
                                    return (_jsxs("div", { className: "p-3 bg-slate-800/50 rounded-lg border border-slate-700", children: [_jsx("p", { className: "text-xs text-slate-400", children: category.label }), _jsxs("p", { className: "text-lg font-bold text-white", children: ["$", categoryTotal.toFixed(2)] })] }, category.value));
                                }) })] }), _jsxs("div", { className: "p-6 border-t border-slate-700 flex justify-between", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-slate-400 hover:text-white transition-colors", children: "Cancel" }), _jsxs("div", { className: "flex space-x-3", children: [_jsxs("button", { className: "px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center space-x-2", children: [_jsx(FileText, { className: "h-4 w-4" }), _jsx("span", { children: "Export Report" })] }), _jsx("button", { onClick: () => {
                                            onClose();
                                        }, className: "px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300", children: "Save Expenses" })] })] })] }) }) }));
}
//# sourceMappingURL=ExpenseTrackingModal.js.map