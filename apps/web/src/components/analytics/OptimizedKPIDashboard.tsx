'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import dynamic from 'next/dynamic';
import {
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  Users, 
  Clock, 
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';

// Lazy load heavy chart components
const LazyCharts = dynamic(() => import('./ChartComponents'), {
  loading: () => <div className="animate-pulse bg-slate-700 rounded-lg h-[300px]" />,
  ssr: false
});

// Memoized data generator with caching
const generateOptimizedData = (() => {
  let cachedData: any = null;
  let lastGenerated = 0;
  const CACHE_DURATION = 30000; // 30 seconds

  return () => {
    const now = Date.now();
    if (cachedData && (now - lastGenerated) < CACHE_DURATION) {
      return cachedData;
    }

    const currentMonth = new Date().getMonth();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    cachedData = {
      deploymentEfficiencyData: months.slice(0, currentMonth + 1).map((month, index) => ({
        month,
        timeToDeployDays: Math.max(20, 45 - index * 2 + Math.random() * 5),
        successRate: Math.min(98, 78 + index * 2 + Math.random() * 3),
        revenuePerEngineer: 12500 + index * 500 + Math.random() * 1000,
        avgMargin: 22 + index * 0.5 + Math.random() * 2
      })),
      pipelineConversionData: [
        { stage: 'Leads', candidates: 1000 + Math.floor(Math.random() * 200), conversion: 100 },
        { stage: 'Qualified', candidates: 650 + Math.floor(Math.random() * 100), conversion: 65 },
        { stage: 'Vetted', candidates: 420 + Math.floor(Math.random() * 80), conversion: 42 },
        { stage: 'Offered', candidates: 280 + Math.floor(Math.random() * 50), conversion: 28 },
        { stage: 'Deployed', candidates: 180 + Math.floor(Math.random() * 30), conversion: 18 }
      ],
      utilizationData: months.slice(0, currentMonth + 1).map((month, index) => ({
        month,
        billableHours: Math.min(98, 82 + index * 2 + Math.random() * 5),
        benchTime: Math.max(2, 18 - index * 2 - Math.random() * 3),
        targetUtilization: 85,
        revenue: 850000 + index * 100000 + Math.random() * 50000
      })),
      clientRetentionData: [
        { name: 'Automotive', value: 45 + Math.floor(Math.random() * 10), growth: 12 },
        { name: 'Aerospace', value: 28 + Math.floor(Math.random() * 8), growth: 8 },
        { name: 'Manufacturing', value: 32 + Math.floor(Math.random() * 7), growth: 15 },
        { name: 'Technology', value: 18 + Math.floor(Math.random() * 5), growth: 22 },
        { name: 'Energy', value: 15 + Math.floor(Math.random() * 5), growth: 18 }
      ],
      revenueData: months.slice(0, currentMonth + 1).map((month, index) => ({
        month,
        mrr: 850000 + index * 130000 + Math.random() * 100000,
        growth: 12 + index * 2 + Math.random() * 3,
        pipelineValue: 2400000 + index * 250000 + Math.random() * 200000,
        cashCollected: 800000 + index * 120000 + Math.random() * 80000
      })),
      partnerPerformance: [
        { partner: 'GM', engineers: 42, utilization: 94, satisfaction: 4.8, revenue: 520000 },
        { partner: 'Ford', engineers: 38, utilization: 91, satisfaction: 4.6, revenue: 480000 },
        { partner: 'Stellantis', engineers: 35, utilization: 88, satisfaction: 4.7, revenue: 440000 },
        { partner: 'Aptiv', engineers: 28, utilization: 92, satisfaction: 4.9, revenue: 360000 },
        { partner: 'HIROTEC', engineers: 22, utilization: 86, satisfaction: 4.5, revenue: 280000 }
      ]
    };
    lastGenerated = now;
    return cachedData;
  };
})();

// Memoized KPI Card component
interface KPICardProps {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

const KPICard = memo<KPICardProps>(({ title, value, change, trend, icon, color }) => {
  return (
    <div className={`p-6 rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 hover:border-${color}-500/50 transition-all duration-300`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg bg-${color}-500/20`}>
              {icon}
            </div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
          </div>
          <p className="text-3xl font-bold text-white">{value}</p>
          <div className={`flex items-center gap-1 mt-2 text-sm ${
            trend === 'up' ? 'text-green-400' : 
            trend === 'down' ? 'text-red-400' : 
            'text-gray-400'
          }`}>
            {trend === 'up' ? <TrendingUp size={16} /> : 
             trend === 'down' ? <TrendingDown size={16} /> : 
             <Activity size={16} />}
            <span>{change}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

KPICard.displayName = 'KPICard';

// Memoized Partner Performance Table
const PartnerTable = memo<{ partners: any[] }>(({ partners }) => (
  <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-xl border border-slate-700/50">
    <h3 className="text-lg font-semibold text-white mb-4">Partner Performance Matrix</h3>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Partner</th>
            <th className="text-right py-3 px-4 text-slate-400 font-medium">Engineers</th>
            <th className="text-right py-3 px-4 text-slate-400 font-medium">Utilization</th>
            <th className="text-right py-3 px-4 text-slate-400 font-medium">Satisfaction</th>
            <th className="text-right py-3 px-4 text-slate-400 font-medium">Revenue</th>
            <th className="text-right py-3 px-4 text-slate-400 font-medium">Trend</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((partner, index) => (
            <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
              <td className="py-3 px-4 text-white font-medium">{partner.partner}</td>
              <td className="py-3 px-4 text-right text-slate-300">{partner.engineers}</td>
              <td className="py-3 px-4 text-right">
                <span className={`px-2 py-1 rounded text-xs ${
                  partner.utilization >= 90 ? 'bg-green-500/20 text-green-400' :
                  partner.utilization >= 85 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {partner.utilization}%
                </span>
              </td>
              <td className="py-3 px-4 text-right text-slate-300">⭐ {partner.satisfaction}</td>
              <td className="py-3 px-4 text-right text-slate-300">${(partner.revenue / 1000).toFixed(0)}K</td>
              <td className="py-3 px-4 text-right">
                <TrendingUp className="inline text-green-400" size={16} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
));

PartnerTable.displayName = 'PartnerTable';

export default function OptimizedKPIDashboard() {
  const [data, setData] = useState(() => {
    try {
      return generateOptimizedData();
    } catch (error) {
      // SECURITY: Removed console.error('Error generating initial data:', error);
      return null;
    }
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState('6M');
  const [isLoading, setIsLoading] = useState(false);

  // Debounced data refresh
  const refreshData = useCallback(() => {
    setIsLoading(true);
    // Use requestIdleCallback for non-critical updates
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        try {
          setData(generateOptimizedData());
        } catch (error) {
          // SECURITY: Removed console.error('Error refreshing data:', error);
        } finally {
          setIsLoading(false);
        }
      });
    } else {
      setTimeout(() => {
        try {
          setData(generateOptimizedData());
        } catch (error) {
          // SECURITY: Removed console.error('Error refreshing data:', error);
        } finally {
          setIsLoading(false);
        }
      }, 0);
    }
  }, []);

  // Reduced update frequency and cleanup
  useEffect(() => {
    const interval = setInterval(refreshData, 60000); // Reduced to 60 seconds
    return () => clearInterval(interval);
  }, [refreshData]);

  // Memoized current metrics calculation
  const currentMetrics = useMemo(() => {
    if (!data || typeof data !== 'object') {
      return {
        mrr: 0,
        deployTime: 30,
        successRate: 94,
        utilization: '0.0',
        totalEngineers: 0,
        benchCost: 0
      };
    }
    
    const lastMonth = data.revenueData?.[data.revenueData.length - 1];
    const lastDeployment = data.deploymentEfficiencyData?.[data.deploymentEfficiencyData.length - 1];
    const totalEngineers = data.partnerPerformance?.reduce((sum: number, p: any) => sum + p.engineers, 0) || 0;
    const avgUtilization = data.partnerPerformance?.length > 0 
      ? data.partnerPerformance.reduce((sum: number, p: any) => sum + p.utilization, 0) / data.partnerPerformance.length 
      : 0;
    
    return {
      mrr: lastMonth?.mrr || 0,
      deployTime: lastDeployment?.timeToDeployDays || 30,
      successRate: lastDeployment?.successRate || 94,
      utilization: avgUtilization.toFixed(1),
      totalEngineers,
      benchCost: totalEngineers * (100 - avgUtilization) * 150
    };
  }, [data]);

  // Optimized time range handler
  const handleTimeRangeChange = useCallback((range: string) => {
    setSelectedTimeRange(range);
    setIsLoading(true);
    setTimeout(() => {
      try {
        setData(generateOptimizedData());
      } catch (error) {
        // SECURITY: Removed console.error('Error changing time range:', error);
      } finally {
        setIsLoading(false);
      }
    }, 200);
  }, []);

  return (
    <div className="w-full space-y-6 p-4">
      {/* Header with Time Range Selector */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl p-6 rounded-xl border border-slate-700/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Analytics Dashboard
              {isLoading && <span className="ml-2 text-blue-400 text-lg">↻</span>}
            </h1>
            <p className="text-slate-400">
              Real-time operational metrics and performance indicators
            </p>
          </div>
          <div className="flex gap-2">
            {['1M', '3M', '6M', '1Y'].map((range) => (
              <button
                key={range}
                onClick={() => handleTimeRangeChange(range)}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg transition-all disabled:opacity-50 ${
                  selectedTimeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Monthly Recurring Revenue"
          value={`$${(currentMetrics.mrr / 1000000).toFixed(2)}M`}
          change="28% from last month"
          trend="up"
          icon={<DollarSign className="text-green-400" size={20} />}
          color="green"
        />
        <KPICard
          title="Time to Deploy"
          value={`${currentMetrics.deployTime.toFixed(0)} days`}
          change="33% faster vs Q1"
          trend="up"
          icon={<Clock className="text-blue-400" size={20} />}
          color="blue"
        />
        <KPICard
          title="Engineer Utilization"
          value={`${currentMetrics.utilization}%`}
          change="Above 85% target"
          trend="up"
          icon={<Activity className="text-purple-400" size={20} />}
          color="purple"
        />
        <KPICard
          title="Active Engineers"
          value={currentMetrics.totalEngineers}
          change="12 new this month"
          trend="up"
          icon={<Users className="text-orange-400" size={20} />}
          color="orange"
        />
      </div>

      {/* Lazy-loaded Charts */}
      {data && Object.keys(data).length > 0 && (
        <LazyCharts data={data} />
      )}

      {/* Partner Performance Table */}
      {data?.partnerPerformance && data.partnerPerformance.length > 0 && (
        <PartnerTable partners={data.partnerPerformance} />
      )}

      {/* Alerts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 p-6 rounded-xl border border-red-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-400 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-red-400 mb-2">Critical Actions Required</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Bench time exceeding target by 3.2% - ${(currentMetrics.benchCost / 1000).toFixed(0)}K monthly impact</li>
                <li>• 3 engineers pending contract renewal this week</li>
                <li>• Visa processing bottleneck affecting 12 deployments</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-6 rounded-xl border border-green-500/30">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-400 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-green-400 mb-2">Positive Trends</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Revenue growth exceeding forecast by 18%</li>
                <li>• Deployment time improved by 33% YoY</li>
                <li>• Client satisfaction at all-time high (4.7/5.0)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}