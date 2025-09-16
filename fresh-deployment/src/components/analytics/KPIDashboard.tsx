'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
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

// Dynamic data generator for realistic analytics
const generateDynamicData = () => {
  const currentMonth = new Date().getMonth();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Generate deployment efficiency data with seasonal variations
  const deploymentEfficiencyData = months.slice(0, currentMonth + 1).map((month, index) => ({
    month,
    timeToDeployDays: Math.max(20, 45 - index * 2 + Math.random() * 5),
    successRate: Math.min(98, 78 + index * 2 + Math.random() * 3),
    revenuePerEngineer: 12500 + index * 500 + Math.random() * 1000,
    avgMargin: 22 + index * 0.5 + Math.random() * 2
  }));

  // Pipeline conversion with realistic funnel
  const pipelineConversionData = [
    { stage: 'Leads', candidates: 1000 + Math.floor(Math.random() * 200), conversion: 100 },
    { stage: 'Qualified', candidates: 650 + Math.floor(Math.random() * 100), conversion: 65 },
    { stage: 'Vetted', candidates: 420 + Math.floor(Math.random() * 80), conversion: 42 },
    { stage: 'Offered', candidates: 280 + Math.floor(Math.random() * 50), conversion: 28 },
    { stage: 'Deployed', candidates: 180 + Math.floor(Math.random() * 30), conversion: 18 }
  ];

  // Utilization data with realistic fluctuations
  const utilizationData = months.slice(0, currentMonth + 1).map((month, index) => ({
    month,
    billableHours: Math.min(98, 82 + index * 2 + Math.random() * 5),
    benchTime: Math.max(2, 18 - index * 2 - Math.random() * 3),
    targetUtilization: 85,
    revenue: 850000 + index * 100000 + Math.random() * 50000
  }));

  // Client distribution by industry
  const clientRetentionData = [
    { name: 'Automotive', value: 45 + Math.floor(Math.random() * 10), growth: 12 },
    { name: 'Aerospace', value: 28 + Math.floor(Math.random() * 8), growth: 8 },
    { name: 'Manufacturing', value: 32 + Math.floor(Math.random() * 7), growth: 15 },
    { name: 'Technology', value: 18 + Math.floor(Math.random() * 5), growth: 22 },
    { name: 'Energy', value: 15 + Math.floor(Math.random() * 5), growth: 18 }
  ];

  // Revenue trends with growth
  const revenueData = months.slice(0, currentMonth + 1).map((month, index) => ({
    month,
    mrr: 850000 + index * 130000 + Math.random() * 100000,
    growth: 12 + index * 2 + Math.random() * 3,
    pipelineValue: 2400000 + index * 250000 + Math.random() * 200000,
    cashCollected: 800000 + index * 120000 + Math.random() * 80000
  }));

  // Operational metrics by partner
  const partnerPerformance = [
    { partner: 'GM', engineers: 42, utilization: 94, satisfaction: 4.8, revenue: 520000 },
    { partner: 'Ford', engineers: 38, utilization: 91, satisfaction: 4.6, revenue: 480000 },
    { partner: 'Stellantis', engineers: 35, utilization: 88, satisfaction: 4.7, revenue: 440000 },
    { partner: 'Aptiv', engineers: 28, utilization: 92, satisfaction: 4.9, revenue: 360000 },
    { partner: 'HIROTEC', engineers: 22, utilization: 86, satisfaction: 4.5, revenue: 280000 }
  ];

  return {
    deploymentEfficiencyData,
    pipelineConversionData,
    utilizationData,
    clientRetentionData,
    revenueData,
    partnerPerformance
  };
};

// Enhanced KPI Card with live updates
interface KPICardProps {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, trend, icon, color }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className={`p-6 rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 hover:border-${color}-500/50 transition-all duration-300 ${isAnimating ? 'scale-105' : ''}`}>
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
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 p-3 rounded-lg shadow-xl border border-slate-700">
        <p className="text-white font-semibold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' && entry.value > 1000 
              ? `$${(entry.value / 1000).toFixed(0)}K`
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function KPIDashboard() {
  const [data, setData] = useState(generateDynamicData());
  const [selectedTimeRange, setSelectedTimeRange] = useState('6M');

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateDynamicData());
    }, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Calculate current metrics
  const currentMetrics = useMemo(() => {
    const lastMonth = data.revenueData[data.revenueData.length - 1];
    const lastDeployment = data.deploymentEfficiencyData[data.deploymentEfficiencyData.length - 1];
    const totalEngineers = data.partnerPerformance.reduce((sum, p) => sum + p.engineers, 0);
    const avgUtilization = data.partnerPerformance.reduce((sum, p) => sum + p.utilization, 0) / data.partnerPerformance.length;
    
    return {
      mrr: lastMonth?.mrr || 0,
      deployTime: lastDeployment?.timeToDeployDays || 30,
      successRate: lastDeployment?.successRate || 94,
      utilization: avgUtilization.toFixed(1),
      totalEngineers,
      benchCost: totalEngineers * (100 - avgUtilization) * 150 // Estimated daily bench cost
    };
  }, [data]);

  // Chart colors
  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

  return (
    <div className="w-full space-y-6 p-4">
      {/* Header with Time Range Selector */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl p-6 rounded-xl border border-slate-700/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-slate-400">
              Real-time operational metrics and performance indicators
            </p>
          </div>
          <div className="flex gap-2">
            {['1M', '3M', '6M', '1Y'].map((range) => (
              <button
                key={range}
                onClick={() => {
                  setSelectedTimeRange(range);
                  setTimeout(() => {
                    setData(generateDynamicData());
                  }, 500);
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
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

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-400" />
            Revenue & Growth Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.revenueData}>
              <defs>
                <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorPipeline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="mrr" 
                stroke="#10B981" 
                fillOpacity={1}
                fill="url(#colorMrr)"
                name="Monthly Revenue"
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="pipelineValue" 
                stroke="#3B82F6" 
                fillOpacity={1}
                fill="url(#colorPipeline)"
                name="Pipeline Value"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Deployment Efficiency */}
        <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target size={20} className="text-green-400" />
            Deployment Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.deploymentEfficiencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis yAxisId="left" stroke="#94a3b8" />
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="timeToDeployDays" 
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ fill: '#EF4444', r: 4 }}
                name="Deploy Time (days)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="successRate" 
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 4 }}
                name="Success Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline Funnel */}
        <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users size={20} className="text-purple-400" />
            Recruitment Pipeline
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.pipelineConversionData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="stage" type="category" width={80} stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="candidates" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Client Distribution */}
        <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-orange-400" />
            Client Distribution by Industry
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.clientRetentionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
              >
                {data.clientRetentionData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Partner Performance Table */}
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
              {data.partnerPerformance.map((partner, index) => (
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