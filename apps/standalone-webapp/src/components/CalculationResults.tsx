/**
 * Calculation Results Component
 * Displays real-time calculation results with detailed breakdowns
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Chip,
  Divider,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { LaborCategoryInput, ValidationError } from '../types/labor-category';
import { CalculationResult, LaborCategoryResult, OtherDirectCostResult } from '../../packages/calculator-types/src/pricing';

interface CalculationResultsProps {
  result: CalculationResult | null;
  laborCategories: LaborCategoryInput[];
  otherDirectCosts: any[]; // TODO: Define proper type
  validationWarnings: ValidationError[];
  isLoading?: boolean;
}

const CalculationResults: React.FC<CalculationResultsProps> = ({
  result,
  laborCategories,
  otherDirectCosts,
  validationWarnings,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card elevation={2} sx={{ mt: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              Calculating results...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card elevation={2} sx={{ mt: 3 }}>
        <CardContent>
          <Alert severity="info">
            <AlertTitle>No Calculation Results</AlertTitle>
            Add labor categories and configure project settings to see calculation results.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatHours = (hours: number) => {
    return hours.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  return (
    <Box mt={3}>
      {/* Total Project Cost - Prominent Display */}
      <Card elevation={3} sx={{ mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            {formatCurrency(result.totals.totalCost)}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Total Project Cost
          </Typography>
        </CardContent>
      </Card>

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Calculation Warnings</AlertTitle>
          {validationWarnings.map((warning, index) => (
            <Typography key={index} variant="body2">
              • {warning.message}
            </Typography>
          ))}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Cost Breakdown Summary */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold" display="flex" alignItems="center">
                <MoneyIcon sx={{ mr: 1 }} />
                Cost Breakdown
              </Typography>
              <Box mt={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
                  <Typography variant="body1">Labor Costs:</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency(result.totals.laborCost)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
                  <Typography variant="body1">Other Direct Costs:</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency(result.totals.odcCost)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
                  <Typography variant="h6" fontWeight="bold">Total Project Cost:</Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    {formatCurrency(result.totals.totalCost)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Project Summary */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold" display="flex" alignItems="center">
                <PeopleIcon sx={{ mr: 1 }} />
                Project Summary
              </Typography>
              <Box mt={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
                  <Typography variant="body1">Total Hours:</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatHours(result.totals.totalEffectiveHours)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
                  <Typography variant="body1">Average Burdened Rate:</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency(result.totals.averageBurdenedRate)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
                  <Typography variant="body1">Labor Categories:</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {result.laborCategories.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Labor Categories Breakdown */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold" display="flex" alignItems="center">
                <ScheduleIcon sx={{ mr: 1 }} />
                Labor Categories Breakdown
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">Base Rate</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">Hours</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">FTE%</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">Effective Hours</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="center">Clearance</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="center">Location</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">Burdened Rate</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">Total Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.laborCategories.map((category, index) => (
                      <TableRow key={category.id || index} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {category.title}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(category.baseRate)}
                        </TableCell>
                        <TableCell align="right">
                          {formatHours(category.hours)}
                        </TableCell>
                        <TableCell align="right">
                          {formatPercentage(category.ftePercentage / 100)}
                        </TableCell>
                        <TableCell align="right">
                          {formatHours(category.effectiveHours)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={category.clearanceLevel}
                            size="small"
                            color={
                              category.clearanceLevel === 'Top Secret' ? 'error' :
                              category.clearanceLevel === 'Secret' ? 'warning' :
                              category.clearanceLevel === 'Public Trust' ? 'info' : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={category.location}
                            size="small"
                            variant="outlined"
                            color={
                              category.location === 'On-site' ? 'primary' :
                              category.location === 'Hybrid' ? 'secondary' : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(category.burdenedRate)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {formatCurrency(category.totalCost)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Other Direct Costs Breakdown */}
        {result.otherDirectCosts && result.otherDirectCosts.length > 0 && (
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold" display="flex" alignItems="center">
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  Other Direct Costs Breakdown
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Amount</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Tax Rate</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Tax Amount</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Total Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.otherDirectCosts.map((odc, index) => (
                        <TableRow key={odc.id || index} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {odc.description}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(odc.amount)}
                          </TableCell>
                          <TableCell align="right">
                            {formatPercentage(odc.taxRate)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(odc.taxAmount)}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold" color="primary">
                              {formatCurrency(odc.totalAmount)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default CalculationResults;
