'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Download, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  DollarSign,
  Eye,
  Calendar,
  User,
  Building,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import { Invoice, PaymentRecord } from '@/types/invoicing'

export default function CustomerPortalPage() {
  const searchParams = useSearchParams()
  const [session, setSession] = useState<any>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sessionId = searchParams.get('session')
  const token = searchParams.get('token')

  useEffect(() => {
    if (sessionId && token) {
      validateSession()
    } else {
      setError('Invalid access link. Please check your email for the correct link.')
      setLoading(false)
    }
  }, [sessionId, token])

  const validateSession = async () => {
    try {
      const response = await fetch(`/api/customer-portal/auth?session=${sessionId}&token=${token}`)
      const data = await response.json()
      
      if (data.valid) {
        setSession(data.session)
        await fetchInvoices(data.session.accessibleInvoices)
      } else {
        setError(data.error || 'Session validation failed')
      }
    } catch (error) {
      // SECURITY: Removed console.error('Session validation error:', error)
      setError('Failed to validate session')
    } finally {
      setLoading(false)
    }
  }

  const fetchInvoices = async (invoiceIds: string[]) => {
    try {
      // In a real implementation, you'd fetch invoices by IDs
      // For now, we'll use mock data
      const mockInvoices: Invoice[] = [
        {
          id: 'inv-001',
          invoiceNumber: 'HMB-202411-0001',
          projectId: 'proj-001',
          projectName: 'GM Assembly Line Automation',
          clientId: 'client-gm',
          clientName: 'General Motors',
          clientEmail: 'customer@gm.com',
          status: 'sent',
          type: 'project_milestone',
          description: 'First milestone - Electrical system design and implementation',
          lineItems: [
            {
              id: 'line-001',
              description: 'Engineering Services - Sarah Johnson (Lead Electrical Engineer)',
              quantity: 180,
              unitPrice: 175,
              amount: 31500,
              category: 'engineering_hours',
              engineerId: 'eng-001',
              engineerName: 'Sarah Johnson',
              hours: 180
            },
            {
              id: 'line-002',
              description: 'Software Licenses - AutoCAD Electrical',
              quantity: 1,
              unitPrice: 2500,
              amount: 2500,
              category: 'software_licenses'
            }
          ],
          engineerCosts: [],
          totalEngineerHours: 180,
          totalEngineerCost: 31500,
          softCosts: { softwareLicenses: [], cloudServices: [], subscriptions: [], training: [], consulting: [], documentation: [], total: 2500 },
          hardCosts: { equipment: [], materials: [], tools: [], infrastructure: [], shipping: [], installation: [], total: 0 },
          travelExpenses: [],
          miscExpenses: [],
          subtotal: 34000,
          taxRate: 6.0,
          taxAmount: 2040,
          total: 36040,
          currency: 'USD',
          approvalStatus: 'approved',
          approvals: [],
          requiredApprovers: [],
          issueDate: '2024-11-01',
          dueDate: '2024-12-01',
          createdAt: '2024-11-01T00:00:00Z',
          updatedAt: '2024-11-01T00:00:00Z',
          customerPortalAccess: true,
          billableHours: 180
        },
        {
          id: 'inv-002',
          invoiceNumber: 'HMB-202411-0002',
          projectId: 'proj-001',
          projectName: 'GM Assembly Line Automation',
          clientId: 'client-gm',
          clientName: 'General Motors',
          clientEmail: 'customer@gm.com',
          status: 'paid',
          type: 'hourly_billing',
          description: 'Monthly billing - October 2024',
          lineItems: [
            {
              id: 'line-003',
              description: 'Engineering Services - Michael Chen (Mechanical Engineer)',
              quantity: 160,
              unitPrice: 150,
              amount: 24000,
              category: 'engineering_hours',
              engineerId: 'eng-002',
              engineerName: 'Michael Chen',
              hours: 160
            }
          ],
          engineerCosts: [],
          totalEngineerHours: 160,
          totalEngineerCost: 24000,
          softCosts: { softwareLicenses: [], cloudServices: [], subscriptions: [], training: [], consulting: [], documentation: [], total: 0 },
          hardCosts: { equipment: [], materials: [], tools: [], infrastructure: [], shipping: [], installation: [], total: 0 },
          travelExpenses: [],
          miscExpenses: [],
          subtotal: 24000,
          taxRate: 6.0,
          taxAmount: 1440,
          total: 25440,
          currency: 'USD',
          approvalStatus: 'approved',
          approvals: [],
          requiredApprovers: [],
          issueDate: '2024-10-01',
          dueDate: '2024-11-01',
          paidDate: '2024-10-25',
          createdAt: '2024-10-01T00:00:00Z',
          updatedAt: '2024-10-25T00:00:00Z',
          customerPortalAccess: true,
          billableHours: 160
        }
      ]
      
      setInvoices(mockInvoices)
    } catch (error) {
      // SECURITY: Removed console.error('Error fetching invoices:', error)
    }
  }

  const initiatePayment = async (invoice: Invoice, paymentMethod: string) => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount: invoice.total,
          paymentMethod,
          customerEmail: session.clientEmail,
          returnUrl: `${window.location.origin}/customer-portal/payment-success`,
          cancelUrl: `${window.location.origin}/customer-portal/payment-cancelled`
        })
      })

      const data = await response.json()
      
      if (data.success) {
        if (data.paymentUrl) {
          // Redirect to payment gateway
          window.open(data.paymentUrl, '_blank')
        } else if (data.instructions) {
          // Show bank transfer instructions
          alert(`Bank Transfer Instructions:\n\nAccount: ${data.instructions.accountName}\nAccount Number: ${data.instructions.accountNumber}\nRouting: ${data.instructions.routingNumber}\nReference: ${data.instructions.referenceNumber}\nAmount: $${data.instructions.amount}`)
        }
      } else {
        alert('Failed to create payment: ' + data.error)
      }
    } catch (error) {
      // SECURITY: Removed console.error('Payment initiation error:', error)
      alert('Failed to initiate payment')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400'
      case 'sent': return 'bg-blue-500/20 text-blue-400'
      case 'overdue': return 'bg-red-500/20 text-red-400'
      case 'draft': return 'bg-yellow-500/20 text-yellow-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'sent': return <Clock className="h-5 w-5 text-blue-400" />
      case 'overdue': return <AlertCircle className="h-5 w-5 text-red-400" />
      default: return <FileText className="h-5 w-5 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-lg">Loading your invoices...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Error</h1>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Customer Portal</h1>
              <p className="text-slate-400">Welcome, {session?.clientEmail}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Session expires:</p>
              <p className="text-sm text-white">{new Date(session?.expiryTime).toLocaleString()}</p>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Invoices</p>
                  <p className="text-2xl font-bold text-white">{invoices.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-400" />
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
                  <p className="text-sm text-slate-400">Total Amount</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(invoices.reduce((sum, inv) => sum + inv.total, 0))}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
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
                  <p className="text-sm text-slate-400">Paid</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0))}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
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
                  <p className="text-sm text-slate-400">Outstanding</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {formatCurrency(invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.total, 0))}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Your Invoices</h2>
          
          {invoices.map((invoice, index) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {getStatusIcon(invoice.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{invoice.invoiceNumber}</h3>
                    <p className="text-sm text-slate-400">{invoice.projectName}</p>
                    <p className="text-xs text-slate-500">{invoice.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{formatCurrency(invoice.total)}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)} mt-1`}>
                    {invoice.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700/50">
                <div>
                  <p className="text-xs text-slate-500">Issue Date</p>
                  <p className="text-sm text-white">{new Date(invoice.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Due Date</p>
                  <p className="text-sm text-white">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Billable Hours</p>
                  <p className="text-sm text-white">{invoice.billableHours} hours</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                <button
                  onClick={() => setSelectedInvoice(invoice)}
                  className="flex items-center space-x-2 px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors">
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>

                  {invoice.status !== 'paid' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => initiatePayment(invoice, 'stripe')}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Pay Now</span>
                      </button>
                      
                      <button
                        onClick={() => initiatePayment(invoice, 'bank_transfer')}
                        className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Building className="h-4 w-4" />
                        <span>Wire Transfer</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Invoice Detail Modal */}
        {selectedInvoice && (
          <InvoiceDetailModal 
            invoice={selectedInvoice} 
            onClose={() => setSelectedInvoice(null)}
            onPayment={(method) => initiatePayment(selectedInvoice, method)}
          />
        )}
      </div>
    </div>
  )
}

interface InvoiceDetailModalProps {
  invoice: Invoice
  onClose: () => void
  onPayment: (method: string) => void
}

function InvoiceDetailModal({ invoice, onClose, onPayment }: InvoiceDetailModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{invoice.invoiceNumber}</h2>
            <p className="text-slate-400">{invoice.projectName}</p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Line Items */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Line Items</h3>
          <div className="space-y-2">
            {invoice.lineItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{item.description}</p>
                  <p className="text-sm text-slate-400">
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                    {item.hours && ` (${item.hours} hours)`}
                  </p>
                </div>
                <p className="text-lg font-bold text-white">{formatCurrency(item.amount)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-slate-700 pt-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Subtotal:</span>
              <span className="text-white">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tax ({invoice.taxRate}%):</span>
              <span className="text-white">{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-slate-700 pt-2">
              <span className="text-white">Total:</span>
              <span className="text-white">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Actions */}
        {invoice.status !== 'paid' && (
          <div className="flex space-x-4">
            <button
              onClick={() => onPayment('stripe')}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CreditCard className="h-5 w-5" />
              <span>Pay with Card</span>
            </button>
            
            <button
              onClick={() => onPayment('paypal')}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <ExternalLink className="h-5 w-5" />
              <span>Pay with PayPal</span>
            </button>
            
            <button
              onClick={() => onPayment('bank_transfer')}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Building className="h-5 w-5" />
              <span>Wire Transfer</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}