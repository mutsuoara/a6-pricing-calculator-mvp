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
import { companyConfigService } from '../config/company.config';
import {
  ContractVehicle,
  ProjectRole,
  LCAT,
  CompanyRole,
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
  // A6Levels removed - replaced with Company Roles
  const [projectRoles, setProjectRoles] = useState<ProjectRole[]>([]);
  const [lcats, setLcats] = useState<LCAT[]>([]);
  const [companyRoles, setCompanyRoles] = useState<CompanyRole[]>([]);
  // Three-Way Mappings removed - simplified architecture
  const [rateValidationRules, setRateValidationRules] = useState<RateValidationRule[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportTemplate | null>(null);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [showCompanyRoleDialog, setShowCompanyRoleDialog] = useState(false);
  const [editingCompanyRole, setEditingCompanyRole] = useState<CompanyRole | null>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [vehicles, roles, lcatsData, companyRoles] = await Promise.all([
        MappingService.getContractVehicles(),
        MappingService.getProjectRoles(),
        MappingService.getLCATs(),
        MappingService.getCompanyRoles(),
      ]);
      
      setContractVehicles(vehicles);
      setProjectRoles(roles);
      setLcats(lcatsData);
      setCompanyRoles(companyRoles);
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

  const handleFileSelect = async (file: File) => {
    try {
      setLoading(true);
      const template = await MappingService.importFromExcel(file);
      setImportPreview(template);
      setShowImportPreview(true);
      setImportDialogOpen(false);
    } catch (error) {
      console.error('Error parsing file:', error);
      setSnackbarMessage(`File parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview) return;
    
    try {
      setLoading(true);
      
      // Process and display imported data
      const importSummary = {
        contractVehicles: importPreview.contractVehicles.length,
        lcats: importPreview.lcats.length,
        projectRoles: importPreview.projectRoles.length,
        companyRoles: importPreview.companyRoles.length,
        rateValidationRules: importPreview.rateValidationRules.length,
      };
      
      // Group LCATs by vehicle for better display
      const lcatsByVehicle = importPreview.lcats.reduce((acc, lcat) => {
        if (!acc[lcat.vehicle]) {
          acc[lcat.vehicle] = [];
        }
        acc[lcat.vehicle].push(lcat);
        return acc;
      }, {} as Record<string, LCAT[]>);
      
      console.log('Import Summary:', importSummary);
      console.log('LCATs by Vehicle:', lcatsByVehicle);
      
      // ACTUALLY PERSIST THE IMPORTED DATA TO STATE
      // In a real app, this would be a backend call
      if (importMode === 'replace') {
        // Replace all existing data
        setContractVehicles(importPreview.contractVehicles);
        setLcats(importPreview.lcats);
        setProjectRoles(importPreview.projectRoles);
        setCompanyRoles(importPreview.companyRoles);
        setRateValidationRules(importPreview.rateValidationRules);
      } else {
        // Merge with existing data (default behavior) - with deduplication
        setContractVehicles(prev => {
          const existing = new Set(prev.map(v => v.id));
          const newVehicles = importPreview.contractVehicles.filter(v => !existing.has(v.id));
          return [...prev, ...newVehicles];
        });
        
        setLcats(prev => {
          const existing = new Set(prev.map(l => l.id));
          const newLcats = importPreview.lcats.filter(l => !existing.has(l.id));
          return [...prev, ...newLcats];
        });
        
        setProjectRoles(prev => {
          const existing = new Set(prev.map(r => r.id));
          const newRoles = importPreview.projectRoles.filter(r => !existing.has(r.id));
          return [...prev, ...newRoles];
        });
        
        setCompanyRoles(prev => {
          const existing = new Set(prev.map(r => r.id));
          const newRoles = importPreview.companyRoles.filter(r => !existing.has(r.id));
          return [...prev, ...newRoles];
        });
        
        setRateValidationRules(prev => {
          const existing = new Set(prev.map(r => r.id));
          const newRules = importPreview.rateValidationRules.filter(r => !existing.has(r.id));
          return [...prev, ...newRules];
        });
      }
      
      // Show detailed success message
      const message = `Import successful! Added: ${importSummary.contractVehicles} vehicles, ${importSummary.lcats} LCATs, ${importSummary.projectRoles} project roles, ${importSummary.companyRoles} company roles, ${importSummary.rateValidationRules} validation rules`;
      setSnackbarMessage(message);
      setSnackbarOpen(true);
      setShowImportPreview(false);
      setImportPreview(null);
      
    } catch (error) {
      console.error('Error importing data:', error);
      setSnackbarMessage(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
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
            color="warning"
            startIcon={<DeleteIcon />}
            onClick={() => {
              setContractVehicles([]);
              setLcats([]);
              setProjectRoles([]);
              setCompanyRoles([]);
              setRateValidationRules([]);
              setSnackbarMessage('All data cleared');
              setSnackbarOpen(true);
            }}
          >
            Clear All Data
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
              <Tab label="LCATs" />
              <Tab label="Project Roles" />
              <Tab label="Agile Six Roles" />
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

        {/* A6 Levels Tab removed - replaced with Company Roles */}

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
                  <TableCell>Typical Clearance</TableCell>
                  <TableCell>Typical Hours</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projectRoles.map((role) => {
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
                        <Chip label={role.typicalClearance} size="small" />
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

        {/* LCATs Tab */}
        <TabPanel value={currentTab} index={1}>
          <Typography variant="h6" gutterBottom>
            LCATs
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Manage labor category titles with rates for all contract vehicles.
          </Alert>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>LCAT Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lcats.map((lcat) => (
                  <TableRow key={lcat.id}>
                    <TableCell>
                      <Chip label={lcat.vehicle} size="small" color="primary" />
                    </TableCell>
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
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        ${lcat.rate?.toFixed(2) || '0.00'}
                      </Typography>
                    </TableCell>
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

        {/* Agile Six Roles Tab */}
        <TabPanel value={currentTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Agile Six Roles
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Manage internal Agile Six roles with practice areas and pay bands (dollar amounts).
          </Alert>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowCompanyRoleDialog(true)}
            >
              Add {companyConfigService.getLabels().companyRole}
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
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        ${role.payBand?.toLocaleString() || '0'}
                      </Typography>
                    </TableCell>
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

        {/* Three-Way Mappings Tab removed - simplified architecture */}

        {/* Rate Validation Rules Tab */}
        <TabPanel value={currentTab} index={4}>
          <Typography variant="h6" gutterBottom>
            Rate Validation Rules
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            These rules define rate ranges and validation criteria for different Company Roles and contract vehicles.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Rate validation rules will be displayed here once implemented.
          </Typography>
        </TabPanel>
      </Paper>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Import LCAT Data</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Import LCAT data from Excel files. The file should contain the following sheets:
            </Alert>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Expected Excel Structure:</strong>
              </Typography>
              <ul>
                <li><strong>Contract Vehicles:</strong> Available contract vehicles (VA SPRUCE, GSA MAS, etc.)</li>
                <li><strong>LCATs:</strong> Labor category titles with rates for all vehicles</li>
                <li><strong>Project Roles:</strong> Specific project roles with clearance and hours</li>
                <li><strong>Agile Six Roles:</strong> Internal company roles with pay bands (dollar amounts)</li>
                <li><strong>Rate Validation Rules:</strong> Rate validation criteria</li>
              </ul>
            </Box>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>Note:</strong> This will replace existing data. Make sure to download the current template first if you want to preserve existing data.
            </Alert>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileSelect(file);
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

      {/* Import Preview Dialog */}
      <Dialog open={showImportPreview} onClose={() => setShowImportPreview(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Import Preview</DialogTitle>
        <DialogContent>
          {importPreview && (
            <Box sx={{ pt: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Review the data that will be imported. Click "Confirm Import" to proceed or "Cancel" to abort.
              </Alert>
              
              {/* Import Mode Selection */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Import Mode</Typography>
                <FormControl component="fieldset">
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant={importMode === 'merge' ? 'contained' : 'outlined'}
                      onClick={() => setImportMode('merge')}
                      size="small"
                    >
                      Merge with existing data
                    </Button>
                    <Button
                      variant={importMode === 'replace' ? 'contained' : 'outlined'}
                      onClick={() => setImportMode('replace')}
                      size="small"
                      color="warning"
                    >
                      Replace all data
                    </Button>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {importMode === 'merge' 
                      ? 'New data will be added to existing data' 
                      : 'All existing data will be replaced with imported data'
                    }
                  </Typography>
                </FormControl>
              </Box>
              
              {/* Import Summary */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Import Summary</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">{importPreview.contractVehicles.length}</Typography>
                      <Typography variant="body2">Contract Vehicles</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">{importPreview.lcats.length}</Typography>
                      <Typography variant="body2">LCATs</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">{importPreview.projectRoles.length}</Typography>
                      <Typography variant="body2">Project Roles</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">{importPreview.companyRoles.length}</Typography>
                      <Typography variant="body2">Company Roles</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {/* LCATs by Vehicle */}
              {importPreview.lcats.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>LCATs by Vehicle</Typography>
                  {Object.entries(
                    importPreview.lcats.reduce((acc, lcat) => {
                      if (!acc[lcat.vehicle]) acc[lcat.vehicle] = [];
                      acc[lcat.vehicle].push(lcat);
                      return acc;
                    }, {} as Record<string, LCAT[]>)
                  ).map(([vehicle, lcats]) => (
                    <Box key={vehicle} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {vehicle} ({lcats.length} LCATs)
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Code</TableCell>
                              <TableCell>Rate</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {lcats.slice(0, 5).map((lcat) => (
                              <TableRow key={lcat.id}>
                                <TableCell>{lcat.name}</TableCell>
                                <TableCell>
                                  <Chip label={lcat.code} size="small" />
                                </TableCell>
                                <TableCell>${lcat.rate.toFixed(2)}</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={lcat.isActive ? 'Active' : 'Inactive'} 
                                    color={lcat.isActive ? 'success' : 'default'} 
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                            {lcats.length > 5 && (
                              <TableRow>
                                <TableCell colSpan={4} align="center">
                                  <Typography variant="body2" color="text.secondary">
                                    ... and {lcats.length - 5} more
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Contract Vehicles Preview */}
              {importPreview.contractVehicles.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Contract Vehicles</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Code</TableCell>
                          <TableCell>Start Date</TableCell>
                          <TableCell>End Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {importPreview.contractVehicles.slice(0, 5).map((vehicle) => (
                          <TableRow key={vehicle.id}>
                            <TableCell>{vehicle.name}</TableCell>
                            <TableCell>
                              <Chip label={vehicle.code} size="small" />
                            </TableCell>
                            <TableCell>{vehicle.startDate}</TableCell>
                            <TableCell>{vehicle.endDate}</TableCell>
                          </TableRow>
                        ))}
                        {importPreview.contractVehicles.length > 5 && (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              <Typography variant="body2" color="text.secondary">
                                ... and {importPreview.contractVehicles.length - 5} more
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImportPreview(false)}>Cancel</Button>
          <Button onClick={handleConfirmImport} variant="contained" color="primary">
            Confirm Import
          </Button>
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
