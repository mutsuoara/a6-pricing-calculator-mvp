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
  IconButton,
  Checkbox,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  TextField,
} from '@mui/material';
import {
  Close as CloseIcon,
  Check as CheckIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { LCAT, ProjectRole, CompanyRole } from '../types/mapping';
import { MappingService } from '../services/mapping.service';

interface LCATProjectRoleSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (selection: {
    lcat: LCAT;
    projectRole: ProjectRole;
    hours?: number;
    companyRole?: CompanyRole;
    finalRate?: number;
    quantity?: number;
  }) => void;
}


export const LCATProjectRoleSelectionDialog: React.FC<LCATProjectRoleSelectionDialogProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const [lcats, setLcats] = useState<LCAT[]>([]);
  const [projectRoles, setProjectRoles] = useState<ProjectRole[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLCATs, setSelectedLCATs] = useState<LCAT[]>([]);
  const [lcatMappings, setLcatMappings] = useState<Array<{lcat: LCAT, projectRole: ProjectRole | null, instanceId: string, quantity: number}>>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [multiSelectMode, setMultiSelectMode] = useState(false);

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      const [lcatsData, projectRolesData] = await Promise.all([
        MappingService.getLCATs(),
        MappingService.getProjectRoles(),
      ]);
      setLcats(lcatsData);
      setProjectRoles(projectRolesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Get filtered LCATs based on selected vehicle and search query
  const getFilteredLCATs = () => {
    let filtered = lcats;
    
    // Filter by vehicle
    if (selectedVehicle) {
      filtered = filtered.filter(lcat => lcat.vehicle === selectedVehicle);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(lcat => 
        lcat.name.toLowerCase().includes(query) ||
        lcat.code.toLowerCase().includes(query) ||
        lcat.description.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  // Get unique vehicles from LCATs
  const getAvailableVehicles = () => {
    const vehicles = [...new Set(lcats.map(lcat => lcat.vehicle))];
    return vehicles;
  };

  // Get filtered LCATs (no combinations generated upfront)
  const getFilteredLCATsForDisplay = () => {
    return getFilteredLCATs();
  };

  const handleLCATSelect = (lcat: LCAT) => {
    if (multiSelectMode) {
      setSelectedLCATs(prev => {
        const isSelected = prev.some(selected => selected.id === lcat.id);
        if (isSelected) {
          // Remove from mappings too
          setLcatMappings(prevMappings => prevMappings.filter(mapping => mapping.lcat.id !== lcat.id));
          return prev.filter(selected => selected.id !== lcat.id);
        } else {
          // Add to mappings with null project role and unique instance ID
          setLcatMappings(prevMappings => [...prevMappings, { lcat, projectRole: null, instanceId: `${lcat.id}-${Date.now()}`, quantity: 1 }]);
          return [...prev, lcat];
        }
      });
    } else {
      setSelectedLCATs([lcat]);
      setLcatMappings([{ lcat, projectRole: null, instanceId: `${lcat.id}-${Date.now()}`, quantity: 1 }]);
    }
  };

  const handleProjectRoleMapping = (instanceId: string, projectRole: ProjectRole) => {
    setLcatMappings(prev => 
      prev.map(mapping => 
        mapping.instanceId === instanceId 
          ? { ...mapping, projectRole }
          : mapping
      )
    );
  };

  const handleAddInstance = (lcatId: string) => {
    const lcat = lcats.find(l => l.id === lcatId);
    if (lcat) {
      setLcatMappings(prev => [...prev, { lcat, projectRole: null, instanceId: `${lcat.id}-${Date.now()}`, quantity: 1 }]);
    }
  };

  const handleRemoveInstance = (instanceId: string) => {
    setLcatMappings(prev => prev.filter(mapping => mapping.instanceId !== instanceId));
  };

  const handleQuantityChange = (instanceId: string, quantity: number) => {
    setLcatMappings(prev => 
      prev.map(mapping => 
        mapping.instanceId === instanceId 
          ? { ...mapping, quantity: Math.max(1, quantity) }
          : mapping
      )
    );
  };

  const handleConfirm = () => {
    const validMappings = lcatMappings.filter(mapping => mapping.projectRole !== null);
    console.log(`Processing ${validMappings.length} labor category mappings:`, validMappings);
    
    if (validMappings.length > 0) {
      // Handle multiple labor categories - call onSelect for each individual instance
      validMappings.forEach((mapping, index) => {
        console.log(`Calling onSelect for mapping ${index + 1}:`, mapping.lcat.name, '->', mapping.projectRole!.name, `(quantity: ${mapping.quantity})`);
        
        onSelect({
          lcat: mapping.lcat,
          projectRole: mapping.projectRole!,
          // Include project role hours in the labor category
          hours: mapping.projectRole!.typicalHours,
          quantity: mapping.quantity || 1,
        });
      });
      
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedLCATs([]);
    setLcatMappings([]);
    setActiveTab(0);
    setMultiSelectMode(false);
    onClose();
  };


  const handleNext = () => {
    if (activeTab < 2) {
      setActiveTab(activeTab + 1);
    }
  };

  const handleBack = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  const filteredLCATs = getFilteredLCATsForDisplay();

  const steps = ['Select LCATs', 'Map to Project Roles', 'Confirm & Add'];

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
      
      <DialogContent sx={{ p: 0 }}>
        {/* Progress Stepper */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Stepper activeStep={activeTab} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Sticky Navigation Controls */}
        <Box sx={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 1, 
          bgcolor: 'background.paper', 
          borderBottom: 1, 
          borderColor: 'divider',
          p: 2,
          mb: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={multiSelectMode}
                    onChange={(e) => setMultiSelectMode(e.target.checked)}
                  />
                }
                label="Multi-select mode"
              />
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
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                disabled={activeTab === 0}
                variant="outlined"
              >
                Back
              </Button>
              <Button
                endIcon={<ArrowForwardIcon />}
                onClick={handleNext}
                disabled={
                  activeTab === 2 || 
                  (activeTab === 0 && selectedLCATs.length === 0) || 
                  (activeTab === 1 && lcatMappings.some(mapping => mapping.projectRole === null))
                }
                variant="contained"
              >
                Next
              </Button>
            </Box>
          </Box>
          
          {/* Search Bar - Only show on LCAT selection tab */}
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search LCATs by name, code, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ minWidth: 300 }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, color: 'text.secondary' }}>
                      🔍
                    </Box>
                  ),
                }}
              />
              {searchQuery && (
                <Button
                  size="small"
                  onClick={() => setSearchQuery('')}
                  variant="outlined"
                >
                  Clear
                </Button>
              )}
            </Box>
          )}
        </Box>

        {/* Tab Content */}
        <Box sx={{ minHeight: 400, p: 3 }}>
          {/* Tab 0: LCAT Selection */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Select LCATs {multiSelectMode ? '(Multi-select)' : '(Single select)'}
                {multiSelectMode && selectedLCATs.length > 0 && (
                  <Typography component="span" variant="body2" color="primary" sx={{ ml: 1 }}>
                    ({selectedLCATs.length} selected)
                  </Typography>
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedVehicle 
                  ? `Showing LCATs for ${selectedVehicle} (${filteredLCATs.length} available)`
                  : `Showing all LCATs (${filteredLCATs.length} available)`
                }
              </Typography>
              <Grid container spacing={2}>
                {filteredLCATs.map((lcat) => {
                  const isSelected = selectedLCATs.some(selected => selected.id === lcat.id);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={lcat.id}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          border: isSelected ? 2 : 1,
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          '&:hover': { borderColor: 'primary.main' }
                        }}
                      >
                        <CardActionArea onClick={() => handleLCATSelect(lcat)}>
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                              <Typography variant="h6" component="div" noWrap>
                                {lcat.name}
                              </Typography>
                              {isSelected && (
                                <CheckIcon color="primary" />
                              )}
                            </Box>
                            
                            <Box mb={1}>
                              <Chip 
                                label={lcat.vehicle} 
                                size="small" 
                                color="primary" 
                                sx={{ mr: 1 }}
                              />
                              <Chip 
                                label={lcat.code} 
                                size="small" 
                                variant="outlined"
                              />
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {lcat.description}
                            </Typography>
                            
                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                              <Typography variant="h6" color="primary">
                                ${Number(lcat.rate || 0).toFixed(2)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                LCAT Rate
                              </Typography>
                            </Box>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {/* Tab 1: Map to Project Roles */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Map Each LCAT to a Project Role
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select a project role for each selected LCAT. This will determine the hours and clearance level for the labor category.
              </Typography>
              
              <Grid container spacing={2}>
                {lcatMappings.map((mapping, index) => (
                  <Grid item xs={12} md={6} key={mapping.instanceId}>
                    <Card sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Mapping {index + 1}
                      </Typography>
                      
                      {/* LCAT Info */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">LCAT:</Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip label={mapping.lcat.vehicle} size="small" color="primary" />
                          <Typography variant="body1" fontWeight="bold">
                            {mapping.lcat.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            (${Number(mapping.lcat.rate || 0).toFixed(2)})
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* Project Role Selection */}
                      <FormControl fullWidth size="small">
                        <InputLabel>Select Project Role</InputLabel>
                        <Select
                          value={mapping.projectRole?.id || ''}
                          onChange={(e) => {
                            const selectedRole = projectRoles.find(pr => pr.id === e.target.value);
                            if (selectedRole) {
                              handleProjectRoleMapping(mapping.instanceId, selectedRole);
                            }
                          }}
                          label="Select Project Role"
                        >
                          {projectRoles.map((role) => (
                            <MenuItem key={role.id} value={role.id}>
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {role.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {role.typicalClearance} • {role.typicalHours} hours
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      {/* Quantity Selection */}
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Quantity:
                        </Typography>
                        <TextField
                          size="small"
                          type="number"
                          value={mapping.quantity || 1}
                          onChange={(e) => handleQuantityChange(mapping.instanceId, parseInt(e.target.value) || 1)}
                          inputProps={{ min: 1, max: 20 }}
                          sx={{ width: 80 }}
                        />
                      </Box>
                      
                      {/* Selected Project Role Info */}
                      {mapping.projectRole && (
                        <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Selected: <strong>{mapping.projectRole.name}</strong>
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Clearance: {mapping.projectRole.typicalClearance} • Hours: {mapping.projectRole.typicalHours}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Quantity: <strong>{mapping.quantity || 1}</strong>
                          </Typography>
                        </Box>
                      )}
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Tab 2: Confirm & Add */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Confirm Labor Categories to Add
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Review the labor categories that will be created. Each LCAT will be mapped to its selected project role.
              </Typography>
              
              <Grid container spacing={2}>
                {lcatMappings.filter(mapping => mapping.projectRole !== null).map((mapping, index) => (
                  <Grid item xs={12} md={6} key={`${mapping.lcat.id}-${mapping.projectRole!.id}`}>
                    <Card sx={{ p: 2, border: 1, borderColor: 'success.main', bgcolor: 'success.50' }}>
                      <Typography variant="subtitle1" gutterBottom color="success.main">
                        Labor Category {index + 1}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">LCAT:</Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip label={mapping.lcat.vehicle} size="small" color="primary" />
                          <Typography variant="body1" fontWeight="bold">
                            {mapping.lcat.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            (${Number(mapping.lcat.rate || 0).toFixed(2)})
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Project Role:</Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" fontWeight="bold">
                            {mapping.projectRole!.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ({mapping.projectRole!.typicalClearance})
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          <strong>Hours:</strong> {mapping.projectRole!.typicalHours}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          <strong>Clearance:</strong> {mapping.projectRole!.typicalClearance}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          <strong>Rate:</strong> ${Number(mapping.lcat.rate || 0).toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          <strong>Quantity:</strong> {mapping.quantity || 1}
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          disabled={activeTab !== 2 || lcatMappings.some(mapping => mapping.projectRole === null)}
        >
          Add {lcatMappings.filter(mapping => mapping.projectRole !== null).reduce((total, mapping) => total + (mapping.quantity || 1), 0)} Labor Categories
        </Button>
      </DialogActions>
    </Dialog>
  );
};
