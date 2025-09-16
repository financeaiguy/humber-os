'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import dynamic from 'next/dynamic';
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
const LazyCharts = dynamic(() => import('./ChartComponents'), {
    loading: () => _jsx("div", { className: "animate-pulse bg-slate-700 rounded-lg h-[300px]" }),
    ssr: false
});
const generateOptimizedData = (() => {
    let cachedData = null;
    let lastGenerated = 0;
    const CACHE_DURATION = 30000;
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
const KPICard = memo(({ title, value, change, trend, icon, color }) => {
    return (_jsx("div", { className: `p-6 rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 hover:border-${color}-500/50 transition-all duration-300`, children: _jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("div", { className: `p-2 rounded-lg bg-${color}-500/20`, children: icon }), _jsx("p", { className: "text-sm font-medium text-slate-400", children: title })] }), _jsx("p", { className: "text-3xl font-bold text-white", children: value }), _jsxs("div", { className: `flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-green-400' :
                            trend === 'down' ? 'text-red-400' :
                                'text-gray-400'}`, children: [trend === 'up' ? _jsx(TrendingUp, { size: 16 }) :
                                trend === 'down' ? _jsx(TrendingDown, { size: 16 }) :
                                    _jsx(Activity, { size: 16 }), _jsx("span", { children: change })] })] }) }) }));
});
KPICard.displayName = 'KPICard';
const PartnerTable = memo(({ partners }) => (_jsxs("div", { className: "bg-slate-800/50 backdrop-blur-xl p-6 rounded-xl border border-slate-700/50", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "Partner Performance Matrix" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-slate-700", children: [_jsx("th", { className: "text-left py-3 px-4 text-slate-400 font-medium", children: "Partner" }), _jsx("th", { className: "text-right py-3 px-4 text-slate-400 font-medium", children: "Engineers" }), _jsx("th", { className: "text-right py-3 px-4 text-slate-400 font-medium", children: "Utilization" }), _jsx("th", { className: "text-right py-3 px-4 text-slate-400 font-medium", children: "Satisfaction" }), _jsx("th", { className: "text-right py-3 px-4 text-slate-400 font-medium", children: "Revenue" }), _jsx("th", { className: "text-right py-3 px-4 text-slate-400 font-medium", children: "Trend" })] }) }), _jsx("tbody", { children: partners.map((partner, index) => (_jsxs("tr", { className: "border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors", children: [_jsx("td", { className: "py-3 px-4 text-white font-medium", children: partner.partner }), _jsx("td", { className: "py-3 px-4 text-right text-slate-300", children: partner.engineers }), _jsx("td", { className: "py-3 px-4 text-right", children: _jsxs("span", { className: `px-2 py-1 rounded text-xs ${partner.utilization >= 90 ? 'bg-green-500/20 text-green-400' :
                                            partner.utilization >= 85 ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'}`, children: [partner.utilization, "%"] }) }), _jsxs("td", { className: "py-3 px-4 text-right text-slate-300", children: ["\u2B50 ", partner.satisfaction] }), _jsxs("td", { className: "py-3 px-4 text-right text-slate-300", children: ["$", (partner.revenue / 1000).toFixed(0), "K"] }), _jsx("td", { className: "py-3 px-4 text-right", children: _jsx(TrendingUp, { className: "inline text-green-400", size: 16 }) })] }, index))) })] }) })] })));
PartnerTable.displayName = 'PartnerTable';
export default function OptimizedKPIDashboard() {
    const [data, setData] = useState(() => generateOptimizedData());
    const [selectedTimeRange, setSelectedTimeRange] = useState('6M');
    const [isLoading, setIsLoading] = useState(false);
    const refreshData = useCallback(() => {
        setIsLoading(true);
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            window.requestIdleCallback(() => {
                setData(generateOptimizedData());
                setIsLoading(false);
            });
        }
        else {
            setTimeout(() => {
                setData(generateOptimizedData());
                setIsLoading(false);
            }, 0);
        }
    }, []);
    useEffect(() => {
        const interval = setInterval(refreshData, 60000);
        return () => clearInterval(interval);
    }, [refreshData]);
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
            benchCost: totalEngineers * (100 - avgUtilization) * 150
        };
    }, [data]);
    const handleTimeRangeChange = useCallback((range) => {
        setSelectedTimeRange(range);
        setIsLoading(true);
        setTimeout(() => {
            setData(generateOptimizedData());
            setIsLoading(false);
        }, 200);
    }, []);
    return (_jsxs("div", { className: "w-full space-y-6 p-4", children: [_jsx("div", { className: "bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl p-6 rounded-xl border border-slate-700/50", children: _jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold text-white mb-2", children: ["Analytics Dashboard", isLoading && _jsx("span", { className: "ml-2 text-blue-400 text-lg", children: "\u21BB" })] }), _jsx("p", { className: "text-slate-400", children: "Real-time operational metrics and performance indicators" })] }), _jsx("div", { className: "flex gap-2", children: ['1M', '3M', '6M', '1Y'].map((range) => (_jsx("button", { onClick: () => handleTimeRangeChange(range), disabled: isLoading, className: `px-4 py-2 rounded-lg transition-all disabled:opacity-50 ${selectedTimeRange === range
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`, children: range }, range))) })] }) }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(KPICard, { title: "Monthly Recurring Revenue", value: `$${(currentMetrics.mrr / 1000000).toFixed(2)}M`, change: "28% from last month", trend: "up", icon: _jsx(DollarSign, { className: "text-green-400", size: 20 }), color: "green" }), _jsx(KPICard, { title: "Time to Deploy", value: `${currentMetrics.deployTime.toFixed(0)} days`, change: "33% faster vs Q1", trend: "up", icon: _jsx(Clock, { className: "text-blue-400", size: 20 }), color: "blue" }), _jsx(KPICard, { title: "Engineer Utilization", value: `${currentMetrics.utilization}%`, change: "Above 85% target", trend: "up", icon: _jsx(Activity, { className: "text-purple-400", size: 20 }), color: "purple" }), _jsx(KPICard, { title: "Active Engineers", value: currentMetrics.totalEngineers, change: "12 new this month", trend: "up", icon: _jsx(Users, { className: "text-orange-400", size: 20 }), color: "orange" })] }), _jsx(LazyCharts, { data: data }), _jsx(PartnerTable, { partners: data.partnerPerformance }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [_jsx("div", { className: "bg-gradient-to-r from-red-500/10 to-orange-500/10 p-6 rounded-xl border border-red-500/30", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(AlertTriangle, { className: "text-red-400 mt-1", size: 20 }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-red-400 mb-2", children: "Critical Actions Required" }), _jsxs("ul", { className: "text-sm text-slate-300 space-y-1", children: [_jsxs("li", { children: ["\u2022 Bench time exceeding target by 3.2% - $", (currentMetrics.benchCost / 1000).toFixed(0), "K monthly impact"] }), _jsx("li", { children: "\u2022 3 engineers pending contract renewal this week" }), _jsx("li", { children: "\u2022 Visa processing bottleneck affecting 12 deployments" })] })] })] }) }), _jsx("div", { className: "bg-gradient-to-r from-green-500/10 to-blue-500/10 p-6 rounded-xl border border-green-500/30", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(CheckCircle, { className: "text-green-400 mt-1", size: 20 }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-green-400 mb-2", children: "Positive Trends" }), _jsxs("ul", { className: "text-sm text-slate-300 space-y-1", children: [_jsx("li", { children: "\u2022 Revenue growth exceeding forecast by 18%" }), _jsx("li", { children: "\u2022 Deployment time improved by 33% YoY" }), _jsx("li", { children: "\u2022 Client satisfaction at all-time high (4.7/5.0)" })] })] })] }) })] })] }));
}
//# sourceMappingURL=OptimizedKPIDashboard.js.map