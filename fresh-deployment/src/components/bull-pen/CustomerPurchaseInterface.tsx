'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ShoppingCart, CreditCard, Calendar, Clock, User, Star,
  MapPin, DollarSign, CheckCircle, AlertCircle, Filter,
  Search, SortAsc, Eye, Plus, Minus, X, Save
} from 'lucide-react'

interface Engineer {
  id: string
  name: string
  category: 'Controls' | 'Mechanical' | 'Electrical' | 'Piping' | 'Robotics'
  experience: number
  hourlyRate: number
  rating: number
  location: string
  availability: 'Available' | 'Busy' | 'Booked'
  skills: string[]
  certifications: string[]
  previousClients: string[]
  image?: string
}

interface PurchaseItem {
  engineerId: string
  engineer: Engineer
  hours: number
  startDate: string
  endDate: string
  totalCost: number
}

interface CustomerPurchaseProps {
  isOpen: boolean
  onClose: () => void
  customerData?: any
}

export default function CustomerPurchaseInterface({ isOpen, onClose, customerData }: CustomerPurchaseProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'rate' | 'rating' | 'experience'>('rating')
  const [cart, setCart] = useState<PurchaseItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock engineer data for bull pen
  const availableEngineers: Engineer[] = [
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
  ]

  const filteredEngineers = availableEngineers
    .filter(engineer => 
      engineer.availability === 'Available' &&
      (selectedCategory === 'all' || engineer.category === selectedCategory) &&
      (searchTerm === '' || 
        engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        engineer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'rate': return a.hourlyRate - b.hourlyRate
        case 'rating': return b.rating - a.rating
        case 'experience': return b.experience - a.experience
        default: return 0
      }
    })

  const addToCart = (engineer: Engineer) => {
    const existingItem = cart.find(item => item.engineerId === engineer.id)
    if (existingItem) {
      setCart(prev => prev.map(item => 
        item.engineerId === engineer.id 
          ? { ...item, hours: item.hours + 40, totalCost: (item.hours + 40) * engineer.hourlyRate }
          : item
      ))
    } else {
      const newItem: PurchaseItem = {
        engineerId: engineer.id,
        engineer,
        hours: 40,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalCost: 40 * engineer.hourlyRate
      }
      setCart(prev => [...prev, newItem])
    }
  }

  const removeFromCart = (engineerId: string) => {
    setCart(prev => prev.filter(item => item.engineerId !== engineerId))
  }

  const updateCartItem = (engineerId: string, field: keyof PurchaseItem, value: any) => {
    setCart(prev => prev.map(item => {
      if (item.engineerId === engineerId) {
        const updated = { ...item, [field]: value }
        if (field === 'hours') {
          updated.totalCost = value * item.engineer.hourlyRate
        }
        return updated
      }
      return item
    }))
  }

  const getTotalCost = () => {
    return cart.reduce((total, item) => total + item.totalCost, 0)
  }

  const handlePurchase = async () => {
    setIsSubmitting(true)
    
    try {
      // Simulate purchase API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In production, this would:
      // 1. Create purchase order
      // 2. Reserve engineers
      // 3. Set up project workspace
      // 4. Send notifications
      // 5. Generate contracts
      
      alert(`Purchase successful! ${cart.length} engineer${cart.length > 1 ? 's' : ''} reserved for $${getTotalCost().toLocaleString()}`)
      setCart([])
      onClose()
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Purchase failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 rounded-2xl border border-slate-700 max-w-7xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Purchase Engineer Time</h2>
            <p className="text-slate-400 mt-1">Select engineers from our bull pen for your project</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Cart ({cart.length})</span>
              {cart.length > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs">
                  {cart.length}
                </div>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Engineer Catalog */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search engineers or skills..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="all">All Categories</option>
                <option value="Controls">Controls</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Electrical">Electrical</option>
                <option value="Piping">Piping</option>
                <option value="Robotics">Robotics</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="rating">Sort by Rating</option>
                <option value="rate">Sort by Rate</option>
                <option value="experience">Sort by Experience</option>
              </select>
            </div>

            {/* Engineer Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredEngineers.map((engineer) => (
                <motion.div
                  key={engineer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-700/30 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {engineer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{engineer.name}</h3>
                        <p className="text-sm text-slate-400">{engineer.category} Engineer</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-400">${engineer.hourlyRate}/hr</div>
                      <div className="flex items-center space-x-1 text-yellow-400">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-xs">{engineer.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span>{engineer.experience} years experience</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <MapPin className="h-4 w-4" />
                      <span>{engineer.location}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-slate-500 mb-1">Key Skills</div>
                    <div className="flex flex-wrap gap-1">
                      {engineer.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                      {engineer.skills.length > 3 && (
                        <span className="px-2 py-1 bg-slate-600 text-slate-300 rounded text-xs">
                          +{engineer.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-slate-500 mb-1">Previous Clients</div>
                    <div className="text-sm text-slate-300">
                      {engineer.previousClients.join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      engineer.availability === 'Available' ? 'bg-green-500/20 text-green-400' :
                      engineer.availability === 'Busy' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {engineer.availability}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        className="px-3 py-1 bg-slate-600 text-white rounded text-xs hover:bg-slate-500 transition-colors flex items-center space-x-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Details</span>
                      </button>
                      <button
                        onClick={() => addToCart(engineer)}
                        disabled={engineer.availability !== 'Available'}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Shopping Cart Sidebar */}
          {showCart && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-96 bg-slate-900/50 border-l border-slate-700 p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Shopping Cart</h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Your cart is empty</p>
                  <p className="text-slate-500 text-sm">Add engineers to get started</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.engineerId} className="bg-slate-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-white">{item.engineer.name}</h4>
                            <p className="text-sm text-slate-400">{item.engineer.category} Engineer</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.engineerId)}
                            className="p-1 hover:bg-slate-700 rounded transition-colors"
                          >
                            <X className="h-4 w-4 text-slate-400" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Hours</label>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateCartItem(item.engineerId, 'hours', Math.max(8, item.hours - 8))}
                                className="p-1 bg-slate-700 rounded hover:bg-slate-600 transition-colors"
                              >
                                <Minus className="h-3 w-3 text-white" />
                              </button>
                              <input
                                type="number"
                                value={item.hours}
                                onChange={(e) => updateCartItem(item.engineerId, 'hours', parseInt(e.target.value) || 0)}
                                className="w-16 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-center text-sm"
                                min="8"
                                step="8"
                              />
                              <button
                                onClick={() => updateCartItem(item.engineerId, 'hours', item.hours + 8)}
                                className="p-1 bg-slate-700 rounded hover:bg-slate-600 transition-colors"
                              >
                                <Plus className="h-3 w-3 text-white" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-slate-400 mb-1">Start Date</label>
                              <input
                                type="date"
                                value={item.startDate}
                                onChange={(e) => updateCartItem(item.engineerId, 'startDate', e.target.value)}
                                className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-400 mb-1">End Date</label>
                              <input
                                type="date"
                                value={item.endDate}
                                onChange={(e) => updateCartItem(item.engineerId, 'endDate', e.target.value)}
                                className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs"
                              />
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-slate-600">
                            <span className="text-sm text-slate-400">Total Cost:</span>
                            <span className="font-semibold text-green-400">${item.totalCost.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart Summary */}
                  <div className="border-t border-slate-700 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-white">Total:</span>
                      <span className="text-xl font-bold text-green-400">${getTotalCost().toLocaleString()}</span>
                    </div>
                    
                    <button
                      onClick={handlePurchase}
                      disabled={cart.length === 0 || isSubmitting}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4" />
                          <span>Purchase Engineers</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
