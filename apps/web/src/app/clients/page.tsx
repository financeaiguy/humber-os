'use client'


import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  DollarSign,
  Users,
  Briefcase,
  TrendingUp,
  Plus
} from 'lucide-react'
import { NewCustomerModal } from '@/components/clients/NewCustomerModal'

const clients = [
  {
    id: 1,
    name: 'General Motors',
    industry: 'Automotive Manufacturing',
    location: 'Detroit, MI',
    contact: {
      name: 'Demo Contact',
      email: 'demo@example.com',
      phone: '+1 (555) 000-0000'
    },
    projects: {
      active: 2,
      completed: 8,
      totalValue: 2850000
    },
    engineers: {
      deployed: 6,
      categories: ['Electrical', 'Mechanical', 'Software']
    },
    relationship: {
      since: '2022-03-15',
      status: 'active',
      satisfaction: 4.8,
      lastContact: '2025-01-12'
    }
  },
  {
    id: 2,
    name: 'Ford Motor Company',
    industry: 'Automotive Manufacturing',
    location: 'Dearborn, MI',
    contact: {
      name: 'Maria Garcia',
      email: 'demo@example.com',
      phone: '+1 (313) 555-0456'
    },
    projects: {
      active: 1,
      completed: 5,
      totalValue: 1950000
    },
    engineers: {
      deployed: 4,
      categories: ['Mechanical', 'Systems', 'Project']
    },
    relationship: {
      since: '2022-08-20',
      status: 'active',
      satisfaction: 4.6,
      lastContact: '2025-01-10'
    }
  },
  {
    id: 3,
    name: 'Stellantis',
    industry: 'Automotive Manufacturing',
    location: 'Auburn Hills, MI',
    contact: {
      name: 'Robert Wilson',
      email: 'demo@example.com',
      phone: '+1 (248) 555-0789'
    },
    projects: {
      active: 1,
      completed: 3,
      totalValue: 1200000
    },
    engineers: {
      deployed: 3,
      categories: ['Electrical', 'Systems']
    },
    relationship: {
      since: '2023-01-10',
      status: 'active',
      satisfaction: 4.4,
      lastContact: '2025-01-08'
    }
  },
  {
    id: 4,
    name: 'HIROTEC America',
    industry: 'Automotive Supplier',
    location: 'Howell, MI',
    contact: {
      name: 'Takeshi Yamamoto',
      email: 'demo@example.com',
      phone: '+1 (517) 555-0321'
    },
    projects: {
      active: 1,
      completed: 4,
      totalValue: 980000
    },
    engineers: {
      deployed: 2,
      categories: ['Robotics', 'Mechanical']
    },
    relationship: {
      since: '2023-05-22',
      status: 'active',
      satisfaction: 4.9,
      lastContact: '2025-01-11'
    }
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500/20 text-green-400'
    case 'inactive': return 'bg-gray-500/20 text-gray-400'
    case 'pending': return 'bg-yellow-500/20 text-yellow-400'
    default: return 'bg-blue-500/20 text-blue-400'
  }
}

export default function ClientsPage() {
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false)
  const [clientList, setClientList] = useState(clients)
  
  const totalRevenue = clientList.reduce((sum, client) => sum + client.projects.totalValue, 0)
  const totalProjects = clientList.reduce((sum, client) => sum + client.projects.active + client.projects.completed, 0)
  // const totalEngineers = clientList.reduce((sum, client) => sum + client.engineers.deployed, 0)
  const avgSatisfaction = clientList.reduce((sum, client) => sum + client.relationship.satisfaction, 0) / clientList.length

  const handleAddCustomer = (newCustomer: any) => {
    const customerWithId = {
      ...newCustomer,
      id: Math.max(...clientList.map(c => c.id)) + 1,
      relationship: {
        ...newCustomer.relationship,
        since: new Date().toISOString().split('T')[0],
        status: 'active',
        lastContact: new Date().toISOString().split('T')[0]
      }
    }
    setClientList([...clientList, customerWithId])
    setIsNewCustomerModalOpen(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Customer Management
          </h1>
          <p className="text-slate-400">
            Manage customer relationships and track project performance.
          </p>
        </div>
        <button
          onClick={() => setIsNewCustomerModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Client Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Clients</p>
              <p className="text-2xl font-bold text-white mt-1">{clientList.length}</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Revenue</p>
              <p className="text-2xl font-bold text-white mt-1">${(totalRevenue / 1000000).toFixed(1)}M</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Active Projects</p>
              <p className="text-2xl font-bold text-white mt-1">{totalProjects}</p>
            </div>
            <Briefcase className="h-8 w-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Avg Satisfaction</p>
              <p className="text-2xl font-bold text-white mt-1">{avgSatisfaction.toFixed(1)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-400" />
          </div>
        </motion.div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {clientList.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600 transition-all duration-300"
          >
            {/* Client Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">{client.name}</h3>
                <p className="text-sm text-slate-400">{client.industry}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(client.relationship.status)}`}>
                {client.relationship.status}
              </span>
            </div>

            {/* Contact Info */}
            <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-white mb-3">Primary Contact</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span>{client.contact.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>{client.contact.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{client.contact.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>{client.location}</span>
                </div>
              </div>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-sm text-slate-400">Projects</p>
                <p className="text-lg font-bold text-white">
                  {client.projects.active} active, {client.projects.completed} completed
                </p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-sm text-slate-400">Engineers</p>
                <p className="text-lg font-bold text-white">{client.engineers.deployed} deployed</p>
              </div>
            </div>

            {/* Financial & Relationship */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
              <div className="text-center">
                <p className="text-lg font-bold text-green-400">
                  ${(client.projects.totalValue / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-slate-400">Total Value</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-yellow-400">{client.relationship.satisfaction}</p>
                <p className="text-xs text-slate-400">Satisfaction</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-400">
                  {Math.round((new Date().getTime() - new Date(client.relationship.since).getTime()) / (1000 * 60 * 60 * 24 * 365 * 10)) / 10}y
                </p>
                <p className="text-xs text-slate-400">Partnership</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* New Customer Modal */}
      <NewCustomerModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
        onSubmit={handleAddCustomer}
      />
    </div>
  )
}
