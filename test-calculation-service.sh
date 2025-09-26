#!/bin/bash

# Test script for Pricing Calculation Service
# This script demonstrates all the calculation service functionality

echo "🧮 Testing Pricing Calculation Service"
echo "====================================="

BASE_URL="http://localhost:3001/api/calculation"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Test data
SETTINGS='{
  "overheadRate": 0.30,
  "gaRate": 0.15,
  "feeRate": 0.10,
  "contractType": "FFP",
  "periodOfPerformance": {
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-12-31T23:59:59.999Z"
  }
}'

LABOR_CATEGORY='{
  "title": "Senior Software Engineer",
  "baseRate": 85.00,
  "hours": 2080,
  "ftePercentage": 100,
  "clearanceLevel": "Secret",
  "location": "On-site"
}'

ODC='{
  "description": "Travel to client site",
  "amount": 2500.00,
  "category": "Travel",
  "taxable": true,
  "taxRate": 0.08
}'

CALCULATION_INPUT='{
  "settings": {
    "overheadRate": 0.30,
    "gaRate": 0.15,
    "feeRate": 0.10,
    "contractType": "FFP",
    "periodOfPerformance": {
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-12-31T23:59:59.999Z"
    }
  },
  "laborCategories": [
    {
      "title": "Senior Software Engineer",
      "baseRate": 85.00,
      "hours": 2080,
      "ftePercentage": 100,
      "clearanceLevel": "Secret",
      "location": "On-site"
    },
    {
      "title": "Project Manager",
      "baseRate": 95.00,
      "hours": 2080,
      "ftePercentage": 100,
      "clearanceLevel": "Public Trust",
      "location": "Hybrid"
    }
  ],
  "otherDirectCosts": [
    {
      "description": "Travel to client site",
      "amount": 2500.00,
      "category": "Travel",
      "taxable": true,
      "taxRate": 0.08
    },
    {
      "description": "Development software licenses",
      "amount": 5000.00,
      "category": "Software",
      "taxable": false,
      "taxRate": 0.08
    }
  ]
}'

# Test 1: Calculate individual labor category
echo ""
print_info "Test 1: Calculating individual labor category..."
LABOR_RESPONSE=$(curl -s -X POST $BASE_URL/calculate-labor-category \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer test-token" \
    -d "{\"laborCategory\": $LABOR_CATEGORY, \"settings\": $SETTINGS}")

if echo $LABOR_RESPONSE | jq -e '.success' > /dev/null; then
    print_status "Labor category calculation completed!"
    echo "Labor Category Result:"
    echo $LABOR_RESPONSE | jq '.result | {title, baseRate, effectiveHours, clearancePremium, clearanceAdjustedRate, burdenedRate, totalCost}'
else
    print_error "Labor category calculation failed"
    echo $LABOR_RESPONSE | jq
fi

# Test 2: Calculate other direct cost
echo ""
print_info "Test 2: Calculating other direct cost..."
ODC_RESPONSE=$(curl -s -X POST $BASE_URL/calculate-odc \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer test-token" \
    -d "{\"otherDirectCost\": $ODC}")

if echo $ODC_RESPONSE | jq -e '.success' > /dev/null; then
    print_status "Other direct cost calculation completed!"
    echo "ODC Result:"
    echo $ODC_RESPONSE | jq '.result | {description, amount, taxable, taxAmount, totalAmount}'
else
    print_error "Other direct cost calculation failed"
    echo $ODC_RESPONSE | jq
fi

# Test 3: Calculate complete project
echo ""
print_info "Test 3: Calculating complete project pricing..."
PROJECT_RESPONSE=$(curl -s -X POST $BASE_URL/calculate \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer test-token" \
    -d "$CALCULATION_INPUT")

if echo $PROJECT_RESPONSE | jq -e '.success' > /dev/null; then
    print_status "Project calculation completed!"
    echo ""
    echo "📊 PROJECT CALCULATION RESULTS:"
    echo "=============================="
    
    echo ""
    echo "💰 Labor Categories:"
    echo $PROJECT_RESPONSE | jq -r '.result.laborCategories[] | "• \(.title): $\(.baseRate)/hr → $\(.burdenedRate | round)/hr (Total: $\(.totalCost | round))"'
    
    echo ""
    echo "💸 Other Direct Costs:"
    echo $PROJECT_RESPONSE | jq -r '.result.otherDirectCosts[] | "• \(.description): $\(.amount) → $\(.totalAmount | round) (Tax: $\(.taxAmount | round))"'
    
    echo ""
    echo "📈 PROJECT TOTALS:"
    echo $PROJECT_RESPONSE | jq -r '.result.totals | "• Total Labor Cost: $\(.totalLaborCost | round)\n• Total ODC Cost: \(.totalODCCost | round)\n• Total Project Cost: $\(.totalProjectCost | round)\n• Total Effective Hours: \(.totalEffectiveHours | round)\n• Average Burdened Rate: $\(.averageBurdenedRate | round)/hr"'
    
else
    print_error "Project calculation failed"
    echo $PROJECT_RESPONSE | jq
fi

# Test 4: Validate calculation input
echo ""
print_info "Test 4: Validating calculation input..."
VALIDATION_RESPONSE=$(curl -s -X POST $BASE_URL/validate \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer test-token" \
    -d "$CALCULATION_INPUT")

if echo $VALIDATION_RESPONSE | jq -e '.valid' > /dev/null; then
    print_status "Input validation passed!"
else
    print_error "Input validation failed"
    echo $VALIDATION_RESPONSE | jq '.errors[]'
fi

# Test 5: Test invalid input validation
echo ""
print_info "Test 5: Testing invalid input validation..."
INVALID_INPUT='{
  "settings": {
    "overheadRate": 3.0,
    "gaRate": 0.15,
    "feeRate": 0.10,
    "contractType": "INVALID",
    "periodOfPerformance": {
      "startDate": "2025-12-31T00:00:00.000Z",
      "endDate": "2025-01-01T00:00:00.000Z"
    }
  },
  "laborCategories": [
    {
      "title": "",
      "baseRate": 1500.00,
      "hours": 0,
      "ftePercentage": 150,
      "clearanceLevel": "Invalid",
      "location": "Invalid"
    }
  ],
  "otherDirectCosts": []
}'

INVALID_VALIDATION=$(curl -s -X POST $BASE_URL/validate \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer test-token" \
    -d "$INVALID_INPUT")

if echo $INVALID_VALIDATION | jq -e '.valid == false' > /dev/null; then
    print_status "Invalid input correctly rejected!"
    echo "Validation errors:"
    echo $INVALID_VALIDATION | jq -r '.errors[] | "• \(.field): \(.message)"'
else
    print_error "Invalid input was not rejected"
    echo $INVALID_VALIDATION | jq
fi

# Test 6: Calculate burden rate
echo ""
print_info "Test 6: Calculating burden rate..."
BURDEN_RESPONSE=$(curl -s -X POST $BASE_URL/burden-rate \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer test-token" \
    -d "{\"baseRate\": 85, \"clearanceLevel\": \"Secret\", \"settings\": $SETTINGS}")

if echo $BURDEN_RESPONSE | jq -e '.success' > /dev/null; then
    print_status "Burden rate calculation completed!"
    echo "Burden Rate: $$(echo $BURDEN_RESPONSE | jq -r '.burdenRate | round')/hr"
else
    print_error "Burden rate calculation failed"
    echo $BURDEN_RESPONSE | jq
fi

# Test 7: Calculate effective hours
echo ""
print_info "Test 7: Calculating effective hours..."
EFFECTIVE_HOURS_RESPONSE=$(curl -s -X POST $BASE_URL/effective-hours \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer test-token" \
    -d '{"hours": 2080, "ftePercentage": 100}')

if echo $EFFECTIVE_HOURS_RESPONSE | jq -e '.success' > /dev/null; then
    print_status "Effective hours calculation completed!"
    echo "Effective Hours: $(echo $EFFECTIVE_HOURS_RESPONSE | jq -r '.effectiveHours')"
else
    print_error "Effective hours calculation failed"
    echo $EFFECTIVE_HOURS_RESPONSE | jq
fi

# Test 8: Get clearance premium
echo ""
print_info "Test 8: Getting clearance premium..."
CLEARANCE_RESPONSE=$(curl -s -X GET $BASE_URL/clearance-premium/Secret \
    -H "Authorization: Bearer test-token")

if echo $CLEARANCE_RESPONSE | jq -e '.success' > /dev/null; then
    print_status "Clearance premium retrieved!"
    echo "Secret Clearance Premium: $(echo $CLEARANCE_RESPONSE | jq -r '.premium * 100')%"
else
    print_error "Clearance premium retrieval failed"
    echo $CLEARANCE_RESPONSE | jq
fi

# Test 9: Generate Excel export data
echo ""
print_info "Test 9: Generating Excel export data..."
if echo $PROJECT_RESPONSE | jq -e '.success' > /dev/null; then
    EXPORT_RESPONSE=$(curl -s -X POST $BASE_URL/export/excel \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer test-token" \
        -d "{\"result\": $(echo $PROJECT_RESPONSE | jq '.result')}")
    
    if echo $EXPORT_RESPONSE | jq -e '.success' > /dev/null; then
        print_status "Excel export data generated!"
        echo "Export data structure:"
        echo $EXPORT_RESPONSE | jq '.exportData | keys'
    else
        print_error "Excel export data generation failed"
        echo $EXPORT_RESPONSE | jq
    fi
else
    print_warning "Skipping Excel export test - project calculation failed"
fi

echo ""
echo "🎉 All calculation service tests completed!"
echo ""
print_info "Available calculation endpoints:"
echo "• POST $BASE_URL/calculate - Complete project calculation"
echo "• POST $BASE_URL/calculate-labor-category - Individual labor category"
echo "• POST $BASE_URL/calculate-odc - Other direct cost calculation"
echo "• POST $BASE_URL/compare-scenarios - Scenario comparison"
echo "• POST $BASE_URL/validate - Input validation"
echo "• POST $BASE_URL/export/excel - Excel export data"
echo "• POST $BASE_URL/burden-rate - Burden rate calculation"
echo "• POST $BASE_URL/effective-hours - Effective hours calculation"
echo "• GET $BASE_URL/clearance-premium/{level} - Clearance premium lookup"
