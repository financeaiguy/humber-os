'use client'

import { UserRole, WorkflowType, Tooltip, Walkthrough, TooltipConfig } from '@humber/types';

// Comprehensive tooltip definitions for different user roles
export const ROLE_BASED_TOOLTIPS: Record<UserRole, Tooltip[]> = {
  NEW_USER: [
    {
      id: 'welcome-dashboard',
      targetElement: '[data-tooltip="dashboard"]',
      type: 'FEATURE',
      placement: 'BOTTOM',
      title: '👋 Welcome to Humber Operations!',
      content: 'This is your main dashboard. Here you can see all your projects, revenue, and team performance at a glance. Think of it as your mission control center!',
      roles: ['NEW_USER'],
      trigger: 'AUTO',
      delay: 1000,
      hasAction: true,
      actionText: 'Start Tour',
      actionUrl: '/walkthrough/dashboard',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'navigation-help',
      targetElement: '[data-tooltip="navigation"]',
      type: 'HELP',
      placement: 'RIGHT',
      title: '🧭 Easy Navigation',
      content: 'Use this sidebar to jump between different sections. Each icon represents a different part of your work - like different rooms in your office!',
      roles: ['NEW_USER'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  
  ENGINEER: [
    {
      id: 'timesheet-simple',
      targetElement: '[data-tooltip="timesheet"]',
      type: 'PROCESS',
      placement: 'TOP',
      title: '⏰ Track Your Time (Super Easy!)',
      content: 'Just like clocking in at any job! Click here to record when you start and stop work. The system uses your fingerprint or face to make sure it\'s really you.',
      roles: ['ENGINEER'],
      workflows: ['TIMESHEET'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'biometric-explanation',
      targetElement: '[data-tooltip="biometric"]',
      type: 'FEATURE',
      placement: 'BOTTOM',
      title: '🔐 Why Fingerprint/Face Scan?',
      content: 'This is like having a super-secure ID card! It makes sure nobody else can clock in for you, protecting both you and the company. It\'s the same technology your phone uses.',
      roles: ['ENGINEER'],
      workflows: ['TIMESHEET'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'location-verification',
      targetElement: '[data-tooltip="location"]',
      type: 'PROCESS',
      placement: 'LEFT',
      title: '📍 Location Check (Automatic!)',
      content: 'The app automatically knows if you\'re at the right work site - just like GPS in your car! You don\'t need to do anything, it happens in the background.',
      roles: ['ENGINEER'],
      workflows: ['TIMESHEET'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  
  MANAGER: [
    {
      id: 'bull-pen-overview',
      targetElement: '[data-tooltip="bull-pen"]',
      type: 'FEATURE',
      placement: 'BOTTOM',
      title: '🎯 Bull Pen - Your Team Command Center',
      content: 'This shows all your engineers like a sports team roster. See who\'s available, who\'s working, and who\'s ready for new projects. Green = good to go!',
      roles: ['MANAGER'],
      workflows: ['DASHBOARD_TOUR'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'discrepancy-alerts',
      targetElement: '[data-tooltip="discrepancies"]',
      type: 'WARNING',
      placement: 'TOP',
      title: '⚠️ Time Discrepancies (Needs Your Attention)',
      content: 'When engineer hours don\'t match client hours, it shows up here. Think of it like balancing a checkbook - everything should add up!',
      roles: ['MANAGER'],
      workflows: ['TIMESHEET'],
      priority: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'approval-workflow',
      targetElement: '[data-tooltip="approve-timesheet"]',
      type: 'PROCESS',
      placement: 'RIGHT',
      title: '✅ Approve Timesheets (Simple Click)',
      content: 'Review and approve engineer timesheets here. It\'s like signing off on their work hours. Green button = approve, red button = needs review.',
      roles: ['MANAGER'],
      workflows: ['TIMESHEET'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  
  RECRUITER: [
    {
      id: 'candidate-pipeline',
      targetElement: '[data-tooltip="pipeline"]',
      type: 'PROCESS',
      placement: 'BOTTOM',
      title: '🏭 Candidate Pipeline (Like an Assembly Line)',
      content: 'This shows candidates moving through the hiring process. Each stage is like a checkpoint - from application to deployment. Watch them progress!',
      roles: ['RECRUITER'],
      workflows: ['RECRUITING'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'background-checks',
      targetElement: '[data-tooltip="background-check"]',
      type: 'COMPLIANCE',
      placement: 'TOP',
      title: '🔍 Background Checks (Required by Law)',
      content: 'All engineers need background checks before they can work. It\'s like getting a driver\'s license - required for safety and legal compliance.',
      roles: ['RECRUITER'],
      workflows: ['RECRUITING'],
      priority: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  
  ACCOUNTANT: [
    {
      id: 'financial-dashboard',
      targetElement: '[data-tooltip="revenue"]',
      type: 'FEATURE',
      placement: 'TOP',
      title: '💰 Financial Overview (Your Money Dashboard)',
      content: 'See all the money coming in and going out. Revenue (money earned), costs (money spent), and profit (what\'s left over). Like your bank account summary!',
      roles: ['ACCOUNTANT'],
      workflows: ['REPORTING'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'report-generation',
      targetElement: '[data-tooltip="generate-report"]',
      type: 'PROCESS',
      placement: 'BOTTOM',
      title: '📊 Generate Reports (One Click Magic)',
      content: 'Click here to create professional reports automatically. Choose what you want to see, and the system creates a beautiful PDF - like having a personal assistant!',
      roles: ['ACCOUNTANT'],
      workflows: ['REPORTING'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  
  ADMIN: [
    {
      id: 'system-health',
      targetElement: '[data-tooltip="health"]',
      type: 'FEATURE',
      placement: 'TOP',
      title: '🏥 System Health Monitor',
      content: 'This shows if all parts of the system are working properly. Green = everything good, yellow = needs attention, red = urgent issue.',
      roles: ['ADMIN'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'user-management',
      targetElement: '[data-tooltip="users"]',
      type: 'PROCESS',
      placement: 'RIGHT',
      title: '👥 Manage Users (Like HR for the System)',
      content: 'Add new users, change their permissions, or remove access. Each person gets different abilities based on their job role.',
      roles: ['ADMIN'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  
  CLIENT: [
    {
      id: 'client-dashboard',
      targetElement: '[data-tooltip="client-view"]',
      type: 'FEATURE',
      placement: 'BOTTOM',
      title: '👀 Your Project View',
      content: 'See your engineers, their progress, and time tracking. This is your window into the work being done for you.',
      roles: ['CLIENT'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  
  VIEWER: [
    {
      id: 'readonly-notice',
      targetElement: '[data-tooltip="readonly"]',
      type: 'HELP',
      placement: 'TOP',
      title: '👁️ View-Only Access',
      content: 'You can see everything but can\'t make changes. It\'s like being a visitor in a museum - look but don\'t touch!',
      roles: ['VIEWER'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};

// Workflow-based walkthroughs
export const WORKFLOW_WALKTHROUGHS: Record<WorkflowType, Walkthrough> = {
  ONBOARDING: {
    id: 'onboarding-tour',
    name: 'Welcome to Humber Operations',
    description: 'A gentle introduction to your new workspace',
    workflowType: 'ONBOARDING',
    targetRoles: ['NEW_USER'],
    estimatedDuration: 5,
    difficulty: 'BEGINNER',
    isRequired: true,
    steps: [
      {
        id: 'step-1',
        order: 1,
        targetElement: '[data-tour="dashboard"]',
        placement: 'BOTTOM',
        title: '🏠 Your Home Base',
        content: 'This is your dashboard - like the homepage of a website. Everything important is here: your projects, money earned, and team status.',
        action: 'CLICK',
        actionTarget: '[data-tour="dashboard"]',
        nextStepId: 'step-2'
      },
      {
        id: 'step-2',
        order: 2,
        targetElement: '[data-tour="navigation"]',
        placement: 'RIGHT',
        title: '🧭 Getting Around',
        content: 'These buttons on the left are like rooms in a building. Click them to go to different sections: Bull Pen (team), Projects (work), Knowledge (documents).',
        action: 'WAIT',
        autoAdvance: true,
        autoAdvanceDelay: 4000,
        nextStepId: 'step-3',
        previousStepId: 'step-1'
      },
      {
        id: 'step-3',
        order: 3,
        targetElement: '[data-tour="chat"]',
        placement: 'LEFT',
        title: '🤖 Your AI Assistant',
        content: 'This chat bubble is your smart helper! Ask it questions about anything - it knows all the company documents and can help you with your work.',
        action: 'CLICK',
        actionTarget: '[data-tour="chat"]',
        nextStepId: 'step-4',
        previousStepId: 'step-2'
      },
      {
        id: 'step-4',
        order: 4,
        targetElement: '[data-tour="profile"]',
        placement: 'BOTTOM',
        title: '👤 Your Profile',
        content: 'Click here to see your settings, change your notification preferences, or log out. It\'s like your personal account settings.',
        action: 'WAIT',
        autoAdvance: true,
        autoAdvanceDelay: 3000,
        previousStepId: 'step-3'
      }
    ],
    version: '1.0',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  TIMESHEET: {
    id: 'timesheet-walkthrough',
    name: 'Time Tracking Made Simple',
    description: 'Learn how to track your work hours easily',
    workflowType: 'TIMESHEET',
    targetRoles: ['ENGINEER', 'NEW_USER'],
    estimatedDuration: 3,
    difficulty: 'BEGINNER',
    steps: [
      {
        id: 'time-step-1',
        order: 1,
        targetElement: '[data-tour="clock-in"]',
        placement: 'TOP',
        title: '🕐 Clock In (Like Punching a Time Card)',
        content: 'Click this button when you start work. The app will ask for your fingerprint or face scan - just like unlocking your phone!',
        action: 'CLICK',
        actionTarget: '[data-tour="clock-in"]',
        nextStepId: 'time-step-2'
      },
      {
        id: 'time-step-2',
        order: 2,
        targetElement: '[data-tour="biometric"]',
        placement: 'BOTTOM',
        title: '🔐 Secure Verification (High-Tech Security)',
        content: 'Use your fingerprint or face scan. This makes sure it\'s really you clocking in - like a super-secure ID badge that can\'t be lost or stolen!',
        action: 'WAIT',
        autoAdvance: true,
        autoAdvanceDelay: 5000,
        nextStepId: 'time-step-3',
        previousStepId: 'time-step-1'
      },
      {
        id: 'time-step-3',
        order: 3,
        targetElement: '[data-tour="location"]',
        placement: 'LEFT',
        title: '📍 Location Check (Automatic GPS)',
        content: 'The app checks if you\'re at the right work location automatically - like GPS in your car. You don\'t need to do anything!',
        action: 'WAIT',
        autoAdvance: true,
        autoAdvanceDelay: 4000,
        nextStepId: 'time-step-4',
        previousStepId: 'time-step-2'
      },
      {
        id: 'time-step-4',
        order: 4,
        targetElement: '[data-tour="clock-out"]',
        placement: 'TOP',
        title: '🕐 Clock Out (End of Day)',
        content: 'When you\'re done working, click here to clock out. Same fingerprint/face scan process. Your hours are automatically calculated!',
        action: 'CLICK',
        actionTarget: '[data-tour="clock-out"]',
        previousStepId: 'time-step-3'
      }
    ],
    version: '1.0',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  RECRUITING: {
    id: 'recruiting-walkthrough',
    name: 'Hiring Process Guide',
    description: 'Step-by-step guide to hiring engineers',
    workflowType: 'RECRUITING',
    targetRoles: ['RECRUITER', 'MANAGER'],
    estimatedDuration: 7,
    difficulty: 'INTERMEDIATE',
    steps: [
      {
        id: 'recruit-step-1',
        order: 1,
        targetElement: '[data-tour="add-candidate"]',
        placement: 'BOTTOM',
        title: '👤 Add New Candidate (Like Adding a Contact)',
        content: 'Start here to add a new engineer candidate. Fill in their basic info - name, email, skills. Think of it like creating a contact in your phone.',
        action: 'CLICK',
        actionTarget: '[data-tour="add-candidate"]',
        nextStepId: 'recruit-step-2'
      },
      {
        id: 'recruit-step-2',
        order: 2,
        targetElement: '[data-tour="vetting"]',
        placement: 'RIGHT',
        title: '🔍 Vetting Process (Like an Interview)',
        content: 'Review the candidate\'s skills and experience. This is like a detailed interview process to make sure they\'re a good fit for the job.',
        action: 'WAIT',
        autoAdvance: true,
        autoAdvanceDelay: 6000,
        nextStepId: 'recruit-step-3',
        previousStepId: 'recruit-step-1'
      },
      {
        id: 'recruit-step-3',
        order: 3,
        targetElement: '[data-tour="background-check"]',
        placement: 'TOP',
        title: '🔍 Background Check (Safety First)',
        content: 'Run background checks and drug tests. This is required by law for safety-sensitive positions - like getting a driver\'s license.',
        action: 'CLICK',
        actionTarget: '[data-tour="background-check"]',
        nextStepId: 'recruit-step-4',
        previousStepId: 'recruit-step-2'
      },
      {
        id: 'recruit-step-4',
        order: 4,
        targetElement: '[data-tour="offer-letter"]',
        placement: 'BOTTOM',
        title: '📝 Send Offer Letter (Make It Official)',
        content: 'Send the official job offer. Like proposing marriage - this makes everything official and legal!',
        action: 'CLICK',
        actionTarget: '[data-tour="offer-letter"]',
        nextStepId: 'recruit-step-5',
        previousStepId: 'recruit-step-3'
      },
      {
        id: 'recruit-step-5',
        order: 5,
        targetElement: '[data-tour="deploy"]',
        placement: 'LEFT',
        title: '🚀 Deploy Engineer (Send to Work)',
        content: 'Assign the engineer to a client project. This is like sending them to their first day of work at the client site!',
        action: 'WAIT',
        autoAdvance: true,
        autoAdvanceDelay: 4000,
        previousStepId: 'recruit-step-4'
      }
    ],
    version: '1.0',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  REPORTING: {
    id: 'reporting-walkthrough',
    name: 'Generate Reports Like Magic',
    description: 'Create professional reports with one click',
    workflowType: 'REPORTING',
    targetRoles: ['ACCOUNTANT', 'MANAGER'],
    estimatedDuration: 4,
    difficulty: 'BEGINNER',
    steps: [
      {
        id: 'report-step-1',
        order: 1,
        targetElement: '[data-tour="reports"]',
        placement: 'BOTTOM',
        title: '📊 Reports Section (Your Data Kitchen)',
        content: 'This is where you cook up reports! Choose what data you want, and the system creates beautiful PDFs automatically.',
        action: 'CLICK',
        actionTarget: '[data-tour="reports"]',
        nextStepId: 'report-step-2'
      },
      {
        id: 'report-step-2',
        order: 2,
        targetElement: '[data-tour="report-type"]',
        placement: 'RIGHT',
        title: '📋 Choose Report Type (Pick Your Recipe)',
        content: 'Select what kind of report you want: Timesheet Summary (hours worked), Financial Summary (money stuff), or Performance Report (how well people are doing).',
        action: 'CLICK',
        actionTarget: '[data-tour="report-type"]',
        nextStepId: 'report-step-3',
        previousStepId: 'report-step-1'
      },
      {
        id: 'report-step-3',
        order: 3,
        targetElement: '[data-tour="date-range"]',
        placement: 'TOP',
        title: '📅 Pick Date Range (When to When)',
        content: 'Choose the time period for your report. Last week? Last month? Last quarter? Just pick the start and end dates.',
        action: 'TYPE',
        actionTarget: '[data-tour="date-range"]',
        nextStepId: 'report-step-4',
        previousStepId: 'report-step-2'
      },
      {
        id: 'report-step-4',
        order: 4,
        targetElement: '[data-tour="generate"]',
        placement: 'BOTTOM',
        title: '🚀 Generate Report (Magic Button)',
        content: 'Click this button and watch the magic happen! The system creates a professional PDF report and can even email it to you automatically.',
        action: 'CLICK',
        actionTarget: '[data-tour="generate"]',
        previousStepId: 'report-step-3'
      }
    ],
    version: '1.0',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  DASHBOARD_TOUR: {
    id: 'dashboard-walkthrough',
    name: 'Dashboard Tour for Everyone',
    description: 'Understand your dashboard like reading a newspaper',
    workflowType: 'DASHBOARD_TOUR',
    targetRoles: ['NEW_USER', 'MANAGER', 'ENGINEER'],
    estimatedDuration: 6,
    difficulty: 'BEGINNER',
    steps: [
      {
        id: 'dash-step-1',
        order: 1,
        targetElement: '[data-tour="metrics"]',
        placement: 'BOTTOM',
        title: '📈 Key Numbers (Your Scoreboard)',
        content: 'These big numbers show the most important stuff: how much money you\'re making, how many projects you have, and how busy everyone is.',
        action: 'WAIT',
        autoAdvance: true,
        autoAdvanceDelay: 5000,
        nextStepId: 'dash-step-2'
      },
      {
        id: 'dash-step-2',
        order: 2,
        targetElement: '[data-tour="charts"]',
        placement: 'TOP',
        title: '📊 Charts and Graphs (Visual Story)',
        content: 'These colorful charts tell the story of your business. Hover over any part to see exact numbers. Up and to the right = good!',
        action: 'HOVER',
        actionTarget: '[data-tour="charts"] .recharts-wrapper',
        nextStepId: 'dash-step-3',
        previousStepId: 'dash-step-1'
      },
      {
        id: 'dash-step-3',
        order: 3,
        targetElement: '[data-tour="recent-activity"]',
        placement: 'LEFT',
        title: '📋 Recent Activity (What\'s Happening Now)',
        content: 'See what\'s happening right now: new timesheets, engineer deployments, alerts. Like a news feed for your business.',
        action: 'SCROLL',
        actionTarget: '[data-tour="recent-activity"]',
        nextStepId: 'dash-step-4',
        previousStepId: 'dash-step-2'
      },
      {
        id: 'dash-step-4',
        order: 4,
        targetElement: '[data-tour="quick-actions"]',
        placement: 'TOP',
        title: '⚡ Quick Actions (Your Shortcuts)',
        content: 'These buttons let you do common tasks quickly: add new engineer, generate report, send notification. Like speed dial for your most used features.',
        action: 'WAIT',
        autoAdvance: true,
        autoAdvanceDelay: 4000,
        previousStepId: 'dash-step-3'
      }
    ],
    version: '1.0',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  DOCUMENT_UPLOAD: {
    id: 'document-upload-tour',
    name: 'Upload Documents to Knowledge Base',
    description: 'Learn how to add documents for AI chat assistance',
    workflowType: 'DOCUMENT_UPLOAD',
    targetRoles: ['MANAGER', 'ADMIN'],
    estimatedDuration: 3,
    difficulty: 'BEGINNER',
    steps: [
      {
        id: 'doc-step-1',
        order: 1,
        targetElement: '[data-tour="knowledge-base"]',
        placement: 'BOTTOM',
        title: '📚 Knowledge Base (Your Digital Library)',
        content: 'This is where you store all your important documents. The AI chat reads these to answer questions - like having a super-smart librarian!',
        action: 'CLICK',
        actionTarget: '[data-tour="knowledge-base"]',
        nextStepId: 'doc-step-2'
      },
      {
        id: 'doc-step-2',
        order: 2,
        targetElement: '[data-tour="upload-button"]',
        placement: 'RIGHT',
        title: '📤 Upload Documents (Drag and Drop Easy)',
        content: 'Click here or just drag files from your computer. The system accepts PDFs, Word docs, Excel files, and more. Like email attachments!',
        action: 'CLICK',
        actionTarget: '[data-tour="upload-button"]',
        nextStepId: 'doc-step-3',
        previousStepId: 'doc-step-1'
      },
      {
        id: 'doc-step-3',
        order: 3,
        targetElement: '[data-tour="chat-test"]',
        placement: 'LEFT',
        title: '🤖 Test AI Knowledge (Ask Questions)',
        content: 'After uploading, test the AI! Ask questions about your documents. It\'s like having a colleague who has read everything and remembers it perfectly.',
        action: 'TYPE',
        actionTarget: '[data-tour="chat-test"] input',
        actionValue: 'What are our safety protocols?',
        previousStepId: 'doc-step-2'
      }
    ],
    version: '1.0',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  CHAT_ASSISTANCE: {
    id: 'chat-assistance-tour',
    name: 'AI Chat Assistant Guide',
    description: 'Get the most out of your AI helper',
    workflowType: 'CHAT_ASSISTANCE',
    targetRoles: ['NEW_USER', 'ENGINEER', 'MANAGER'],
    estimatedDuration: 4,
    difficulty: 'BEGINNER',
    steps: [
      {
        id: 'chat-step-1',
        order: 1,
        targetElement: '[data-tour="chat-widget"]',
        placement: 'LEFT',
        title: '💬 Your AI Assistant (Like Siri for Work)',
        content: 'This chat bot knows everything about your company! Ask it questions, get help with tasks, or find information. It\'s available 24/7.',
        action: 'CLICK',
        actionTarget: '[data-tour="chat-widget"]',
        nextStepId: 'chat-step-2'
      },
      {
        id: 'chat-step-2',
        order: 2,
        targetElement: '[data-tour="chat-modes"]',
        placement: 'TOP',
        title: '🎛️ Chat Modes (Different Types of Help)',
        content: 'Switch between modes: Documents (ask about company files), Engineer (get specific person info), General (anything else). Like changing radio stations!',
        action: 'CLICK',
        actionTarget: '[data-tour="chat-modes"]',
        nextStepId: 'chat-step-3',
        previousStepId: 'chat-step-1'
      },
      {
        id: 'chat-step-3',
        order: 3,
        targetElement: '[data-tour="chat-input"]',
        placement: 'TOP',
        title: '⌨️ Ask Questions (Just Type Normally)',
        content: 'Type your questions in plain English! "How many hours did John work?" or "What are our safety rules?" - no special commands needed.',
        action: 'TYPE',
        actionTarget: '[data-tour="chat-input"]',
        actionValue: 'How do I submit my timesheet?',
        nextStepId: 'chat-step-4',
        previousStepId: 'chat-step-2'
      },
      {
        id: 'chat-step-4',
        order: 4,
        targetElement: '[data-tour="chat-history"]',
        placement: 'RIGHT',
        title: '📜 Chat History (Your Conversation Log)',
        content: 'All your conversations are saved here. Come back anytime to see previous answers - like a search history for your questions!',
        action: 'WAIT',
        autoAdvance: true,
        autoAdvanceDelay: 4000,
        previousStepId: 'chat-step-3'
      }
    ],
    version: '1.0',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  BILLING: {
    id: 'billing-walkthrough',
    name: 'Understanding Money Flow',
    description: 'See how money moves through the system',
    workflowType: 'BILLING',
    targetRoles: ['ACCOUNTANT', 'MANAGER'],
    estimatedDuration: 5,
    difficulty: 'INTERMEDIATE',
    steps: [
      {
        id: 'bill-step-1',
        order: 1,
        targetElement: '[data-tour="revenue-chart"]',
        placement: 'BOTTOM',
        title: '💰 Revenue Flow (Money Coming In)',
        content: 'This chart shows money coming in from clients. Each bar represents a month. Higher bars = more money earned. Green = good!',
        action: 'HOVER',
        actionTarget: '[data-tour="revenue-chart"] .recharts-bar',
        nextStepId: 'bill-step-2'
      },
      {
        id: 'bill-step-2',
        order: 2,
        targetElement: '[data-tour="costs"]',
        placement: 'TOP',
        title: '💸 Costs (Money Going Out)',
        content: 'These are your expenses: engineer salaries, benefits, overhead. Like your monthly bills - necessary but you want to keep them reasonable.',
        action: 'WAIT',
        autoAdvance: true,
        autoAdvanceDelay: 5000,
        nextStepId: 'bill-step-3',
        previousStepId: 'bill-step-1'
      },
      {
        id: 'bill-step-3',
        order: 3,
        targetElement: '[data-tour="profit"]',
        placement: 'RIGHT',
        title: '📈 Profit (What\'s Left Over)',
        content: 'Profit = Revenue - Costs. This is what you actually make after paying all the bills. The goal is to keep this growing!',
        action: 'WAIT',
        autoAdvance: true,
        autoAdvanceDelay: 4000,
        previousStepId: 'bill-step-2'
      }
    ],
    version: '1.0',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  COMPLIANCE: {
    id: 'compliance-walkthrough',
    name: 'Staying Legal and Safe',
    description: 'Understanding compliance requirements',
    workflowType: 'COMPLIANCE',
    targetRoles: ['ADMIN', 'MANAGER'],
    estimatedDuration: 6,
    difficulty: 'INTERMEDIATE',
    steps: [
      {
        id: 'comp-step-1',
        order: 1,
        targetElement: '[data-tour="audit-trail"]',
        placement: 'BOTTOM',
        title: '📋 Audit Trail (Digital Paper Trail)',
        content: 'Every action is recorded here - like a security camera for data. This helps with legal compliance and finding out what happened when.',
        action: 'CLICK',
        actionTarget: '[data-tour="audit-trail"]',
        nextStepId: 'comp-step-2'
      },
      {
        id: 'comp-step-2',
        order: 2,
        targetElement: '[data-tour="compliance-alerts"]',
        placement: 'TOP',
        title: '🚨 Compliance Alerts (Red Flags)',
        content: 'When something might be against the rules, it shows up here. Like a smoke detector - it warns you before there\'s a big problem.',
        action: 'WAIT',
        autoAdvance: true,
        autoAdvanceDelay: 5000,
        nextStepId: 'comp-step-3',
        previousStepId: 'comp-step-1'
      },
      {
        id: 'comp-step-3',
        order: 3,
        targetElement: '[data-tour="compliance-reports"]',
        placement: 'LEFT',
        title: '📄 Compliance Reports (Proof of Good Behavior)',
        content: 'Generate reports to show auditors that you\'re following all the rules. Like a report card that proves you\'re doing everything correctly.',
        action: 'CLICK',
        actionTarget: '[data-tour="compliance-reports"]',
        previousStepId: 'comp-step-2'
      }
    ],
    version: '1.0',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  DEPLOYMENT: {
    id: 'deployment-walkthrough',
    name: 'Deploying Engineers to Projects',
    description: 'How to assign engineers to client work',
    workflowType: 'DEPLOYMENT',
    targetRoles: ['MANAGER'],
    estimatedDuration: 4,
    difficulty: 'INTERMEDIATE',
    steps: [
      {
        id: 'deploy-step-1',
        order: 1,
        targetElement: '[data-tour="available-engineers"]',
        placement: 'RIGHT',
        title: '👥 Available Engineers (Your Team Bench)',
        content: 'See which engineers are ready for new projects. Green status = available, yellow = finishing current project, red = not available.',
        action: 'CLICK',
        actionTarget: '[data-tour="available-engineers"]',
        nextStepId: 'deploy-step-2'
      },
      {
        id: 'deploy-step-2',
        order: 2,
        targetElement: '[data-tour="client-projects"]',
        placement: 'BOTTOM',
        title: '🏢 Client Projects (Available Jobs)',
        content: 'These are projects that need engineers. Each one shows what skills are needed, timeline, and pay rate. Like job postings!',
        action: 'CLICK',
        actionTarget: '[data-tour="client-projects"]',
        nextStepId: 'deploy-step-3',
        previousStepId: 'deploy-step-1'
      },
      {
        id: 'deploy-step-3',
        order: 3,
        targetElement: '[data-tour="match-engineer"]',
        placement: 'TOP',
        title: '🎯 Match Engineer to Project (Perfect Fit)',
        content: 'The system suggests the best engineer for each project based on skills, location, and availability. Like a dating app for work!',
        action: 'CLICK',
        actionTarget: '[data-tour="match-engineer"]',
        nextStepId: 'deploy-step-4',
        previousStepId: 'deploy-step-2'
      },
      {
        id: 'deploy-step-4',
        order: 4,
        targetElement: '[data-tour="deploy-confirm"]',
        placement: 'BOTTOM',
        title: '✅ Confirm Deployment (Make It Official)',
        content: 'Review the match and click confirm. The engineer gets notified, the client gets updated, and billing starts automatically!',
        action: 'CLICK',
        actionTarget: '[data-tour="deploy-confirm"]',
        previousStepId: 'deploy-step-3'
      }
    ],
    version: '1.0',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

// Simple explanations for complex concepts
export const SIMPLE_EXPLANATIONS = {
  'biometric-authentication': {
    title: '🔐 Biometric Authentication',
    simple: 'Using your fingerprint or face to prove it\'s you',
    detailed: 'Instead of passwords that can be forgotten or stolen, you use your unique fingerprint or face. It\'s like having a key that only you have and can never be copied.',
    analogy: 'Like unlocking your phone with your fingerprint - but for work!'
  },
  
  'geolocation-verification': {
    title: '📍 Location Verification',
    simple: 'Making sure you\'re at the right work place',
    detailed: 'The app uses GPS (like Google Maps) to check if you\'re at the correct work site. This prevents time theft and ensures accurate billing.',
    analogy: 'Like a GPS that says "You have arrived at your destination" - but for work locations!'
  },
  
  'rag-knowledge-base': {
    title: '🧠 RAG Knowledge Base',
    simple: 'AI that reads your documents and answers questions',
    detailed: 'RAG means Retrieval-Augmented Generation. The AI reads all your company documents and can answer questions about them instantly.',
    analogy: 'Like having a super-smart colleague who has read every company document and has perfect memory!'
  },
  
  'multi-tenant-architecture': {
    title: '🏢 Multi-Tenant System',
    simple: 'Multiple companies using the same system safely',
    detailed: 'Each company gets their own private space in the system. It\'s like having separate apartments in the same building - everyone shares the utilities but has their own private space.',
    analogy: 'Like Gmail - millions of people use it, but you only see your own emails!'
  },
  
  'time-reconciliation': {
    title: '⚖️ Time Reconciliation',
    simple: 'Making sure engineer hours match client hours',
    detailed: 'Compare the hours engineers report with the hours clients confirm. When they don\'t match, investigate and resolve the difference.',
    analogy: 'Like balancing your checkbook - making sure what you think you spent matches what the bank says!'
  }
};

// Contextual help based on current page and user action
export const CONTEXTUAL_HELP = {
  '/': {
    'NEW_USER': 'This is your main dashboard. Think of it like the home screen on your phone - everything important is here!',
    'ENGINEER': 'Your personal work summary. See your hours, current projects, and upcoming deadlines.',
    'MANAGER': 'Team overview and key metrics. Monitor your engineers, projects, and financial performance.',
    'ACCOUNTANT': 'Financial dashboard with revenue, costs, and profitability metrics.'
  },
  
  '/bull-pen': {
    'NEW_USER': 'The Bull Pen shows all engineers like a sports team roster. See who\'s playing, who\'s on the bench, and who\'s ready to go in!',
    'MANAGER': 'Your team management center. Deploy engineers, track performance, and monitor utilization rates.',
    'RECRUITER': 'See available talent and deployment opportunities. Match engineers to client needs.'
  },
  
  '/knowledge': {
    'NEW_USER': 'This is your digital library. Upload documents here and the AI will read them to answer questions later!',
    'MANAGER': 'Upload SOPs, safety protocols, and project documents. The AI chat will use these to help your team.',
    'ADMIN': 'Manage the knowledge base. Upload, organize, and maintain company documents for AI assistance.'
  },
  
  '/projects': {
    'NEW_USER': 'See all the work projects. Each project is like a job assignment with deadlines, requirements, and team members.',
    'ENGINEER': 'Your current and upcoming work assignments. Check deadlines, requirements, and project details.',
    'MANAGER': 'Project portfolio management. Track progress, allocate resources, and monitor deliverables.'
  }
};

// Feature complexity levels with explanations
export const FEATURE_COMPLEXITY = {
  BEGINNER: {
    features: ['dashboard', 'timesheet', 'chat', 'basic-reports'],
    description: 'Essential features everyone needs to know',
    timeToLearn: '30 minutes'
  },

  INTERMEDIATE: {
    features: ['bull-pen', 'recruiting', 'document-upload', 'advanced-reports'],
    description: 'Management and administrative features',
    timeToLearn: '2 hours'
  },

  ADVANCED: {
    features: ['system-admin', 'compliance', 'integrations', 'custom-workflows'],
    description: 'Administrative and technical features',
    timeToLearn: '1 day'
  }
};

// Simple page guides for first-time visitors (9th grade level)
export const SIMPLE_PAGE_GUIDES = {
  '/': {
    title: 'Welcome to Your Dashboard! 🏠',
    steps: [
      {
        selector: '[data-tour="metrics"]',
        title: 'Your Business Numbers',
        description: 'These big numbers show how your business is doing. Think of them like the score in a game - higher is usually better!'
      },
      {
        selector: '[data-tour="charts"]',
        title: 'Visual Stories',
        description: 'These colorful charts show trends over time. Hover over any part to see exact numbers. Lines going up = good news!'
      },
      {
        selector: '[data-tour="quick-actions"]',
        title: 'Quick Actions',
        description: 'These buttons are like shortcuts on your phone. Click them to do common tasks quickly without searching around.'
      }
    ]
  },

  '/analytics': {
    title: 'Analytics - Your Business Intelligence 📊',
    steps: [
      {
        selector: '[data-tour="nervous-system"]',
        title: 'AI Brain Status',
        description: 'This shows if your AI assistant is working properly. Green dots = everything is good to go!'
      },
      {
        selector: '[data-tour="ai-models"]',
        title: 'AI Models',
        description: 'These are different AI helpers, like having multiple smart assistants. Each one is good at different things.'
      },
      {
        selector: '[data-tour="performance-metrics"]',
        title: 'Performance Numbers',
        description: 'These numbers show how well your AI and business are performing. Like a report card for your company!'
      }
    ]
  },

  '/bull-pen': {
    title: 'Bull Pen - Your Team Roster 👥',
    steps: [
      {
        selector: '[data-tour="engineer-list"]',
        title: 'Your Engineers',
        description: 'This shows all your engineers like a sports team roster. You can see who\'s available and who\'s working on projects.'
      },
      {
        selector: '[data-tour="availability"]',
        title: 'Availability Status',
        description: 'Green = ready to work, Yellow = busy but available, Red = unavailable. Like traffic lights for your team!'
      },
      {
        selector: '[data-tour="deploy-button"]',
        title: 'Deploy Engineers',
        description: 'Click this to assign engineers to new projects. It\'s like putting players in the game!'
      }
    ]
  },

  '/recruits': {
    title: 'Recruiting - Finding New Team Members 🔍',
    steps: [
      {
        selector: '[data-tour="recruit-list"]',
        title: 'Potential Recruits',
        description: 'These are people who might join your team. Think of it like looking at job applications.'
      },
      {
        selector: '[data-tour="filters"]',
        title: 'Search Filters',
        description: 'Use these to find specific types of engineers. Like using filters when shopping online!'
      },
      {
        selector: '[data-tour="add-recruit"]',
        title: 'Add New Recruit',
        description: 'Click here to add someone new who wants to join your team. Start their journey here!'
      }
    ]
  },

  '/time': {
    title: 'Time Tracking - Clock In & Out ⏰',
    steps: [
      {
        selector: '[data-tour="clock-in"]',
        title: 'Clock In/Out',
        description: 'Just like punching a time clock! Click here when you start and stop work. The system keeps track automatically.'
      },
      {
        selector: '[data-tour="biometric"]',
        title: 'Fingerprint/Face Scan',
        description: 'This makes sure it\'s really you clocking in. Same technology as unlocking your phone - super secure!'
      },
      {
        selector: '[data-tour="timesheet"]',
        title: 'Your Timesheet',
        description: 'See all your work hours here. Like a diary of when you worked and for how long.'
      }
    ]
  },

  '/projects': {
    title: 'Projects - Your Work Assignments 📋',
    steps: [
      {
        selector: '[data-tour="project-list"]',
        title: 'Current Projects',
        description: 'These are all your work assignments. Each box is like a different job you need to complete.'
      },
      {
        selector: '[data-tour="project-status"]',
        title: 'Project Status',
        description: 'Colors show how projects are doing: Green = on track, Yellow = needs attention, Red = behind schedule.'
      },
      {
        selector: '[data-tour="new-project"]',
        title: 'Create New Project',
        description: 'Click here to start a new work assignment. Like creating a new to-do list for your team.'
      }
    ]
  },

  '/knowledge': {
    title: 'Knowledge Base - Your Digital Library 📚',
    steps: [
      {
        selector: '[data-tour="upload-docs"]',
        title: 'Upload Documents',
        description: 'Drag and drop files here. The AI will read them and remember everything so you can ask questions later!'
      },
      {
        selector: '[data-tour="document-list"]',
        title: 'Your Documents',
        description: 'All your uploaded files are here. Click on any document to read it or ask the AI questions about it.'
      },
      {
        selector: '[data-tour="ai-chat"]',
        title: 'AI Assistant',
        description: 'Ask questions about your documents here. The AI has read everything and can help you find answers quickly!'
      }
    ]
  }
};
