/**
 * LCAT Project Role Selection Dialog
 * Shows tiles for LCAT + Project Role combinations from admin management
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Info as InfoIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { LCAT, ProjectRole, CompanyRole } from '../types/mapping';
import { MappingService } from '../services/mapping.service';

interface LCATProjectRoleSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (selection: {
    lcat: LCAT;
    projectRole: ProjectRole;
    companyRole?: CompanyRole;
    finalRate?: number;
  }) => void;
}

interface LCATProjectRoleCombination {
  lcat: LCAT;
  projectRole: ProjectRole;
  id: string;
}

export const LCATProjectRoleSelectionDialog: React.FC<LCATProjectRoleSelectionDialogProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const [lcats, setLcats] = useState<LCAT[]>([]);
  const [projectRoles, setProjectRoles] = useState<ProjectRole[]>([]);
  const [companyRoles, setCompanyRoles] = useState<CompanyRole[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [selectedCombination, setSelectedCombination] = useState<LCATProjectRoleCombination | null>(null);
  const [selectedCompanyRole, setSelectedCompanyRole] = useState<CompanyRole | null>(null);
  const [finalRate, setFinalRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [lcatsData, projectRolesData, companyRolesData] = await Promise.all([
        MappingService.getLCATs(),
        MappingService.getProjectRoles(),
        MappingService.getCompanyRoles(),
      ]);
      setLcats(lcatsData);
      setProjectRoles(projectRolesData);
      setCompanyRoles(companyRolesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get filtered LCATs based on selected vehicle
  const getFilteredLCATs = () => {
    if (!selectedVehicle) return lcats;
    return lcats.filter(lcat => lcat.vehicle === selectedVehicle);
  };

  // Get unique vehicles from LCATs
  const getAvailableVehicles = () => {
    const vehicles = [...new Set(lcats.map(lcat => lcat.vehicle))];
    return vehicles;
  };

  // Generate all possible LCAT + Project Role combinations
  const getCombinations = (): LCATProjectRoleCombination[] => {
    const filteredLCATs = getFilteredLCATs();
    const combinations: LCATProjectRoleCombination[] = [];
    
    filteredLCATs.forEach(lcat => {
      projectRoles.forEach(projectRole => {
        combinations.push({
          lcat,
          projectRole,
          id: `${lcat.id}-${projectRole.id}`,
        });
      });
    });
    
    return combinations;
  };

  const handleCombinationSelect = (combination: LCATProjectRoleCombination) => {
    setSelectedCombination(combination);
    // Auto-populate final rate with LCAT rate
    setFinalRate(combination.lcat.rate);
  };

  const handleCompanyRoleSelect = (companyRole: CompanyRole) => {
    setSelectedCompanyRole(companyRole);
    // Update final rate to company role rate
    setFinalRate(companyRole.payBand);
  };

  const handleConfirm = () => {
    if (selectedCombination) {
      onSelect({
        lcat: selectedCombination.lcat,
        projectRole: selectedCombination.projectRole,
        companyRole: selectedCompanyRole || undefined,
        finalRate: finalRate || undefined,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedCombination(null);
    setSelectedCompanyRole(null);
    setFinalRate(null);
    onClose();
  };

  const combinations = getCombinations();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Select Labor Category</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Select a combination of LCAT and Project Role from your management system, then optionally map to a Company Role.
        </Alert>

        {/* Vehicle Filter */}
        <Box sx={{ mb: 3 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Vehicle</InputLabel>
            <Select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              label="Filter by Vehicle"
            >
              <MenuItem value="">
                <em>All Vehicles</em>
              </MenuItem>
              {getAvailableVehicles().map((vehicle) => (
                <MenuItem key={vehicle} value={vehicle}>
                  {vehicle}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
            {selectedVehicle 
              ? `Showing combinations for ${selectedVehicle} (${combinations.length} available)`
              : `Showing all combinations (${combinations.length} available)`
            }
          </Typography>
        </Box>

        {/* LCAT + Project Role Combinations */}
        <Typography variant="h6" gutterBottom>
          LCAT + Project Role Combinations
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {combinations.map((combination) => (
            <Grid item xs={12} sm={6} md={4} key={combination.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedCombination?.id === combination.id ? 2 : 1,
                  borderColor: selectedCombination?.id === combination.id ? 'primary.main' : 'divider',
                  '&:hover': { borderColor: 'primary.main' }
                }}
              >
                <CardActionArea onClick={() => handleCombinationSelect(combination)}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="h6" component="div" noWrap>
                        {combination.lcat.name}
                      </Typography>
                      {selectedCombination?.id === combination.id && (
                        <CheckIcon color="primary" />
                      )}
                    </Box>
                    
                    <Box mb={1}>
                      <Chip 
                        label={combination.lcat.vehicle} 
                        size="small" 
                        color="primary" 
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        label={combination.lcat.code} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {combination.lcat.description}
                    </Typography>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Project Role: {combination.projectRole.name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {combination.projectRole.description}
                    </Typography>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                      <Typography variant="h6" color="primary">
                        ${combination.lcat.rate.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        LCAT Rate
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Company Role Mapping */}
        {selectedCombination && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Map to Company Role (Optional)
            </Typography>
            <Grid container spacing={2}>
              {companyRoles.map((role) => (
                <Grid item xs={12} sm={6} md={4} key={role.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedCompanyRole?.id === role.id ? 2 : 1,
                      borderColor: selectedCompanyRole?.id === role.id ? 'secondary.main' : 'divider',
                      '&:hover': { borderColor: 'secondary.main' }
                    }}
                  >
                    <CardActionArea onClick={() => handleCompanyRoleSelect(role)}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                          <Typography variant="h6" component="div" noWrap>
                            {role.name}
                          </Typography>
                          {selectedCompanyRole?.id === role.id && (
                            <CheckIcon color="secondary" />
                          )}
                        </Box>
                        
                        <Chip 
                          label={role.practiceArea} 
                          size="small" 
                          color="secondary" 
                          sx={{ mb: 1 }}
                        />
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {role.description}
                        </Typography>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                          <Typography variant="h6" color="secondary">
                            ${role.payBand.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Pay Band
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Final Rate Input */}
        {selectedCombination && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Final Rate
            </Typography>
            <TextField
              fullWidth
              label="Final Rate"
              type="number"
              value={finalRate || ''}
              onChange={(e) => setFinalRate(parseFloat(e.target.value) || null)}
              helperText="Enter the final rate to use for calculations"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {selectedCompanyRole 
                ? `Company Role Rate: $${selectedCompanyRole.payBand.toLocaleString()} | LCAT Rate: $${selectedCombination.lcat.rate.toFixed(2)}`
                : `LCAT Rate: $${selectedCombination.lcat.rate.toFixed(2)}`
              }
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          disabled={!selectedCombination}
        >
          Add Labor Category
        </Button>
      </DialogActions>
    </Dialog>
  );
};
