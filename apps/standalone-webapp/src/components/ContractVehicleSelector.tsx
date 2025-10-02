/**
 * Contract Vehicle Selector Component
 * Allows users to select contract vehicles and view their rate limits
 */

import React, { useState } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Info as InfoIcon, Add as AddIcon } from '@mui/icons-material';
import { useContractVehicles } from '../hooks/useContractVehicles';

interface ContractVehicleSelectorProps {
  selectedVehicle: string | undefined;
  onVehicleChange: (vehicle: string | undefined, burdenedRates?: { overheadRate: number; gaRate: number; feeRate: number }) => void;
  disabled?: boolean;
}

export const ContractVehicleSelector: React.FC<ContractVehicleSelectorProps> = ({
  selectedVehicle,
  onVehicleChange,
  disabled = false,
}) => {
  const { vehicles, loading, error, createVehicle } = useContractVehicles();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    code: '',
    description: '',
    escalationRate: 0.03,
    startDate: '',
    endDate: '',
    maxOverheadRate: 40,
    maxGaRate: 15,
    maxFeeRate: 10,
    complianceRequirements: [] as string[],
  });


  const handleCreateVehicle = async () => {
    try {
      const createdVehicle = await createVehicle({
        ...newVehicle,
        tenantId: '00000000-0000-0000-0000-000000000000',
        createdBy: 'user',
        isActive: true,
      });
      
      onVehicleChange(createdVehicle.name, {
        overheadRate: createdVehicle.maxOverheadRate / 100,
        gaRate: createdVehicle.maxGaRate / 100,
        feeRate: createdVehicle.maxFeeRate / 100,
      });
      setShowCreateDialog(false);
      setNewVehicle({
        name: '',
        code: '',
        description: '',
        escalationRate: 0.03,
        startDate: '',
        endDate: '',
        maxOverheadRate: 40,
        maxGaRate: 15,
        maxFeeRate: 10,
        complianceRequirements: [],
      });
    } catch (err) {
      console.error('Error creating contract vehicle:', err);
    }
  };

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
          onChange={(e) => {
            const vehicle = e.target.value;
            if (vehicle) {
              const selectedVehicleData = vehicles.find(v => v.name === vehicle);
              if (selectedVehicleData) {
                onVehicleChange(vehicle, {
                  overheadRate: selectedVehicleData.maxOverheadRate / 100,
                  gaRate: selectedVehicleData.maxGaRate / 100,
                  feeRate: selectedVehicleData.maxFeeRate / 100,
                });
              } else {
                onVehicleChange(vehicle);
              }
            } else {
              onVehicleChange(undefined);
            }
          }}
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
          <MenuItem value="__CREATE_NEW__" onClick={(e) => { e.stopPropagation(); setShowCreateDialog(true); }}>
            <Box display="flex" alignItems="center" gap={1}>
              <AddIcon fontSize="small" />
              <Typography variant="body1" color="primary">
                Create New Contract Vehicle
              </Typography>
            </Box>
          </MenuItem>
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
                    {selectedVehicleData.maxOverheadRate ? Number(selectedVehicleData.maxOverheadRate).toFixed(0) : '0'}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Max Overhead
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h6" color="primary">
                    {selectedVehicleData.maxGaRate ? Number(selectedVehicleData.maxGaRate).toFixed(0) : '0'}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Max G&A
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h6" color="primary">
                    {selectedVehicleData.maxFeeRate ? Number(selectedVehicleData.maxFeeRate).toFixed(0) : '0'}%
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

      {/* Create New Contract Vehicle Dialog */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Contract Vehicle</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={newVehicle.name}
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Code"
                  value={newVehicle.code}
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, code: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={newVehicle.description}
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, description: e.target.value }))}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={newVehicle.startDate}
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, startDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={newVehicle.endDate}
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, endDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Escalation Rate (%)"
                  type="number"
                  value={newVehicle.escalationRate * 100}
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, escalationRate: (parseFloat(e.target.value) || 0) / 100 }))}
                  inputProps={{ step: 0.1, min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Max Overhead Rate (%)"
                  type="number"
                  value={newVehicle.maxOverheadRate}
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, maxOverheadRate: parseFloat(e.target.value) || 0 }))}
                  inputProps={{ step: 0.1, min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Max G&A Rate (%)"
                  type="number"
                  value={newVehicle.maxGaRate}
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, maxGaRate: parseFloat(e.target.value) || 0 }))}
                  inputProps={{ step: 0.1, min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Max Fee Rate (%)"
                  type="number"
                  value={newVehicle.maxFeeRate}
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, maxFeeRate: parseFloat(e.target.value) || 0 }))}
                  inputProps={{ step: 0.1, min: 0, max: 100 }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateVehicle} 
            variant="contained" 
            disabled={!newVehicle.name || !newVehicle.code}
          >
            Create Contract Vehicle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractVehicleSelector;
