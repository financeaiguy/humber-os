'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Factory,
  AlertTriangle,
  CheckCircle,
  PieChart,
  BarChart3,
  Target,
  Zap,
  Clock,
  Briefcase
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ProfitCalculator, 
  BusinessProfitMetrics, 
  PurchaseOrderProfit,
  ShopCharge,
  RunningCosts
} from '@/lib/profit-calculator'

interface ProfitDashboardProps {
  purchaseOrders?: any[]
  timeEntries?: any[]
  shopCharges?: ShopCharge[]
  expenses?: any[]
}

export function ProfitDashboard({
  purchaseOrders = [],
  timeEntries = [],
  shopCharges = [],
  expenses = []
}: ProfitDashboardProps) {
  
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [businessMetrics, setBusinessMetrics] = useState<BusinessProfitMetrics | null>(null)
  const [poProfit, setPOProfit] = useState<PurchaseOrderProfit[]>([])
  
  useEffect(() => {
    calculateMetrics()
  }, [purchaseOrders, timeEntries, shopCharges, expenses])
  
  const calculateMetrics = () => {
    // Calculate profit for each PO
    const poProfit = purchaseOrders.map(po => {
      const poTimeEntries = timeEntries.filter(entry => entry.poId === po.id)
      const laborCosts = poTimeEntries.reduce((sum, entry) => sum + (entry.hours * entry.rate), 0)
      const engineerHours = poTimeEntries.reduce((sum, entry) => sum + entry.hours, 0)
      const uniqueEngineers = new Set(poTimeEntries.map(e => e.engineerId)).size
      const poShopCharges = shopCharges.filter(charge => charge.poId === po.id)
      const poExpenses = expenses.filter(expense => expense.poId === po.id)
      const totalExpenses = poExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      
      return ProfitCalculator.calculatePOProfit(
        po,
        laborCosts,
        engineerHours,
        uniqueEngineers,
        poShopCharges,
        totalExpenses
      )
    })
    
    setPOProfit(poProfit)
    
    // Calculate business metrics
    const activeEngineers = new Set(timeEntries.map(e => e.engineerId)).size
    const totalEngineers = 25 // Mock value - replace with actual
    const shopUtilization = 0.72 // Mock value - replace with actual
    
    const metrics = ProfitCalculator.calculateBusinessProfitMetrics(
      poProfit,
      activeEngineers,
      totalEngineers,
      shopUtilization
    )
    
    setBusinessMetrics(metrics)
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }
  
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }
  
  if (!businessMetrics) {
    return <div>Loading profit metrics...</div>
  }
  
  const recommendations = ProfitCalculator.generateProfitRecommendations(businessMetrics)
  
  return (
    <div className="space-y-6">
      {/* Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(businessMetrics.totalRevenue)}
            </div>
            <div className="flex items-center mt-2 text-xs text-green-600 dark:text-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+12.5% from last period</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Net Profit */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(businessMetrics.netProfit)}
            </div>
            <div className="flex items-center mt-2">
              <Badge variant={businessMetrics.netProfitMargin >= 15 ? "default" : "destructive"}>
                {formatPercentage(businessMetrics.netProfitMargin)} margin
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        {/* Utilization Rate */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">
              Utilization Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatPercentage(businessMetrics.utilizationRate)}
            </div>
            <Progress 
              value={businessMetrics.utilizationRate} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
        
        {/* Monthly Burn */}
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400">
              Monthly Running Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(businessMetrics.monthlyRunningCosts.total)}
            </div>
            <div className="flex items-center mt-2 text-xs text-orange-600 dark:text-orange-400">
              <Clock className="h-3 w-3 mr-1" />
              <span>When idle</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="manpower">Manpower</TabsTrigger>
          <TabsTrigger value="shopfloor">Shop Floor</TabsTrigger>
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit Breakdown Chart */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-blue-400" />
                  Profit Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-400">Gross Profit</span>
                      <span className="text-sm font-medium text-white">
                        {formatCurrency(businessMetrics.grossProfit)}
                      </span>
                    </div>
                    <Progress 
                      value={businessMetrics.grossProfitMargin} 
                      className="h-3"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-400">Operating Costs</span>
                      <span className="text-sm font-medium text-red-400">
                        -{formatCurrency(businessMetrics.monthlyRunningCosts.total * 3)}
                      </span>
                    </div>
                    <Progress 
                      value={30} 
                      className="h-3 bg-red-900"
                    />
                  </div>
                  
                  <div className="pt-3 border-t border-slate-700">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-slate-300">Net Profit</span>
                      <span className="text-lg font-bold text-green-400">
                        {formatCurrency(businessMetrics.netProfit)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {formatPercentage(businessMetrics.netProfitMargin)} net margin
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Running Costs Breakdown */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Factory className="h-5 w-5 mr-2 text-orange-400" />
                  Monthly Running Costs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(businessMetrics.monthlyRunningCosts).map(([key, value]) => {
                    if (key === 'total') return null
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-slate-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-medium text-white">
                          {formatCurrency(value as number)}
                        </span>
                      </div>
                    )
                  })}
                  <div className="pt-3 border-t border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-300">Total Monthly</span>
                      <span className="text-lg font-bold text-orange-400">
                        {formatCurrency(businessMetrics.monthlyRunningCosts.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Top Performing POs */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-green-400" />
                Top Performing Purchase Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {businessMetrics.topPerformingPOs.map((po, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          index === 1 ? 'bg-gray-500/20 text-gray-400' :
                          index === 2 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-slate-700 text-slate-400'}
                      `}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-white">{po.clientName}</div>
                        <div className="text-xs text-slate-400">{po.poNumber}</div>
                      </div>
                    </div>
                    <Badge className={`
                      ${po.profitMargin >= 20 ? 'bg-green-500/20 text-green-400' :
                        po.profitMargin >= 15 ? 'bg-blue-500/20 text-blue-400' :
                        po.profitMargin >= 10 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'}
                    `}>
                      {formatPercentage(po.profitMargin)} margin
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Manpower Tab */}
        <TabsContent value="manpower" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(businessMetrics.manpowerMetrics.revenue)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  From engineering services
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Profit Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {formatPercentage(businessMetrics.manpowerMetrics.profitMargin)}
                </div>
                <Progress 
                  value={businessMetrics.manpowerMetrics.profitMargin} 
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatPercentage(businessMetrics.manpowerMetrics.utilizationRate)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {businessMetrics.manpowerMetrics.headcount} engineers
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Manpower Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">Total Costs</div>
                  <div className="text-lg font-medium text-white">
                    {formatCurrency(businessMetrics.manpowerMetrics.costs)}
                  </div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">Net Profit</div>
                  <div className="text-lg font-medium text-green-400">
                    {formatCurrency(businessMetrics.manpowerMetrics.profit)}
                  </div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">Avg Rate</div>
                  <div className="text-lg font-medium text-white">
                    {formatCurrency(businessMetrics.manpowerMetrics.averageRate)}/hr
                  </div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">Headcount</div>
                  <div className="text-lg font-medium text-white">
                    {businessMetrics.manpowerMetrics.headcount}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Shop Floor Tab */}
        <TabsContent value="shopfloor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(businessMetrics.shopFloorMetrics.revenue)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  From shop services
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Equipment ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">
                  {formatPercentage(businessMetrics.shopFloorMetrics.equipmentROI)}
                </div>
                <Progress 
                  value={Math.min(businessMetrics.shopFloorMetrics.equipmentROI, 100)} 
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatPercentage(businessMetrics.shopFloorMetrics.utilizationRate)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Shop capacity
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Shop Floor Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">Total Costs</div>
                  <div className="text-lg font-medium text-white">
                    {formatCurrency(businessMetrics.shopFloorMetrics.costs)}
                  </div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">Net Profit</div>
                  <div className="text-lg font-medium text-green-400">
                    {formatCurrency(businessMetrics.shopFloorMetrics.profit)}
                  </div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">Profit Margin</div>
                  <div className="text-lg font-medium text-white">
                    {formatPercentage(businessMetrics.shopFloorMetrics.profitMargin)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Cost Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Complete Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Revenue vs Costs */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-300">Total Revenue</span>
                    <span className="text-lg font-bold text-green-400">
                      {formatCurrency(businessMetrics.totalRevenue)}
                    </span>
                  </div>
                  <Progress value={100} className="h-4 bg-green-900" />
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-400">Labor Costs</span>
                      <span className="text-sm font-medium text-white">
                        {formatCurrency(businessMetrics.manpowerMetrics.costs)}
                      </span>
                    </div>
                    <Progress 
                      value={(businessMetrics.manpowerMetrics.costs / businessMetrics.totalRevenue) * 100} 
                      className="h-3"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-400">Shop Floor Costs</span>
                      <span className="text-sm font-medium text-white">
                        {formatCurrency(businessMetrics.shopFloorMetrics.costs)}
                      </span>
                    </div>
                    <Progress 
                      value={(businessMetrics.shopFloorMetrics.costs / businessMetrics.totalRevenue) * 100} 
                      className="h-3"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-400">Operating Expenses</span>
                      <span className="text-sm font-medium text-white">
                        {formatCurrency(businessMetrics.monthlyRunningCosts.total * 3)}
                      </span>
                    </div>
                    <Progress 
                      value={(businessMetrics.monthlyRunningCosts.total * 3 / businessMetrics.totalRevenue) * 100} 
                      className="h-3"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-slate-300">Net Profit</span>
                    <span className="text-xl font-bold text-green-400">
                      {formatCurrency(businessMetrics.netProfit)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {formatPercentage(businessMetrics.netProfitMargin)} of revenue
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Recommendations */}
      <Card className="bg-gradient-to-r from-slate-800/50 to-blue-800/20 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="h-5 w-5 mr-2 text-yellow-400" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-2 p-3 bg-slate-900/50 rounded-lg"
              >
                <span className="text-sm text-slate-300">{rec}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}