# 🎭 Demo Accounts - Role-Based Access Testing

## 🔑 **Available Demo Accounts**

### **System Admin** 
- **Email:** `admin@humber.com`
- **Password:** `admin123`
- **Access Level:** Full system access
- **Capabilities:**
  - ✅ Complete system administration
  - ✅ User management and permissions
  - ✅ All analytics and reporting
  - ✅ Bull pen management
  - ✅ Time tracking oversight
  - ✅ Recruiting system access
  - ✅ Financial analytics
  - ✅ Security and compliance monitoring

### **Engineer Manager**
- **Email:** `engineer@humber.com`
- **Password:** `engineer123`
- **Access Level:** Engineering management
- **Capabilities:**
  - ✅ Team management and oversight
  - ✅ Time entry approval and rejection
  - ✅ Bull pen engineer assignment
  - ✅ Performance analytics
  - ✅ Project coordination
  - ✅ Technical documentation access
  - ✅ Calendar management for team
  - ❌ Financial data (restricted)

### **Operations Manager**
- **Email:** `operator@humber.com`
- **Password:** `operator123`
- **Access Level:** Operations control
- **Capabilities:**
  - ✅ Project management and assignment
  - ✅ Compliance monitoring
  - ✅ Dispute resolution
  - ✅ Operational analytics
  - ✅ Resource allocation
  - ✅ Time tracking oversight
  - ✅ Client coordination
  - ❌ User management (restricted)

### **Customer (GM)**
- **Email:** `customer@gm.com`
- **Password:** `customer123`
- **Access Level:** Client portal access
- **Capabilities:**
  - ✅ View assigned engineers
  - ✅ Approve/reject timesheets
  - ✅ Project status monitoring
  - ✅ Performance reporting
  - ✅ Communication with engineers
  - ✅ Billing and invoice review
  - ❌ Internal operations (restricted)
  - ❌ Other client data (restricted)

### **Partner (Ford)**
- **Email:** `partner@ford.com`
- **Password:** `partner123`
- **Access Level:** Strategic management
- **Capabilities:**
  - ✅ Strategic planning and oversight
  - ✅ Client relationship management
  - ✅ Business analytics and reporting
  - ✅ Resource allocation decisions
  - ✅ Financial performance monitoring
  - ✅ Partnership coordination
  - ✅ High-level system access
  - ❌ Day-to-day operations (delegated)

### **Employee (Self-Service)**
- **Email:** `employee@humber.com`
- **Password:** `employee123`
- **Access Level:** Personal portal
- **Capabilities:**
  - ✅ Personal time tracking
  - ✅ Clock in/out functionality
  - ✅ Personal calendar and schedule
  - ✅ Time entry history
  - ✅ Personal data export
  - ✅ Basic system notifications
  - ❌ Team data (restricted)
  - ❌ Administrative functions (restricted)

---

## 🎯 **Role Testing Guide**

### **How to Test Different Roles:**

1. **Go to Login Page:** Visit `/auth/signin`
2. **Click Demo Account:** Click any demo account button to auto-login
3. **Explore Capabilities:** Navigate through the system to see role-specific features
4. **Test Permissions:** Try accessing different sections to see restrictions
5. **Switch Roles:** Logout and login with different demo account

### **What Each Role Can Access:**

#### **Navigation Access by Role:**
| Feature | System Admin | Engineer | Operator | Customer | Partner | Employee |
|---------|--------------|----------|----------|----------|---------|----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Analytics | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Bull Pen | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Time Tracking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Recruiting | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Onboarding | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Projects | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Settings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

#### **Calendar Permissions by Role:**
| Calendar Feature | System Admin | Engineer | Operator | Customer | Partner | Employee |
|------------------|--------------|----------|----------|----------|---------|----------|
| View Own Calendar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Team Calendar | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit Own Entries | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit Team Entries | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Approve Entries | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Manage Projects | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| Client Relations | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |

---

## 🧪 **Testing Scenarios**

### **Scenario 1: Employee Experience**
1. Login as `employee@humber.com`
2. Navigate to Time Tracking
3. Test clock in/out functionality
4. View personal calendar
5. Try to access restricted areas (should be blocked)

### **Scenario 2: Engineer Management**
1. Login as `engineer@humber.com`
2. Access Bull Pen dashboard
3. Manage engineer assignments
4. Approve time entries
5. View team calendar and analytics

### **Scenario 3: Operations Control**
1. Login as `operator@humber.com`
2. Manage projects and assignments
3. Monitor compliance and disputes
4. Coordinate resources
5. Generate operational reports

### **Scenario 4: Customer Portal**
1. Login as `customer@gm.com`
2. View assigned engineers
3. Review and approve timesheets
4. Monitor project progress
5. Access billing information

### **Scenario 5: Partner Management**
1. Login as `partner@ford.com`
2. Strategic planning dashboard
3. Business analytics and KPIs
4. Client relationship management
5. Financial performance monitoring

### **Scenario 6: System Administration**
1. Login as `admin@humber.com`
2. Full system overview
3. User management
4. Security monitoring
5. Complete system configuration

---

## 🔐 **Security Features Testing**

### **Authentication Testing:**
- ✅ **Role-based redirects** after login
- ✅ **Permission validation** on each page
- ✅ **Secure logout** with session cleanup
- ✅ **Route protection** for unauthorized access

### **Calendar Security Testing:**
- ✅ **Role-based editing** permissions
- ✅ **Data isolation** between roles
- ✅ **Read-only modes** for restricted users
- ✅ **Audit logging** for all calendar actions

---

## 🚀 **Quick Access**

**Login Page:** `/auth/signin`  
**Signup Page:** `/auth/signup`  
**System Dashboard:** `/` (after login)  
**Time Tracking:** `/time` (role-specific features)  
**Calendar View:** `/time` → Calendar tab

**All demo accounts use simple passwords for testing:**
- System Admin: `admin123`
- Engineer: `engineer123` 
- Operator: `operator123`
- Customer: `customer123`
- Partner: `partner123`
- Employee: `employee123`

Test the complete role-based system with one-click demo account access! 🎯
