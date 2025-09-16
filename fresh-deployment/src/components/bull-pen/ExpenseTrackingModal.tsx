'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, DollarSign, Calendar, FileText, Camera, Plus, Trash2 } from 'lucide-react'

interface ExpenseTrackingModalProps {
  isOpen: boolean
  onClose: () => void
  selectedEngineer?: any
  selectedProject?: any
}

interface Expense {
  id: string
  category: string
  amount: number
  description: string
  date: string
  receipt?: boolean
}

export default function ExpenseTrackingModal({
  isOpen,
  onClose,
  selectedEngineer,
  selectedProject
}: ExpenseTrackingModalProps) {
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      category: 'meals',
      amount: 45.50,
      description: 'Dinner with client team',
      date: '2024-01-15',
      receipt: true
    }
  ])

  const [newExpense, setNewExpense] = useState({
    category: 'meals',
    amount: '',
    description: '',
    date: ''
  })

  const expenseCategories = [
    { value: 'meals', label: 'Meals & Entertainment' },
    { value: 'travel', label: 'Travel & Transportation' },
    { value: 'lodging', label: 'Lodging' },
    { value: 'supplies', label: 'Supplies & Materials' },
    { value: 'equipment', label: 'Equipment Rental' },
    { value: 'other', label: 'Other' }
  ]

  const addExpense = () => {
    if (newExpense.amount && newExpense.description && newExpense.date) {
      const expense: Expense = {
        id: Date.now().toString(),
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        description: newExpense.description,
        date: newExpense.date,
        receipt: false
      }
      setExpenses([...expenses, expense])
      setNewExpense({ category: 'meals', amount: '', description: '', date: '' })
    }
  }

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id))
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        >
          <div className="p-4 sm:p-6 border-b border-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-green-400" />
                  Expense Tracking
                </h2>
                <p className="text-slate-400">Track and manage project expenses</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Context Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedEngineer && (
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <h3 className="font-medium text-white mb-2">Engineer</h3>
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{selectedEngineer.avatar}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{selectedEngineer.name}</p>
                      <p className="text-xs text-slate-400">{selectedEngineer.role}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedProject && (
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <h3 className="font-medium text-white mb-2">Project</h3>
                  <p className="text-sm font-medium text-white">{selectedProject.name}</p>
                  <p className="text-xs text-slate-400">{selectedProject.client}</p>
                </div>
              )}
            </div>

            {/* Expense Summary */}
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Total Expenses</h3>
                  <p className="text-sm text-slate-400">{expenses.length} items</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-400">${totalExpenses.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">This period</p>
                </div>
              </div>
            </div>

            {/* Add New Expense */}
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h3 className="font-medium text-white mb-4">Add New Expense</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {expenseCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={addExpense}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Expense description..."
                  value={newExpense.description}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Expense List */}
            <div>
              <h3 className="font-medium text-white mb-4">Expense Items</h3>
              <div className="space-y-3">
                {expenses.map(expense => (
                  <div key={expense.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-white">
                              {expenseCategories.find(c => c.value === expense.category)?.label}
                            </span>
                            {expense.receipt && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                Receipt
                              </span>
                            )}
                          </div>
                          <span className="text-lg font-bold text-green-400">
                            ${expense.amount.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 mt-1">{expense.description}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                          <Camera className="h-4 w-4 text-slate-400" />
                        </button>
                        <button 
                          onClick={() => removeExpense(expense.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Categories Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {expenseCategories.map(category => {
                const categoryTotal = expenses
                  .filter(e => e.category === category.value)
                  .reduce((sum, e) => sum + e.amount, 0)
                
                return (
                  <div key={category.value} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-xs text-slate-400">{category.label}</p>
                    <p className="text-lg font-bold text-white">${categoryTotal.toFixed(2)}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="p-6 border-t border-slate-700 flex justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Export Report</span>
              </button>
              <button
                onClick={() => {
                  // Handle save logic here
                  onClose()
                }}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
              >
                Save Expenses
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}