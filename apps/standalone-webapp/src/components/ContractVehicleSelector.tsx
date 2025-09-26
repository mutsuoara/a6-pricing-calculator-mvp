/**
 * Contract Vehicle Selector Component
 * Allows users to select contract vehicles and view their rate limits
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

interface ContractVehicle {
  id: string;
  name: string;
  code: string;
  description: string;
  maxOverheadRate: number;
  maxGaRate: number;
  maxFeeRate: number;
  complianceRequirements: string[];
}

interface ContractVehicleSelectorProps {
  selectedVehicle?: string;
  onVehicleChange: (vehicle: string | undefined) => void;
  disabled?: boolean;
}

export const ContractVehicleSelector: React.FC<ContractVehicleSelectorProps> = ({
  selectedVehicle,
  onVehicleChange,
  disabled = false,
}) => {
  const [vehicles, setVehicles] = useState<ContractVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3002/api/labor-categories/contract-vehicles');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setVehicles(data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching contract vehicles:', err);
        setError('Failed to load contract vehicles');
        // Fallback to hardcoded vehicles
        setVehicles([
          {
            id: '1',
            name: 'GSA MAS',
            code: 'GSA_MAS',
            description: 'General Services Administration Multiple Award Schedule',
            maxOverheadRate: 0.40,
            maxGaRate: 0.15,
            maxFeeRate: 0.10,
            complianceRequirements: ['GSA compliance', 'SIN requirements'],
          },
          {
            id: '2',
            name: 'VA SPRUCE',
            code: 'VA_SPRUCE',
            description: 'VA Strategic Partnering for Readiness in Underserved Communities',
            maxOverheadRate: 0.35,
            maxGaRate: 0.12,
            maxFeeRate: 0.08,
            complianceRequirements: ['VA compliance', 'Healthcare focus'],
          },
          {
            id: '3',
            name: 'OPM (GSA)',
            code: 'OPM_GSA',
            description: 'Office of Personnel Management through GSA',
            maxOverheadRate: 0.38,
            maxGaRate: 0.14,
            maxFeeRate: 0.09,
            complianceRequirements: ['OPM compliance', 'HR services'],
          },
          {
            id: '4',
            name: 'HHS SWIFT (GSA)',
            code: 'HHS_SWIFT_GSA',
            description: 'Health and Human Services SWIFT through GSA',
            maxOverheadRate: 0.42,
            maxGaRate: 0.16,
            maxFeeRate: 0.11,
            complianceRequirements: ['HHS compliance', 'Healthcare IT'],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const selectedVehicleData = vehicles.find(v => v.name === selectedVehicle);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={2}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading contract vehicles...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <FormControl fullWidth disabled={disabled}>
        <InputLabel>Contract Vehicle</InputLabel>
        <Select
          value={selectedVehicle || ''}
          onChange={(e) => onVehicleChange(e.target.value || undefined)}
          label="Contract Vehicle"
        >
          <MenuItem value="">
            <em>No Contract Vehicle Selected</em>
          </MenuItem>
          {vehicles.map((vehicle) => (
            <MenuItem key={vehicle.id} value={vehicle.name}>
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {vehicle.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {vehicle.description}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {error && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}

      {selectedVehicleData && (
        <Card sx={{ mt: 2, bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {selectedVehicleData.name} Rate Limits
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {selectedVehicleData.description}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h6" color="primary">
                    {(selectedVehicleData.maxOverheadRate * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Max Overhead
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h6" color="primary">
                    {(selectedVehicleData.maxGaRate * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Max G&A
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h6" color="primary">
                    {(selectedVehicleData.maxFeeRate * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Max Fee
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {selectedVehicleData.complianceRequirements.length > 0 && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Compliance Requirements:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {selectedVehicleData.complianceRequirements.map((requirement, index) => (
                    <Chip
                      key={index}
                      label={requirement}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedVehicle && (
        <Alert severity="info" sx={{ mt: 1 }} icon={<InfoIcon />}>
          <Typography variant="body2">
            Select a contract vehicle to see specific rate limits and compliance requirements.
            Without a selection, general rate limits will apply.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default ContractVehicleSelector;
