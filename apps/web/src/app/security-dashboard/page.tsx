'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Globe,
  Activity,
  TrendingUp,
  Eye,
  Lock,
  Zap,
  Server,
  Database,
  Clock
} from 'lucide-react'

// export const runtime = 'edge'

interface SecurityMetrics {
  totalRequests: number
  blockedRequests: number
  challengedRequests: number
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  topThreats: ThreatType[]
  countryStats: CountryStats[]
  rateLimit: RateLimitStats
  wafRules: WAFRuleStats[]
  aiAnalysis: AIAnalysisStats
}

interface ThreatType {
  type: string
  count: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
}

interface CountryStats {
  country: string
  requests: number
  blocked: number
  flag: string
}

interface RateLimitStats {
  triggeredCount: number
  activeBlocks: number
  averageRequestsPerMinute: number
}

interface WAFRuleStats {
  ruleId: string
  ruleName: string
  triggers: number
  lastTriggered: string
  enabled: boolean
}

interface AIAnalysisStats {
  totalAnalyses: number
  highConfidenceThreats: number
  averageProcessingTime: number
  modelAccuracy: number
}

const mockSecurityData: SecurityMetrics = {
  totalRequests: 245680,
  blockedRequests: 1247,
  challengedRequests: 856,
  threatLevel: 'medium',
  topThreats: [
    { type: 'SQL Injection', count: 423, percentage: 34, trend: 'down' },
    { type: 'XSS Attempts', count: 312, percentage: 25, trend: 'stable' },
    { type: 'Bot Activity', count: 298, percentage: 24, trend: 'up' },
    { type: 'Rate Limiting', count: 214, percentage: 17, trend: 'down' }
  ],
  countryStats: [
    { country: 'US', requests: 125000, blocked: 45, flag: '🇺🇸' },
    { country: 'CA', requests: 35000, blocked: 12, flag: '🇨🇦' },
    { country: 'CN', requests: 15000, blocked: 890, flag: '🇨🇳' },
    { country: 'RU', requests: 8500, blocked: 203, flag: '🇷🇺' },
    { country: 'DE', requests: 22000, blocked: 8, flag: '🇩🇪' }
  ],
  rateLimit: {
    triggeredCount: 156,
    activeBlocks: 23,
    averageRequestsPerMinute: 285
  },
  wafRules: [
    { ruleId: 'sql_injection_block', ruleName: 'SQL Injection Protection', triggers: 423, lastTriggered: '2 minutes ago', enabled: true },
    { ruleId: 'xss_challenge', ruleName: 'XSS Challenge', triggers: 312, lastTriggered: '5 minutes ago', enabled: true },
    { ruleId: 'malicious_ua_block', ruleName: 'Malicious User Agent Block', triggers: 156, lastTriggered: '12 minutes ago', enabled: true },
    { ruleId: 'api_rate_limit', ruleName: 'API Rate Limiting', triggers: 214, lastTriggered: '1 minute ago', enabled: true }
  ],
  aiAnalysis: {
    totalAnalyses: 45234,
    highConfidenceThreats: 892,
    averageProcessingTime: 234,
    modelAccuracy: 94.7
  }
}

export default function SecurityDashboard() {
  const [data, setData] = useState<SecurityMetrics>(mockSecurityData)
  const [timeRange, setTimeRange] = useState('24h')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // In production, fetch real data from API
        // setData(await fetchSecurityMetrics(timeRange))
      }, 30000) // Refresh every 30 seconds

      return () => clearInterval(interval)
    }
  }, [autoRefresh, timeRange])

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-400 bg-red-500/20'
      case 'high': return 'text-orange-400 bg-orange-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'low': return 'text-green-400 bg-green-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getBlockRate = () => {
    return ((data.blockedRequests / data.totalRequests) * 100).toFixed(2)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <Shield className="h-10 w-10 text-blue-400 mr-3" />
            Security Dashboard
          </h1>
          <p className="text-slate-400">
            Real-time security monitoring and threat analysis powered by Cloudflare WAF
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              autoRefresh 
                ? 'bg-green-500 text-white' 
                : 'bg-slate-800 border border-slate-700 text-slate-300'
            }`}
          >
            Auto Refresh
          </button>
        </div>
      </div>

      {/* Threat Level Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 border ${getThreatLevelColor(data.threatLevel)} border-opacity-50`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 mr-3" />
            <div>
              <h3 className="text-xl font-semibold">Current Threat Level</h3>
              <p className="opacity-80">System-wide security status</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full font-bold text-lg uppercase ${getThreatLevelColor(data.threatLevel)}`}>
            {data.threatLevel}
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Globe className="h-6 w-6 text-blue-400" />
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Total Requests</p>
              <p className="text-2xl font-bold text-white">{data.totalRequests.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center text-green-400 text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            +12% from yesterday
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <Shield className="h-6 w-6 text-red-400" />
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Blocked Requests</p>
              <p className="text-2xl font-bold text-white">{data.blockedRequests.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center text-red-400 text-sm">
            <span className="font-semibold">{getBlockRate()}%</span>
            <span className="ml-1">block rate</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Eye className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Challenged</p>
              <p className="text-2xl font-bold text-white">{data.challengedRequests.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center text-yellow-400 text-sm">
            <Lock className="h-4 w-4 mr-1" />
            Human verification
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Zap className="h-6 w-6 text-purple-400" />
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">AI Analyses</p>
              <p className="text-2xl font-bold text-white">{data.aiAnalysis.totalAnalyses.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center text-purple-400 text-sm">
            <span className="font-semibold">{data.aiAnalysis.modelAccuracy}%</span>
            <span className="ml-1">accuracy</span>
          </div>
        </motion.div>
      </div>

      {/* Top Threats and Country Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-400 mr-2" />
            Top Threat Types
          </h3>
          <div className="space-y-4">
            {data.topThreats.map((threat, index) => (
              <div key={threat.type} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{threat.type}</p>
                    <p className="text-sm text-slate-400">{threat.count} incidents</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-white">{threat.percentage}%</p>
                  <p className={`text-xs ${threat.trend === 'up' ? 'text-red-400' : threat.trend === 'down' ? 'text-green-400' : 'text-gray-400'}`}>
                    {threat.trend === 'up' ? '↗' : threat.trend === 'down' ? '↘' : '→'} {threat.trend}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Globe className="h-5 w-5 text-blue-400 mr-2" />
            Requests by Country
          </h3>
          <div className="space-y-4">
            {data.countryStats.map((country, index) => (
              <div key={country.country} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{country.flag}</span>
                  <div>
                    <p className="text-white font-medium">{country.country}</p>
                    <p className="text-sm text-slate-400">{country.requests.toLocaleString()} requests</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-red-400">{country.blocked}</p>
                  <p className="text-xs text-slate-400">blocked</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* WAF Rules Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Server className="h-5 w-5 text-green-400 mr-2" />
          WAF Rules Status
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 py-3">Rule Name</th>
                <th className="text-left text-slate-400 py-3">Triggers</th>
                <th className="text-left text-slate-400 py-3">Last Triggered</th>
                <th className="text-left text-slate-400 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.wafRules.map((rule) => (
                <tr key={rule.ruleId} className="border-b border-slate-800">
                  <td className="py-4">
                    <div>
                      <p className="text-white font-medium">{rule.ruleName}</p>
                      <p className="text-xs text-slate-400">{rule.ruleId}</p>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                      {rule.triggers}
                    </span>
                  </td>
                  <td className="py-4 text-slate-300">{rule.lastTriggered}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      rule.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* AI Analysis Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Database className="h-5 w-5 text-purple-400 mr-2" />
          AI Threat Analysis Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {data.aiAnalysis.highConfidenceThreats}
            </div>
            <p className="text-slate-400">High Confidence Threats Detected</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {data.aiAnalysis.averageProcessingTime}ms
            </div>
            <p className="text-slate-400">Average Processing Time</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {data.aiAnalysis.modelAccuracy}%
            </div>
            <p className="text-slate-400">Model Accuracy</p>
          </div>
        </div>
      </motion.div>

      {/* Rate Limiting Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Clock className="h-5 w-5 text-yellow-400 mr-2" />
          Rate Limiting Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              {data.rateLimit.triggeredCount}
            </div>
            <p className="text-slate-400">Triggers Today</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400 mb-2">
              {data.rateLimit.activeBlocks}
            </div>
            <p className="text-slate-400">Active Blocks</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {data.rateLimit.averageRequestsPerMinute}
            </div>
            <p className="text-slate-400">Avg Requests/Min</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}