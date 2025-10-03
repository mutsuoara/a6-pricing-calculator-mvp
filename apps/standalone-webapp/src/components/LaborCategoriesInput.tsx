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
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LaborCategoryInput, LaborCategoryResult, LaborCategorySummary, ValidationError } from '../types/labor-category';
import { LaborCategoryService } from '../services/labor-category.service';
import { LCAT, CompanyRole, ProjectRole } from '../types/mapping';
import { MappingService } from '../services/mapping.service';
import { getSalaryConversionInfo } from '../utils/salary-conversion';
import { formatNumberWithCommas, formatCurrencyWithCommas, formatCurrencySmart, formatPercentageWithCommas } from '../utils/number-formatting';
import { useSystemSettings } from '../hooks/useSystemSettings';
import { LCATProjectRoleSelectionDialog } from './LCATProjectRoleSelectionDialog';

// SortableRow component for drag-and-drop functionality
interface SortableRowProps {
  category: LaborCategoryInput;
  index: number;
  result: LaborCategoryResult;
  editing: boolean;
  onUpdateCategory: (index: number, field: keyof LaborCategoryInput, value: any) => void;
  onDeleteCategory: (index: number) => void;
  onEditCategory: (index: number) => void;
  onSaveCategory: (index: number) => void;
  onCancelEdit: (index: number) => void;
  onDuplicateCategory: (index: number) => void;
  isEditing: (index: number) => boolean;
  calculateCategoryResult: (category: LaborCategoryInput) => LaborCategoryResult;
  systemSettings: any;
  companyRoles: CompanyRole[];
  handleCapacityInputChange: (index: number, value: string) => void;
  handleCapacityInputBlur: (index: number) => void;
  handleCapacityInputFocus: (index: number) => void;
  capacityInputValues: { [key: number]: string };
}

const SortableRow: React.FC<SortableRowProps> = ({
  category,
  index,
  result,
  editing,
  onUpdateCategory,
  onDeleteCategory,
  onEditCategory,
  onSaveCategory,
  onCancelEdit,
  onDuplicateCategory,
  isEditing,
  calculateCategoryResult,
  systemSettings,
  companyRoles,
  handleCapacityInputChange,
  handleCapacityInputBlur,
  handleCapacityInputFocus,
  capacityInputValues,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id || `temp-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow 
      ref={setNodeRef} 
      style={style} 
      hover
      sx={{ 
        backgroundColor: isDragging ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
        '&:hover': {
          backgroundColor: isDragging ? 'rgba(0, 0, 0, 0.04)' : 'rgba(0, 0, 0, 0.04)',
        }
      }}
    >
      {/* Drag Handle */}
      <TableCell sx={{ width: 40, p: 1 }}>
        <IconButton
          {...attributes}
          {...listeners}
          size="small"
          sx={{ 
            cursor: 'grab',
            '&:active': { cursor: 'grabbing' },
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' }
          }}
        >
          <DragIndicatorIcon fontSize="small" />
        </IconButton>
      </TableCell>

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
            {category.projectRoleDescription && (
              <Typography variant="caption" color="text.secondary">
                {category.projectRoleDescription}
              </Typography>
            )}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No role selected
          </Typography>
        )}
      </TableCell>

      {/* Company Role - Always Editable */}
      <TableCell>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={category.companyRoleId || ''}
            onChange={(e) => onUpdateCategory(index, 'companyRoleId', e.target.value)}
            displayEmpty
          >
            <MenuItem value="">
              <em>Select Company Role</em>
            </MenuItem>
            {companyRoles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name} - {formatCurrencyWithCommas(role.rate)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </TableCell>

      {/* LCAT Rate */}
      <TableCell align="right">
        <Typography variant="body2" fontWeight="medium">
          {formatCurrencyWithCommas(category.lcatRate || 0)}
        </Typography>
      </TableCell>

      {/* Company Minimum Rate */}
      <TableCell align="right">
        <Typography variant="body2" fontWeight="medium" color="primary">
          {formatCurrencyWithCommas(result.companyMinimumRate)}
        </Typography>
      </TableCell>

      {/* Final Rate - Always Editable */}
      <TableCell>
        <TextField
          size="small"
          type="number"
          value={category.finalRate || ''}
          onChange={(e) => onUpdateCategory(index, 'finalRate', parseFloat(e.target.value) || 0)}
          InputProps={{
            startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
          }}
          sx={{ width: 120 }}
        />
      </TableCell>

      {/* Final Rate Discount */}
      <TableCell align="right">
        <Typography variant="body2" color="error">
          {formatPercentageWithCommas(result.finalRateDiscount)}
        </Typography>
      </TableCell>

      {/* Hours */}
      <TableCell>
        {editing ? (
          <TextField
            size="small"
            type="number"
            value={category.hours || ''}
            onChange={(e) => onUpdateCategory(index, 'hours', parseInt(e.target.value) || 0)}
            sx={{ width: 80 }}
          />
        ) : (
          <Typography variant="body2">
            {formatNumberWithCommas(category.hours)}
          </Typography>
        )}
      </TableCell>

      {/* FTE Percentage */}
      <TableCell>
        {editing ? (
          <TextField
            size="small"
            type="number"
            value={category.ftePercentage || ''}
            onChange={(e) => onUpdateCategory(index, 'ftePercentage', parseFloat(e.target.value) || 0)}
            InputProps={{
              endAdornment: <Typography sx={{ ml: 1 }}>%</Typography>,
            }}
            sx={{ width: 80 }}
          />
        ) : (
          <Typography variant="body2">
            {formatPercentageWithCommas(category.ftePercentage)}
          </Typography>
        )}
      </TableCell>

      {/* Capacity */}
      <TableCell>
        <TextField
          size="small"
          type="text"
          value={capacityInputValues[index] ?? category.capacity}
          onChange={(e) => handleCapacityInputChange(index, e.target.value)}
          onFocus={() => handleCapacityInputFocus(index)}
          onBlur={() => handleCapacityInputBlur(index)}
          sx={{ width: 80 }}
        />
      </TableCell>

      {/* Effective Hours */}
      <TableCell align="right">
        <Typography variant="body2" fontWeight="medium">
          {formatNumberWithCommas(result.effectiveHours)}
        </Typography>
      </TableCell>

      {/* Annual Salary Estimate */}
      <TableCell align="right">
        <Typography variant="body2" fontWeight="medium">
          {formatCurrencyWithCommas(result.annualSalary)}
        </Typography>
      </TableCell>

      {/* Wrap */}
      <TableCell align="right">
        <Typography variant="body2" fontWeight="medium">
          {formatCurrencyWithCommas(result.wrapAmount)}
        </Typography>
      </TableCell>

      {/* Minimum Profit */}
      <TableCell align="right">
        <Typography variant="body2" fontWeight="medium">
          {formatCurrencyWithCommas(result.minimumProfitAmount)}
        </Typography>
      </TableCell>

      {/* Minimum Annual Revenue */}
      <TableCell align="right">
        <Typography variant="body2" fontWeight="medium">
          {formatCurrencyWithCommas(result.minimumAnnualRevenue)}
        </Typography>
      </TableCell>

      {/* Total Cost */}
      <TableCell align="right">
        <Typography variant="body2" fontWeight="bold" color="primary">
          {formatCurrencyWithCommas(result.totalCost)}
        </Typography>
      </TableCell>

      {/* Actual Cost */}
      <TableCell align="right">
        <Typography variant="body2" fontWeight="medium">
          {formatCurrencyWithCommas(result.actualCost)}
        </Typography>
      </TableCell>

      {/* Actual Profit */}
      <TableCell align="right">
        <Typography variant="body2" fontWeight="medium" color={result.actualProfit >= 0 ? 'success.main' : 'error.main'}>
          {formatCurrencyWithCommas(result.actualProfit)}
        </Typography>
      </TableCell>

      {/* Actual Profit (%) */}
      <TableCell align="right">
        <Typography variant="body2" fontWeight="medium" color={result.actualProfitPercentage >= 0 ? 'success.main' : 'error.main'}>
          {formatPercentageWithCommas(result.actualProfitPercentage)}
        </Typography>
      </TableCell>

      {/* Actions */}
      <TableCell align="center">
        <Box display="flex" gap={1} justifyContent="center">
          {editing ? (
            <>
              <Tooltip title="Save">
                <IconButton size="small" onClick={() => onSaveCategory(index)} color="primary">
                  <SaveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton size="small" onClick={() => onCancelEdit(index)} color="secondary">
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => onEditCategory(index)} color="primary">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Duplicate">
                <IconButton size="small" onClick={() => onDuplicateCategory(index)} color="info">
                  <DuplicateIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => onDeleteCategory(index)} color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
};

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
    // New properties for enhanced calculations
    totalCost: 0,
    totalActualCost: 0,
    totalActualProfit: 0,
    averageActualProfitPercentage: 0,
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = categories.findIndex(category => (category.id || `temp-${categories.indexOf(category)}`) === active.id);
      const newIndex = categories.findIndex(category => (category.id || `temp-${categories.indexOf(category)}`) === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newCategories = arrayMove(categories, oldIndex, newIndex);
        onCategoriesChange(newCategories);
      }
    }
  };
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
    quantity?: number;
  }) => {
    const quantity = selection.quantity || 1;
    const newCategories: LaborCategoryInput[] = [];

    // Create multiple labor category entries based on quantity
    for (let i = 0; i < quantity; i++) {
    const newCategory: LaborCategoryInput = {
        id: `temp-${Date.now()}-${i}`, // Unique ID for each instance
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
        // Company Role data - provide defaults if not provided
        companyRoleId: selection.companyRole?.id || 'default-company-role',
        companyRoleName: selection.companyRole?.name || 'Default Company Role',
        companyRoleRate: selection.companyRole?.rate || selection.lcat.rate,
      // Final Rate with metadata
      finalRate: selection.finalRate || selection.lcat.rate,
      finalRateMetadata: {
        source: selection.companyRole ? 'company' : 'lcat',
        reason: selection.companyRole ? 'Mapped to company role' : 'Using LCAT rate',
        timestamp: new Date().toISOString(),
        userId: 'current-user', // In real app, get from auth context
      },
    };

      newCategories.push(newCategory);
    }
    
    // Use functional update to ensure we get the latest state
    onCategoriesChange((prevCategories: LaborCategoryInput[]) => {
      const updated = [...prevCategories, ...newCategories];
      console.log(`Adding ${quantity} labor category instances: ${selection.lcat.name} - ${selection.projectRole.name}. Total categories: ${updated.length}`);
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
    const baseResult = LaborCategoryService.calculateTotalCost(category, overheadRate, gaRate, feeRate);
    
    // Calculate extended properties
    const annualSalary = category.finalRate * baseResult.effectiveHours;
    const wrapAmount = Number(calculateWrapAmount(annualSalary)) || 0;
    const minimumProfitAmount = Number(calculateMinimumProfitAmount(annualSalary, wrapAmount)) || 0;
    const minimumAnnualRevenue = annualSalary + wrapAmount + minimumProfitAmount;
    const companyMinimumRate = baseResult.effectiveHours > 0 ? minimumAnnualRevenue / baseResult.effectiveHours : 0;
    const actualCost = (Number(category.companyRoleRate) + wrapAmount) * category.capacity;
    const actualProfit = baseResult.totalCost - ((annualSalary + wrapAmount) * category.capacity);
    const actualProfitPercentage = ((annualSalary + wrapAmount) * category.capacity + actualProfit) !== 0
      ? (actualProfit / ((annualSalary + wrapAmount) * category.capacity + actualProfit)) * 100
      : 0;
    
    // Calculate final rate discount as percentage
    const lcatRate = Number(category.lcatRate) || 0;
    const finalRateDiscount = lcatRate > 0 ? ((lcatRate - category.finalRate) / lcatRate) * 100 : 0;
    
    return {
      ...baseResult,
      annualSalary,
      wrapAmount,
      minimumProfitAmount,
      minimumAnnualRevenue,
      companyMinimumRate,
      actualCost,
      actualProfit,
      actualProfitPercentage,
      finalRateDiscount,
    };
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

  // Capacity input handlers for better UX
  const handleCapacityChange = (index: number, value: string) => {
    setCapacityInputValues(prev => ({ ...prev, [index]: value }));
  };

  const handleCapacityBlur = (index: number) => {
    const inputValue = capacityInputValues[index];
    if (inputValue === undefined) return;

    let numValue = parseFloat(inputValue);

    // Handle empty or invalid input - default to 1
    if (!inputValue || isNaN(numValue)) {
      numValue = 1;
    }

    // Handle leading decimal (e.g., ".5" becomes "0.5")
    if (inputValue.startsWith('.')) {
      numValue = parseFloat(`0${inputValue}`);
    }

    // Ensure minimum value of 0
    numValue = Math.max(0, numValue);

    // Update the category
    updateCategory(index, 'capacity', numValue);

    // Clear the local input state
    setCapacityInputValues(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
  };

  const handleCapacityFocus = (index: number) => {
    // Select all text on focus for easy replacement
    const category = categories[index];
    if (category) {
      setCapacityInputValues(prev => ({ ...prev, [index]: String(category.capacity) }));
    }
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
              <TableCell sx={{ fontWeight: 'bold', width: 40 }}>Drag</TableCell>
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={categories.map(category => category.id || `temp-${categories.indexOf(category)}`)}
                strategy={verticalListSortingStrategy}
              >
            {categories.map((category, index) => {
              const result = calculateCategoryResult(category);
              const editing = isEditing(index);
              
              return (
                    <SortableRow
                      key={category.id || `temp-${index}`}
                      category={category}
                      index={index}
                      result={result}
                      editing={editing}
                      onUpdateCategory={updateCategory}
                      onDeleteCategory={removeCategory}
                      onEditCategory={startEditing}
                      onSaveCategory={saveEditing}
                      onCancelEdit={cancelEditing}
                      onDuplicateCategory={duplicateCategory}
                      isEditing={isEditing}
                      calculateCategoryResult={calculateCategoryResult}
                      systemSettings={settings}
                      companyRoles={companyRoles}
                      handleCapacityInputChange={handleCapacityChange}
                      handleCapacityInputBlur={handleCapacityBlur}
                      handleCapacityInputFocus={handleCapacityFocus}
                      capacityInputValues={capacityInputValues}
                    />
              );
            })}
              </SortableContext>
            </DndContext>
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
                      Labor Categories
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
                      {formatNumberWithCommas(summary.totalEffectiveHours)}
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
                      {formatCurrencyWithCommas(summary.totalCost)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Cost
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
                      {formatCurrencyWithCommas(summary.totalActualProfit)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Actual Profit
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {/* LCAT Project Role Selection Dialog */}
      <LCATProjectRoleSelectionDialog
        open={lcatDialogOpen}
        onClose={() => setLcatDialogOpen(false)}
        onSelect={handleLCATProjectRoleSelection}
      />

      {/* Floating Speed Dial for Actions */}
        <SpeedDial
        ariaLabel="Labor Category Actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
          onClose={() => setSpeedDialOpen(false)}
          onOpen={() => setSpeedDialOpen(true)}
          open={speedDialOpen}
        >
            <SpeedDialAction
          icon={<AddIcon />}
          tooltipTitle="Add from LCAT Management"
          onClick={() => setLcatDialogOpen(true)}
        />
        <SpeedDialAction
          icon={<LibraryIcon />}
          tooltipTitle="Add from Template"
          onClick={() => console.log('Not implemented')}
        />
        <SpeedDialAction
          icon={<ClearAllIcon />}
          tooltipTitle="Clear All"
          onClick={() => onCategoriesChange([])}
        />
      </SpeedDial>
    </Box>
  );
};

export default LaborCategoriesInput;
