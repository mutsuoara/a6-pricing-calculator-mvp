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
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tooltip,
  Divider,
  Grid,
  Card,
  CardContent,
  Fab,
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
import LCATSelectionDialog from './LCATSelectionDialog';

interface LaborCategoriesInputProps {
  categories: LaborCategoryInput[];
  onCategoriesChange: (categories: LaborCategoryInput[]) => void;
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
  const [editingState, setEditingState] = useState<EditingState>({});
  const [errors, setErrors] = useState<Record<string, ValidationError[]>>({});
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

  // Calculate summary whenever categories or rates change
  useEffect(() => {
    const newSummary = LaborCategoryService.calculateSummary(categories, overheadRate, gaRate, feeRate);
    setSummary(newSummary);
  }, [categories, overheadRate, gaRate, feeRate]);

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
    newCategories[index] = { ...newCategories[index], [field]: value };
    onCategoriesChange(newCategories);
  };

  const startEditing = (index: number) => {
    setEditingState(prev => ({
      ...prev,
      [`category_${index}`]: true,
    }));
  };

  const stopEditing = (index: number) => {
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

  const handleLCATSelect = (template: any) => {
    // Get typical rate for the template (use first available vehicle rate or average)
    const vehicleCodes = Object.keys(template.vehicleRates);
    const typicalRate = vehicleCodes.length > 0 
      ? template.vehicleRates[vehicleCodes[0]].typicalRate
      : 75; // Fallback rate

    const newCategory: LaborCategoryInput = {
      id: Date.now().toString(),
      title: template.title,
      baseRate: typicalRate,
      hours: template.typicalHours || 2080,
      ftePercentage: 100,
      clearanceLevel: template.typicalClearanceLevel,
      location: template.typicalLocation,
    };
    
    const newCategories = [...categories, newCategory];
    onCategoriesChange(newCategories);
    
    // Start editing the new category
    setEditingState(prev => ({
      ...prev,
      [`category_${newCategories.length - 1}`]: true,
    }));
  };

  const duplicateCategory = (index: number) => {
    const categoryToDuplicate = categories[index];
    const duplicatedCategory: LaborCategoryInput = {
      ...categoryToDuplicate,
      id: Date.now().toString(),
      title: `${categoryToDuplicate.title} (Copy)`,
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={addCategory}
            disabled={disabled}
            sx={{ 
              backgroundColor: '#1976d2',
              minWidth: '180px',
              height: '40px',
              '&:hover': { backgroundColor: '#1565c0' }
            }}
          >
            Add Labor Category
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
                  Title
                  <Tooltip title="Labor category job title or role name">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                  Base Rate
                  <Tooltip title="Hourly rate before burden (overhead, G&A, fee)">
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
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                  Clearance
                  <Tooltip title="Security clearance level required">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                  Location
                  <Tooltip title="Work location type">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                  Burdened Rate
                  <Tooltip title="Base rate + overhead + G&A + fee + clearance premium">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                  Total Cost
                  <Tooltip title="Burdened rate × effective hours">
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
                  {/* Title */}
                  <TableCell>
                    {editing ? (
                      <TextField
                        fullWidth
                        size="small"
                        value={category.title}
                        onChange={(e) => updateCategory(index, 'title', e.target.value)}
                        error={!!getFieldError(index, 'title')}
                        disabled={disabled}
                        sx={{ 
                          '& .MuiFormHelperText-root': { 
                            position: 'absolute', 
                            top: '100%', 
                            left: 0,
                            margin: 0,
                            fontSize: '0.75rem'
                          }
                        }}
                        helperText={getFieldError(index, 'title')}
                      />
                    ) : (
                      <Typography variant="body2" fontWeight="medium">
                        {category.title || 'Untitled Category'}
                      </Typography>
                    )}
                  </TableCell>

                  {/* Base Rate */}
                  <TableCell align="right">
                    {editing ? (
                      <TextField
                        size="small"
                        type="number"
                        value={category.baseRate}
                        onChange={(e) => updateCategory(index, 'baseRate', parseFloat(e.target.value) || 0)}
                        error={!!getFieldError(index, 'baseRate')}
                        disabled={disabled}
                        sx={{ 
                          width: 100,
                          '& .MuiFormHelperText-root': { 
                            position: 'absolute', 
                            top: '100%', 
                            left: 0,
                            margin: 0,
                            fontSize: '0.75rem'
                          }
                        }}
                        helperText={getFieldError(index, 'baseRate')}
                        inputProps={{ min: 1, max: 1000, step: 0.01 }}
                      />
                    ) : (
                      <Typography variant="body2">
                        {LaborCategoryService.formatCurrency(category.baseRate)}
                      </Typography>
                    )}
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
                        {category.ftePercentage.toFixed(1)}%
                      </Typography>
                    )}
                  </TableCell>

                  {/* Effective Hours */}
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      {result.effectiveHours.toLocaleString()}
                    </Typography>
                  </TableCell>

                  {/* Clearance Level */}
                  <TableCell align="center">
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
                  </TableCell>

                  {/* Location */}
                  <TableCell align="center">
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
                  </TableCell>

                  {/* Burdened Rate */}
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium" color="primary">
                      {LaborCategoryService.formatCurrency(result.burdenedRate)}
                    </Typography>
                  </TableCell>

                  {/* Total Cost */}
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {LaborCategoryService.formatCurrency(result.totalCost)}
                    </Typography>
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="center">
                    {editing ? (
                      <Box display="flex" gap={1}>
                        <Tooltip title="Save">
                          <IconButton
                            size="small"
                            onClick={() => stopEditing(index)}
                            disabled={disabled}
                            color="primary"
                          >
                            <SaveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton
                            size="small"
                            onClick={() => stopEditing(index)}
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
                      {LaborCategoryService.formatCurrency(summary.averageBurdenedRate)}
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
                      {LaborCategoryService.formatCurrency(summary.totalBurdenedCost)}
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
                      {LaborCategoryService.formatCurrency(summary.totalBaseCost)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Base Cost
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                    <Typography variant="h6" color="success.main" fontWeight="bold">
                      {LaborCategoryService.formatCurrency(summary.totalBurdenedCost - summary.totalBaseCost)}
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

      {/* LCAT Selection Dialog */}
      <LCATSelectionDialog
        open={lcatDialogOpen}
        onClose={() => setLcatDialogOpen(false)}
        onSelect={handleLCATSelect}
      />

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
    </Box>
  );
};

export default LaborCategoriesInput;
