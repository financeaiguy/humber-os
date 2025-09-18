'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle, 
  Clock,
  Users,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Zap
} from 'lucide-react'
import { BurnRateMetrics, BurnRateCalculator, PurchaseOrder, EngineerTimeEntry } from '@/lib/burn-rate-calculator'
import { motion, AnimatePresence } from 'framer-motion'

interface BurnRateWidgetProps {
  purchaseOrder: PurchaseOrder
  timeEntries: EngineerTimeEntry[]
  compact?: boolean
  showDetails?: boolean
  onAlertClick?: (poId: string) => void
}

export function BurnRateWidget({ 
  purchaseOrder, 
  timeEntries, 
  compact = false,
  showDetails = true,
  onAlertClick
}: BurnRateWidgetProps) {
  const [metrics, setMetrics] = useState<BurnRateMetrics | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)

  useEffect(() => {
    const calculated = BurnRateCalculator.calculateBurnRate(purchaseOrder, timeEntries)
    setMetrics(calculated)
  }, [purchaseOrder, timeEntries])

  if (!metrics) {
    return (
      <Card className="bg-slate-900/50 border-slate-700 animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-slate-800 rounded" />
        </CardContent>
      </Card>
    )
  }

  const display = BurnRateCalculator.formatBurnRateDisplay(metrics)
  const statusColors = {
    healthy: 'border-green-600 bg-green-900/20',
    warning: 'border-yellow-600 bg-yellow-900/20',
    critical: 'border-orange-600 bg-orange-900/20',
    exhausted: 'border-red-600 bg-red-900/20'
  }

  const trendIcons = {
    up: <TrendingUp className="h-4 w-4" />,
    down: <TrendingDown className="h-4 w-4" />,
    stable: <Activity className="h-4 w-4" />
  }

  if (compact) {
    return (
      <Card 
        className={`bg-slate-900/50 border-2 ${statusColors[metrics.burnRateStatus]} hover:bg-slate-900/70 transition-all cursor-pointer`}
        onClick={() => onAlertClick?.(purchaseOrder.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className={`h-5 w-5 ${display.color}`} />
              <span className="font-semibold text-white">{purchaseOrder.poNumber}</span>
            </div>
            <Badge className={`${display.color} bg-slate-900/50`}>
              {metrics.burnRateStatus.toUpperCase()}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={metrics.percentConsumed} 
              className="h-2 bg-slate-800"
            />
            
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">
                {metrics.consumedHours.toFixed(0)} / {metrics.allocatedHours} hrs
              </span>
              <span className={display.color}>
                {metrics.percentConsumed.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {metrics.weeklyAverageHours.toFixed(1)} hrs/week
              </span>
              <div className="flex items-center gap-1 text-slate-400">
                {trendIcons[display.trend]}
                <span>{display.secondaryMetric}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-slate-900/50 border-2 ${statusColors[metrics.burnRateStatus]}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Zap className="h-6 w-6" />
            PO Burn Rate: {purchaseOrder.poNumber}
          </CardTitle>
          <Badge 
            variant="outline" 
            className={`${display.color} border-current bg-slate-900/50 px-3 py-1`}
          >
            {metrics.burnRateStatus.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Alert Banner */}
        {metrics.burnRateStatus !== 'healthy' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${statusColors[metrics.burnRateStatus]} border`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className={`h-5 w-5 mt-0.5 ${display.color}`} />
              <div className="flex-1">
                <p className="text-white font-medium mb-1">
                  {metrics.recommendedAction}
                </p>
                {metrics.projectedOverrun && metrics.projectedOverrun > 0 && (
                  <p className="text-sm text-slate-300">
                    Projected overrun: ${metrics.projectedOverrun.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Primary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-slate-400">Hours Remaining</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {metrics.remainingHours.toFixed(0)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              of {metrics.allocatedHours} total
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-xs text-slate-400">Budget Remaining</span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${(metrics.remainingBudget / 1000).toFixed(1)}k
            </p>
            <p className="text-xs text-slate-500 mt-1">
              of ${(metrics.totalBudget / 1000).toFixed(0)}k total
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-slate-400">Weeks Left</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {metrics.weeksRemaining === Infinity ? '∞' : metrics.weeksRemaining.toFixed(1)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              at current rate
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-slate-400">Active Engineers</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {metrics.engineerCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              charging to PO
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Budget Consumption</span>
            <span className={`font-medium ${display.color}`}>
              {metrics.percentConsumed.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={metrics.percentConsumed} 
            className="h-3 bg-slate-800"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>{metrics.consumedHours.toFixed(0)} hours used</span>
            <span>{metrics.remainingHours.toFixed(0)} hours remaining</span>
          </div>
        </div>

        {/* Weekly Burn Rate */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Weekly Burn Rate
            </h3>
            <div className="flex items-center gap-1">
              {trendIcons[display.trend]}
              <span className={`text-sm ${display.color}`}>
                {display.trend === 'up' ? '+' : display.trend === 'down' ? '-' : ''}
                {metrics.weeklyAverageHours.toFixed(1)} hrs/week
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            {metrics.weeklyTrend.slice(-4).map((week, index) => (
              <div 
                key={week.weekStartDate}
                className="flex items-center justify-between cursor-pointer hover:bg-slate-700/50 p-2 rounded transition-colors"
                onClick={() => setSelectedWeek(selectedWeek === index ? null : index)}
              >
                <span className="text-xs text-slate-400">
                  Week of {new Date(week.weekStartDate).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-white">
                    {week.hours.toFixed(1)} hrs
                  </span>
                  <span className="text-xs text-slate-400">
                    ${(week.cost / 1000).toFixed(1)}k
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {week.engineerCount} eng
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Engineers */}
        {showDetails && (
          <div className="space-y-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors"
            >
              <span className="text-sm font-medium text-white">
                Top Engineers ({metrics.topEngineers.length})
              </span>
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>
            
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {metrics.topEngineers.map((engineer) => (
                    <div 
                      key={engineer.engineerId}
                      className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          {engineer.engineerName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {engineer.weeklyAverage.toFixed(1)} hrs/week average
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white">
                          {engineer.totalHours.toFixed(1)} hrs
                        </p>
                        <p className="text-xs text-slate-400">
                          ${(engineer.totalCost / 1000).toFixed(1)}k
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Projected Completion */}
        {metrics.projectedCompletionDate !== 'Unknown' && (
          <div className="pt-4 border-t border-slate-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Projected Completion</span>
              <span className="text-white font-medium">
                {new Date(metrics.projectedCompletionDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}