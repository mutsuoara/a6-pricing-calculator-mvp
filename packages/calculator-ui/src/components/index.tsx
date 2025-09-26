/**
 * UI components exports
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Container,
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
} from '@mui/material';
import {
  Save as SaveIcon,
  FolderOpen as OpenIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

// Import types (these would be imported from the types package in a real implementation)
interface ProjectData {
  id: string;
  name: string;
  lastModified: string;
  status: 'draft' | 'active' | 'archived';
  contractVehicle: string | undefined;
  overheadRate: number;
  gaRate: number;
  feeRate: number;
  laborCategories: any[];
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

export const PricingCalculator: React.FC = () => {
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
    laborCategories: [],
    otherDirectCosts: [],
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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

  const handleExportExcel = () => {
    setSnackbarMessage('Excel export started!');
    setSnackbarOpen(true);
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
              <Typography variant="h4" fontWeight="bold">
                {projectData.name}
              </Typography>
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
              <Tab label="Labor Categories" />
              <Tab label="Other Direct Costs" />
              <Tab label="Results" />
              <Tab label="Scenarios" />
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
          <Typography variant="body1" color="text.secondary">
            Project settings configuration will be implemented here.
          </Typography>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Labor Categories
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Add and manage labor categories for your project. Configure rates, hours, and clearance levels.
          </Alert>
          <Typography variant="body1" color="text.secondary">
            Labor categories management will be implemented here.
          </Typography>
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
          <Typography variant="body1" color="text.secondary">
            Calculation results display will be implemented here.
          </Typography>
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
    </Box>
  );
};
