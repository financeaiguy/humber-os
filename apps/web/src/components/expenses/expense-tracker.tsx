'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Receipt, 
  Car, 
  Plane, 
  Hotel, 
  Coffee, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Calculator
} from 'lucide-react'
import { TravelExpense, MiscExpense, TravelExpenseType, ExpenseCategory } from '@/types/invoicing'

interface ExpenseTrackerProps {
  engineerId: string
  engineerName: string
  projectId?: string
}

export function ExpenseTracker({ engineerId, engineerName, projectId }: ExpenseTrackerProps) {
  const [expenses, setExpenses] = useState<(TravelExpense | MiscExpense)[]>([])
  const [showNewExpense, setShowNewExpense] = useState(false)
  const [expenseType, setExpenseType] = useState<'travel' | 'misc'>('travel')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState({
    totalAmount: 0,
    approvedAmount: 0,
    pendingAmount: 0,
    reimbursableAmount: 0,
    billableAmount: 0
  })

  useEffect(() => {
    fetchExpenses()
  }, [engineerId])

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ engineerId })
      if (projectId) params.append('projectId', projectId)
      
      const response = await fetch(`/api/expenses?${params}`)
      const data = await response.json()
      
      if (data.expenses) {
        setExpenses(data.expenses)
        setSummary(data.summary)
      }
    } catch (error) {
      // SECURITY: console statement removed: console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitExpense = async (expenseData: any) => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...expenseData,
          type: expenseType,
          engineerId,
          engineerName,
          projectId
        })
      })

      const result = await response.json()
      
      if (result.success) {
        await fetchExpenses() // Refresh the list
        setShowNewExpense(false)
        // SECURITY: console statement removed: console.log('✅ Expense submitted successfully')
      } else {
        // SECURITY: console statement removed: console.error('Failed to submit expense:', result.error)
      }
    } catch (error) {
      // SECURITY: console statement removed: console.error('Error submitting expense:', error)
    } finally {
      setLoading(false)
    }
  }

  const getExpenseIcon = (expense: TravelExpense | MiscExpense) => {
    if ('type' in expense) {
      // Travel expense
      switch (expense.type) {
        case 'airfare': return <Plane className="h-5 w-5 text-blue-400" />
        case 'hotel': return <Hotel className="h-5 w-5 text-purple-400" />
        case 'meals': return <Coffee className="h-5 w-5 text-orange-400" />
        case 'mileage': return <Car className="h-5 w-5 text-green-400" />
        default: return <Receipt className="h-5 w-5 text-gray-400" />
      }
    } else {
      // Misc expense
      return <FileText className="h-5 w-5 text-slate-400" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total</p>
              <p className="text-lg font-bold text-white">{formatCurrency(summary.totalAmount)}</p>
            </div>
            <DollarSign className="h-6 w-6 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Approved</p>
              <p className="text-lg font-bold text-green-400">{formatCurrency(summary.approvedAmount)}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Pending</p>
              <p className="text-lg font-bold text-yellow-400">{formatCurrency(summary.pendingAmount)}</p>
            </div>
            <Clock className="h-6 w-6 text-yellow-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Reimbursable</p>
              <p className="text-lg font-bold text-purple-400">{formatCurrency(summary.reimbursableAmount)}</p>
            </div>
            <Receipt className="h-6 w-6 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Billable</p>
              <p className="text-lg font-bold text-orange-400">{formatCurrency(summary.billableAmount)}</p>
            </div>
            <Calculator className="h-6 w-6 text-orange-400" />
          </div>
        </motion.div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Expense Tracker</h2>
          <p className="text-slate-400">Track travel and miscellaneous expenses</p>
        </div>
        <button
          onClick={() => setShowNewExpense(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* New Expense Modal */}
      {showNewExpense && (
        <NewExpenseModal
          expenseType={expenseType}
          setExpenseType={setExpenseType}
          onSubmit={submitExpense}
          onClose={() => setShowNewExpense(false)}
          loading={loading}
        />
      )}

      {/* Expenses List */}
      <div className="space-y-4">
        {expenses.map((expense, index) => (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {getExpenseIcon(expense)}
                <div>
                  <h3 className="font-semibold text-white">{expense.description}</h3>
                  <p className="text-sm text-slate-400">
                    {'type' in expense ? `Travel - ${expense.type}` : `Misc - ${expense.category}`}
                  </p>
                  <p className="text-xs text-slate-500">{expense.date} • {expense.location || 'N/A'}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-bold text-white">{formatCurrency(expense.amount)}</p>
                <div className="flex items-center space-x-2 mt-1">
                  {expense.approved ? (
                    <span className="flex items-center text-xs text-green-400">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approved
                    </span>
                  ) : (
                    <span className="flex items-center text-xs text-yellow-400">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </span>
                  )}
                  {expense.billableToClient && (
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">
                      Billable
                    </span>
                  )}
                  {expense.reimbursable && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                      Reimbursable
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {expenses.length === 0 && !loading && (
        <div className="text-center py-12">
          <Receipt className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No expenses recorded yet</p>
          <p className="text-sm text-slate-500">Add your first expense to get started</p>
        </div>
      )}
    </div>
  )
}

interface NewExpenseModalProps {
  expenseType: 'travel' | 'misc'
  setExpenseType: (type: 'travel' | 'misc') => void
  onSubmit: (data: any) => void
  onClose: () => void
  loading: boolean
}

function NewExpenseModal({ expenseType, setExpenseType, onSubmit, onClose, loading }: NewExpenseModalProps) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    expenseType: 'meals' as TravelExpenseType,
    category: 'office_supplies' as ExpenseCategory,
    billableToClient: false,
    reimbursable: true,
    mileage: '',
    receipt: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
      mileage: formData.mileage ? parseFloat(formData.mileage) : undefined
    }
    
    onSubmit(submitData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md"
      >
        <h3 className="text-xl font-bold text-white mb-4">Add New Expense</h3>
        
        {/* Expense Type Toggle */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setExpenseType('travel')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              expenseType === 'travel' 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Travel
          </button>
          <button
            onClick={() => setExpenseType('misc')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              expenseType === 'misc' 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Miscellaneous
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {expenseType === 'travel' ? 'Expense Type' : 'Category'}
            </label>
            {expenseType === 'travel' ? (
              <select
                value={formData.expenseType}
                onChange={(e) => setFormData({...formData, expenseType: e.target.value as TravelExpenseType})}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="meals">Meals</option>
                <option value="hotel">Hotel</option>
                <option value="airfare">Airfare</option>
                <option value="mileage">Mileage</option>
                <option value="ground_transport">Ground Transport</option>
                <option value="parking">Parking</option>
                <option value="fuel">Fuel</option>
                <option value="car_rental">Car Rental</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as ExpenseCategory})}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="office_supplies">Office Supplies</option>
                <option value="equipment">Equipment</option>
                <option value="software">Software</option>
                <option value="training">Training</option>
                <option value="communication">Communication</option>
                <option value="professional_services">Professional Services</option>
                <option value="other">Other</option>
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {expenseType === 'travel' && formData.expenseType === 'mileage' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Miles Driven
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.mileage}
                onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Amount will be calculated at $0.67/mile"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.billableToClient}
                onChange={(e) => setFormData({...formData, billableToClient: e.target.checked})}
                className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-300">Billable to client</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.reimbursable}
                onChange={(e) => setFormData({...formData, reimbursable: e.target.checked})}
                className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-300">Reimbursable</span>
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}