/**
 * Labor Categories Demo Page
 * Demonstrates the Labor Categories Input component with sample data
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton,
  Tooltip,
  Button,
  Alert,
  Collapse,
} from '@mui/material';
import { Info as InfoIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { LaborCategoryInput, ValidationError, OverridePermissions, ValidationContext } from '../types/labor-category';
import LaborCategoriesInput from '../components/LaborCategoriesInput';
import ValidationAlert from '../components/ValidationAlert';
import ContractVehicleSelector from '../components/ContractVehicleSelector';
import UserPermissionsSelector from '../components/UserPermissionsSelector';

export const LaborCategoriesDemo: React.FC = () => {
  const [categories, setCategories] = useState<LaborCategoryInput[]>([
    {
      id: '1',
      title: 'Senior Software Engineer',
      baseRate: 85.00,
      hours: 2080,
      ftePercentage: 100,
      clearanceLevel: 'Secret',
      location: 'On-site',
    },
    {
      id: '2',
      title: 'Project Manager',
      baseRate: 95.00,
      hours: 2080,
      ftePercentage: 100,
      clearanceLevel: 'Public Trust',
      location: 'Hybrid',
    },
    {
      id: '3',
      title: 'Business Analyst',
      baseRate: 75.00,
      hours: 1040,
      ftePercentage: 50,
      clearanceLevel: 'None',
      location: 'Remote',
    },
  ]);

  const [overheadRate, setOverheadRate] = useState(0.30);
  const [gaRate, setGaRate] = useState(0.15);
  const [feeRate, setFeeRate] = useState(0.10);
  const [contractVehicle, setContractVehicle] = useState<string | undefined>();
  const [permissions, setPermissions] = useState<OverridePermissions>({
    canOverrideRates: false,
    canOverrideContractLimits: false,
    canOverrideValidation: false,
    userRole: 'analyst',
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<ValidationError[]>([]);
  const [showValidationDetails, setShowValidationDetails] = useState(false);
  const [overriddenFields, setOverriddenFields] = useState<Set<string>>(new Set());

  const handleCategoriesChange = (newCategories: LaborCategoryInput[]) => {
    setCategories(newCategories);
  };

  const handleOverheadRateChange = (_: Event, newValue: number | number[]) => {
    setOverheadRate(newValue as number);
  };

  const handleGaRateChange = (_: Event, newValue: number | number[]) => {
    setGaRate(newValue as number);
  };

  const handleFeeRateChange = (_: Event, newValue: number | number[]) => {
    setFeeRate(newValue as number);
  };

  // Validation logic
  const validateRates = useCallback(() => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Basic validation
    if (overheadRate < 0) {
      errors.push({
        field: 'overheadRate',
        message: 'Overhead rate cannot be negative',
        value: overheadRate,
        severity: 'error',
        canOverride: false,
      });
    }

    if (gaRate < 0) {
      errors.push({
        field: 'gaRate',
        message: 'G&A rate cannot be negative',
        value: gaRate,
        severity: 'error',
        canOverride: false,
      });
    }

    if (feeRate < 0) {
      errors.push({
        field: 'feeRate',
        message: 'Fee rate cannot be negative',
        value: feeRate,
        severity: 'error',
        canOverride: false,
      });
    }

    // Contract vehicle specific validation
    if (contractVehicle) {
      const contractLimits = getContractVehicleLimits(contractVehicle);
      
      if (contractLimits) {
        // Check overhead rate against contract limits
        if (overheadRate > contractLimits.maxOverheadRate) {
          const canOverride = permissions.canOverrideContractLimits;
          const error: ValidationError = {
            field: 'overheadRate',
            message: `Overhead rate (${(overheadRate * 100).toFixed(1)}%) exceeds ${contractVehicle} limit (${(contractLimits.maxOverheadRate * 100).toFixed(0)}%)`,
            value: overheadRate,
            severity: canOverride ? 'warning' : 'error',
            canOverride,
          };
          if (canOverride) {
            error.overrideReason = 'Contract vehicle limit exceeded';
          }
          if (overriddenFields.has('overheadRate')) {
            warnings.push(error);
          } else {
            (canOverride ? warnings : errors).push(error);
          }
        }

        // Check G&A rate against contract limits
        if (gaRate > contractLimits.maxGaRate) {
          const canOverride = permissions.canOverrideContractLimits;
          const error: ValidationError = {
            field: 'gaRate',
            message: `G&A rate (${(gaRate * 100).toFixed(1)}%) exceeds ${contractVehicle} limit (${(contractLimits.maxGaRate * 100).toFixed(0)}%)`,
            value: gaRate,
            severity: canOverride ? 'warning' : 'error',
            canOverride,
          };
          if (canOverride) {
            error.overrideReason = 'Contract vehicle limit exceeded';
          }
          if (overriddenFields.has('gaRate')) {
            warnings.push(error);
          } else {
            (canOverride ? warnings : errors).push(error);
          }
        }

        // Check fee rate against contract limits
        if (feeRate > contractLimits.maxFeeRate) {
          const canOverride = permissions.canOverrideContractLimits;
          const error: ValidationError = {
            field: 'feeRate',
            message: `Fee rate (${(feeRate * 100).toFixed(1)}%) exceeds ${contractVehicle} limit (${(contractLimits.maxFeeRate * 100).toFixed(0)}%)`,
            value: feeRate,
            severity: canOverride ? 'warning' : 'error',
            canOverride,
          };
          if (canOverride) {
            error.overrideReason = 'Contract vehicle limit exceeded';
          }
          if (overriddenFields.has('feeRate')) {
            warnings.push(error);
          } else {
            (canOverride ? warnings : errors).push(error);
          }
        }
      }
    } else {
      // Fallback to general limits when no contract vehicle specified
      if (overheadRate > 1) { // 100%
        const canOverride = permissions.canOverrideRates;
        const error: ValidationError = {
          field: 'overheadRate',
          message: 'Overhead rate exceeds 100% - consider selecting a contract vehicle for specific limits',
          value: overheadRate,
          severity: canOverride ? 'warning' : 'error',
          canOverride,
        };
        if (canOverride) {
          error.overrideReason = 'General rate limit exceeded';
        }
        if (overriddenFields.has('overheadRate')) {
          warnings.push(error);
        } else {
          (canOverride ? warnings : errors).push(error);
        }
      }

      if (gaRate > 0.5) { // 50%
        const canOverride = permissions.canOverrideRates;
        const error: ValidationError = {
          field: 'gaRate',
          message: 'G&A rate exceeds 50% - consider selecting a contract vehicle for specific limits',
          value: gaRate,
          severity: canOverride ? 'warning' : 'error',
          canOverride,
        };
        if (canOverride) {
          error.overrideReason = 'General rate limit exceeded';
        }
        if (overriddenFields.has('gaRate')) {
          warnings.push(error);
        } else {
          (canOverride ? warnings : errors).push(error);
        }
      }

      if (feeRate > 0.2) { // 20%
        const canOverride = permissions.canOverrideRates;
        const error: ValidationError = {
          field: 'feeRate',
          message: 'Fee rate exceeds 20% - consider selecting a contract vehicle for specific limits',
          value: feeRate,
          severity: canOverride ? 'warning' : 'error',
          canOverride,
        };
        if (canOverride) {
          error.overrideReason = 'General rate limit exceeded';
        }
        if (overriddenFields.has('feeRate')) {
          warnings.push(error);
        } else {
          (canOverride ? warnings : errors).push(error);
        }
      }
    }

    setValidationErrors(errors);
    setValidationWarnings(warnings);
  }, [overheadRate, gaRate, feeRate, contractVehicle, permissions, overriddenFields]);

  // Contract vehicle limits
  const getContractVehicleLimits = (vehicle: string) => {
    const limits: Record<string, { maxOverheadRate: number; maxGaRate: number; maxFeeRate: number }> = {
      'GSA MAS': { maxOverheadRate: 0.40, maxGaRate: 0.15, maxFeeRate: 0.10 },
      'VA SPRUCE': { maxOverheadRate: 0.35, maxGaRate: 0.12, maxFeeRate: 0.08 },
      'OPM (GSA)': { maxOverheadRate: 0.38, maxGaRate: 0.14, maxFeeRate: 0.09 },
      'HHS SWIFT (GSA)': { maxOverheadRate: 0.42, maxGaRate: 0.16, maxFeeRate: 0.11 },
      '8(a)': { maxOverheadRate: 0.35, maxGaRate: 0.12, maxFeeRate: 0.08 },
      'SBIR': { maxOverheadRate: 0.25, maxGaRate: 0.10, maxFeeRate: 0.05 },
      'IDIQ': { maxOverheadRate: 0.50, maxGaRate: 0.20, maxFeeRate: 0.15 },
    };
    
    return limits[vehicle] || null;
  };

  // Override handlers
  const handleOverride = (field: string) => {
    setOverriddenFields(prev => new Set([...prev, field]));
    validateRates();
  };

  const handleDismiss = (field: string) => {
    setOverriddenFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(field);
      return newSet;
    });
    validateRates();
  };

  // Run validation when rates or permissions change
  React.useEffect(() => {
    validateRates();
  }, [validateRates]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Labor Categories Input Demo
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Professional table-based input for managing labor categories with real-time calculations
        </Typography>
      </Box>

      {/* Settings Panel */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Project Settings
        </Typography>
        
        {/* Contract Vehicle Selection */}
        <Box mb={3}>
          <ContractVehicleSelector
            selectedVehicle={contractVehicle}
            onVehicleChange={setContractVehicle}
          />
        </Box>

        {/* Rate Settings */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="subtitle1">
                Overhead Rate: {(overheadRate * 100).toFixed(1)}%
              </Typography>
              <Tooltip title="Indirect costs for facilities, equipment, and administrative support. Typically 20-40% for government contracts.">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Slider
              value={overheadRate}
              onChange={handleOverheadRateChange}
              min={0}
              max={contractVehicle ? getContractVehicleLimits(contractVehicle)?.maxOverheadRate || 1 : 1}
              step={0.01}
              marks={[
                { value: 0, label: '0%' },
                { value: 0.25, label: '25%' },
                { value: 0.5, label: '50%' },
                { value: 0.75, label: '75%' },
                { value: 1, label: '100%' },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${(value * 100).toFixed(1)}%`}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="subtitle1">
                G&A Rate: {(gaRate * 100).toFixed(1)}%
              </Typography>
              <Tooltip title="General & Administrative costs for corporate overhead, executive management, and business development. Usually 8-15%.">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Slider
              value={gaRate}
              onChange={handleGaRateChange}
              min={0}
              max={contractVehicle ? getContractVehicleLimits(contractVehicle)?.maxGaRate || 0.5 : 0.5}
              step={0.01}
              marks={[
                { value: 0, label: '0%' },
                { value: 0.25, label: '25%' },
                { value: 0.5, label: '50%' },
                { value: 0.75, label: '75%' },
                { value: 1, label: '100%' },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${(value * 100).toFixed(1)}%`}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="subtitle1">
                Fee Rate: {(feeRate * 100).toFixed(1)}%
              </Typography>
              <Tooltip title="Profit margin added to total costs. Varies by contract type: FFP (5-15%), T&M (2-8%), CPFF (1-5%).">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Slider
              value={feeRate}
              onChange={handleFeeRateChange}
              min={0}
              max={contractVehicle ? getContractVehicleLimits(contractVehicle)?.maxFeeRate || 0.2 : 0.2}
              step={0.01}
              marks={[
                { value: 0, label: '0%' },
                { value: 0.25, label: '25%' },
                { value: 0.5, label: '50%' },
                { value: 0.75, label: '75%' },
                { value: 1, label: '100%' },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${(value * 100).toFixed(1)}%`}
            />
          </Grid>
        </Grid>

        {/* Validation Alerts */}
        <Box mt={3}>
          <ValidationAlert
            errors={validationErrors}
            warnings={validationWarnings}
            permissions={permissions}
            onOverride={handleOverride}
            onDismiss={handleDismiss}
            expanded={showValidationDetails}
            onToggleExpanded={() => setShowValidationDetails(!showValidationDetails)}
          />
        </Box>
      </Paper>

      {/* User Permissions Panel */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <UserPermissionsSelector
          permissions={permissions}
          onPermissionsChange={setPermissions}
        />
      </Paper>

      {/* Labor Categories Input */}
      <LaborCategoriesInput
        categories={categories}
        onCategoriesChange={handleCategoriesChange}
        overheadRate={overheadRate}
        gaRate={gaRate}
        feeRate={feeRate}
      />

      {/* Features Overview */}
      <Box mt={6}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Features Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  🎯 Real-time Calculations
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Effective hours calculated automatically (Hours × FTE%)
                  • Burdened rates updated instantly with clearance premiums
                  • Total costs recalculated as you type
                  • Summary statistics updated in real-time
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  ✅ Input Validation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Base rate validation ($1-$1000)
                  • Hours validation (1-10000)
                  • FTE percentage validation (0.01%-100%)
                  • Inline error messages with specific guidance
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  🎨 Professional UI
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Color-coded clearance levels (None/Public Trust/Secret/Top Secret)
                  • Location icons (Remote/On-site/Hybrid)
                  • Professional government contracting appearance
                  • Responsive design for all screen sizes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  ⚡ Performance Optimized
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Debounced input handling prevents excessive calculations
                  • Efficient state management with React hooks
                  • Optimized re-rendering with proper dependencies
                  • Smooth user experience without lag
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Technical Details */}
      <Box mt={6}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Technical Implementation
        </Typography>
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="body1" paragraph>
            The Labor Categories Input component is built with React, TypeScript, and Material-UI, 
            providing a professional interface for managing project staffing. Key technical features include:
          </Typography>
          <Typography variant="body1" component="div">
            <ul>
              <li><strong>Type Safety:</strong> Full TypeScript interfaces for all data structures</li>
              <li><strong>Service Layer:</strong> Dedicated service class for calculations and validation</li>
              <li><strong>State Management:</strong> Efficient local state with React hooks</li>
              <li><strong>Validation:</strong> Comprehensive input validation with user-friendly error messages</li>
              <li><strong>Accessibility:</strong> WCAG 2.2 AA compliance with proper ARIA labels</li>
              <li><strong>Responsive Design:</strong> Mobile-first approach with Material-UI breakpoints</li>
            </ul>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default LaborCategoriesDemo;
