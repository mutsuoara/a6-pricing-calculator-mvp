/**
 * Labor Categories Demo Page
 * Demonstrates the Labor Categories Input component with sample data
 */

import React, { useState } from 'react';
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
} from '@mui/material';
import { LaborCategoryInput } from '../types/labor-category';
import LaborCategoriesInput from '../components/LaborCategoriesInput';

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
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Overhead Rate: {(overheadRate * 100).toFixed(1)}%
            </Typography>
            <Slider
              value={overheadRate}
              onChange={handleOverheadRateChange}
              min={0}
              max={2}
              step={0.01}
              marks={[
                { value: 0, label: '0%' },
                { value: 0.5, label: '50%' },
                { value: 1, label: '100%' },
                { value: 1.5, label: '150%' },
                { value: 2, label: '200%' },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${(value * 100).toFixed(1)}%`}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              G&A Rate: {(gaRate * 100).toFixed(1)}%
            </Typography>
            <Slider
              value={gaRate}
              onChange={handleGaRateChange}
              min={0}
              max={2}
              step={0.01}
              marks={[
                { value: 0, label: '0%' },
                { value: 0.5, label: '50%' },
                { value: 1, label: '100%' },
                { value: 1.5, label: '150%' },
                { value: 2, label: '200%' },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${(value * 100).toFixed(1)}%`}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Fee Rate: {(feeRate * 100).toFixed(1)}%
            </Typography>
            <Slider
              value={feeRate}
              onChange={handleFeeRateChange}
              min={0}
              max={1}
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
