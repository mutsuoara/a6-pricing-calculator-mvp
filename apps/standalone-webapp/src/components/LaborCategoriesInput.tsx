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
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { LaborCategoryInput, LaborCategoryResult, LaborCategorySummary, ValidationError } from '../types/labor-category';
import { LaborCategoryService } from '../services/labor-category.service';

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

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          Labor Categories
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={addCategory}
          disabled={disabled}
          sx={{ 
            backgroundColor: '#1976d2',
            '&:hover': { backgroundColor: '#1565c0' }
          }}
        >
          Add Category
        </Button>
      </Box>

      {/* Categories Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Base Rate</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Hours</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">FTE %</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Effective Hours</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Clearance</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Location</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Burdened Rate</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Total Cost</TableCell>
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
                        helperText={getFieldError(index, 'title')}
                        disabled={disabled}
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
                        helperText={getFieldError(index, 'baseRate')}
                        disabled={disabled}
                        sx={{ width: 100 }}
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
                        helperText={getFieldError(index, 'hours')}
                        disabled={disabled}
                        sx={{ width: 80 }}
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
                        helperText={getFieldError(index, 'ftePercentage')}
                        disabled={disabled}
                        sx={{ width: 80 }}
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
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={category.clearanceLevel}
                          onChange={(e) => updateCategory(index, 'clearanceLevel', e.target.value)}
                          disabled={disabled}
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
                      <FormControl size="small" sx={{ minWidth: 100 }}>
                        <Select
                          value={category.location}
                          onChange={(e) => updateCategory(index, 'location', e.target.value)}
                          disabled={disabled}
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

      {/* Summary Cards */}
      {categories.length > 0 && (
        <Box mt={3}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {summary.totalCategories}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Categories
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {summary.totalEffectiveHours.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Effective Hours
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    {LaborCategoryService.formatCurrency(summary.averageBurdenedRate)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Burdened Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    {LaborCategoryService.formatCurrency(summary.totalBurdenedCost)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Labor Cost
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Empty State */}
      {categories.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No labor categories added yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Click "Add Category" to start building your project team
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addCategory}
            disabled={disabled}
          >
            Add First Category
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default LaborCategoriesInput;
