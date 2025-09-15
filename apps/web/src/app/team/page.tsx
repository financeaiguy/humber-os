'use client'

import { motion } from 'framer-motion'
import { Users, Mail, Phone, MapPin, Calendar, Award } from 'lucide-react'

const teamMembers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Senior Electrical Engineer',
    category: 'ELECTRICAL_ENGINEER',
    email: 'sarah.johnson@humber.com',
    phone: '+1 (555) 123-4567',
    location: 'Detroit, MI',
    status: 'deployed',
    currentProject: 'GM Assembly Line Automation',
    hourlyRate: 85,
    joinDate: '2023-03-15',
    completedProjects: 12,
    rating: 4.8
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Mechanical Engineer',
    category: 'MECHANICAL_ENGINEER',
    email: 'michael.chen@humber.com',
    phone: '+1 (555) 234-5678',
    location: 'Dearborn, MI',
    status: 'available',
    currentProject: null,
    hourlyRate: 80,
    joinDate: '2023-01-20',
    completedProjects: 8,
    rating: 4.6
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Software Engineer',
    category: 'SOFTWARE_ENGINEER',
    email: 'emily.rodriguez@humber.com',
    phone: '+1 (555) 345-6789',
    location: 'Remote',
    status: 'deployed',
    currentProject: 'Ford Paint Shop Upgrade',
    hourlyRate: 95,
    joinDate: '2022-11-10',
    completedProjects: 15,
    rating: 4.9
  },
  {
    id: 4,
    name: 'David Kim',
    role: 'Systems Engineer',
    category: 'SYSTEMS_ENGINEER',
    email: 'david.kim@humber.com',
    phone: '+1 (555) 456-7890',
    location: 'Grand Rapids, MI',
    status: 'processing',
    currentProject: null,
    hourlyRate: 88,
    joinDate: '2023-06-01',
    completedProjects: 5,
    rating: 4.4
  },
  {
    id: 5,
    name: 'Lisa Thompson',
    role: 'Project Engineer',
    category: 'PROJECT_ENGINEER',
    email: 'lisa.thompson@humber.com',
    phone: '+1 (555) 567-8901',
    location: 'Troy, MI',
    status: 'available',
    currentProject: null,
    hourlyRate: 75,
    joinDate: '2023-08-15',
    completedProjects: 3,
    rating: 4.2
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'deployed': return 'bg-green-500/20 text-green-400'
    case 'available': return 'bg-blue-500/20 text-blue-400'
    case 'processing': return 'bg-yellow-500/20 text-yellow-400'
    default: return 'bg-gray-500/20 text-gray-400'
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'ELECTRICAL_ENGINEER': return 'from-blue-500 to-cyan-500'
    case 'MECHANICAL_ENGINEER': return 'from-green-500 to-emerald-500'
    case 'SOFTWARE_ENGINEER': return 'from-purple-500 to-pink-500'
    case 'SYSTEMS_ENGINEER': return 'from-orange-500 to-red-500'
    case 'PROJECT_ENGINEER': return 'from-indigo-500 to-purple-500'
    default: return 'from-gray-500 to-slate-500'
  }
}

export default function TeamPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Team Management
        </h1>
        <p className="text-slate-400">
          Manage your engineering team and track their deployments.
        </p>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Engineers</p>
              <p className="text-2xl font-bold text-white mt-1">{teamMembers.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
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
              <p className="text-sm text-slate-400">Deployed</p>
              <p className="text-2xl font-bold text-white mt-1">
                {teamMembers.filter(m => m.status === 'deployed').length}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-white"></div>
            </div>
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
              <p className="text-sm text-slate-400">Available</p>
              <p className="text-2xl font-bold text-white mt-1">
                {teamMembers.filter(m => m.status === 'available').length}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-white"></div>
            </div>
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
              <p className="text-sm text-slate-400">Avg Rating</p>
              <p className="text-2xl font-bold text-white mt-1">
                {(teamMembers.reduce((sum, m) => sum + m.rating, 0) / teamMembers.length).toFixed(1)}
              </p>
            </div>
            <Award className="h-8 w-8 text-yellow-400" />
          </div>
        </motion.div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600 transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`h-12 w-12 rounded-full bg-gradient-to-r ${getCategoryColor(member.category)} flex items-center justify-center text-white font-semibold text-lg`}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{member.name}</h3>
                  <p className="text-sm text-slate-400">{member.role}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                {member.status}
              </span>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <Mail className="h-4 w-4" />
                <span>{member.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <Phone className="h-4 w-4" />
                <span>{member.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <MapPin className="h-4 w-4" />
                <span>{member.location}</span>
              </div>
            </div>

            {/* Current Project */}
            {member.currentProject && (
              <div className="bg-slate-900/50 rounded-lg p-3 mb-4">
                <p className="text-xs text-slate-500 mb-1">Current Project</p>
                <p className="text-sm font-medium text-white">{member.currentProject}</p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
              <div className="text-center">
                <p className="text-lg font-bold text-white">${member.hourlyRate}</p>
                <p className="text-xs text-slate-400">Hourly Rate</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{member.completedProjects}</p>
                <p className="text-xs text-slate-400">Projects</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{member.rating}</p>
                <p className="text-xs text-slate-400">Rating</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add New Engineer Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center"
      >
        <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Add New Engineer</span>
        </button>
      </motion.div>
    </div>
  )
}
