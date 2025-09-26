#!/bin/bash

# Test script for Pricing Calculator Models
# This script demonstrates all the pricing model functionality

echo "🧪 Testing Pricing Calculator Models"
echo "===================================="

BASE_URL="http://localhost:3001/api/pricing"

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

# Test 1: Create a test project
echo ""
print_info "Test 1: Creating a test pricing project..."
PROJECT_RESPONSE=$(curl -s -X POST $BASE_URL/test-project)
PROJECT_ID=$(echo $PROJECT_RESPONSE | jq -r '.project.id')

if [ "$PROJECT_ID" != "null" ] && [ "$PROJECT_ID" != "" ]; then
    print_status "Project created successfully!"
    echo "Project ID: $PROJECT_ID"
    echo "Project Settings:"
    echo $PROJECT_RESPONSE | jq '.project.settings'
else
    print_error "Failed to create project"
    echo $PROJECT_RESPONSE | jq
    exit 1
fi

# Test 2: Create test labor categories
echo ""
print_info "Test 2: Creating test labor categories..."
LABOR_RESPONSE=$(curl -s -X POST $BASE_URL/test-labor-categories \
    -H "Content-Type: application/json" \
    -d "{\"projectId\": \"$PROJECT_ID\"}")

if echo $LABOR_RESPONSE | jq -e '.success' > /dev/null; then
    print_status "Labor categories created successfully!"
    echo "Labor Categories:"
    echo $LABOR_RESPONSE | jq '.laborCategories[] | {title, baseRate, hours, ftePercentage, clearanceLevel, location, effectiveHours}'
else
    print_error "Failed to create labor categories"
    echo $LABOR_RESPONSE | jq
fi

# Test 3: Create test other direct costs
echo ""
print_info "Test 3: Creating test other direct costs..."
ODC_RESPONSE=$(curl -s -X POST $BASE_URL/test-odc \
    -H "Content-Type: application/json" \
    -d "{\"projectId\": \"$PROJECT_ID\"}")

if echo $ODC_RESPONSE | jq -e '.success' > /dev/null; then
    print_status "Other direct costs created successfully!"
    echo "Other Direct Costs:"
    echo $ODC_RESPONSE | jq '.otherDirectCosts[] | {description, amount, category, taxable, taxAmount, totalAmount}'
else
    print_error "Failed to create other direct costs"
    echo $ODC_RESPONSE | jq
fi

# Test 4: Calculate pricing
echo ""
print_info "Test 4: Calculating project pricing..."
CALC_RESPONSE=$(curl -s -X GET $BASE_URL/calculate/$PROJECT_ID)

if echo $CALC_RESPONSE | jq -e '.success' > /dev/null; then
    print_status "Pricing calculation completed successfully!"
    echo ""
    echo "📊 CALCULATION RESULTS:"
    echo "======================"
    
    echo ""
    echo "💰 Labor Categories Breakdown:"
    echo $CALC_RESPONSE | jq -r '.calculation.laborCategories[] | "• \(.title): $\(.baseRate)/hr → $\(.burdenedRate | round)/hr (Total: $\(.totalCost | round))"'
    
    echo ""
    echo "💸 Other Direct Costs:"
    echo $CALC_RESPONSE | jq -r '.calculation.otherDirectCosts[] | "• \(.description): $\(.amount) → $\(.totalAmount | round) (Tax: $\(.taxAmount | round))"'
    
    echo ""
    echo "📈 PROJECT TOTALS:"
    echo $CALC_RESPONSE | jq -r '.calculation.totals | "• Total Labor Cost: $\(.totalLaborCost | round)\n• Total ODC Cost: $\(.totalODCCost | round)\n• Total Project Cost: $\(.totalProjectCost | round)\n• Total Effective Hours: \(.totalEffectiveHours | round)\n• Average Burdened Rate: $\(.averageBurdenedRate | round)/hr"'
    
    echo ""
    echo "⚙️  PROJECT SETTINGS:"
    echo $CALC_RESPONSE | jq -r '.calculation.settings | "• Overhead Rate: \(.overheadRate * 100 | round)%\n• G&A Rate: \(.gaRate * 100 | round)%\n• Fee Rate: \(.feeRate * 100 | round)%\n• Contract Type: \(.contractType)"'
    
else
    print_error "Failed to calculate pricing"
    echo $CALC_RESPONSE | jq
fi

# Test 5: Validate business rules
echo ""
print_info "Test 5: Testing business rule validation..."

# Test valid labor category
VALID_LABOR=$(curl -s -X POST $BASE_URL/validate-labor-category \
    -H "Content-Type: application/json" \
    -d '{
        "title": "Software Engineer",
        "baseRate": 85.00,
        "hours": 2080,
        "ftePercentage": 100,
        "clearanceLevel": "Secret",
        "location": "On-site"
    }')

if echo $VALID_LABOR | jq -e '.valid' > /dev/null; then
    print_status "Valid labor category passed validation"
else
    print_error "Valid labor category failed validation"
    echo $VALID_LABOR | jq
fi

# Test invalid labor category (base rate too high)
INVALID_LABOR=$(curl -s -X POST $BASE_URL/validate-labor-category \
    -H "Content-Type: application/json" \
    -d '{
        "title": "Software Engineer",
        "baseRate": 1500.00,
        "hours": 2080,
        "ftePercentage": 100,
        "clearanceLevel": "Secret",
        "location": "On-site"
    }')

if echo $INVALID_LABOR | jq -e '.valid == false' > /dev/null; then
    print_status "Invalid labor category correctly rejected"
    echo "Validation errors:"
    echo $INVALID_LABOR | jq -r '.errors[]'
else
    print_error "Invalid labor category was not rejected"
    echo $INVALID_LABOR | jq
fi

# Test 6: Get all projects
echo ""
print_info "Test 6: Retrieving all projects..."
PROJECTS_RESPONSE=$(curl -s -X GET $BASE_URL/projects)

if echo $PROJECTS_RESPONSE | jq -e '.success' > /dev/null; then
    print_status "Projects retrieved successfully!"
    PROJECT_COUNT=$(echo $PROJECTS_RESPONSE | jq '.projects | length')
    echo "Total projects: $PROJECT_COUNT"
else
    print_error "Failed to retrieve projects"
    echo $PROJECTS_RESPONSE | jq
fi

echo ""
echo "🎉 All tests completed!"
echo ""
print_info "You can also test these endpoints manually:"
echo "• POST $BASE_URL/test-project"
echo "• POST $BASE_URL/test-labor-categories -d '{\"projectId\": \"<PROJECT_ID>\"}'"
echo "• POST $BASE_URL/test-odc -d '{\"projectId\": \"<PROJECT_ID>\"}'"
echo "• GET $BASE_URL/calculate/<PROJECT_ID>"
echo "• POST $BASE_URL/validate-labor-category -d '{...labor data...}'"
echo "• GET $BASE_URL/projects"
