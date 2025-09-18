'use client'

import { motion } from 'framer-motion'
import { 
  Brain, 
  Activity, 
  Cpu, 
  Database, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Network,
  Layers,
  Target,
  Users,
  FileText,
  Eye,
  Lightbulb
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNervousSystem } from '@/hooks/use-nervous-system'

export function NervousSystemDashboard() {
  const { 
    isConnected, 
    insights, 
    recommendations, 
    stats, 
    isLoading,
    context 
  } = useNervousSystem({
    page: 'dashboard',
    feature: 'nervous-system-overview'
  })

  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [modelStats, setModelStats] = useState<any>(null)
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null)

  useEffect(() => {
    if (isConnected) {
      loadSystemData()
    }
  }, [isConnected])

  const loadSystemData = async () => {
    try {
      // Simulate real-time system data
      setSystemHealth({
        overallHealth: 95,
        components: {
          knowledgeGraph: { status: 'healthy', uptime: '99.8%', responseTime: '24ms' },
          aiModels: { status: 'healthy', activeModels: 4, trainingJobs: 2 },
          dataProcessing: { status: 'healthy', queueSize: 12, throughput: '1.2k/min' },
          learningSystem: { status: 'healthy', learningRate: '15 insights/hour' }
        }
      })

      setModelStats({
        totalModels: 4,
        activeModels: 4,
        trainingJobs: 2,
        totalRequests: 15420,
        successRate: 98.7,
        averageCost: 0.024,
        efficiency: 87.3
      })

      setRealTimeMetrics({
        knowledgeNodes: 2847,
        relationships: 8921,
        documentsProcessed: 1456,
        insightsGenerated: 89,
        predictionsAccuracy: 91.2,
        automationLevel: 73.8
      })
    } catch (error) {
      // SECURITY: Removed console.error('Failed to load system data:', error)
    }
  }

  if (!isConnected || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Brain className="w-16 h-16 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Connecting to Nervous System...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Humber Nervous System</h2>
              <p className="text-sm text-gray-600">Central AI Intelligence & Learning Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium text-gray-700">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {systemHealth && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">System Health</p>
                  <p className="text-2xl font-bold text-green-900">{systemHealth.overallHealth}%</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Active Models</p>
                  <p className="text-2xl font-bold text-blue-900">{modelStats?.activeModels || 0}</p>
                </div>
                <Cpu className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Knowledge Nodes</p>
                  <p className="text-2xl font-bold text-purple-900">{realTimeMetrics?.knowledgeNodes || 0}</p>
                </div>
                <Network className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Success Rate</p>
                  <p className="text-2xl font-bold text-orange-900">{modelStats?.successRate || 0}%</p>
                </div>
                <Target className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Models Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">AI Models</h3>
            <Layers className="w-5 h-5 text-gray-500" />
          </div>
          
          {systemHealth?.components && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-900">GPT-4 Turbo</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">94% Accuracy</p>
                  <p className="text-xs text-gray-500">1.2s avg latency</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-900">Claude 3.5 Sonnet</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">96% Accuracy</p>
                  <p className="text-xs text-gray-500">1.0s avg latency</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium text-gray-900">Humber Domain Expert</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Training</p>
                  <p className="text-xs text-gray-500">73% complete</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-900">GPT-4 Vision</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">91% Accuracy</p>
                  <p className="text-xs text-gray-500">2.0s avg latency</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Learning Insights */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Learning Insights</h3>
            <Lightbulb className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="space-y-4">
            {insights.length > 0 ? (
              insights.slice(0, 3).map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                >
                  <p className="text-sm font-medium text-blue-900">{insight.title}</p>
                  <p className="text-xs text-blue-700 mt-1">{insight.description}</p>
                  <div className="flex items-center mt-2 text-xs text-blue-600">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Confidence: {Math.round(insight.confidence * 100)}%
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Learning from interactions...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
          <BarChart3 className="w-5 h-5 text-gray-500" />
        </div>

        {realTimeMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.documentsProcessed}</p>
              <p className="text-sm text-gray-600">Documents Processed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.insightsGenerated}</p>
              <p className="text-sm text-gray-600">Insights Generated</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.relationships}</p>
              <p className="text-sm text-gray-600">Knowledge Links</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.predictionsAccuracy}%</p>
              <p className="text-sm text-gray-600">Prediction Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.automationLevel}%</p>
              <p className="text-sm text-gray-600">Automation Level</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">${modelStats?.averageCost || 0}</p>
              <p className="text-sm text-gray-600">Avg Cost/Request</p>
            </div>
          </div>
        )}
      </div>

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Smart Recommendations</h3>
            <Zap className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.slice(0, 4).map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{index + 1}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-green-900">{rec.title}</p>
                    <p className="text-sm text-green-700 mt-1">{rec.description}</p>
                    <div className="flex items-center mt-2 text-xs text-green-600">
                      <Target className="w-3 h-3 mr-1" />
                      Impact: {rec.impact || 'High'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}