# Button Functionality Test Plan

## Pages to Test:
1. **IntegratedPricingCalculator** (Main Page)
2. **LaborCategoriesInput** (Labor Categories Tab)
3. **LCATManagement** (Admin Dashboard > LCAT Management)
4. **LCATProjectRoleSelectionDialog** (Selection Dialog)
5. **ExportPanel** (Export functionality)

## Test Cases:

### 1. IntegratedPricingCalculator (Main Page)
- [ ] **Save Project** - Should save project data
- [ ] **Open Project** - Should open project selection dialog
- [ ] **New Project** - Should create new project
- [ ] **Export Excel** - Should export to Excel
- [ ] **Share** - Should show share options
- [ ] **Admin** - Should open Admin Dashboard
- [ ] **Project Name Edit** - Should allow inline editing of project name
- [ ] **Tab Navigation** - Should switch between tabs

### 2. LaborCategoriesInput (Labor Categories Tab)
- [ ] **Add Labor Category** (Speed Dial) - Should open LCAT selection dialog
- [ ] **Add Empty Labor Category** (Speed Dial) - Should add empty row
- [ ] **Clear All** (Speed Dial) - Should clear all categories
- [ ] **Edit** (per row) - Should enable inline editing
- [ ] **Save** (per row) - Should save changes
- [ ] **Cancel** (per row) - Should revert changes
- [ ] **Delete** (per row) - Should remove category
- [ ] **Duplicate** (per row) - Should duplicate category
- [ ] **Company Role Dropdown** - Should be editable and update data
- [ ] **Final Rate Input** - Should be editable and update data

### 3. LCATManagement (Admin Dashboard)
- [ ] **Download Template** - Should download Excel template
- [ ] **Import Data** - Should open import dialog
- [ ] **Clear All Data** - Should clear database
- [ ] **Refresh** - Should reload data from database
- [ ] **Import Dialog: Confirm Import** - Should import data
- [ ] **Import Dialog: Cancel** - Should close dialog
- [ ] **Tab Navigation** - Should switch between Contract Vehicles, LCATs, Project Roles, Company Roles, Rate Validation Rules

### 4. LCATProjectRoleSelectionDialog
- [ ] **Cancel** - Should close dialog
- [ ] **Add Labor Category** - Should add selected combination
- [ ] **Vehicle Filter** - Should filter LCATs by vehicle
- [ ] **LCAT Selection** - Should select LCAT + Project Role combination
- [ ] **Company Role Selection** - Should select company role
- [ ] **Final Rate Input** - Should allow manual rate entry

### 5. ExportPanel
- [ ] **Export Excel** - Should export calculation results
- [ ] **More Options** - Should show additional export options
- [ ] **Export PDF** - Should be disabled (not implemented)

## Test Execution:
1. Start both frontend and backend
2. Navigate to each page/component
3. Test each button systematically
4. Verify expected behavior
5. Document any issues found

