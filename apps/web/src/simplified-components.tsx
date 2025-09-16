import React from 'react'

// Simplified versions of complex components for Workers compatibility
export function SimpleDashboard() {
  const stats = [
    { name: 'Total Revenue', value: '$917,235', change: '+12.5%', icon: '💰' },
    { name: 'Active Projects', value: '15', change: '+3 this month', icon: '🚀' },
    { name: 'Billable Hours', value: '73%', change: '+5.2%', icon: '⏰' },
    { name: 'Team Members', value: '35', change: '2 new hires', icon: '👥' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
          Welcome back, Demo User
        </h1>
        <p className="text-slate-200">
          Demo Partner - Partner Admin
        </p>
        <p className="text-slate-200 mt-1">
          Here's what's happening with your automation projects today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{stat.name}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                <p className="text-sm text-green-400 mt-1">{stat.change}</p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              'New engineer onboarded - 2 hours ago',
              'Project milestone completed - 4 hours ago', 
              'Background check completed - 6 hours ago',
              'Client meeting scheduled - 8 hours ago'
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <p className="text-sm text-white">{activity}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
          <div className="space-y-3">
            {[
              { service: 'Workers AI', status: 'operational' },
              { service: 'Vectorize', status: 'operational' },
              { service: 'D1 Databases', status: 'operational' },
              { service: 'R2 Storage', status: 'operational' },
              { service: 'Backend API', status: 'operational' }
            ].map((service) => (
              <div key={service.service} className="flex justify-between items-center p-2">
                <span className="text-sm font-medium text-white">{service.service}</span>
                <span className="text-sm font-semibold text-green-400">✓ {service.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function SimpleBullPen() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Bull Pen Dashboard</h1>
        <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium text-white">
          Load Engineers
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2 text-green-400">Available</h3>
          <p className="text-3xl font-bold text-white">12</p>
          <p className="text-sm text-slate-400 mt-1">Ready for deployment</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-400">Deployed</h3>
          <p className="text-3xl font-bold text-white">36</p>
          <p className="text-sm text-slate-400 mt-1">Currently working</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2 text-purple-400">Utilization</h3>
          <p className="text-3xl font-bold text-white">87%</p>
          <p className="text-sm text-slate-400 mt-1">Efficiency rate</p>
        </div>
      </div>
      
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Engineer Allocation</h3>
        <div className="space-y-3">
          {[
            { name: 'Sarah Johnson', role: 'Senior Controls Engineer', status: 'Available' },
            { name: 'Mike Chen', role: 'Mechanical Engineer', status: 'Deployed' },
            { name: 'Lisa Rodriguez', role: 'Electrical Engineer', status: 'Available' },
            { name: 'David Kim', role: 'Software Engineer', status: 'Deployed' }
          ].map((engineer, index) => (
            <div key={index} className="bg-slate-700 p-4 rounded-lg flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-white">{engineer.name}</h4>
                <p className="text-slate-400 text-sm">{engineer.role}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${
                engineer.status === 'Available' 
                  ? 'bg-green-900 text-green-300' 
                  : 'bg-blue-900 text-blue-300'
              }`}>
                {engineer.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SimpleTimeTracking() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Time Tracking</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Clock In/Out</h3>
          <div className="space-y-4">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium">
              🕐 Clock In
            </button>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium">
              🕐 Clock Out
            </button>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Today's Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Hours Worked:</span>
              <span className="text-white font-medium">7.5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Break Time:</span>
              <span className="text-white font-medium">1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="text-green-400 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Biometric Verification</h3>
        <p className="text-slate-300 mb-4">Advanced time tracking with multi-layer trust verification:</p>
        <ul className="space-y-2 text-sm text-slate-400">
          <li>✓ Biometric authentication</li>
          <li>✓ Geolocation verification</li>
          <li>✓ Device trust scoring</li>
          <li>✓ Real-time monitoring</li>
        </ul>
      </div>
    </div>
  )
}

export function SimpleAnalytics() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Trends</h3>
          <div className="h-64 flex items-center justify-center bg-slate-700 rounded-lg">
            <p className="text-slate-400">📈 Revenue Chart Placeholder</p>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Project Activity</h3>
          <div className="h-64 flex items-center justify-center bg-slate-700 rounded-lg">
            <p className="text-slate-400">📊 Activity Chart Placeholder</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Overall Utilization', value: '87%', color: 'text-blue-400' },
          { label: 'YTD Revenue', value: '$6.2M', color: 'text-green-400' },
          { label: 'Active Projects', value: '30', color: 'text-purple-400' },
          { label: 'Client Satisfaction', value: '95%', color: 'text-orange-400' }
        ].map((kpi) => (
          <div key={kpi.label} className="text-center p-4 bg-slate-800 border border-slate-700 rounded-lg">
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-sm text-slate-200">{kpi.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SimpleRecruits() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Recruits Management</h1>
      
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recruitment Pipeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { stage: 'Sourced', count: 15, color: 'bg-yellow-900 text-yellow-300' },
            { stage: 'Screened', count: 8, color: 'bg-blue-900 text-blue-300' },
            { stage: 'Interviewed', count: 5, color: 'bg-green-900 text-green-300' }
          ].map((stage) => (
            <div key={stage.stage} className="bg-slate-700 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-white">{stage.count}</div>
              <div className={`text-sm font-medium ${stage.color} px-2 py-1 rounded mt-2 inline-block`}>
                {stage.stage}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Candidates</h3>
        <div className="space-y-3">
          {[
            { name: 'Alex Thompson', role: 'Senior Controls Engineer', status: 'Interview Scheduled' },
            { name: 'Maria Garcia', role: 'Mechanical Engineer', status: 'Technical Assessment' },
            { name: 'James Wilson', role: 'Electrical Engineer', status: 'Background Check' }
          ].map((candidate, index) => (
            <div key={index} className="bg-slate-700 p-4 rounded-lg flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-white">{candidate.name}</h4>
                <p className="text-slate-400 text-sm">{candidate.role}</p>
              </div>
              <span className="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-xs">
                {candidate.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SimpleProjects() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Projects</h1>
      
      <div className="space-y-4">
        {[
          { name: 'GM Assembly Line Automation', client: 'General Motors', progress: 65, status: 'In Progress' },
          { name: 'Ford Paint Shop Upgrade', client: 'Ford', progress: 40, status: 'In Progress' },
          { name: 'Stellantis Quality Control', client: 'Stellantis', progress: 15, status: 'Planning' },
          { name: 'HIROTEC Welding System', client: 'HIROTEC', progress: 80, status: 'In Progress' }
        ].map((project, index) => (
          <div key={index} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-white text-lg">{project.name}</h3>
                <p className="text-slate-400">{project.client}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                project.status === 'In Progress' 
                  ? 'bg-blue-900 text-blue-300' 
                  : 'bg-yellow-900 text-yellow-300'
              }`}>
                {project.status}
              </span>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm text-slate-400 mb-1">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SimpleOnboarding() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Onboarding</h1>
      
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Employee Onboarding</h3>
        <p className="text-slate-300 mb-6">
          Streamlined employee onboarding with document management and progress tracking.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: 'Documentation', status: 'Complete', count: 12 },
            { step: 'Background Check', status: 'In Progress', count: 8 },
            { step: 'Training', status: 'Pending', count: 5 }
          ].map((step) => (
            <div key={step.step} className="bg-slate-700 p-4 rounded-lg text-center">
              <div className="text-xl font-bold text-white">{step.count}</div>
              <div className="text-sm font-medium text-slate-300">{step.step}</div>
              <div className={`text-xs mt-2 px-2 py-1 rounded inline-block ${
                step.status === 'Complete' 
                  ? 'bg-green-900 text-green-300'
                  : step.status === 'In Progress'
                  ? 'bg-blue-900 text-blue-300'
                  : 'bg-yellow-900 text-yellow-300'
              }`}>
                {step.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SimpleSettings() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">System Configuration</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">API Version</span>
              <span className="text-white font-medium">v1.0.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Environment</span>
              <span className="text-green-400 font-medium">Production</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Log Level</span>
              <span className="text-white font-medium">Info</span>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Integrations</h3>
          <div className="space-y-3">
            {[
              { service: 'Workers AI', status: 'Connected' },
              { service: 'Vectorize DB', status: 'Connected' },
              { service: 'R2 Storage', status: 'Connected' },
              { service: 'KV Cache', status: 'Connected' }
            ].map((integration) => (
              <div key={integration.service} className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                <span className="text-white">{integration.service}</span>
                <span className="text-green-400 text-sm">✓ {integration.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
