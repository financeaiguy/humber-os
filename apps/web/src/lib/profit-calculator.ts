// Comprehensive Profit & Cost Tracking System for Humber

export interface ShopCharge {
  id: string
  poId: string
  category: 'equipment' | 'materials' | 'tooling' | 'consumables' | 'utilities' | 'other'
  description: string
  amount: number
  date: string
  approved: boolean
}

export interface RunningCosts {
  // Fixed monthly costs when no work
  facilityRent: number
  utilities: number
  insurance: number
  salariesOverhead: number // Office staff, management
  equipmentLeases: number
  softwareLicenses: number
  maintenance: number
  other: number
  total: number
}

export interface PurchaseOrderProfit {
  poId: string
  poNumber: string
  clientName: string
  
  // Revenue
  totalRevenue: number
  
  // Costs - Manpower
  laborCosts: number
  engineerHours: number
  engineerCount: number
  
  // Costs - Shop Floor
  shopCharges: number
  materialsCost: number
  equipmentCost: number
  toolingCost: number
  utilitiesCost: number
  
  // Costs - Other
  travelExpenses: number
  miscExpenses: number
  
  // Profit Calculations
  grossProfit: number
  grossProfitMargin: number // percentage
  
  netProfit: number
  netProfitMargin: number // percentage
  
  // Breakdown
  manpowerCostPercentage: number
  shopFloorCostPercentage: number
  overheadAllocation: number
}

export interface BusinessProfitMetrics {
  // Overall Business Metrics
  totalRevenue: number
  totalCosts: number
  grossProfit: number
  grossProfitMargin: number
  
  // After overhead allocation
  netProfit: number
  netProfitMargin: number
  
  // Running Costs (monthly)
  monthlyRunningCosts: RunningCosts
  monthlyBreakeven: number // Revenue needed to break even
  
  // Utilization
  utilizationRate: number // % of capacity being used
  idleTimeCost: number // Cost of unutilized capacity
  
  // Breakdown by Category
  manpowerMetrics: {
    revenue: number
    costs: number
    profit: number
    profitMargin: number
    headcount: number
    averageRate: number
    utilizationRate: number
  }
  
  shopFloorMetrics: {
    revenue: number
    costs: number
    profit: number
    profitMargin: number
    utilizationRate: number
    equipmentROI: number
  }
  
  // Projections
  projectedMonthlyProfit: number
  projectedAnnualProfit: number
  requiredRevenueForTarget: number // Revenue needed for target profit
  
  // Performance Indicators
  averagePOProfit: number
  averagePOMargin: number
  topPerformingPOs: Array<{
    poNumber: string
    clientName: string
    profitMargin: number
  }>
  
  // Risk Metrics
  cashBurnRate: number // When no work
  runwayMonths: number // How long can survive without work
  minimumPOsNeeded: number // To stay profitable
}

export class ProfitCalculator {
  private static readonly DEFAULT_OVERHEAD_RATE = 0.15 // 15% overhead allocation
  private static readonly TARGET_NET_MARGIN = 0.20 // 20% target net profit margin
  
  // Monthly running costs for Humber (example values - adjust as needed)
  static readonly MONTHLY_RUNNING_COSTS: RunningCosts = {
    facilityRent: 25000,
    utilities: 5000,
    insurance: 8000,
    salariesOverhead: 60000, // Management, admin, etc.
    equipmentLeases: 10000,
    softwareLicenses: 3000,
    maintenance: 4000,
    other: 5000,
    total: 120000 // $120K/month to keep doors open
  }
  
  static calculatePOProfit(
    po: {
      id: string
      poNumber: string
      clientName: string
      totalBudget: number
      allocatedHours: number
    },
    laborCosts: number,
    engineerHours: number,
    engineerCount: number,
    shopCharges: ShopCharge[],
    expenses: number
  ): PurchaseOrderProfit {
    
    // Calculate shop floor costs by category
    const shopCostsByCategory = shopCharges.reduce((acc, charge) => {
      if (!charge.approved) return acc
      
      switch(charge.category) {
        case 'materials':
          acc.materials += charge.amount
          break
        case 'equipment':
          acc.equipment += charge.amount
          break
        case 'tooling':
          acc.tooling += charge.amount
          break
        case 'utilities':
          acc.utilities += charge.amount
          break
        default:
          acc.other += charge.amount
      }
      acc.total += charge.amount
      return acc
    }, {
      materials: 0,
      equipment: 0,
      tooling: 0,
      utilities: 0,
      other: 0,
      total: 0
    })
    
    // Calculate overhead allocation
    const overheadAllocation = po.totalBudget * this.DEFAULT_OVERHEAD_RATE
    
    // Calculate profits
    const totalCosts = laborCosts + shopCostsByCategory.total + expenses
    const grossProfit = po.totalBudget - totalCosts
    const grossProfitMargin = (grossProfit / po.totalBudget) * 100
    
    const netProfit = grossProfit - overheadAllocation
    const netProfitMargin = (netProfit / po.totalBudget) * 100
    
    // Calculate cost percentages
    const manpowerCostPercentage = (laborCosts / totalCosts) * 100
    const shopFloorCostPercentage = (shopCostsByCategory.total / totalCosts) * 100
    
    return {
      poId: po.id,
      poNumber: po.poNumber,
      clientName: po.clientName,
      
      // Revenue
      totalRevenue: po.totalBudget,
      
      // Costs - Manpower
      laborCosts,
      engineerHours,
      engineerCount,
      
      // Costs - Shop Floor
      shopCharges: shopCostsByCategory.total,
      materialsCost: shopCostsByCategory.materials,
      equipmentCost: shopCostsByCategory.equipment,
      toolingCost: shopCostsByCategory.tooling,
      utilitiesCost: shopCostsByCategory.utilities,
      
      // Costs - Other
      travelExpenses: expenses,
      miscExpenses: 0,
      
      // Profit Calculations
      grossProfit,
      grossProfitMargin,
      
      netProfit,
      netProfitMargin,
      
      // Breakdown
      manpowerCostPercentage,
      shopFloorCostPercentage,
      overheadAllocation
    }
  }
  
  static calculateBusinessProfitMetrics(
    allPOs: PurchaseOrderProfit[],
    activeEngineers: number,
    totalEngineers: number,
    shopUtilizationRate: number = 0.75
  ): BusinessProfitMetrics {
    
    // Aggregate PO data
    const totalRevenue = allPOs.reduce((sum, po) => sum + po.totalRevenue, 0)
    const totalLaborCosts = allPOs.reduce((sum, po) => sum + po.laborCosts, 0)
    const totalShopCosts = allPOs.reduce((sum, po) => sum + po.shopCharges, 0)
    const totalExpenses = allPOs.reduce((sum, po) => sum + po.travelExpenses + po.miscExpenses, 0)
    const totalCosts = totalLaborCosts + totalShopCosts + totalExpenses
    
    // Business-level profit calculations
    const grossProfit = totalRevenue - totalCosts
    const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
    
    // Include running costs for net profit
    const monthlyRunningCosts = this.MONTHLY_RUNNING_COSTS
    const annualizedRunningCosts = monthlyRunningCosts.total * 12
    const netProfit = grossProfit - annualizedRunningCosts
    const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
    
    // Utilization metrics
    const engineerUtilization = totalEngineers > 0 ? (activeEngineers / totalEngineers) * 100 : 0
    const idleTimeCost = (1 - engineerUtilization / 100) * monthlyRunningCosts.salariesOverhead
    
    // Manpower metrics
    const manpowerRevenue = totalRevenue * 0.7 // Assume 70% of revenue from engineering services
    const manpowerProfit = manpowerRevenue - totalLaborCosts
    const manpowerMargin = manpowerRevenue > 0 ? (manpowerProfit / manpowerRevenue) * 100 : 0
    
    // Shop floor metrics  
    const shopRevenue = totalRevenue * 0.3 // Assume 30% from shop services
    const shopProfit = shopRevenue - totalShopCosts
    const shopMargin = shopRevenue > 0 ? (shopProfit / shopRevenue) * 100 : 0
    const equipmentROI = totalShopCosts > 0 ? (shopProfit / totalShopCosts) * 100 : 0
    
    // Projections (assuming current rate continues)
    const monthsInData = 3 // Assume 3 months of data
    const monthlyProfit = netProfit / monthsInData
    const projectedAnnualProfit = monthlyProfit * 12
    
    // Required revenue for target margin
    const targetProfit = totalCosts / (1 - this.TARGET_NET_MARGIN)
    const requiredRevenueForTarget = targetProfit
    
    // Performance metrics
    const averagePOProfit = allPOs.length > 0 ? 
      allPOs.reduce((sum, po) => sum + po.netProfit, 0) / allPOs.length : 0
    const averagePOMargin = allPOs.length > 0 ?
      allPOs.reduce((sum, po) => sum + po.netProfitMargin, 0) / allPOs.length : 0
    
    // Top performing POs
    const topPerformingPOs = allPOs
      .sort((a, b) => b.netProfitMargin - a.netProfitMargin)
      .slice(0, 5)
      .map(po => ({
        poNumber: po.poNumber,
        clientName: po.clientName,
        profitMargin: po.netProfitMargin
      }))
    
    // Risk metrics
    const monthlyRevenue = totalRevenue / monthsInData
    const cashBurnRate = monthlyRunningCosts.total - monthlyRevenue
    const runwayMonths = cashBurnRate > 0 ? 12 : Infinity // Assume 12 months cash reserves
    const minimumPOsNeeded = Math.ceil(monthlyRunningCosts.total / averagePOProfit)
    
    return {
      // Overall Business Metrics
      totalRevenue,
      totalCosts,
      grossProfit,
      grossProfitMargin,
      
      // After overhead allocation
      netProfit,
      netProfitMargin,
      
      // Running Costs
      monthlyRunningCosts,
      monthlyBreakeven: monthlyRunningCosts.total,
      
      // Utilization
      utilizationRate: (engineerUtilization + shopUtilizationRate * 100) / 2,
      idleTimeCost,
      
      // Breakdown by Category
      manpowerMetrics: {
        revenue: manpowerRevenue,
        costs: totalLaborCosts,
        profit: manpowerProfit,
        profitMargin: manpowerMargin,
        headcount: totalEngineers,
        averageRate: totalLaborCosts / (allPOs.reduce((sum, po) => sum + po.engineerHours, 0) || 1),
        utilizationRate: engineerUtilization
      },
      
      shopFloorMetrics: {
        revenue: shopRevenue,
        costs: totalShopCosts,
        profit: shopProfit,
        profitMargin: shopMargin,
        utilizationRate: shopUtilizationRate * 100,
        equipmentROI
      },
      
      // Projections
      projectedMonthlyProfit: monthlyProfit,
      projectedAnnualProfit,
      requiredRevenueForTarget,
      
      // Performance Indicators
      averagePOProfit,
      averagePOMargin,
      topPerformingPOs,
      
      // Risk Metrics
      cashBurnRate,
      runwayMonths,
      minimumPOsNeeded
    }
  }
  
  static generateProfitRecommendations(metrics: BusinessProfitMetrics): string[] {
    const recommendations: string[] = []
    
    // Profitability recommendations
    if (metrics.netProfitMargin < 10) {
      recommendations.push('⚠️ Net profit margin below 10%. Consider increasing rates or reducing costs.')
    }
    
    if (metrics.netProfitMargin < this.TARGET_NET_MARGIN * 100) {
      const revenueGap = metrics.requiredRevenueForTarget - metrics.totalRevenue
      recommendations.push(`📈 Need $${revenueGap.toLocaleString()} more revenue to reach ${this.TARGET_NET_MARGIN * 100}% target margin.`)
    }
    
    // Utilization recommendations
    if (metrics.utilizationRate < 70) {
      recommendations.push('🏭 Low utilization rate. Focus on sales and marketing to increase workload.')
    }
    
    if (metrics.manpowerMetrics.utilizationRate < 75) {
      recommendations.push(`👥 Engineer utilization at ${metrics.manpowerMetrics.utilizationRate.toFixed(1)}%. Consider project pipeline management.`)
    }
    
    // Cost recommendations
    if (metrics.idleTimeCost > metrics.monthlyRunningCosts.total * 0.2) {
      recommendations.push(`💸 High idle time cost ($${metrics.idleTimeCost.toLocaleString()}/month). Optimize staffing levels.`)
    }
    
    if (metrics.shopFloorMetrics.equipmentROI < 50) {
      recommendations.push('🔧 Low equipment ROI. Review shop floor pricing or utilization.')
    }
    
    // Risk recommendations
    if (metrics.cashBurnRate > 0) {
      recommendations.push(`🔥 Burning $${Math.abs(metrics.cashBurnRate).toLocaleString()}/month. Need more revenue to cover costs.`)
    }
    
    if (metrics.runwayMonths < 6) {
      recommendations.push(`⏰ Only ${metrics.runwayMonths.toFixed(1)} months of runway. Urgent action needed.`)
    }
    
    if (metrics.minimumPOsNeeded > 3) { // Assuming we need more than 3 POs
      recommendations.push(`📊 Need at least ${metrics.minimumPOsNeeded} active POs to stay profitable.`)
    }
    
    // Positive recommendations
    if (metrics.netProfitMargin >= this.TARGET_NET_MARGIN * 100) {
      recommendations.push(`✅ Exceeding target profit margin! Consider expansion or bonuses.`)
    }
    
    if (metrics.topPerformingPOs.length > 0) {
      const topPO = metrics.topPerformingPOs[0]
      recommendations.push(`🌟 ${topPO.clientName} is your most profitable client (${topPO.profitMargin.toFixed(1)}% margin).`)
    }
    
    return recommendations
  }
}