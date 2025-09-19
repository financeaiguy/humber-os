import { 
  ProjectCostCalculator, 
  EngineerDeployment, 
  EngineerCostBreakdown, 
  ProjectSoftCosts, 
  ProjectHardCosts, 
  CostItem,
  ProjectBudgetAllocation,
  TravelExpense,
  MiscExpense
} from '@/types/invoicing'

export class DynamicProjectCostCalculator implements ProjectCostCalculator {
  
  /**
   * Calculate engineer costs based on deployments and hourly rates
   */
  async calculateEngineerCosts(
    engineers: EngineerDeployment[], 
    hourlyRates: Map<string, number>
  ): Promise<EngineerCostBreakdown[]> {
    const costBreakdowns: EngineerCostBreakdown[] = []
    
    for (const engineer of engineers) {
      const hourlyRate = hourlyRates.get(engineer.engineerId) || this.getDefaultRateByRole(engineer.role)
      const hoursWorked = await this.getActualHoursWorked(engineer.engineerId, engineer.projectId)
      const overtime = this.calculateOvertime(hoursWorked)
      
      const regularHours = Math.min(hoursWorked, 40 * this.getWeeksInDeployment(engineer))
      const overtimeHours = Math.max(0, hoursWorked - regularHours)
      const overtimeRate = hourlyRate * 1.5 // 1.5x for overtime
      
      const regularCost = regularHours * hourlyRate
      const overtimeCost = overtimeHours * overtimeRate
      const totalCost = regularCost + overtimeCost
      
      costBreakdowns.push({
        engineerId: engineer.engineerId,
        engineerName: engineer.engineerName,
        engineerRole: engineer.role,
        hourlyRate,
        hoursWorked,
        totalCost,
        costCenter: this.getCostCenter(engineer.role),
        billable: true,
        overtime: overtimeHours > 0,
        overtimeRate: overtimeHours > 0 ? overtimeRate : undefined,
        overtimeHours: overtimeHours > 0 ? overtimeHours : undefined,
        overtimeCost: overtimeHours > 0 ? overtimeCost : undefined
      })
    }
    
    return costBreakdowns
  }

  /**
   * Calculate soft costs (licenses, subscriptions, etc.)
   */
  calculateSoftCosts(items: CostItem[]): ProjectSoftCosts {
    const categorizeItems = (category: string) => 
      items.filter(item => item.category === category)
    
    const softwareLicenses = categorizeItems('software_license')
    const cloudServices = categorizeItems('cloud_service')
    const subscriptions = categorizeItems('subscription')
    const training = categorizeItems('training')
    const consulting = categorizeItems('consulting')
    const documentation = categorizeItems('documentation')
    
    const total = items.reduce((sum, item) => sum + item.totalCost, 0)
    
    return {
      softwareLicenses,
      cloudServices,
      subscriptions,
      training,
      consulting,
      documentation,
      total
    }
  }

  /**
   * Calculate hard costs (equipment, materials, etc.)
   */
  calculateHardCosts(items: CostItem[]): ProjectHardCosts {
    const categorizeItems = (category: string) => 
      items.filter(item => item.category === category)
    
    const equipment = categorizeItems('equipment')
    const materials = categorizeItems('materials')
    const tools = categorizeItems('tools')
    const infrastructure = categorizeItems('infrastructure')
    const shipping = categorizeItems('shipping')
    const installation = categorizeItems('installation')
    
    const total = items.reduce((sum, item) => sum + item.totalCost, 0)
    
    return {
      equipment,
      materials,
      tools,
      infrastructure,
      shipping,
      installation,
      total
    }
  }

  /**
   * Calculate total project cost including all components
   */
  async calculateTotalProjectCost(projectId: string): Promise<number> {
    try {
      // Get all cost components
      const engineers = await this.getProjectEngineers(projectId)
      const hourlyRates = await this.getHourlyRates()
      const softCostItems = await this.getProjectSoftCosts(projectId)
      const hardCostItems = await this.getProjectHardCosts(projectId)
      const travelExpenses = await this.getProjectTravelExpenses(projectId)
      const miscExpenses = await this.getProjectMiscExpenses(projectId)
      
      // Calculate each component
      const engineerCosts = await this.calculateEngineerCosts(engineers, hourlyRates)
      const softCosts = this.calculateSoftCosts(softCostItems)
      const hardCosts = this.calculateHardCosts(hardCostItems)
      
      const totalEngineerCost = engineerCosts.reduce((sum, ec) => sum + ec.totalCost, 0)
      const totalTravelCost = travelExpenses.reduce((sum, te) => sum + te.amount, 0)
      const totalMiscCost = miscExpenses.reduce((sum, me) => sum + me.amount, 0)
      
      return totalEngineerCost + softCosts.total + hardCosts.total + totalTravelCost + totalMiscCost
      
    } catch (error) {
      // SECURITY: console statement removed: console.error('Error calculating total project cost:', error)
      throw new Error('Failed to calculate project cost')
    }
  }

  /**
   * Validate if proposed costs fit within budget allocation
   */
  async validateBudgetAllocation(projectId: string, proposedCosts: number): Promise<boolean> {
    try {
      const budgetAllocation = await this.getProjectBudgetAllocation(projectId)
      const currentSpend = await this.calculateTotalProjectCost(projectId)
      const projectedTotal = currentSpend + proposedCosts
      
      return projectedTotal <= budgetAllocation.totalBudget
      
    } catch (error) {
      // SECURITY: console statement removed: console.error('Error validating budget allocation:', error)
      return false
    }
  }

  /**
   * Generate cost forecast based on completion percentage
   */
  async generateCostForecast(projectId: string, completionPercentage: number): Promise<number> {
    try {
      const currentCost = await this.calculateTotalProjectCost(projectId)
      
      if (completionPercentage === 0) {
        return currentCost
      }
      
      // Simple linear extrapolation - can be enhanced with ML models
      const forecastedTotal = (currentCost / completionPercentage) * 100
      
      return forecastedTotal
      
    } catch (error) {
      // SECURITY: console statement removed: console.error('Error generating cost forecast:', error)
      throw new Error('Failed to generate cost forecast')
    }
  }

  /**
   * Generate detailed budget breakdown for approval workflow
   */
  async generateBudgetBreakdown(projectId: string): Promise<ProjectBudgetAllocation> {
    try {
      const totalCost = await this.calculateTotalProjectCost(projectId)
      const engineers = await this.getProjectEngineers(projectId)
      const hourlyRates = await this.getHourlyRates()
      const engineerCosts = await this.calculateEngineerCosts(engineers, hourlyRates)
      const softCostItems = await this.getProjectSoftCosts(projectId)
      const hardCostItems = await this.getProjectHardCosts(projectId)
      const travelExpenses = await this.getProjectTravelExpenses(projectId)
      
      const softCosts = this.calculateSoftCosts(softCostItems)
      const hardCosts = this.calculateHardCosts(hardCostItems)
      
      const engineerBudget = engineerCosts.reduce((sum, ec) => sum + ec.totalCost, 0)
      const travelBudget = travelExpenses.reduce((sum, te) => sum + te.amount, 0)
      const originalBudget = await this.getOriginalProjectBudget(projectId)
      
      return {
        projectId,
        totalBudget: originalBudget,
        allocatedBudget: totalCost,
        remainingBudget: originalBudget - totalCost,
        engineerBudget,
        softCostBudget: softCosts.total,
        hardCostBudget: hardCosts.total,
        travelBudget,
        contingencyBudget: originalBudget * 0.1, // 10% contingency
        utilizationPercentage: (totalCost / originalBudget) * 100,
        forecastedTotal: await this.generateCostForecast(projectId, await this.getProjectCompletion(projectId)),
        budgetVariance: totalCost - originalBudget,
        lastUpdated: new Date().toISOString()
      }
      
    } catch (error) {
      // SECURITY: console statement removed: console.error('Error generating budget breakdown:', error)
      throw new Error('Failed to generate budget breakdown')
    }
  }

  // Helper methods
  private getDefaultRateByRole(role: string): number {
    const rates: Record<string, number> = {
      'Lead Electrical Engineer': 175,
      'Mechanical Engineer': 150,
      'Systems Engineer': 160,
      'Software Engineer': 140,
      'Project Engineer': 130,
      'Field Engineer': 120,
      'Junior Engineer': 95
    }
    return rates[role] || 125 // Default rate
  }

  private calculateOvertime(hoursWorked: number): boolean {
    return hoursWorked > 40 // Overtime if more than 40 hours per week
  }

  private getWeeksInDeployment(engineer: EngineerDeployment): number {
    const start = new Date(engineer.deploymentDate)
    const end = engineer.endDate ? new Date(engineer.endDate) : new Date()
    const weeks = Math.ceil((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000))
    return Math.max(1, weeks)
  }

  private getCostCenter(role: string): string {
    if (role.includes('Electrical')) return 'EE-001'
    if (role.includes('Mechanical')) return 'ME-001'
    if (role.includes('Software')) return 'SW-001'
    if (role.includes('Systems')) return 'SY-001'
    return 'GE-001' // General Engineering
  }

  // Mock data access methods - replace with actual database calls
  private async getActualHoursWorked(engineerId: string, projectId: string): Promise<number> {
    // Mock: Return random hours between 160-200 for demonstration
    return Math.floor(Math.random() * 40) + 160
  }

  private async getProjectEngineers(projectId: string): Promise<EngineerDeployment[]> {
    // Mock data - replace with actual database query
    return [
      {
        id: '1',
        projectId,
        engineerId: 'eng-001',
        engineerName: 'Sarah Johnson',
        role: 'Lead Electrical Engineer',
        deploymentDate: '2024-10-15',
        status: 'active',
        location: 'Detroit, MI',
        travelRequired: true,
        accommodationRequired: true,
        estimatedDuration: 90,
        costEstimate: 150000,
        approvedBy: 'admin-001',
        approvedAt: '2024-10-14'
      }
    ]
  }

  private async getHourlyRates(): Promise<Map<string, number>> {
    // Mock data - replace with actual database query
    return new Map([
      ['eng-001', 175],
      ['eng-002', 150],
      ['eng-003', 160]
    ])
  }

  private async getProjectSoftCosts(projectId: string): Promise<CostItem[]> {
    return []
  }

  private async getProjectHardCosts(projectId: string): Promise<CostItem[]> {
    return []
  }

  private async getProjectTravelExpenses(projectId: string): Promise<TravelExpense[]> {
    return []
  }

  private async getProjectMiscExpenses(projectId: string): Promise<MiscExpense[]> {
    return []
  }

  private async getProjectBudgetAllocation(projectId: string): Promise<ProjectBudgetAllocation> {
    // Mock data
    return {
      projectId,
      totalBudget: 1200000,
      allocatedBudget: 780000,
      remainingBudget: 420000,
      engineerBudget: 600000,
      softCostBudget: 100000,
      hardCostBudget: 50000,
      travelBudget: 30000,
      contingencyBudget: 120000,
      utilizationPercentage: 65,
      forecastedTotal: 1150000,
      budgetVariance: -50000,
      lastUpdated: new Date().toISOString()
    }
  }

  private async getOriginalProjectBudget(projectId: string): Promise<number> {
    return 1200000 // Mock budget
  }

  private async getProjectCompletion(projectId: string): Promise<number> {
    return 65 // Mock completion percentage
  }
}

// Export singleton instance
export const projectCostCalculator = new DynamicProjectCostCalculator()