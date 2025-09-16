'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plane, Calendar, Clock, MapPin, User, DollarSign } from 'lucide-react'

interface FlightBookingModalProps {
  isOpen: boolean
  onClose: () => void
  selectedEngineer?: any
}

export default function FlightBookingModal({
  isOpen,
  onClose,
  selectedEngineer
}: FlightBookingModalProps) {
  const [bookingData, setBookingData] = useState({
    from: '',
    to: '',
    departureDate: '',
    returnDate: '',
    travelClass: 'economy',
    notes: ''
  })

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
          className="bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        >
          <div className="p-4 sm:p-6 border-b border-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                  <Plane className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-blue-400" />
                  Flight Booking
                </h2>
                <p className="text-slate-400">Book travel for engineer deployment</p>
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
            {/* Traveler Information */}
            {selectedEngineer && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Traveler</h3>
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold">{selectedEngineer.avatar}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{selectedEngineer.name}</h4>
                      <p className="text-sm text-slate-400">{selectedEngineer.role}</p>
                      <p className="text-xs text-slate-500">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        Current Location: {selectedEngineer.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Flight Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  From (Origin)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Detroit, MI (DTW)"
                  value={bookingData.from}
                  onChange={(e) => setBookingData(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  To (Destination)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Austin, TX (AUS)"
                  value={bookingData.to}
                  onChange={(e) => setBookingData(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Departure Date
                </label>
                <input
                  type="date"
                  value={bookingData.departureDate}
                  onChange={(e) => setBookingData(prev => ({ ...prev, departureDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Return Date
                </label>
                <input
                  type="date"
                  value={bookingData.returnDate}
                  onChange={(e) => setBookingData(prev => ({ ...prev, returnDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Travel Class
              </label>
              <select
                value={bookingData.travelClass}
                onChange={(e) => setBookingData(prev => ({ ...prev, travelClass: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="economy">Economy</option>
                <option value="premium">Premium Economy</option>
                <option value="business">Business Class</option>
                <option value="first">First Class</option>
              </select>
            </div>

            {/* Travel Preferences */}
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h4 className="font-medium text-white mb-3">Travel Preferences</h4>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-slate-600 bg-slate-700 text-blue-500" />
                  <span className="text-sm text-slate-300">Aisle Seat</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-slate-600 bg-slate-700 text-blue-500" />
                  <span className="text-sm text-slate-300">Extra Legroom</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-slate-600 bg-slate-700 text-blue-500" />
                  <span className="text-sm text-slate-300">Meal Preference</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-slate-600 bg-slate-700 text-blue-500" />
                  <span className="text-sm text-slate-300">Priority Boarding</span>
                </label>
              </div>
            </div>

            {/* Cost Estimation */}
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Estimated Cost</h4>
                  <p className="text-sm text-slate-400">Based on current rates</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-400">$850</p>
                  <p className="text-xs text-slate-500">Round trip</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Special Notes
              </label>
              <textarea
                placeholder="Any special requirements or notes..."
                value={bookingData.notes}
                onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-6 border-t border-slate-700 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Handle booking logic here
                onClose()
              }}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 flex items-center space-x-2"
            >
              <Plane className="h-4 w-4" />
              <span>Book Flight</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}