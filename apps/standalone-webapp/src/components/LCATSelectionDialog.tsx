/**
 * LCAT Selection Dialog Component
 * Provides a searchable interface for selecting pre-populated labor categories
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  Divider,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Work as WorkIcon,
  Security as SecurityIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

// API base URL - in production this would come from environment variables
const API_BASE_URL = '/api';

interface LCATTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  experienceLevel: string;
  vehicleRates: Record<string, {
    baseRateMin: number;
    baseRateMax: number;
    typicalRate: number;
    notes?: string;
  }>;
  a6RoleMappings: string[];
  typicalClearanceLevel: string;
  typicalLocation: string;
  typicalHours: number;
  tags: string[];
  complianceRequirements: string[];
  isActive: boolean;
}

interface ContractVehicle {
  id: string;
  name: string;
  code: string;
  description: string;
  rateStructure: string;
  maxOverheadRate: number;
  maxGaRate: number;
  maxFeeRate: number;
  complianceRequirements: string[];
  isActive: boolean;
}

interface A6Role {
  id: string;
  name: string;
  code: string;
  description: string;
  department: string;
  level: string;
  careerPath: string[];
  requiredSkills: string[];
  typicalClearanceLevel: string;
  typicalLocation: string;
  isActive: boolean;
}

interface LCATSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: LCATTemplate) => void;
}

export const LCATSelectionDialog: React.FC<LCATSelectionDialogProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState<LCATTemplate[]>([]);
  
  // API data state
  const [contractVehicles, setContractVehicles] = useState<ContractVehicle[]>([]);
  const [a6Roles, setA6Roles] = useState<A6Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from API
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load contract vehicles
      const vehiclesResponse = await fetch(`${API_BASE_URL}/labor-categories/contract-vehicles`);
      if (!vehiclesResponse.ok) throw new Error('Failed to load contract vehicles');
      const vehiclesData = await vehiclesResponse.json();
      setContractVehicles(vehiclesData.data || []);

      // Load A6 roles
      const rolesResponse = await fetch(`${API_BASE_URL}/labor-categories/a6-roles`);
      if (!rolesResponse.ok) throw new Error('Failed to load A6 roles');
      const rolesData = await rolesResponse.json();
      setA6Roles(rolesData.data || []);

      // Load LCAT templates
      await loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading LCAT data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('searchTerm', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      if (experienceFilter) params.append('experienceLevel', experienceFilter);
      if (vehicleFilter) params.append('vehicleCode', vehicleFilter);

      const response = await fetch(`${API_BASE_URL}/labor-categories/search?${params}`);
      if (!response.ok) throw new Error('Failed to load LCAT templates');
      
      const data = await response.json();
      setFilteredTemplates(data.data?.map((result: any) => result.template) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
      console.error('Error loading templates:', err);
    }
  };

  // Reload templates when filters change
  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [searchTerm, categoryFilter, experienceFilter, vehicleFilter, open]);

  const handleSelect = (template: LCATTemplate) => {
    onSelect(template);
    onClose();
  };

  const getClearanceColor = (level: string) => {
    switch (level) {
      case 'None': return '#9e9e9e';
      case 'Public Trust': return '#4caf50';
      case 'Secret': return '#ff9800';
      case 'Top Secret': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'Remote': return '🏠';
      case 'On-site': return '🏢';
      case 'Hybrid': return '🔄';
      default: return '📍';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Technical': return <WorkIcon />;
      case 'Management': return <SecurityIcon />;
      case 'Administrative': return <LocationIcon />;
      default: return <WorkIcon />;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="bold">
            Select Labor Category
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Search and Filters */}
        <Box mb={3}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="Technical">Technical</MenuItem>
                  <MenuItem value="Management">Management</MenuItem>
                  <MenuItem value="Administrative">Administrative</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Experience Level</InputLabel>
                <Select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  label="Experience Level"
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="junior">Junior</MenuItem>
                  <MenuItem value="mid">Mid</MenuItem>
                  <MenuItem value="senior">Senior</MenuItem>
                  <MenuItem value="lead">Lead</MenuItem>
                  <MenuItem value="principal">Principal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Contract Vehicle</InputLabel>
                <Select
                  value={vehicleFilter}
                  onChange={(e) => setVehicleFilter(e.target.value)}
                  label="Contract Vehicle"
                >
                  <MenuItem value="">All Vehicles</MenuItem>
                  {contractVehicles.map((vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.code}>
                      {vehicle.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Results */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Available Templates ({filteredTemplates.length})
          </Typography>
          
          {loading && (
            <Box display="flex" justifyContent="center" py={4}>
              <Typography>Loading LCAT templates...</Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {!loading && !error && filteredTemplates.length === 0 ? (
            <Alert severity="info">
              No templates found matching your criteria. Try adjusting your search or filters.
            </Alert>
          ) : !loading && !error && (
            <Grid container spacing={2}>
              {filteredTemplates.map((template) => (
                <Grid item xs={12} md={6} key={template.id}>
                  <Card 
                    elevation={2} 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { 
                        elevation: 4,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                    onClick={() => handleSelect(template)}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {template.title}
                        </Typography>
                        <Box display="flex" gap={1}>
                          <Chip
                            label={template.category}
                            size="small"
                            icon={getCategoryIcon(template.category)}
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={template.experienceLevel}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        </Box>
                      </Box>

                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {template.description}
                      </Typography>

                      {/* Vehicle-specific rates */}
                      {vehicleFilter && template.vehicleRates[vehicleFilter] ? (
                        <Box mb={2}>
                          <Typography variant="body2" fontWeight="medium" gutterBottom>
                            {contractVehicles.find(v => v.code === vehicleFilter)?.name} Rates:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ${template.vehicleRates[vehicleFilter].baseRateMin} - ${template.vehicleRates[vehicleFilter].baseRateMax}/hr
                            {template.vehicleRates[vehicleFilter].notes && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                {template.vehicleRates[vehicleFilter].notes}
                              </Typography>
                            )}
                          </Typography>
                        </Box>
                      ) : (
                        <Box mb={2}>
                          <Typography variant="body2" fontWeight="medium" gutterBottom>
                            Available Vehicles:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {Object.keys(template.vehicleRates).map((vehicleCode) => {
                              const vehicle = contractVehicles.find(v => v.code === vehicleCode);
                              return (
                                <Chip
                                  key={vehicleCode}
                                  label={vehicle?.name || vehicleCode}
                                  size="small"
                                  variant="outlined"
                                  color="default"
                                />
                              );
                            })}
                          </Box>
                        </Box>
                      )}

                      {/* A6 Role Mappings */}
                      {template.a6RoleMappings.length > 0 && (
                        <Box mb={2}>
                          <Typography variant="body2" fontWeight="medium" gutterBottom>
                            A6 Roles:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {template.a6RoleMappings.map((roleId) => {
                              const role = a6Roles.find(r => r.id === roleId);
                              return role ? (
                                <Chip
                                  key={roleId}
                                  label={`${role.name} (${role.department})`}
                                  size="small"
                                  variant="outlined"
                                  color="success"
                                />
                              ) : null;
                            })}
                          </Box>
                        </Box>
                      )}

                      <Box display="flex" gap={1} mb={2}>
                        <Chip
                          label={template.typicalClearanceLevel}
                          size="small"
                          sx={{
                            backgroundColor: getClearanceColor(template.typicalClearanceLevel),
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                        <Chip
                          label={`${getLocationIcon(template.typicalLocation)} ${template.typicalLocation}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        ))}
                        {template.tags.length > 3 && (
                          <Chip
                            label={`+${template.tags.length - 3} more`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LCATSelectionDialog;
