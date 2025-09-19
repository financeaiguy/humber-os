'use client';

import React, { memo } from 'react';
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
  Target,
  Users,
  CheckCircle,
  BarChart3
} from 'lucide-react';

// Custom tooltip component
const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 p-3 rounded-lg shadow-xl border border-slate-700" style={{ zIndex: 999999, position: 'relative' }}>
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
});

CustomTooltip.displayName = 'CustomTooltip';

// Memoized chart components
const RevenueChart = memo<{ data: any[] }>(({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-xl border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-blue-400" />
          Revenue & Growth Trends
        </h3>
        <div className="animate-pulse bg-slate-700 rounded h-[300px]" />
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-xl border border-slate-700/50">
    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
      <BarChart3 size={20} className="text-blue-400" />
      Revenue & Growth Trends
    </h3>
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
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
  );
});

RevenueChart.displayName = 'RevenueChart';

const DeploymentChart = memo<{ data: any[] }>(({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-xl border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target size={20} className="text-green-400" />
          Deployment Performance
        </h3>
        <div className="animate-pulse bg-slate-700 rounded h-[300px]" />
      </div>
    );
  }

  return (
  <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-xl border border-slate-700/50">
    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
      <Target size={20} className="text-green-400" />
      Deployment Performance
    </h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
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
  );
});

DeploymentChart.displayName = 'DeploymentChart';

const PipelineChart = memo<{ data: any[] }>(({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-xl border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users size={20} className="text-purple-400" />
          Recruitment Pipeline
        </h3>
        <div className="animate-pulse bg-slate-700 rounded h-[300px]" />
      </div>
    );
  }

  return (
  <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-xl border border-slate-700/50">
    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
      <Users size={20} className="text-purple-400" />
      Recruitment Pipeline
    </h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="stage" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="candidates" fill="#8B5CF6" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={`hsl(${260 - index * 15}, 70%, 60%)`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
  );
});

PipelineChart.displayName = 'PipelineChart';

const ClientDistributionChart = memo<{ data: any[] }>(({ data }) => {
  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-xl border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle size={20} className="text-orange-400" />
          Client Distribution by Industry
        </h3>
        <div className="animate-pulse bg-slate-700 rounded h-[300px]" />
      </div>
    );
  }
  
  // Calculate total for percentage
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercentage = data.map(item => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1)
  }));
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-xl border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <CheckCircle size={20} className="text-orange-400" />
        Client Distribution by Industry
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dataWithPercentage}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={2}
            dataKey="value"
            label={(entry: any) => `${entry.name}: ${entry.percentage}%`}
            labelLine={false}
          >
            {dataWithPercentage.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend as separate list for better visibility */}
      <div className="mt-4 flex flex-wrap gap-3">
        {dataWithPercentage.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className="text-sm text-slate-300">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

ClientDistributionChart.displayName = 'ClientDistributionChart';

// Main chart container component
interface ChartComponentsProps {
  data: {
    revenueData: any[];
    deploymentEfficiencyData: any[];
    pipelineConversionData: any[];
    clientRetentionData: any[];
  };
}

const ChartComponents: React.FC<ChartComponentsProps> = ({ data }) => {
  // Validate data before rendering charts
  if (!data || typeof data !== 'object') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-700 rounded-xl h-[350px]" />
        ))}
      </div>
    );
  }

  const {
    revenueData = [],
    deploymentEfficiencyData = [],
    pipelineConversionData = [],
    clientRetentionData = []
  } = data;

  // Additional validation to ensure data is properly structured
  const validateData = (data: any[]): boolean => {
    return Array.isArray(data) && 
           data.length > 0 && 
           data.every(item => item && typeof item === 'object');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {validateData(revenueData) && <RevenueChart data={revenueData} />}
      {validateData(deploymentEfficiencyData) && <DeploymentChart data={deploymentEfficiencyData} />}
      {validateData(pipelineConversionData) && <PipelineChart data={pipelineConversionData} />}
      {validateData(clientRetentionData) && <ClientDistributionChart data={clientRetentionData} />}
    </div>
  );
};

export default memo(ChartComponents);