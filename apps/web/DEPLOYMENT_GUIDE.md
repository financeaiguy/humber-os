# Humber OS Deployment Guide

## 🎯 **Deployment Strategy**

We have set up a **dual-branch deployment strategy** to ensure stability for demos while allowing safe development.

## 📋 **Branch Structure**

### 🟢 **Production Stable Branch**
- **Branch:** `production-stable`
- **Purpose:** Stable version for demos and presentations
- **Deployment:** `humber-nextjs-app` (existing working deployment)
- **URL:** https://e9adc50a.humber-nextjs-app.pages.dev
- **Status:** ✅ **WORKING** - Full React application with all features

### 🔵 **Development Updates Branch**
- **Branch:** `development-updates`
- **Purpose:** New features and updates
- **Deployment:** `humber-app-development` (new project)
- **URL:** https://humber-app-development.pages.dev
- **Status:** Ready for new deployments

## 🚀 **Deployment Commands**

### For Production Stable (Demo-Safe)
```bash
# Switch to stable branch
git checkout production-stable

# Build and deploy to stable environment
npm run build
wrangler pages deploy .next --project-name humber-nextjs-app --commit-dirty=true
```

### For Development Updates
```bash
# Switch to development branch
git checkout development-updates

# Build and deploy to development environment
npm run build
wrangler pages deploy .next --project-name humber-app-development --commit-dirty=true
```

## 🛡️ **Safety Protocol**

### Before Making Changes:
1. **Always work on `development-updates` branch**
2. **Test thoroughly on development deployment**
3. **Only merge to `production-stable` when ready for demos**

### For Demos:
- **Always use:** https://e9adc50a.humber-nextjs-app.pages.dev
- **This URL is guaranteed to work** with full React functionality

## 📊 **Current Working Features**

The production stable deployment includes:
- ✅ **Interactive Project Management** - Tesla, SpaceX, Ford projects
- ✅ **Bull Pen System** - Engineer allocation and management
- ✅ **Time Tracking** - Biometric authentication and geolocation
- ✅ **Recruiting Pipeline** - Complete candidate management
- ✅ **Client Management** - Customer relationship tools
- ✅ **Compliance Dashboard** - SOC2 security management
- ✅ **All 36 React Pages** - Fully interactive components

## 🔗 **Backend Integration**

Both deployments connect to:
- **Backend API:** https://humber-operations-worker-prod.evafiai.workers.dev
- **API Testing:** https://humber-operations-worker-prod.evafiai.workers.dev/api-test
- **Documentation:** https://humber-operations-worker-prod.evafiai.workers.dev/docs

## 📝 **Git Workflow**

### Making Updates:
```bash
# 1. Switch to development branch
git checkout development-updates

# 2. Make your changes
# ... edit files ...

# 3. Commit changes
git add .
git commit -m "Your update description"

# 4. Deploy to development for testing
npm run build
wrangler pages deploy .next --project-name humber-app-development --commit-dirty=true

# 5. Test at https://humber-app-development.pages.dev

# 6. When ready for production, merge to stable
git checkout production-stable
git merge development-updates
git push origin production-stable

# 7. Deploy to production
npm run build
wrangler pages deploy .next --project-name humber-nextjs-app --commit-dirty=true
```

## ⚠️ **Important Notes**

1. **Never deploy directly to production-stable** without testing on development first
2. **The working demo URL** (https://e9adc50a.humber-nextjs-app.pages.dev) should remain stable
3. **Always test new features** on the development deployment first
4. **Keep the production-stable branch clean** - only merge tested, working code

## 🎉 **Success Metrics**

The current deployment shows:
- ✅ **200 status codes** on all pages
- ✅ **Next.js headers** (`x-powered-by: Next.js`)
- ✅ **Edge runtime** (`x-edge-runtime: 1`)
- ✅ **Proper routing** (`x-matched-path`)
- ✅ **Interactive React components**

This setup ensures you always have a working demo while allowing safe development of new features!
