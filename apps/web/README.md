# 🎨 Humber Operations - Frontend Dashboard

**Next.js 14 dashboard for engineering staffing automation**

## 📋 Overview

The frontend dashboard provides a comprehensive interface for managing engineering talent, tracking deployments, and monitoring timesheet reconciliation in real-time.

## ✨ Features

### 🎯 **Dashboard Pages**
- **Bull Pen Dashboard** - Real-time engineer metrics across 5 categories
- **Project Management** - Track deployments and client engagements  
- **Time Tracking** - Interactive timesheet management with live tracking
- **Engineer Profiles** - Complete lifecycle management interface
- **Analytics** - Performance metrics and utilization reports

### 🎨 **UI/UX**
- **Responsive Design** - Mobile-first with Tailwind CSS
- **Dark Theme** - Professional dark mode interface
- **Animations** - Smooth Framer Motion transitions
- **Interactive Elements** - Real-time updates and live data
- **Accessibility** - WCAG compliant with screen reader support

## 🏗️ Technical Stack

- **Framework**: Next.js 14 with App Router
- **React**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4.0 with shadcn/ui components
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React icon library
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation

## 🚀 Getting Started

### **Development**
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### **Environment Variables**
```bash
# Copy example environment
cp .env.example .env.local

# Configure API endpoints
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_APP_ENV=development
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── bull-pen/          # Bull Pen Dashboard
│   ├── projects/          # Project Management
│   ├── time/              # Time Tracking
│   ├── analytics/         # Analytics Dashboard
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility functions
└── styles/               # Global styles
```

## 🎯 Key Components

### **Bull Pen Dashboard** (`/bull-pen`)
- **Engineer Categories**: 5 categories with real-time metrics
- **Status Tracking**: Available, Processing, Buffered, Deployed
- **Pipeline Metrics**: Recruitment to deployment analytics
- **Performance Tracking**: Pass/fail deployment metrics

### **Project Management** (`/projects`)
- **Active Projects**: Live project tracking with progress bars
- **Budget Monitoring**: Real-time budget vs. spent tracking
- **Engineer Assignments**: Visual engineer allocation
- **Timeline Management**: Project milestone tracking

### **Time Tracking** (`/time`)
- **Live Timer**: Real-time time tracking with project selection
- **Timesheet History**: Complete timesheet submission history
- **Status Tracking**: Draft, Submitted, Approved, Reconciling, Paid
- **Weekly Analytics**: Hours breakdown and utilization metrics

## 🎨 Design System

### **Color Palette**
```css
/* Primary Colors */
--blue-500: #3B82F6
--purple-500: #8B5CF6
--green-500: #10B981
--red-500: #EF4444
--yellow-500: #F59E0B

/* Background */
--slate-900: #0F172A
--slate-800: #1E293B
--slate-700: #334155
```

### **Component Library**
- **Cards**: Glassmorphism with backdrop blur
- **Buttons**: Gradient backgrounds with hover states  
- **Forms**: Floating labels with validation states
- **Tables**: Responsive with sorting and filtering
- **Charts**: Interactive visualizations with hover details

## 📊 Data Integration

### **API Integration**
```typescript
// TanStack Query for server state
const { data: engineers } = useQuery({
  queryKey: ['engineers'],
  queryFn: () => fetchEngineers()
})

// Real-time updates
const { data: metrics } = useQuery({
  queryKey: ['bull-pen-metrics'],
  queryFn: () => fetchBullPenMetrics(),
  refetchInterval: 30000 // 30 seconds
})
```

### **Mock Data**
- **Engineers**: Sample profiles across 5 categories
- **Projects**: Realistic project data with timelines
- **Timesheets**: Sample timesheet entries with various statuses
- **Metrics**: Dashboard KPIs and performance indicators

## 🔄 State Management

### **Server State** (TanStack Query)
- **Caching**: Intelligent caching with background updates
- **Synchronization**: Real-time data synchronization
- **Error Handling**: Automatic retry with exponential backoff
- **Optimistic Updates**: Immediate UI updates with rollback

### **Client State** (React useState/useReducer)
- **UI State**: Modal visibility, form states, filters
- **User Preferences**: Theme, layout preferences
- **Navigation**: Route state and breadcrumbs

## 🧪 Testing

### **Unit Tests**
```bash
# Run component tests
pnpm test

# Run with coverage
pnpm test:coverage
```

### **E2E Tests**
```bash
# Run Playwright tests
pnpm test:e2e

# Run specific test suite
pnpm test:e2e:bull-pen
```

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: 640px and below
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px and above
- **Large**: 1400px and above

### **Mobile Optimizations**
- **Touch Targets**: Minimum 44px touch targets
- **Navigation**: Mobile-optimized sidebar
- **Tables**: Horizontal scroll for complex data
- **Forms**: Single-column layouts on mobile

## ⚡ Performance

### **Metrics**
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Bundle Size**: < 300KB gzipped

### **Optimizations**
- **Code Splitting**: Route-based code splitting
- **Image Optimization**: Next.js Image component
- **Font Loading**: Self-hosted fonts with display swap
- **Lazy Loading**: Below-the-fold components

## 🔒 Security

### **Client-Side Security**
- **XSS Prevention**: Sanitized user inputs
- **CSRF Protection**: Secure API communication
- **Content Security Policy**: Strict CSP headers
- **Secure Storage**: Encrypted local storage for sensitive data

## 🚀 Deployment

### **Cloudflare Pages Deployment**
```bash
# Deploy to Cloudflare Pages
npx wrangler pages deploy .next --project-name=humber-operations-web

# Set environment variables in Cloudflare Pages dashboard
# Navigate to Pages → Your Project → Settings → Environment Variables
```

### **Build Optimization**
```bash
# Analyze bundle size
pnpm analyze

# Check for unused code
pnpm bundle-analyzer
```

## 📈 Analytics

### **User Analytics**
- **Page Views**: Track dashboard usage
- **User Interactions**: Button clicks, form submissions
- **Performance Metrics**: Core Web Vitals tracking
- **Error Tracking**: Client-side error monitoring

## 🤝 Contributing

1. Follow the established component patterns
2. Use TypeScript for all new components
3. Include unit tests for complex logic
4. Follow the design system guidelines
5. Test responsive behavior on all devices

---

**Part of the Humber Operations monorepo** 🚀