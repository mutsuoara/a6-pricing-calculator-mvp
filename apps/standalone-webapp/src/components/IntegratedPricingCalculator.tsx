/**
 * Integrated Pricing Calculator Component
 * Orchestrates all pricing components into a unified interface
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Chip,
  Divider,
  Alert,
  Snackbar,
  Grid,
  TextField,
  Dialog,
} from '@mui/material';
import {
  Save as SaveIcon,
  FolderOpen as OpenIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Compare as CompareIcon,
  Edit as EditIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';

// Import existing components
import LaborCategoriesInput from './LaborCategoriesInput';
import CalculationResults from './CalculationResults';
import ContractVehicleSelector from './ContractVehicleSelector';
import ExportPanel from './ExportPanel';
import AdminDashboard from './AdminDashboard';

// Import types
import { LaborCategoryInput, ValidationError } from '../types/labor-category';
import { CalculationResult, PricingSettings, LaborCategoryInput as LaborCategoryInputType } from '@pricing-calculator/types';

interface ProjectData {
  id: string;
  name: string;
  lastModified: string;
  status: 'draft' | 'active' | 'archived';
  contractVehicle: string | undefined;
  overheadRate: number;
  gaRate: number;
  feeRate: number;
  laborCategories: LaborCategoryInput[];
  otherDirectCosts: any[];
}

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
      id={`calculator-tabpanel-${index}`}
      aria-labelledby={`calculator-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const IntegratedPricingCalculator: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [projectData, setProjectData] = useState<ProjectData>({
    id: 'demo-project-1',
    name: 'Demo Project',
    lastModified: new Date().toISOString(),
    status: 'draft',
    contractVehicle: 'GSA MAS',
    overheadRate: 0.30,
    gaRate: 0.15,
    feeRate: 0.10,
    laborCategories: [
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
        location: 'On-site',
      },
    ],
    otherDirectCosts: [],
  });

  // State for validation
  const [validationWarnings] = useState<ValidationError[]>([]);

  // Calculation state
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // UI state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStartEditingProjectName = () => {
    setEditingProjectName(projectData.name);
    setIsEditingProjectName(true);
  };

  const handleSaveProjectName = () => {
    if (editingProjectName.trim()) {
      setProjectData(prev => ({
        ...prev,
        name: editingProjectName.trim(),
        lastModified: new Date().toISOString(),
      }));
      setSnackbarMessage('Project name updated successfully!');
      setSnackbarOpen(true);
    }
    setIsEditingProjectName(false);
  };

  const handleCancelEditingProjectName = () => {
    setEditingProjectName('');
    setIsEditingProjectName(false);
  };

  const handleProjectNameKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSaveProjectName();
    } else if (event.key === 'Escape') {
      handleCancelEditingProjectName();
    }
  };

  const handleSaveProject = () => {
    setSnackbarMessage('Project saved successfully!');
    setSnackbarOpen(true);
    handleMenuClose();
  };

  const handleOpenProject = () => {
    setSnackbarMessage('Project opened successfully!');
    setSnackbarOpen(true);
    handleMenuClose();
  };

  const handleNewProject = () => {
    setProjectData({
      id: `project-${Date.now()}`,
      name: 'New Project',
      lastModified: new Date().toISOString(),
      status: 'draft',
      contractVehicle: undefined,
      overheadRate: 0.30,
      gaRate: 0.15,
      feeRate: 0.10,
      laborCategories: [],
      otherDirectCosts: [],
    });
    setSnackbarMessage('New project created!');
    setSnackbarOpen(true);
    handleMenuClose();
  };

  const handleExportExcel = async () => {
    if (!calculationResult) {
      setSnackbarMessage('No calculation results to export');
      setSnackbarOpen(true);
      return;
    }

    try {
      const { ExportService } = await import('../services/export.service');
      
      await ExportService.exportToExcel(
        calculationResult,
        projectData.laborCategories,
        projectData.otherDirectCosts,
        {
          projectId: projectData.id,
          contractType: 'FFP',
          periodOfPerformance: {
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          },
          overheadRate: projectData.overheadRate,
          gaRate: projectData.gaRate,
          feeRate: projectData.feeRate,
        },
        {
          projectName: projectData.name,
          contractVehicle: projectData.contractVehicle || 'Unknown',
        }
      );

      setSnackbarMessage('Excel file exported successfully!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Export error:', error);
      setSnackbarMessage(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSnackbarOpen(true);
    }
    
    handleMenuClose();
  };

  const handleExportPDF = () => {
    setSnackbarMessage('PDF export started!');
    setSnackbarOpen(true);
    handleMenuClose();
  };

  const handleShareProject = () => {
    setSnackbarMessage('Share link copied to clipboard!');
    setSnackbarOpen(true);
    handleMenuClose();
  };

  const handleCategoriesChange = (newCategories: LaborCategoryInput[]) => {
    setProjectData(prev => ({
      ...prev,
      laborCategories: newCategories,
      lastModified: new Date().toISOString(),
    }));
  };


  const handleContractVehicleChange = (vehicle: string | undefined) => {
    setProjectData(prev => ({
      ...prev,
      contractVehicle: vehicle,
      lastModified: new Date().toISOString(),
    }));
  };

  // Calculate project results
  const calculateProject = useCallback(async () => {
    if (projectData.laborCategories.length === 0) {
      setCalculationResult(null);
      return;
    }

    setIsCalculating(true);
    try {
      // Convert categories to the format expected by the calculation service
      const laborCategories: LaborCategoryInputType[] = projectData.laborCategories.map(cat => ({
        title: cat.title,
        baseRate: cat.baseRate,
        hours: cat.hours,
        ftePercentage: cat.ftePercentage / 100, // Convert percentage to decimal
        clearanceLevel: cat.clearanceLevel as any,
        location: cat.location as any,
      }));

      // Create pricing settings
      const settings: PricingSettings = {
        projectId: projectData.id,
        overheadRate: projectData.overheadRate,
        gaRate: projectData.gaRate,
        feeRate: projectData.feeRate,
        contractType: 'FFP' as any,
        periodOfPerformance: {
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        },
      };

      // Mock calculation (replace with actual API call)
      const mockResult: CalculationResult = {
        projectId: projectData.id,
        calculatedAt: new Date().toISOString(),
        settings,
        laborCategories: laborCategories.map((lc, index) => {
          const clearancePremium = lc.clearanceLevel === 'Top Secret' ? 0.20 : 
                                 lc.clearanceLevel === 'Secret' ? 0.10 : 
                                 lc.clearanceLevel === 'Public Trust' ? 0.05 : 0;
          const clearanceAdjustedRate = lc.baseRate * (1 + clearancePremium);
          const overheadAmount = clearanceAdjustedRate * projectData.overheadRate;
          const gaAmount = (clearanceAdjustedRate + overheadAmount) * projectData.gaRate;
          const feeAmount = (clearanceAdjustedRate + overheadAmount + gaAmount) * projectData.feeRate;
          const burdenedRate = clearanceAdjustedRate + overheadAmount + gaAmount + feeAmount;
          const totalCost = burdenedRate * lc.hours * lc.ftePercentage;

          return {
            id: `temp-${Date.now()}-${index}`,
            title: lc.title,
            baseRate: lc.baseRate,
            hours: lc.hours,
            ftePercentage: lc.ftePercentage,
            effectiveHours: lc.hours * lc.ftePercentage,
            clearanceLevel: lc.clearanceLevel as any,
            location: lc.location as any,
            clearancePremium,
            clearanceAdjustedRate,
            overheadAmount,
            overheadRate: projectData.overheadRate,
            gaAmount,
            gaRate: projectData.gaRate,
            feeAmount,
            feeRate: projectData.feeRate,
            totalCost,
            burdenedRate,
          };
        }),
        otherDirectCosts: [],
        totals: {
          laborCost: 0,
          odcCost: 0,
          totalCost: 0,
          totalEffectiveHours: 0,
          averageBurdenedRate: 0,
        },
        validationWarnings: validationWarnings,
      };

      // Calculate totals
      const laborCost = mockResult.laborCategories.reduce((sum, lc) => sum + lc.totalCost, 0);
      const totalEffectiveHours = mockResult.laborCategories.reduce((sum, lc) => sum + lc.effectiveHours, 0);
      const averageBurdenedRate = totalEffectiveHours > 0 ? laborCost / totalEffectiveHours : 0;

      mockResult.totals = {
        laborCost,
        odcCost: 0,
        totalCost: laborCost,
        totalEffectiveHours,
        averageBurdenedRate,
      };

      setCalculationResult(mockResult);
    } catch (error) {
      console.error('Calculation error:', error);
      setCalculationResult(null);
    } finally {
      setIsCalculating(false);
    }
  }, [projectData, validationWarnings]);

  // Run calculation when inputs change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateProject();
    }, 300); // Debounce calculation

    return () => clearTimeout(timeoutId);
  }, [calculateProject]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'active': return 'success';
      case 'archived': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Project Header */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              {isEditingProjectName ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <TextField
                    value={editingProjectName}
                    onChange={(e) => setEditingProjectName(e.target.value)}
                    onKeyDown={handleProjectNameKeyPress}
                    onBlur={handleSaveProjectName}
                    autoFocus
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        height: '48px',
                      }
                    }}
                  />
                  <Button
                    size="small"
                    onClick={handleSaveProjectName}
                    color="primary"
                    variant="contained"
                  >
                    Save
                  </Button>
                  <Button
                    size="small"
                    onClick={handleCancelEditingProjectName}
                    color="secondary"
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold"
                    sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    onClick={handleStartEditingProjectName}
                  >
                    {projectData.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={handleStartEditingProjectName}
                    sx={{ ml: 1 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              <Typography variant="body2" color="text.secondary">
                Last modified: {new Date(projectData.lastModified).toLocaleDateString()}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Chip 
                label={projectData.status.toUpperCase()} 
                color={getStatusColor(projectData.status) as any}
                size="small"
              />
              {projectData.contractVehicle && (
                <Chip 
                  label={projectData.contractVehicle} 
                  variant="outlined"
                  size="small"
                />
              )}
              <IconButton onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {/* Project Actions */}
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveProject}
            >
              Save Project
            </Button>
            <Button
              variant="outlined"
              startIcon={<OpenIcon />}
              onClick={handleOpenProject}
            >
              Open Project
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleNewProject}
            >
              New Project
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportExcel}
            >
              Export Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={handleShareProject}
            >
              Share
            </Button>
            <Button
              variant="outlined"
              startIcon={<AdminIcon />}
              onClick={() => setShowAdminDashboard(true)}
              sx={{ 
                borderColor: '#f44336',
                color: '#f44336',
                '&:hover': { 
                  borderColor: '#d32f2f',
                  backgroundColor: 'rgba(244, 67, 54, 0.04)'
                }
              }}
            >
              Admin
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Main Calculator Tabs */}
      <Paper elevation={2}>
        <AppBar position="static" color="default" elevation={0}>
          <Toolbar variant="dense">
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                label="Project Settings" 
                icon={<SettingsIcon />}
                iconPosition="start"
              />
              <Tab 
                label="Labor Categories" 
                icon={<PeopleIcon />}
                iconPosition="start"
              />
              <Tab 
                label="Other Direct Costs" 
                icon={<MoneyIcon />}
                iconPosition="start"
              />
              <Tab 
                label="Results" 
                icon={<TrendingUpIcon />}
                iconPosition="start"
              />
              <Tab 
                label="Scenarios" 
                icon={<CompareIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Toolbar>
        </AppBar>

        {/* Tab Panels */}
        <TabPanel value={currentTab} index={0}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Project Settings
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Configure your project settings including contract vehicle, rates, and validation rules.
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ContractVehicleSelector
                selectedVehicle={projectData.contractVehicle}
                onVehicleChange={handleContractVehicleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Alert severity="info">
                User permissions and override settings are managed in the Admin Dashboard.
                Contact your administrator to modify permissions.
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Labor Categories
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Add and manage labor categories for your project. Configure rates, hours, and clearance levels.
          </Alert>
          
          <LaborCategoriesInput
            categories={projectData.laborCategories}
            onCategoriesChange={handleCategoriesChange}
            overheadRate={projectData.overheadRate}
            gaRate={projectData.gaRate}
            feeRate={projectData.feeRate}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Other Direct Costs
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Add other direct costs such as travel, equipment, software, and other project expenses.
          </Alert>
          <Typography variant="body1" color="text.secondary">
            Other direct costs management will be implemented here.
          </Typography>
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Calculation Results
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            View detailed calculation results, cost breakdowns, and project summaries.
          </Alert>
          
          <CalculationResults
            result={calculationResult}
            laborCategories={projectData.laborCategories}
            otherDirectCosts={projectData.otherDirectCosts}
            validationWarnings={validationWarnings}
            isLoading={isCalculating}
          />
          
          <Box mt={4}>
            <ExportPanel
              calculationResult={calculationResult}
              laborCategories={projectData.laborCategories}
              otherDirectCosts={projectData.otherDirectCosts}
              settings={{
                projectId: projectData.id,
                contractType: 'FFP',
                periodOfPerformance: {
                  startDate: new Date().toISOString(),
                  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                },
                overheadRate: projectData.overheadRate,
                gaRate: projectData.gaRate,
                feeRate: projectData.feeRate,
              }}
              projectName={projectData.name}
              contractVehicle={projectData.contractVehicle || 'Unknown'}
            />
          </Box>
        </TabPanel>

        <TabPanel value={currentTab} index={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Scenario Comparison
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Compare different pricing scenarios and analyze the impact of various rate changes.
          </Alert>
          <Typography variant="body1" color="text.secondary">
            Scenario comparison functionality will be implemented here.
          </Typography>
        </TabPanel>
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleSaveProject}>
          <SaveIcon sx={{ mr: 1 }} />
          Save Project
        </MenuItem>
        <MenuItem onClick={handleOpenProject}>
          <OpenIcon sx={{ mr: 1 }} />
          Open Project
        </MenuItem>
        <MenuItem onClick={handleNewProject}>
          <AddIcon sx={{ mr: 1 }} />
          New Project
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleExportExcel}>
          <DownloadIcon sx={{ mr: 1 }} />
          Export to Excel
        </MenuItem>
        <MenuItem onClick={handleExportPDF}>
          <DownloadIcon sx={{ mr: 1 }} />
          Export to PDF
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleShareProject}>
          <ShareIcon sx={{ mr: 1 }} />
          Share Project
        </MenuItem>
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />

      {/* Admin Dashboard Dialog */}
      <Dialog
        open={showAdminDashboard}
        onClose={() => setShowAdminDashboard(false)}
        maxWidth="xl"
        fullWidth
        fullScreen
      >
        <Box sx={{ height: '100vh', overflow: 'auto' }}>
          <AdminDashboard />
          <Box sx={{ p: 2, textAlign: 'right' }}>
            <Button
              variant="contained"
              onClick={() => setShowAdminDashboard(false)}
            >
              Close Admin Dashboard
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default IntegratedPricingCalculator;
