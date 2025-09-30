/**
 * LCAT Management Component
 * Admin interface for managing three-way mappings and rate validation
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { MappingService } from '../services/mapping.service';
import { TemplateService } from '../services/template.service';
import {
  ContractVehicle,
  A6Level,
  ProjectRole,
  SPRUCELCAT,
  CompanyRole,
  ThreeWayMapping,
  RateValidationRule,
  ImportTemplate,
} from '../types/mapping';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`lcat-tabpanel-${index}`}
      aria-labelledby={`lcat-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface CompanyRoleFormProps {
  role: CompanyRole | null;
  onSave: (roleData: Omit<CompanyRole, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const CompanyRoleForm: React.FC<CompanyRoleFormProps> = ({ role, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    practiceArea: role?.practiceArea || '',
    description: role?.description || '',
    payBand: role?.payBand || '',
    rateIncrease: role?.rateIncrease || 0,
    isActive: role?.isActive ?? true,
  });

  const practiceAreas = [
    'Engineering',
    'Product',
    'Design',
    'Data Science',
    'Management',
    'Operations',
  ];

  const payBands = [
    'Band 1',
    'Band 2',
    'Band 3',
    'Band 4',
    'Band 5',
    'Junior Level',
    'Mid Level',
    'Senior Level',
    'Principal Level',
    'Executive Level',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Role Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Practice Area</InputLabel>
            <Select
              value={formData.practiceArea}
              onChange={(e) => setFormData(prev => ({ ...prev, practiceArea: e.target.value }))}
              label="Practice Area"
            >
              {practiceAreas.map((area) => (
                <MenuItem key={area} value={area}>
                  {area}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            multiline
            rows={3}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Pay Band</InputLabel>
            <Select
              value={formData.payBand}
              onChange={(e) => setFormData(prev => ({ ...prev, payBand: e.target.value }))}
              label="Pay Band"
            >
              {payBands.map((band) => (
                <MenuItem key={band} value={band}>
                  {band}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Rate Increase (%)"
            type="number"
            value={formData.rateIncrease * 100}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              rateIncrease: parseFloat(e.target.value) / 100 || 0 
            }))}
            inputProps={{ min: 0, max: 100, step: 0.1 }}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value as boolean }))}
              label="Status"
            >
              <MenuItem value={true}>Active</MenuItem>
              <MenuItem value={false}>Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button type="submit" variant="contained">
          {role ? 'Update' : 'Create'} Role
        </Button>
      </Box>
    </Box>
  );
};

const LCATManagement: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [contractVehicles, setContractVehicles] = useState<ContractVehicle[]>([]);
  const [a6Levels, setA6Levels] = useState<A6Level[]>([]);
  const [projectRoles, setProjectRoles] = useState<ProjectRole[]>([]);
  const [spruceLCATs, setSpruceLCATs] = useState<SPRUCELCAT[]>([]);
  const [companyRoles, setCompanyRoles] = useState<CompanyRole[]>([]);
  const [threeWayMappings, setThreeWayMappings] = useState<ThreeWayMapping[]>([]);
  const [rateValidationRules, setRateValidationRules] = useState<RateValidationRule[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [showCompanyRoleDialog, setShowCompanyRoleDialog] = useState(false);
  const [editingCompanyRole, setEditingCompanyRole] = useState<CompanyRole | null>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [vehicles, levels, roles, lcats, companyRoles, mappings] = await Promise.all([
        MappingService.getContractVehicles(),
        MappingService.getA6Levels(),
        MappingService.getProjectRoles(),
        MappingService.getSPRUCELCATs(),
        MappingService.getCompanyRoles(),
        MappingService.getThreeWayMappings(),
      ]);
      
      setContractVehicles(vehicles);
      setA6Levels(levels);
      setProjectRoles(roles);
      setSpruceLCATs(lcats);
      setCompanyRoles(companyRoles);
      setThreeWayMappings(mappings);
    } catch (error) {
      console.error('Error loading data:', error);
      setSnackbarMessage('Error loading data');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownloadTemplate = () => {
    try {
      TemplateService.downloadTemplate();
      setSnackbarMessage('Template downloaded successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error downloading template:', error);
      setSnackbarMessage('Error downloading template');
      setSnackbarOpen(true);
    }
  };

  const handleImport = async (file: File) => {
    try {
      const template = await MappingService.importFromExcel(file);
      // Process imported data
      setSnackbarMessage('Data imported successfully');
      setSnackbarOpen(true);
      setImportDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error importing data:', error);
      setSnackbarMessage('Error importing data');
      setSnackbarOpen(true);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircleIcon color="success" /> : <WarningIcon color="warning" />;
  };

  // Company Roles handlers
  const handleEditCompanyRole = (role: CompanyRole) => {
    setEditingCompanyRole(role);
    setShowCompanyRoleDialog(true);
  };

  const handleDeleteCompanyRole = async (id: string) => {
    try {
      await MappingService.deleteCompanyRole(id);
      setCompanyRoles(prev => prev.filter(role => role.id !== id));
      setSnackbarMessage('Company role deleted successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting company role:', error);
      setSnackbarMessage('Error deleting company role');
      setSnackbarOpen(true);
    }
  };

  const handleSaveCompanyRole = async (roleData: Omit<CompanyRole, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingCompanyRole) {
        const updatedRole = await MappingService.updateCompanyRole(editingCompanyRole.id, roleData);
        setCompanyRoles(prev => prev.map(role => role.id === editingCompanyRole.id ? updatedRole : role));
        setSnackbarMessage('Company role updated successfully');
      } else {
        const newRole = await MappingService.createCompanyRole(roleData);
        setCompanyRoles(prev => [...prev, newRole]);
        setSnackbarMessage('Company role created successfully');
      }
      setShowCompanyRoleDialog(false);
      setEditingCompanyRole(null);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving company role:', error);
      setSnackbarMessage('Error saving company role');
      setSnackbarOpen(true);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            LCAT Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage three-way mappings: Contract Vehicle → Project → A6 Role
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadTemplate}
          >
            Download Template
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setImportDialogOpen(true)}
          >
            Import Data
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Paper elevation={2}>
        <AppBar position="static" color="default" elevation={0}>
          <Toolbar variant="dense">
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Contract Vehicles" />
              <Tab label="A6 Levels" />
              <Tab label="Project Roles" />
              <Tab label="SPRUCE LCATs" />
              <Tab label="Company Roles" />
              <Tab label="Three-Way Mappings" />
              <Tab label="Rate Validation Rules" />
            </Tabs>
          </Toolbar>
        </AppBar>

        {/* Contract Vehicles Tab */}
        <TabPanel value={currentTab} index={0}>
          <Typography variant="h6" gutterBottom>
            Contract Vehicles
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Escalation Rate</TableCell>
                  <TableCell>Date Range</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contractVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {vehicle.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {vehicle.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={vehicle.code} size="small" />
                    </TableCell>
                    <TableCell>
                      {(vehicle.escalationRate * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      {vehicle.startDate && vehicle.endDate ? (
                        `${new Date(vehicle.startDate).toLocaleDateString()} - ${new Date(vehicle.endDate).toLocaleDateString()}`
                      ) : (
                        'No dates set'
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getStatusIcon(vehicle.isActive)}
                        <Chip 
                          label={vehicle.isActive ? 'Active' : 'Inactive'} 
                          color={getStatusColor(vehicle.isActive) as any}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* A6 Levels Tab */}
        <TabPanel value={currentTab} index={1}>
          <Typography variant="h6" gutterBottom>
            A6 Levels
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Rate Range</TableCell>
                  <TableCell>Requirements</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {a6Levels.map((level) => (
                  <TableRow key={level.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {level.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={level.category} size="small" />
                    </TableCell>
                    <TableCell>{level.level}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          ${level.rateRange.min} - ${level.rateRange.max}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Typical: ${level.rateRange.typical}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="caption">
                          Clearance: {level.clearanceRequirements.join(', ')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Location: {level.locationRequirements.join(', ')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getStatusIcon(level.isActive)}
                        <Chip 
                          label={level.isActive ? 'Active' : 'Inactive'} 
                          color={getStatusColor(level.isActive) as any}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Project Roles Tab */}
        <TabPanel value={currentTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Project Roles
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Role Name</TableCell>
                  <TableCell>A6 Level</TableCell>
                  <TableCell>Typical Clearance</TableCell>
                  <TableCell>Typical Location</TableCell>
                  <TableCell>Typical Hours</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projectRoles.map((role) => {
                  const a6Level = a6Levels.find(level => level.id === role.a6LevelId);
                  return (
                    <TableRow key={role.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {role.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {role.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {a6Level ? (
                          <Chip label={a6Level.name} size="small" />
                        ) : (
                          'Unknown'
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label={role.typicalClearance} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip label={role.typicalLocation} size="small" />
                      </TableCell>
                      <TableCell>{role.typicalHours.toLocaleString()}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getStatusIcon(role.isActive)}
                          <Chip 
                            label={role.isActive ? 'Active' : 'Inactive'} 
                            color={getStatusColor(role.isActive) as any}
                            size="small"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* SPRUCE LCATs Tab */}
        <TabPanel value={currentTab} index={3}>
          <Typography variant="h6" gutterBottom>
            SPRUCE LCATs
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>LCAT Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {spruceLCATs.map((lcat) => (
                  <TableRow key={lcat.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {lcat.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={lcat.code} size="small" />
                    </TableCell>
                    <TableCell>{lcat.description}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getStatusIcon(lcat.isActive)}
                        <Chip 
                          label={lcat.isActive ? 'Active' : 'Inactive'} 
                          color={getStatusColor(lcat.isActive) as any}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Company Roles Tab */}
        <TabPanel value={currentTab} index={4}>
          <Typography variant="h6" gutterBottom>
            Company Roles
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Manage internal company roles with practice areas and pay bands.
          </Alert>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowCompanyRoleDialog(true)}
            >
              Add Company Role
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Practice Area</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Pay Band</TableCell>
                  <TableCell>Rate Increase</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companyRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>{role.name}</TableCell>
                    <TableCell>
                      <Chip label={role.practiceArea} size="small" />
                    </TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>{role.payBand}</TableCell>
                    <TableCell>{(role.rateIncrease * 100).toFixed(1)}%</TableCell>
                    <TableCell>
                      <Chip
                        label={role.isActive ? 'Active' : 'Inactive'}
                        color={role.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEditCompanyRole(role)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDeleteCompanyRole(role.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Three-Way Mappings Tab */}
        <TabPanel value={currentTab} index={5}>
          <Typography variant="h6" gutterBottom>
            Three-Way Mappings
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            These mappings connect Contract Vehicles to specific Projects and A6 Roles.
          </Alert>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Contract Vehicle</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>SPRUCE LCAT</TableCell>
                  <TableCell>Project Role</TableCell>
                  <TableCell>A6 Level</TableCell>
                  <TableCell>Rates</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {threeWayMappings.map((mapping) => {
                  const vehicle = contractVehicles.find(v => v.id === mapping.contractVehicleId);
                  const lcat = spruceLCATs.find(l => l.id === mapping.spruceLCATId);
                  const role = projectRoles.find(r => r.id === mapping.projectRoleId);
                  const a6Level = a6Levels.find(l => l.id === mapping.a6LevelId);
                  
                  return (
                    <TableRow key={mapping.id}>
                      <TableCell>
                        <Chip label={vehicle?.name || 'Unknown'} size="small" />
                      </TableCell>
                      <TableCell>{mapping.projectId}</TableCell>
                      <TableCell>
                        <Chip label={lcat?.name || 'Unknown'} size="small" />
                      </TableCell>
                      <TableCell>{role?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Chip label={a6Level?.name || 'Unknown'} size="small" />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            SPRUCE: ${mapping.spruceRate}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            A6 Min: ${mapping.a6MinimumRate}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getStatusIcon(mapping.isActive)}
                          <Chip 
                            label={mapping.isActive ? 'Active' : 'Inactive'} 
                            color={getStatusColor(mapping.isActive) as any}
                            size="small"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Rate Validation Rules Tab */}
        <TabPanel value={currentTab} index={6}>
          <Typography variant="h6" gutterBottom>
            Rate Validation Rules
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            These rules define rate ranges and validation criteria for different A6 levels and contract vehicles.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Rate validation rules will be displayed here once implemented.
          </Typography>
        </TabPanel>
      </Paper>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import LCAT Data</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Please download the template first, populate it with your data, then upload it here.
            </Alert>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImport(file);
                }
              }}
              style={{ width: '100%', padding: '8px' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Company Role Dialog */}
      <Dialog open={showCompanyRoleDialog} onClose={() => setShowCompanyRoleDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCompanyRole ? 'Edit Company Role' : 'Add Company Role'}
        </DialogTitle>
        <DialogContent>
          <CompanyRoleForm
            role={editingCompanyRole}
            onSave={handleSaveCompanyRole}
            onCancel={() => {
              setShowCompanyRoleDialog(false);
              setEditingCompanyRole(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default LCATManagement;
