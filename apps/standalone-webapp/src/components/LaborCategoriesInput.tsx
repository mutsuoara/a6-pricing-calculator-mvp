/**
 * Labor Categories Input Component
 * Professional table-based input for managing labor categories with real-time calculations
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  Grid,
  Card,
  CardContent,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LibraryBooks as LibraryIcon,
  ContentCopy as DuplicateIcon,
  ClearAll as ClearAllIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { LaborCategoryInput, LaborCategoryResult, LaborCategorySummary, ValidationError } from '../types/labor-category';
import { LaborCategoryService } from '../services/labor-category.service';
import { LCAT, CompanyRole, ProjectRole } from '../types/mapping';
import { MappingService } from '../services/mapping.service';
import { getSalaryConversionInfo } from '../utils/salary-conversion';
import { formatNumberWithCommas, formatCurrencyWithCommas, formatCurrencySmart, formatPercentageWithCommas } from '../utils/number-formatting';
import { useSystemSettings } from '../hooks/useSystemSettings';
import { LCATProjectRoleSelectionDialog } from './LCATProjectRoleSelectionDialog';

interface LaborCategoriesInputProps {
  categories: LaborCategoryInput[];
  onCategoriesChange: (categories: LaborCategoryInput[] | ((prev: LaborCategoryInput[]) => LaborCategoryInput[])) => void;
  overheadRate: number;
  gaRate: number;
  feeRate: number;
  disabled?: boolean;
}

interface EditingState {
  [key: string]: boolean;
}

export const LaborCategoriesInput: React.FC<LaborCategoriesInputProps> = ({
  categories,
  onCategoriesChange,
  overheadRate,
  gaRate,
  feeRate,
  disabled = false,
}) => {
  const { settings, calculateWrapAmount, calculateMinimumProfitAmount } = useSystemSettings();
  const [editingState, setEditingState] = useState<EditingState>({});
  const [originalCategories, setOriginalCategories] = useState<LaborCategoryInput[]>([]);
  const [errors, setErrors] = useState<Record<string, ValidationError[]>>({});
  const [capacityInputValues, setCapacityInputValues] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<LaborCategorySummary>({
    totalCategories: 0,
    totalHours: 0,
    totalEffectiveHours: 0,
    totalBaseCost: 0,
    totalBurdenedCost: 0,
    averageBaseRate: 0,
    averageBurdenedRate: 0,
  });
  const [lcatDialogOpen, setLcatDialogOpen] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [companyRoles, setCompanyRoles] = useState<CompanyRole[]>([]);

  // Load Company Role data
  useEffect(() => {
    const loadCompanyRoles = async () => {
      try {
        console.log('Loading company roles...');
        const companyRolesData = await MappingService.getCompanyRoles();
        console.log('Loaded company roles:', companyRolesData);
        setCompanyRoles(companyRolesData);
      } catch (error) {
        console.error('Error loading Company Role data:', error);
      }
    };
    loadCompanyRoles();
  }, []);

  // Calculate summary whenever categories or rates change
  useEffect(() => {
    const newSummary = LaborCategoryService.calculateSummary(categories, overheadRate, gaRate, feeRate);
    setSummary(newSummary);
  }, [categories, overheadRate, gaRate, feeRate]);

  // Force re-render when system settings change (for minimum profit calculation)
  useEffect(() => {
    // This effect will trigger a re-render when system settings change
  }, [settings]);

  // Validate all categories
  const validateCategories = useCallback(() => {
    const newErrors: Record<string, ValidationError[]> = {};
    
    categories.forEach((category, index) => {
      const categoryErrors = LaborCategoryService.validateLaborCategory(category, index);
      if (categoryErrors.length > 0) {
        newErrors[`category_${index}`] = categoryErrors;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [categories]);

  // Validate categories when they change
  useEffect(() => {
    validateCategories();
  }, [validateCategories]);

  const addCategory = () => {
    const newCategory = LaborCategoryService.createEmptyCategory();
    const newCategories = [...categories, newCategory];
    onCategoriesChange(newCategories);
    
    // Start editing the new category
    setEditingState(prev => ({
      ...prev,
      [`category_${newCategories.length - 1}`]: true,
    }));
  };

  const removeCategory = (index: number) => {
    const newCategories = categories.filter((_, i) => i !== index);
    onCategoriesChange(newCategories);
    
    // Clean up editing state
    setEditingState(prev => {
      const newState = { ...prev };
      delete newState[`category_${index}`];
      return newState;
    });
  };

  const updateCategory = (index: number, field: keyof LaborCategoryInput, value: any) => {
    const newCategories = [...categories];
    const currentCategory = newCategories[index];
    if (!currentCategory) return;
    
    newCategories[index] = { 
      ...currentCategory, 
      [field]: value,
      // Ensure all required fields are explicitly set (only if not being updated)
      title: field === 'title' ? value : currentCategory.title,
      baseRate: field === 'baseRate' ? value : currentCategory.baseRate,
      hours: field === 'hours' ? value : currentCategory.hours,
      ftePercentage: field === 'ftePercentage' ? value : currentCategory.ftePercentage,
      capacity: field === 'capacity' ? value : currentCategory.capacity,
      clearanceLevel: field === 'clearanceLevel' ? value : currentCategory.clearanceLevel,
      location: field === 'location' ? value : currentCategory.location,
      companyRoleId: field === 'companyRoleId' ? value : currentCategory.companyRoleId,
      companyRoleName: field === 'companyRoleName' ? value : currentCategory.companyRoleName,
      companyRoleRate: field === 'companyRoleRate' ? value : currentCategory.companyRoleRate,
      finalRate: field === 'finalRate' ? value : currentCategory.finalRate,
      finalRateMetadata: field === 'finalRateMetadata' ? value : currentCategory.finalRateMetadata,
    };
    onCategoriesChange(newCategories);
  };

  // Handle LCAT + Project Role selection from dialog
  const handleLCATProjectRoleSelection = (selection: {
    lcat: LCAT;
    projectRole: ProjectRole;
    hours?: number;
    companyRole?: CompanyRole;
    finalRate?: number;
  }) => {
    const newCategory: LaborCategoryInput = {
      id: `temp-${Date.now()}`,
      title: `${selection.lcat.name} - ${selection.projectRole.name}`,
      baseRate: selection.finalRate || selection.lcat.rate,
      hours: selection.hours || selection.projectRole.typicalHours, // Use project role hours
      ftePercentage: 100,
      capacity: 1, // Default capacity of 1
      clearanceLevel: selection.projectRole.typicalClearance as any, // Use project role clearance
      location: 'Remote',
      // LCAT data
      lcatId: selection.lcat.id,
      lcatName: selection.lcat.name,
      lcatCode: selection.lcat.code,
      lcatDescription: selection.lcat.description,
      lcatRate: selection.lcat.rate,
      vehicle: selection.lcat.vehicle,
      // Project Role data
      projectRoleId: selection.projectRole.id,
      projectRoleName: selection.projectRole.name,
      projectRoleDescription: selection.projectRole.description,
      // Company Role data
      companyRoleId: selection.companyRole?.id || '',
      companyRoleName: selection.companyRole?.name || '',
      companyRoleRate: selection.companyRole?.rate || 0,
      // Final Rate with metadata
      finalRate: selection.finalRate || selection.lcat.rate,
      finalRateMetadata: {
        source: selection.companyRole ? 'company' : 'lcat',
        reason: selection.companyRole ? 'Mapped to company role' : 'Using LCAT rate',
        timestamp: new Date().toISOString(),
        userId: 'current-user', // In real app, get from auth context
      },
    };
    
    // Use functional update to ensure we get the latest state
    onCategoriesChange((prevCategories: LaborCategoryInput[]) => {
      const updated = [...prevCategories, newCategory];
      console.log(`Adding labor category: ${newCategory.title}. Total categories: ${updated.length}`);
      return updated;
    });
  };

  const startEditing = (index: number) => {
    // Store the original category data before editing
    setOriginalCategories([...categories]);
    setEditingState(prev => ({
      ...prev,
      [`category_${index}`]: true,
    }));
  };

  const saveEditing = (index: number) => {
    setEditingState(prev => ({
      ...prev,
      [`category_${index}`]: false,
    }));
  };

  const cancelEditing = (index: number) => {
    // Revert to original category data
    if (originalCategories.length > 0) {
      onCategoriesChange([...originalCategories]);
    }
    setEditingState(prev => ({
      ...prev,
      [`category_${index}`]: false,
    }));
  };

  const isEditing = (index: number) => editingState[`category_${index}`] || false;

  const getFieldError = (index: number, field: string): string | undefined => {
    const categoryErrors = errors[`category_${index}`] || [];
    const fieldError = categoryErrors.find(error => error.field.includes(field));
    return fieldError?.message;
  };

  const calculateCategoryResult = (category: LaborCategoryInput): LaborCategoryResult => {
    return LaborCategoryService.calculateTotalCost(category, overheadRate, gaRate, feeRate);
  };


  const duplicateCategory = (index: number) => {
    const categoryToDuplicate = categories[index];
    if (!categoryToDuplicate) return;
    
    const duplicatedCategory: LaborCategoryInput = {
      ...categoryToDuplicate,
      id: Date.now().toString(),
      title: `${categoryToDuplicate.title} (Copy)`,
      baseRate: categoryToDuplicate.baseRate,
      hours: categoryToDuplicate.hours,
      ftePercentage: categoryToDuplicate.ftePercentage,
      capacity: categoryToDuplicate.capacity,
      clearanceLevel: categoryToDuplicate.clearanceLevel,
      location: categoryToDuplicate.location,
      companyRoleId: categoryToDuplicate.companyRoleId,
      companyRoleName: categoryToDuplicate.companyRoleName,
      companyRoleRate: categoryToDuplicate.companyRoleRate,
      finalRate: categoryToDuplicate.finalRate,
      finalRateMetadata: categoryToDuplicate.finalRateMetadata,
    };
    
    const newCategories = [...categories, duplicatedCategory];
    onCategoriesChange(newCategories);
  };

  const clearAllCategories = () => {
    if (window.confirm('Are you sure you want to clear all labor categories? This action cannot be undone.')) {
      onCategoriesChange([]);
      setEditingState({});
    }
  };

  const speedDialActions = [
    {
      icon: <LibraryIcon />,
      name: 'Select Labor Category',
      onClick: () => setLcatDialogOpen(true),
    },
    {
      icon: <AddIcon />,
      name: 'Add Empty Labor Category',
      onClick: addCategory,
    },
  ];

  if (categories.length > 0) {
    speedDialActions.push({
      icon: <ClearAllIcon />,
      name: 'Clear All',
      onClick: clearAllCategories,
    });
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" component="h2" fontWeight="bold">
            Labor Categories
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your project team with pre-populated labor categories or custom categories
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<LibraryIcon />}
            onClick={() => setLcatDialogOpen(true)}
            disabled={disabled}
            sx={{ 
              borderColor: '#1976d2',
              color: '#1976d2',
              minWidth: '180px',
              height: '40px',
              '&:hover': { 
                borderColor: '#1565c0',
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            Select Labor Category
          </Button>
        </Box>
      </Box>


      {/* Categories Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  LCAT
                  <Tooltip title="Selected LCAT from management system">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  Project Role
                  <Tooltip title="Selected project role from management system">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  Company Role
                  <Tooltip title="Always editable dropdown - frequently changed during planning">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                  LCAT Rate
                  <Tooltip title="Rate from selected LCAT">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                  Company Minimum Rate
                  <Tooltip title="Minimum Annual Revenue ÷ Effective Hours">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                  Final Rate
                  <Tooltip title="Always editable - shows hourly rate. When company role selected, uses Company Minimum Rate">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                  Final Rate Discount
                  <Tooltip title="Discount percentage: (LCAT Rate - Final Rate) ÷ LCAT Rate">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                  Capacity
                  <Tooltip title="Number of identical LCATs needed (multiplies total cost)">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                  Hours
                  <Tooltip title="Total hours for this labor category">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                  FTE %
                  <Tooltip title="Full-Time Equivalent percentage (0-100%)">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                  Effective Hours
                  <Tooltip title="Calculated as Hours × FTE%">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              {/* Hidden: Clearance column */}
              {/* <TableCell sx={{ fontWeight: 'bold' }} align="center">
                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                  Clearance
                  <Tooltip title="Security clearance level required">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell> */}
              {/* Hidden: Location column */}
              {/* <TableCell sx={{ fontWeight: 'bold' }} align="center">
                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                  Location
                  <Tooltip title="Work location type">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell> */}
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                  Minimum Annual Revenue
                  <Tooltip title="Annual Salary Estimates + Wrap + Minimum Profit">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                  Company Role Rate
                  <Tooltip title="Minimum annual revenue from company role">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                  Wrap
                  <Tooltip title="System-wide wrap rate × Company Role Rate (Configured in Admin Dashboard)">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                  Minimum Profit
                  <Tooltip title="System-wide minimum profit rate × (Company Role Rate + Wrap) (Configured in Admin Dashboard)">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              {/* Hidden: Burdened Rate column */}
              {/* <TableCell sx={{ fontWeight: 'bold' }} align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                  Burdened Rate
                  <Tooltip title="Base rate + overhead + G&A + fee + clearance premium">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell> */}
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                  Total Cost
                  <Tooltip title="Burdened rate × effective hours">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                  Actual Cost
                  <Tooltip title="(Company Role Rate + Wrap) × Capacity">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                  Actual Profit
                  <Tooltip title="Total Cost - Actual Cost">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                  Actual Profit (%)
                  <Tooltip title="Actual Profit / (Actual Cost + Actual Profit)">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category, index) => {
              const result = calculateCategoryResult(category);
              const editing = isEditing(index);
              
              return (
                <TableRow key={index} hover>
                  {/* LCAT */}
                  <TableCell>
                    {category.lcatId ? (
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {category.lcatName}
                        </Typography>
                        <Chip 
                          label={`${category.vehicle} - ${category.lcatCode}`} 
                          size="small" 
                          color="primary" 
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No LCAT selected
                      </Typography>
                    )}
                  </TableCell>

                  {/* Project Role */}
                  <TableCell>
                    {category.projectRoleId ? (
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {category.projectRoleName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {category.projectRoleDescription}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No project role
                      </Typography>
                    )}
                  </TableCell>

                  {/* Company Role - Always Editable */}
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <Select
                        value={category.companyRoleId || ''}
                        onChange={(e) => {
                          console.log('Company Role onChange triggered:', e.target.value);
                          const selectedRole = companyRoles.find(r => r.id === e.target.value);
                          console.log('Selected role:', selectedRole);
                          if (selectedRole) {
                            console.log('Updating category with role:', selectedRole.name, selectedRole.rate);
                            // Calculate Company Minimum Rate (Minimum Annual Revenue ÷ Effective Hours)
                            const effectiveHours = category.hours * (category.ftePercentage / 100);
                            const wrapAmount = calculateWrapAmount(selectedRole.rate);
                            const minimumProfitAmount = calculateMinimumProfitAmount(selectedRole.rate, wrapAmount);
                            const minimumAnnualRevenue = selectedRole.rate + wrapAmount + minimumProfitAmount;
                            const minimumRate = Math.round((minimumAnnualRevenue / effectiveHours) * 100) / 100; // Round to 2 decimal places
                            console.log(`Converting minimum annual revenue ${formatCurrencyWithCommas(minimumAnnualRevenue, false)} to minimum rate: ${formatCurrencyWithCommas(minimumRate, true)} (÷ ${formatNumberWithCommas(effectiveHours)} effective hours)`);
                            
                            // Batch all updates into a single state change
                            const newCategories = [...categories];
                            const currentCategory = newCategories[index];
                            if (!currentCategory) return;
                            
                            newCategories[index] = {
                              ...currentCategory,
                              companyRoleId: selectedRole.id,
                              companyRoleName: selectedRole.name,
                              companyRoleRate: selectedRole.rate, // Keep minimum annual revenue for reference
                              finalRate: minimumRate, // Use minimum rate for calculations (rounded to 2 decimals)
                              baseRate: minimumRate, // Use minimum rate for base calculations (rounded to 2 decimals)
                              title: currentCategory.title,
                              hours: currentCategory.hours,
                              ftePercentage: currentCategory.ftePercentage,
                              capacity: currentCategory.capacity,
                              clearanceLevel: currentCategory.clearanceLevel,
                              location: currentCategory.location,
                              finalRateMetadata: {
                                source: 'company',
                                reason: `Mapped to ${selectedRole.name} (${formatCurrencyWithCommas(minimumAnnualRevenue, false)} minimum annual revenue ÷ ${formatNumberWithCommas(effectiveHours)} effective hours = ${formatCurrencyWithCommas(minimumRate, true)}/hour)`,
                                timestamp: new Date().toISOString(),
                                userId: 'current-user', // In real app, get from auth context
                              }
                            };
                            console.log('Updated category:', newCategories[index]);
                            onCategoriesChange(newCategories);
                          } else {
                            console.log('Clearing company role');
                            // Clear company role
                            const newCategories = [...categories];
                            const currentCategory = newCategories[index];
                            if (!currentCategory) return;
                            
                            newCategories[index] = {
                              ...currentCategory,
                              companyRoleId: '',
                              companyRoleName: '',
                              companyRoleRate: 0,
                              title: currentCategory.title,
                              baseRate: currentCategory.baseRate,
                              hours: currentCategory.hours,
                              ftePercentage: currentCategory.ftePercentage,
                              capacity: currentCategory.capacity,
                              clearanceLevel: currentCategory.clearanceLevel,
                              location: currentCategory.location,
                              finalRate: currentCategory.finalRate,
                              finalRateMetadata: {
                                source: 'manual',
                                reason: 'Company role cleared',
                                timestamp: new Date().toISOString(),
                                userId: 'current-user',
                              }
                            };
                            onCategoriesChange(newCategories);
                          }
                        }}
                        disabled={disabled}
                        sx={{
                          '& .MuiSelect-select': {
                            fontWeight: 'medium'
                          }
                        }}
                      >
                        <MenuItem value="">
                          <em>No Company Role</em>
                        </MenuItem>
                        {companyRoles.map((role) => (
                          <MenuItem key={role.id} value={role.id}>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {role.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {role.practiceArea} - Min Annual Revenue: {getSalaryConversionInfo(role.rate).annual}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>

                  {/* LCAT Rate */}
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrencySmart(category.lcatRate || 0)}
                    </Typography>
                  </TableCell>

                  {/* Company Minimum Rate */}
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {(() => {
                        const effectiveHours = result.effectiveHours;
                        const companyRoleRate = Number(category.companyRoleRate || 0);
                        const wrapAmount = calculateWrapAmount(companyRoleRate);
                        const minimumProfitAmount = calculateMinimumProfitAmount(companyRoleRate, wrapAmount);
                        const minimumAnnualRevenue = companyRoleRate + wrapAmount + minimumProfitAmount;
                        const minimumRate = effectiveHours > 0 ? minimumAnnualRevenue / effectiveHours : 0;
                        return formatCurrencySmart(minimumRate);
                      })()}
                    </Typography>
                  </TableCell>

                  {/* Final Rate - Always Editable */}
                  <TableCell align="right">
                    <TextField
                      size="small"
                      type="number"
                      value={category.finalRate || ''}
                      inputProps={{ step: 0.01 }}
                      onChange={(e) => {
                        console.log('Final Rate onChange triggered:', e.target.value);
                        const newRate = Math.round((parseFloat(e.target.value) || 0) * 100) / 100; // Round to 2 decimal places
                        console.log('Parsed rate:', newRate);
                        // Batch all updates into a single state change
                        const newCategories = [...categories];
                        const currentCategory = newCategories[index];
                        if (!currentCategory) return;
                        
                        newCategories[index] = {
                          ...currentCategory,
                          finalRate: newRate,
                          baseRate: newRate,
                          title: currentCategory.title,
                          hours: currentCategory.hours,
                          ftePercentage: currentCategory.ftePercentage,
                          capacity: currentCategory.capacity,
                          clearanceLevel: currentCategory.clearanceLevel,
                          location: currentCategory.location,
                          companyRoleId: currentCategory.companyRoleId,
                          companyRoleName: currentCategory.companyRoleName,
                          companyRoleRate: currentCategory.companyRoleRate,
                          finalRateMetadata: {
                            source: 'manual',
                            reason: 'Manual rate entry',
                            timestamp: new Date().toISOString(),
                            userId: 'current-user', // In real app, get from auth context
                          }
                        };
                        console.log('Updated category finalRate to:', newRate);
                        onCategoriesChange(newCategories);
                      }}
                      disabled={disabled}
                      sx={{ 
                        width: 120,
                        '& .MuiInputBase-input': {
                          textAlign: 'right',
                          fontWeight: 'bold',
                          color: 'primary.main'
                        }
                      }}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 0.5, fontWeight: 'bold' }}>$</Typography>
                      }}
                      placeholder="0.00"
                    />
                  </TableCell>

                  {/* Final Rate Discount */}
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold" color="secondary">
                      {(() => {
                        const lcatRate = Number(category.lcatRate || 0);
                        const finalRate = Number(category.finalRate || 0);
                        if (lcatRate === 0) return 'N/A';
                        const discount = ((lcatRate - finalRate) / lcatRate) * 100;
                        return formatPercentageWithCommas(discount, 1);
                      })()}
                    </Typography>
                  </TableCell>

                  {/* Capacity */}
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="text"
                      value={capacityInputValues[`capacity_${index}`] ?? (category.capacity || 1).toString()}
                      onChange={(e) => {
                        setCapacityInputValues(prev => ({
                          ...prev,
                          [`capacity_${index}`]: e.target.value
                        }));
                      }}
                      onFocus={(e) => {
                        // Select all text when focused for easy replacement
                        e.target.select();
                      }}
                      onBlur={(e) => {
                        let inputValue = e.target.value.trim();
                        
                        // Handle empty input
                        if (inputValue === '') {
                          updateCategory(index, 'capacity', 1);
                          setCapacityInputValues(prev => ({
                            ...prev,
                            [`capacity_${index}`]: '1'
                          }));
                          return;
                        }
                        
                        // Handle decimal input more intuitively
                        if (inputValue === '.') {
                          inputValue = '0.';
                        } else if (inputValue.startsWith('.')) {
                          inputValue = '0' + inputValue;
                        }
                        
                        // Parse the value
                        const parsedValue = parseFloat(inputValue);
                        
                        // Update with valid number or default to 1
                        if (!isNaN(parsedValue) && parsedValue >= 0.1 && parsedValue <= 100) {
                          updateCategory(index, 'capacity', parsedValue);
                          setCapacityInputValues(prev => ({
                            ...prev,
                            [`capacity_${index}`]: parsedValue.toString()
                          }));
                        } else {
                          // Invalid value, reset to current value
                          const currentValue = category.capacity || 1;
                          updateCategory(index, 'capacity', currentValue);
                          setCapacityInputValues(prev => ({
                            ...prev,
                            [`capacity_${index}`]: currentValue.toString()
                          }));
                        }
                      }}
                      error={!!getFieldError(index, 'capacity')}
                      disabled={disabled}
                      sx={{ 
                        width: 80,
                        '& .MuiFormHelperText-root': { 
                          position: 'absolute', 
                          top: '100%', 
                          left: 0,
                          margin: 0,
                          fontSize: '0.75rem'
                        },
                        '& .MuiInputBase-input': {
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: 'primary.main'
                        }
                      }}
                      helperText={getFieldError(index, 'capacity')}
                      placeholder="1"
                    />
                  </TableCell>

                  {/* Hours */}
                  <TableCell align="right">
                    {editing ? (
                      <TextField
                        size="small"
                        type="number"
                        value={category.hours}
                        onChange={(e) => updateCategory(index, 'hours', parseInt(e.target.value) || 0)}
                        error={!!getFieldError(index, 'hours')}
                        disabled={disabled}
                        sx={{ 
                          width: 80,
                          '& .MuiFormHelperText-root': { 
                            position: 'absolute', 
                            top: '100%', 
                            left: 0,
                            margin: 0,
                            fontSize: '0.75rem'
                          }
                        }}
                        helperText={getFieldError(index, 'hours')}
                        inputProps={{ min: 1, max: 10000 }}
                      />
                    ) : (
                      <Typography variant="body2">
                        {category.hours.toLocaleString()}
                      </Typography>
                    )}
                  </TableCell>

                  {/* FTE Percentage */}
                  <TableCell align="right">
                    {editing ? (
                      <TextField
                        size="small"
                        type="number"
                        value={category.ftePercentage}
                        onChange={(e) => updateCategory(index, 'ftePercentage', parseFloat(e.target.value) || 0)}
                        error={!!getFieldError(index, 'ftePercentage')}
                        disabled={disabled}
                        sx={{ 
                          width: 80,
                          '& .MuiFormHelperText-root': { 
                            position: 'absolute', 
                            top: '100%', 
                            left: 0,
                            margin: 0,
                            fontSize: '0.75rem'
                          }
                        }}
                        helperText={getFieldError(index, 'ftePercentage')}
                        inputProps={{ min: 0.01, max: 100, step: 0.01 }}
                      />
                    ) : (
                      <Typography variant="body2">
                        {formatPercentageWithCommas(category.ftePercentage, 1)}
                      </Typography>
                    )}
                  </TableCell>

                  {/* Effective Hours */}
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      {result.effectiveHours.toLocaleString()}
                    </Typography>
                  </TableCell>

                  {/* Hidden: Clearance Level */}
                  {/* <TableCell align="center">
                    {editing ? (
                      <FormControl size="small" sx={{ minWidth: 120, height: 40 }}>
                        <Select
                          value={category.clearanceLevel}
                          onChange={(e) => updateCategory(index, 'clearanceLevel', e.target.value)}
                          disabled={disabled}
                          sx={{ height: 40 }}
                        >
                          <MenuItem value="None">None</MenuItem>
                          <MenuItem value="Public Trust">Public Trust</MenuItem>
                          <MenuItem value="Secret">Secret</MenuItem>
                          <MenuItem value="Top Secret">Top Secret</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip
                        label={category.clearanceLevel}
                        size="small"
                        sx={{
                          backgroundColor: LaborCategoryService.getClearanceLevelColor(category.clearanceLevel),
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      />
                    )}
                  </TableCell> */}

                  {/* Hidden: Location */}
                  {/* <TableCell align="center">
                    {editing ? (
                      <FormControl size="small" sx={{ minWidth: 100, height: 40 }}>
                        <Select
                          value={category.location}
                          onChange={(e) => updateCategory(index, 'location', e.target.value)}
                          disabled={disabled}
                          sx={{ height: 40 }}
                        >
                          <MenuItem value="Remote">Remote</MenuItem>
                          <MenuItem value="On-site">On-site</MenuItem>
                          <MenuItem value="Hybrid">Hybrid</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Tooltip title={category.location}>
                        <Typography variant="body2" fontSize="1.2rem">
                          {LaborCategoryService.getLocationIcon(category.location)}
                        </Typography>
                      </Tooltip>
                    )}
                  </TableCell> */}

                  {/* Minimum Annual Revenue */}
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {(() => {
                        const companyRoleRate = Number(category.companyRoleRate || 0);
                        const wrapAmount = calculateWrapAmount(companyRoleRate);
                        const minimumProfitAmount = calculateMinimumProfitAmount(companyRoleRate, wrapAmount);
                        const minimumAnnualRevenue = companyRoleRate + wrapAmount + minimumProfitAmount;
                        
                        return formatCurrencySmart(minimumAnnualRevenue);
                      })()}
                    </Typography>
                  </TableCell>

                  {/* Company Role Rate */}
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {formatCurrencySmart(category.companyRoleRate || 0)}
                    </Typography>
                  </TableCell>

                  {/* Wrap */}
                  <TableCell align="right">
                    <Box>
                      <Typography variant="body2" fontWeight="bold" color="secondary">
                        {formatCurrencySmart(calculateWrapAmount(Number(category.companyRoleRate || 0)))}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Minimum Profit */}
                  <TableCell align="right">
                    <Box>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {formatCurrencySmart(calculateMinimumProfitAmount(Number(category.companyRoleRate || 0), calculateWrapAmount(Number(category.companyRoleRate || 0))))}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Hidden: Burdened Rate */}
                  {/* <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium" color="primary">
                      {formatCurrencySmart(result.burdenedRate)}
                    </Typography>
                  </TableCell> */}

                  {/* Total Cost */}
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {formatCurrencySmart(result.totalCost)}
                    </Typography>
                  </TableCell>

                  {/* Actual Cost */}
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold" color="info.main">
                      {(() => {
                        const companyRoleRate = Number(category.companyRoleRate || 0);
                        const wrapAmount = calculateWrapAmount(companyRoleRate);
                        const capacity = category.capacity || 1;
                        const actualCost = (companyRoleRate + wrapAmount) * capacity;
                        
                        return formatCurrencySmart(actualCost);
                      })()}
                    </Typography>
                  </TableCell>

                  {/* Actual Profit */}
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {(() => {
                        const companyRoleRate = Number(category.companyRoleRate || 0);
                        const wrapAmount = calculateWrapAmount(companyRoleRate);
                        const capacity = category.capacity || 1;
                        const totalCost = result.totalCost;
                        const actualCost = (companyRoleRate + wrapAmount) * capacity;
                        const actualProfit = totalCost - actualCost;
                        
                        return formatCurrencySmart(actualProfit);
                      })()}
                    </Typography>
                  </TableCell>

                  {/* Actual Profit (%) */}
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {(() => {
                        const companyRoleRate = Number(category.companyRoleRate || 0);
                        const wrapAmount = calculateWrapAmount(companyRoleRate);
                        const capacity = category.capacity || 1;
                        const totalCost = result.totalCost;
                        const actualCost = (companyRoleRate + wrapAmount) * capacity;
                        const actualProfit = totalCost - actualCost;
                        
                        // Calculate percentage: Actual Profit / (Actual Cost + Actual Profit)
                        const denominator = actualCost + actualProfit;
                        const profitPercentage = denominator !== 0 ? (actualProfit / denominator) * 100 : 0;
                        
                        return `${profitPercentage.toFixed(1)}%`;
                      })()}
                    </Typography>
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="center">
                    {editing ? (
                      <Box display="flex" gap={1}>
                        <Tooltip title="Save">
                          <IconButton
                            size="small"
                            onClick={() => saveEditing(index)}
                            disabled={disabled}
                            color="primary"
                          >
                            <SaveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton
                            size="small"
                            onClick={() => cancelEditing(index)}
                            disabled={disabled}
                            color="secondary"
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Box display="flex" gap={1}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => startEditing(index)}
                            disabled={disabled}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Duplicate">
                          <IconButton
                            size="small"
                            onClick={() => duplicateCategory(index)}
                            disabled={disabled}
                            color="info"
                          >
                            <DuplicateIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => removeCategory(index)}
                            disabled={disabled}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Enhanced Summary Cards */}
      {categories.length > 0 && (
        <Box mt={4}>
          <Paper elevation={2} sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
              📊 Project Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={3} sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}>
                  <CardContent>
                    <Typography variant="h4" fontWeight="bold">
                      {summary.totalCategories}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Categories
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={3} sx={{ 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white'
                }}>
                  <CardContent>
                    <Typography variant="h4" fontWeight="bold">
                      {summary.totalEffectiveHours.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Effective Hours
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={3} sx={{ 
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white'
                }}>
                  <CardContent>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrencySmart(summary.averageBurdenedRate)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Avg Burdened Rate
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={3} sx={{ 
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  color: 'white'
                }}>
                  <CardContent>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrencySmart(summary.totalBurdenedCost)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Labor Cost
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Additional Metrics */}
            <Box mt={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(25, 118, 210, 0.1)', borderRadius: 2 }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {formatCurrencySmart(summary.totalBaseCost)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Base Cost
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                    <Typography variant="h6" color="success.main" fontWeight="bold">
                      {formatCurrencySmart(summary.totalBurdenedCost - summary.totalBaseCost)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Burden Cost
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(255, 152, 0, 0.1)', borderRadius: 2 }}>
                    <Typography variant="h6" color="warning.main" fontWeight="bold">
                      {((summary.totalBurdenedCost / summary.totalBaseCost - 1) * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Burden Rate
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Enhanced Empty State */}
      {categories.length === 0 && (
        <Box textAlign="center" py={6}>
          <Paper elevation={1} sx={{ p: 4, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="bold">
              🚀 Ready to Build Your Team?
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Start by selecting from our pre-populated labor categories or create custom categories
            </Typography>
            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<LibraryIcon />}
                onClick={() => setLcatDialogOpen(true)}
                disabled={disabled}
                size="large"
                sx={{ 
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#1565c0' }
                }}
              >
                Select Labor Category
              </Button>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addCategory}
                disabled={disabled}
                size="large"
                sx={{ 
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  '&:hover': { 
                    borderColor: '#1565c0',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                  }
                }}
              >
                Create Custom Category
              </Button>
            </Box>
          </Paper>
        </Box>
      )}


      {/* Speed Dial for Quick Actions */}
      {categories.length > 0 && (
        <SpeedDial
          ariaLabel="Quick actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
          onClose={() => setSpeedDialOpen(false)}
          onOpen={() => setSpeedDialOpen(true)}
          open={speedDialOpen}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={() => {
                action.onClick();
                setSpeedDialOpen(false);
              }}
            />
          ))}
        </SpeedDial>
      )}

      {/* LCAT Project Role Selection Dialog */}
      <LCATProjectRoleSelectionDialog
        open={lcatDialogOpen}
        onClose={() => setLcatDialogOpen(false)}
        onSelect={handleLCATProjectRoleSelection}
      />
    </Box>
  );
};

export default LaborCategoriesInput;
