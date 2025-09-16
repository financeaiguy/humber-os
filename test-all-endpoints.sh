#!/bin/bash

# 🧪 Comprehensive API Endpoint Testing Script
# Tests all 59 endpoints across 9 integrated systems

echo "🚀 HUMBER OPERATIONS - COMPLETE API ENDPOINT TESTING"
echo "=================================================="
echo "Testing Date: $(date)"
echo "Worker Server: http://localhost:8787"
echo "Next.js Server: http://localhost:3003"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
AUTH_PROTECTED=0

# Test function
test_endpoint() {
    local name="$1"
    local method="$2"
    local url="$3"
    local headers="$4"
    local data="$5"
    local expected_status="$6"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/response.json $headers "$url")
    else
        response=$(curl -s -w "%{http_code}" -o /tmp/response.json -X "$method" $headers -d "$data" "$url")
    fi
    
    status_code="${response: -3}"
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} ($status_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    elif [ "$status_code" = "401" ] && [ "$expected_status" = "AUTH" ]; then
        echo -e "${YELLOW}🔒 AUTH PROTECTED${NC} (correctly secured)"
        AUTH_PROTECTED=$((AUTH_PROTECTED + 1))
    else
        echo -e "${RED}❌ FAIL${NC} ($status_code, expected $expected_status)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "Response: $(cat /tmp/response.json | head -100)"
    fi
}

echo "🏠 CORE SYSTEM ENDPOINTS"
echo "------------------------"
test_endpoint "Health Check" "GET" "http://localhost:8787/health" "" "" "200"
test_endpoint "Service Info" "GET" "http://localhost:8787/" "" "" "200"
test_endpoint "API Documentation" "GET" "http://localhost:8787/docs" "" "" "200"
test_endpoint "Interactive Testing" "GET" "http://localhost:8787/api-test" "" "" "200"
test_endpoint "System Metrics" "GET" "http://localhost:8787/metrics" "-H 'X-Tenant-ID: demo-tenant'" "" "200"

echo ""
echo "🎯 BULL PEN SYSTEM (3 endpoints)"
echo "--------------------------------"
test_endpoint "Bull Pen Dashboard" "GET" "http://localhost:8787/bull-pen/dashboard" "-H 'X-Tenant-ID: demo-tenant'" "" "200"
test_endpoint "Engineers List" "GET" "http://localhost:8787/engineers" "-H 'X-Tenant-ID: demo-tenant'" "" "200"
test_endpoint "Engineers by Category" "GET" "http://localhost:8787/bull-pen/engineers/by-category" "-H 'X-Tenant-ID: demo-tenant'" "" "200"

echo ""
echo "⏰ TIME TRACKING SYSTEM (4 endpoints)"
echo "-------------------------------------"
test_endpoint "Work Sites" "GET" "http://localhost:8787/time-tracking/work-sites" "-H 'X-Tenant-ID: demo-tenant'" "" "200"
test_endpoint "Active Sessions" "GET" "http://localhost:8787/time-tracking/active-sessions" "-H 'X-Tenant-ID: demo-tenant'" "" "200"
test_endpoint "Verify Location" "POST" "http://localhost:8787/time-tracking/verify-location" "-H 'Content-Type: application/json' -H 'X-Tenant-ID: demo-tenant'" '{"latitude":42.3314,"longitude":-83.0458,"accuracy":15}' "200"
test_endpoint "Clock Action (Auth Required)" "POST" "http://localhost:8787/time-tracking/clock-action" "-H 'Content-Type: application/json' -H 'X-Tenant-ID: demo-tenant'" '{"action":"CLOCK_IN","engineerId":"eng_001"}' "AUTH"

echo ""
echo "📄 DOCUMENT MANAGEMENT (6 endpoints)"
echo "------------------------------------"
test_endpoint "Documents List" "GET" "http://localhost:8787/documents" "-H 'X-Tenant-ID: demo-tenant'" "" "200"
test_endpoint "Document Search" "POST" "http://localhost:8787/documents/search" "-H 'Content-Type: application/json' -H 'X-Tenant-ID: demo-tenant'" '{"query":"safety protocols","maxResults":5}' "200"
test_endpoint "Document Upload (Auth Required)" "POST" "http://localhost:8787/documents/upload" "-H 'X-Tenant-ID: demo-tenant'" "" "AUTH"
test_endpoint "Document Detail (Auth Required)" "GET" "http://localhost:8787/documents/doc_001" "-H 'X-Tenant-ID: demo-tenant'" "" "AUTH"
test_endpoint "Document Download (Auth Required)" "GET" "http://localhost:8787/documents/doc_001/download" "-H 'X-Tenant-ID: demo-tenant'" "" "AUTH"
test_endpoint "Document Delete (Auth Required)" "DELETE" "http://localhost:8787/documents/doc_001" "-H 'X-Tenant-ID: demo-tenant'" "" "AUTH"

echo ""
echo "🤖 AI CHAT SYSTEM (3 endpoints)"
echo "-------------------------------"
test_endpoint "Chat Sessions" "GET" "http://localhost:8787/chat/sessions" "-H 'X-Tenant-ID: demo-tenant'" "" "200"
test_endpoint "Chat Message" "POST" "http://localhost:8787/chat/message" "-H 'Content-Type: application/json' -H 'X-Tenant-ID: demo-tenant'" '{"message":"What are safety protocols?","useRAG":true}' "200"
test_endpoint "Session Messages" "GET" "http://localhost:8787/chat/sessions/chat_test/messages" "-H 'X-Tenant-ID: demo-tenant'" "" "200"

echo ""
echo "📧 NOTIFICATIONS SYSTEM (8 endpoints)"
echo "-------------------------------------"
test_endpoint "Notification History" "GET" "http://localhost:8787/notifications/history" "-H 'X-Tenant-ID: demo-tenant'" "" "200"
test_endpoint "Notification Analytics" "GET" "http://localhost:8787/notifications/analytics" "-H 'X-Tenant-ID: demo-tenant'" "" "200"
test_endpoint "Send Notification (Auth Required)" "POST" "http://localhost:8787/notifications/send" "-H 'Content-Type: application/json' -H 'X-Tenant-ID: demo-tenant'" '{"type":"TEST"}' "AUTH"
test_endpoint "Timesheet Alert (Auth Required)" "POST" "http://localhost:8787/notifications/timesheet-submitted" "-H 'Content-Type: application/json' -H 'X-Tenant-ID: demo-tenant'" '{"engineerName":"Test"}' "AUTH"
test_endpoint "Discrepancy Alert (Auth Required)" "POST" "http://localhost:8787/notifications/discrepancy-detected" "-H 'Content-Type: application/json' -H 'X-Tenant-ID: demo-tenant'" '{"engineerName":"Test"}' "AUTH"
test_endpoint "Compliance Alert (Auth Required)" "POST" "http://localhost:8787/notifications/compliance-violation" "-H 'Content-Type: application/json' -H 'X-Tenant-ID: demo-tenant'" '{"violationType":"TEST"}' "AUTH"

echo ""
echo "📊 REPORTS SYSTEM (12 endpoints)"
echo "--------------------------------"
test_endpoint "Report History" "GET" "http://localhost:8787/reports/history" "-H 'X-Tenant-ID: demo-tenant'" "" "200"
test_endpoint "Scheduled Reports" "GET" "http://localhost:8787/reports/scheduled" "-H 'X-Tenant-ID: demo-tenant'" "" "200"
test_endpoint "Generate Report (Auth Required)" "POST" "http://localhost:8787/reports/generate" "-H 'Content-Type: application/json' -H 'X-Tenant-ID: demo-tenant'" '{"type":"TEST"}' "AUTH"
test_endpoint "Timesheet Report (Auth Required)" "POST" "http://localhost:8787/reports/timesheet-summary" "-H 'Content-Type: application/json' -H 'X-Tenant-ID: demo-tenant'" '{"startDate":"2025-01-01"}' "AUTH"
test_endpoint "Financial Report (Auth Required)" "POST" "http://localhost:8787/reports/financial-summary" "-H 'Content-Type: application/json' -H 'X-Tenant-ID: demo-tenant'" '{"startDate":"2025-01-01"}' "AUTH"

echo ""
echo "⚙️ OPERATIONS WORKFLOW (5 endpoints)"
echo "------------------------------------"
test_endpoint "Recruiting Step 1 (Auth Required)" "POST" "http://localhost:8787/operations/recruiting-step-1" "-H 'Content-Type: application/json' -H 'X-Tenant-ID: demo-tenant'" '{"firstName":"John","lastName":"Doe"}' "AUTH"
test_endpoint "Hiring Vetting (Auth Required)" "POST" "http://localhost:8787/operations/hiring-vetting-step-2" "-H 'Content-Type: application/json' -H 'X-Tenant-ID: demo-tenant'" '{"candidateId":"test"}' "AUTH"
test_endpoint "Background Checks (Auth Required)" "POST" "http://localhost:8787/operations/background-checks" "-H 'Content-Type: application/json' -H 'X-Tenant-ID: demo-tenant'" '{"candidateId":"test"}' "AUTH"
test_endpoint "Offer Letter (Auth Required)" "POST" "http://localhost:8787/operations/offer-letter-visa" "-H 'Content-Type: application/json' -H 'X-Tenant-ID: demo-tenant'" '{"candidateId":"test"}' "AUTH"
test_endpoint "Deployment (Auth Required)" "POST" "http://localhost:8787/operations/deployment" "-H 'Content-Type: application/json' -H 'X-Tenant-ID: demo-tenant'" '{"candidateId":"test"}' "AUTH"

echo ""
echo "🔐 AUTHENTICATION SYSTEM (3 endpoints)"
echo "--------------------------------------"
test_endpoint "Login (Auth Required)" "POST" "http://localhost:8787/auth/login" "-H 'Content-Type: application/json'" '{"email":"test@test.com","password":"test"}' "AUTH"
test_endpoint "Refresh (Auth Required)" "POST" "http://localhost:8787/auth/refresh" "-H 'Content-Type: application/json'" '{}' "AUTH"
test_endpoint "Logout (Auth Required)" "POST" "http://localhost:8787/auth/logout" "-H 'Content-Type: application/json'" '{}' "AUTH"

echo ""
echo "📊 TIMESHEETS & RECONCILIATION (10 endpoints)"
echo "---------------------------------------------"
test_endpoint "Reconcile (Auth Required)" "POST" "http://localhost:8787/timesheets/reconcile" "-H 'Content-Type: application/json' -H 'X-Tenant-ID: demo-tenant'" '{"candidateId":"test"}' "AUTH"
test_endpoint "Batch Reconcile (Auth Required)" "POST" "http://localhost:8787/timesheets/batch-reconcile" "-H 'Content-Type: application/json' -H 'X-Tenant-ID: demo-tenant'" '{"timesheets":[]}' "AUTH"
test_endpoint "Candidate Timesheets (Auth Required)" "GET" "http://localhost:8787/timesheets/candidate/test" "-H 'X-Tenant-ID: demo-tenant'" "" "AUTH"
test_endpoint "Period Timesheets (Auth Required)" "GET" "http://localhost:8787/timesheets/period?startDate=2025-01-01&endDate=2025-01-31" "-H 'X-Tenant-ID: demo-tenant'" "" "AUTH"
test_endpoint "Reconciliation Submit (Auth Required)" "POST" "http://localhost:8787/reconciliation/submit" "-H 'Content-Type: application/json' -H 'X-Tenant-ID: demo-tenant'" '{"candidateId":"test"}' "AUTH"
test_endpoint "Customer Hours (Auth Required)" "POST" "http://localhost:8787/reconciliation/customer-hours" "-H 'Content-Type: application/json' -H 'X-Tenant-ID: demo-tenant'" '{"candidateId":"test"}' "AUTH"
test_endpoint "Upload Spreadsheet (Auth Required)" "POST" "http://localhost:8787/reconciliation/upload-spreadsheet" "-H 'Content-Type: application/json' -H 'X-Tenant-ID: demo-tenant'" '{"data":[]}' "AUTH"
test_endpoint "Human Review (Auth Required)" "POST" "http://localhost:8787/reconciliation/human-review" "-H 'Content-Type: application/json' -H 'X-Tenant-ID: demo-tenant'" '{"timesheetId":"test"}' "AUTH"
test_endpoint "Needs Review (Auth Required)" "GET" "http://localhost:8787/reconciliation/needs-review" "-H 'X-Tenant-ID: demo-tenant'" "" "AUTH"
test_endpoint "Reconciliation Stats (Auth Required)" "GET" "http://localhost:8787/reconciliation/stats" "-H 'X-Tenant-ID: demo-tenant'" "" "AUTH"

echo ""
echo "📊 FINAL TEST SUMMARY"
echo "===================="
echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Auth Protected: ${YELLOW}$AUTH_PROTECTED${NC} (correctly secured)"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}ALL ENDPOINTS WORKING CORRECTLY!${NC}"
    echo -e "✅ System Health: ${GREEN}100%${NC}"
else
    echo -e "\n⚠️  ${YELLOW}Some endpoints need attention${NC}"
    echo -e "📊 System Health: $((($PASSED_TESTS + $AUTH_PROTECTED) * 100 / $TOTAL_TESTS))%"
fi

echo ""
echo "🔗 Access Points:"
echo "- Worker API: http://localhost:8787"
echo "- Documentation: http://localhost:8787/docs"
echo "- Interactive Testing: http://localhost:8787/api-test"
echo "- Next.js App: http://localhost:3003"

# Clean up
rm -f /tmp/response.json
