// All the missing page functions for worker-complete.js

function getBullPenPage() {
  return `<!-- BULL PEN PAGE -->
  <div id="bull-pen-page" class="space-y-6 hidden">
      <div class="flex justify-between items-center">
          <div>
              <h1 class="text-3xl font-bold">Resource Allocation Hub</h1>
              <p class="text-gray-400 mt-1">Mix and match engineers for projects • Manage travel and expenses</p>
          </div>
          <div class="flex space-x-3">
              <button onclick="showModal('flight-modal')" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition">
                  ✈️ Book Travel
              </button>
              <button onclick="showModal('expense-modal')" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition">
                  💰 Track Expenses
              </button>
          </div>
      </div>
      
      <!-- Engineer Categories -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-blue-500/20 border border-blue-500/30 p-6 rounded-xl">
              <div class="flex items-center justify-between mb-4">
                  <span class="text-2xl">🔧</span>
                  <span class="text-blue-400 font-bold">Controls</span>
              </div>
              <div class="space-y-2">
                  <div class="flex justify-between"><span class="text-sm">Available:</span><span class="text-green-400 font-bold">12</span></div>
                  <div class="flex justify-between"><span class="text-sm">Deployed:</span><span class="text-blue-400 font-bold">8</span></div>
                  <div class="flex justify-between"><span class="text-sm">Buffered:</span><span class="text-yellow-400 font-bold">2</span></div>
              </div>
          </div>
          
          <div class="bg-green-500/20 border border-green-500/30 p-6 rounded-xl">
              <div class="flex items-center justify-between mb-4">
                  <span class="text-2xl">🔩</span>
                  <span class="text-green-400 font-bold">Mechanical</span>
              </div>
              <div class="space-y-2">
                  <div class="flex justify-between"><span class="text-sm">Available:</span><span class="text-green-400 font-bold">15</span></div>
                  <div class="flex justify-between"><span class="text-sm">Deployed:</span><span class="text-blue-400 font-bold">10</span></div>
                  <div class="flex justify-between"><span class="text-sm">Buffered:</span><span class="text-yellow-400 font-bold">3</span></div>
              </div>
          </div>
          
          <div class="bg-yellow-500/20 border border-yellow-500/30 p-6 rounded-xl">
              <div class="flex items-center justify-between mb-4">
                  <span class="text-2xl">⚡</span>
                  <span class="text-yellow-400 font-bold">Electrical</span>
              </div>
              <div class="space-y-2">
                  <div class="flex justify-between"><span class="text-sm">Available:</span><span class="text-green-400 font-bold">8</span></div>
                  <div class="flex justify-between"><span class="text-sm">Deployed:</span><span class="text-blue-400 font-bold">6</span></div>
                  <div class="flex justify-between"><span class="text-sm">Buffered:</span><span class="text-yellow-400 font-bold">1</span></div>
              </div>
          </div>
          
          <div class="bg-purple-500/20 border border-purple-500/30 p-6 rounded-xl">
              <div class="flex items-center justify-between mb-4">
                  <span class="text-2xl">🔀</span>
                  <span class="text-purple-400 font-bold">Piping</span>
              </div>
              <div class="space-y-2">
                  <div class="flex justify-between"><span class="text-sm">Available:</span><span class="text-green-400 font-bold">10</span></div>
                  <div class="flex justify-between"><span class="text-sm">Deployed:</span><span class="text-blue-400 font-bold">7</span></div>
                  <div class="flex justify-between"><span class="text-sm">Buffered:</span><span class="text-yellow-400 font-bold">2</span></div>
              </div>
          </div>
      </div>
      
      <!-- Available Engineers Table -->
      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-semibold">Available Engineers</h3>
              <div class="flex space-x-3">
                  <input type="text" placeholder="Search engineers..." class="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm" id="bull-pen-search">
                  <select class="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm" id="bull-pen-filter">
                      <option value="All">All Categories</option>
                      <option value="Controls">Controls</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Piping">Piping</option>
                  </select>
                  <button onclick="filterBullPenEngineers()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition">Filter</button>
              </div>
          </div>
          
          <div class="overflow-x-auto">
              <table class="w-full text-sm">
                  <thead>
                      <tr class="border-b border-gray-700">
                          <th class="text-left p-3 text-gray-400">Engineer</th>
                          <th class="text-left p-3 text-gray-400">Category</th>
                          <th class="text-left p-3 text-gray-400">Location</th>
                          <th class="text-left p-3 text-gray-400">Rate</th>
                          <th class="text-left p-3 text-gray-400">Status</th>
                          <th class="text-left p-3 text-gray-400">Actions</th>
                      </tr>
                  </thead>
                  <tbody id="bull-pen-engineers">
                      <tr class="border-b border-gray-700 hover:bg-gray-700/20">
                          <td class="p-3">
                              <div class="flex items-center space-x-3">
                                  <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                      <span class="text-white font-bold text-sm">SC</span>
                                  </div>
                                  <div>
                                      <p class="font-medium text-white">Sarah Chen</p>
                                      <p class="text-gray-400 text-xs">Senior Controls Engineer</p>
                                  </div>
                              </div>
                          </td>
                          <td class="p-3"><span class="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">Controls</span></td>
                          <td class="p-3 text-gray-300">Austin, TX</td>
                          <td class="p-3 text-green-400 font-semibold">$125/hr</td>
                          <td class="p-3"><span class="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Available</span></td>
                          <td class="p-3">
                              <button onclick="allocateEngineer('eng-001')" class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs transition">Allocate</button>
                          </td>
                      </tr>
                      <tr class="border-b border-gray-700 hover:bg-gray-700/20">
                          <td class="p-3">
                              <div class="flex items-center space-x-3">
                                  <div class="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                      <span class="text-white font-bold text-sm">MR</span>
                                  </div>
                                  <div>
                                      <p class="font-medium text-white">Michael Rodriguez</p>
                                      <p class="text-gray-400 text-xs">Mechanical Engineer</p>
                                  </div>
                              </div>
                          </td>
                          <td class="p-3"><span class="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Mechanical</span></td>
                          <td class="p-3 text-gray-300">Detroit, MI</td>
                          <td class="p-3 text-green-400 font-semibold">$115/hr</td>
                          <td class="p-3"><span class="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Available</span></td>
                          <td class="p-3">
                              <button onclick="allocateEngineer('eng-002')" class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs transition">Allocate</button>
                          </td>
                      </tr>
                  </tbody>
              </table>
          </div>
      </div>
  </div>`;
}

function getEngineersPage() {
  return `<!-- ENGINEERS PAGE -->
  <div id="engineers-page" class="space-y-6 hidden">
      <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold">Engineers Management</h1>
          <button onclick="addNewEngineer()" class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition">
              + Add Engineer
          </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div class="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <h3 class="text-sm font-medium text-gray-400">Total Engineers</h3>
              <p class="text-2xl font-bold text-white">48</p>
          </div>
          <div class="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <h3 class="text-sm font-medium text-gray-400">Available</h3>
              <p class="text-2xl font-bold text-green-400">12</p>
          </div>
          <div class="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <h3 class="text-sm font-medium text-gray-400">Deployed</h3>
              <p class="text-2xl font-bold text-blue-400">36</p>
          </div>
          <div class="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <h3 class="text-sm font-medium text-gray-400">Utilization</h3>
              <p class="text-2xl font-bold text-purple-400">87%</p>
          </div>
      </div>
      
      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-semibold">Engineer Directory</h3>
              <div class="flex space-x-3">
                  <input type="text" placeholder="Search engineers..." class="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm" id="engineer-search">
                  <button onclick="searchEngineers()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition">🔍 Search</button>
                  <button onclick="loadAllEngineers()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm transition">Load All</button>
              </div>
          </div>
          <div id="engineers-directory" class="space-y-3">
              <div class="text-center py-8">
                  <span class="text-4xl">👨‍💻</span>
                  <p class="text-gray-400 mt-2">Click "Load All" to fetch engineer data</p>
              </div>
          </div>
      </div>
  </div>`;
}

function getTimeTrackingPage() {
  return `<!-- TIME TRACKING PAGE -->
  <div id="time-page" class="space-y-6 hidden">
      <div class="flex justify-between items-center">
          <div>
              <h1 class="text-3xl font-bold">Advanced Time Tracking</h1>
              <p class="text-gray-400 mt-1">Multi-layer trust verification with real-time notifications and geofencing</p>
          </div>
          <div class="flex space-x-3">
              <button onclick="clockIn()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition">
                  🕐 Clock In
              </button>
              <button onclick="clockOut()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition">
                  🕐 Clock Out
              </button>
          </div>
      </div>
      
      <!-- Time Tracking Tabs -->
      <div class="flex space-x-1 bg-gray-800 rounded-xl p-1">
          <button onclick="showTimeView('entries')" class="time-tab px-6 py-2 rounded-lg font-medium transition bg-blue-600 text-white">
              Time Entries
          </button>
          <button onclick="showTimeView('reconciliation')" class="time-tab px-6 py-2 rounded-lg font-medium transition text-gray-400 hover:text-white">
              Reconciliation
          </button>
          <button onclick="showTimeView('calendar')" class="time-tab px-6 py-2 rounded-lg font-medium transition text-gray-400 hover:text-white">
              Calendar
          </button>
      </div>
      
      <!-- Time Entries View -->
      <div id="time-entries-view" class="space-y-4">
          <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 class="text-lg font-semibold mb-4">Recent Time Entries</h3>
              <div class="space-y-3">
                  <div class="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-gray-500 transition cursor-pointer">
                      <div class="flex justify-between items-start">
                          <div>
                              <p class="font-semibold text-white">Sarah Johnson</p>
                              <p class="text-gray-400 text-sm">Senior Electrical Engineer • GM Assembly Line</p>
                              <p class="text-gray-300 text-sm mt-1">08:02 AM - 05:45 PM (9.72 hours)</p>
                          </div>
                          <div class="text-right">
                              <span class="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Verified</span>
                              <p class="text-gray-400 text-xs mt-1">Trust Score: 98%</p>
                          </div>
                      </div>
                      <div class="mt-3 flex space-x-4 text-xs">
                          <span class="text-blue-400">✓ Biometric</span>
                          <span class="text-green-400">✓ Geolocation</span>
                          <span class="text-purple-400">✓ Device Trust</span>
                      </div>
                  </div>
                  
                  <div class="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-gray-500 transition cursor-pointer">
                      <div class="flex justify-between items-start">
                          <div>
                              <p class="font-semibold text-white">Michael Chen</p>
                              <p class="text-gray-400 text-sm">Controls Engineer • Ford Rouge Plant</p>
                              <p class="text-gray-300 text-sm mt-1">07:58 AM - 04:30 PM (8.53 hours)</p>
                          </div>
                          <div class="text-right">
                              <span class="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Review</span>
                              <p class="text-gray-400 text-xs mt-1">Trust Score: 85%</p>
                          </div>
                      </div>
                      <div class="mt-3 flex space-x-4 text-xs">
                          <span class="text-blue-400">✓ Biometric</span>
                          <span class="text-red-400">✗ Geolocation</span>
                          <span class="text-green-400">✓ Device Trust</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      
      <!-- Reconciliation View (Hidden) -->
      <div id="time-reconciliation-view" class="space-y-4 hidden">
          <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 class="text-lg font-semibold mb-4">Timesheet Reconciliation</h3>
              <p class="text-gray-300">Automated reconciliation with configurable thresholds and manual review.</p>
          </div>
      </div>
      
      <!-- Calendar View (Hidden) -->
      <div id="time-calendar-view" class="space-y-4 hidden">
          <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 class="text-lg font-semibold mb-4">Time Tracking Calendar</h3>
              <p class="text-gray-300">Calendar view of all time entries with filtering and status tracking.</p>
          </div>
      </div>
  </div>`;
}

function getAnalyticsPage() {
  return `<!-- ANALYTICS PAGE -->
  <div id="analytics-page" class="space-y-6 hidden">
      <h1 class="text-3xl font-bold">Analytics Dashboard</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 class="text-sm font-medium text-gray-400">Revenue YTD</h3>
              <p class="text-2xl font-bold text-green-400">$2.4M</p>
              <p class="text-sm text-green-400 mt-1">+18.5% vs last year</p>
          </div>
          <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 class="text-sm font-medium text-gray-400">Billable Hours</h3>
              <p class="text-2xl font-bold text-blue-400">73%</p>
              <p class="text-sm text-blue-400 mt-1">+5.2% efficiency</p>
          </div>
          <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 class="text-sm font-medium text-gray-400">Client Satisfaction</h3>
              <p class="text-2xl font-bold text-purple-400">4.8/5</p>
              <p class="text-sm text-purple-400 mt-1">+0.3 improvement</p>
          </div>
          <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 class="text-sm font-medium text-gray-400">Project Success</h3>
              <p class="text-2xl font-bold text-orange-400">94%</p>
              <p class="text-sm text-orange-400 mt-1">On-time delivery</p>
          </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 class="text-lg font-semibold mb-4">Revenue Trends</h3>
              <div class="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                  <div class="text-center">
                      <span class="text-4xl">📈</span>
                      <p class="text-gray-400 mt-2">Interactive Chart</p>
                      <p class="text-sm text-gray-500">Revenue tracking over time</p>
                  </div>
              </div>
          </div>
          
          <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 class="text-lg font-semibold mb-4">Project Performance</h3>
              <div class="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                  <div class="text-center">
                      <span class="text-4xl">📊</span>
                      <p class="text-gray-400 mt-2">Performance Metrics</p>
                      <p class="text-sm text-gray-500">Project completion rates</p>
                  </div>
              </div>
          </div>
      </div>
  </div>`;
}
