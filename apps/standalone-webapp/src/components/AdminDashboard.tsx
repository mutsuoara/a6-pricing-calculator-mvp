/**
 * Admin Dashboard Component
 * Manages user permissions, role assignments, and system settings
 */

import React, { useState } from 'react';
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
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { OverridePermissions } from '../types/labor-category';
import { useSystemSettings } from '../hooks/useSystemSettings';
import LCATManagement from './LCATManagement';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
  permissions: OverridePermissions;
  lastActive: string;
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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const { settings, setWrapRate } = useSystemSettings();
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Anthony Arashiro',
      email: 'anthony@agile6.com',
      role: 'admin',
      permissions: {
        canOverrideRates: true,
        canOverrideContractLimits: true,
        canOverrideValidation: true,
        userRole: 'admin',
      },
      lastActive: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      name: 'Project Manager',
      email: 'pm@agile6.com',
      role: 'manager',
      permissions: {
        canOverrideRates: true,
        canOverrideContractLimits: false,
        canOverrideValidation: true,
        userRole: 'manager',
      },
      lastActive: '2024-01-15T09:15:00Z',
    },
    {
      id: '3',
      name: 'Pricing Analyst',
      email: 'analyst@agile6.com',
      role: 'analyst',
      permissions: {
        canOverrideRates: false,
        canOverrideContractLimits: false,
        canOverrideValidation: false,
        userRole: 'analyst',
      },
      lastActive: '2024-01-15T08:45:00Z',
    },
  ]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (selectedUser) {
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id ? selectedUser : user
      ));
    }
    setEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handlePermissionChange = (permission: keyof OverridePermissions, value: boolean) => {
    if (selectedUser) {
      setSelectedUser(prev => prev ? {
        ...prev,
        permissions: {
          ...prev.permissions,
          [permission]: value,
        }
      } : null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'analyst': return 'info';
      case 'viewer': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            <AdminIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage user permissions, roles, and system settings
          </Typography>
        </Box>
      </Paper>

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
              <Tab 
                label="User Management" 
                icon={<PeopleIcon />}
                iconPosition="start"
              />
              <Tab 
                label="Permissions" 
                icon={<SecurityIcon />}
                iconPosition="start"
              />
              <Tab 
                label="System Settings" 
                icon={<SettingsIcon />}
                iconPosition="start"
              />
              <Tab 
                label="LCAT Management" 
                icon={<BusinessIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Toolbar>
        </AppBar>

        {/* Tab Panels */}
        <TabPanel value={currentTab} index={0}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            User Management
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Manage user accounts, roles, and access permissions for the pricing calculator.
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Active Users
                  </Typography>
                  <List>
                    {users.map((user) => (
                      <ListItem key={user.id} divider>
                        <ListItemText
                          primary={user.name}
                          secondary={`${user.email} • Last active: ${new Date(user.lastActive).toLocaleDateString()}`}
                        />
                        <ListItemSecondaryAction>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip 
                              label={user.role.toUpperCase()} 
                              color={getRoleColor(user.role) as any}
                              size="small"
                            />
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleEditUser(user)}
                            >
                              Edit
                            </Button>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Stats
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box>
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {users.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Users
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="h4" color="success.main" fontWeight="bold">
                        {users.filter(u => u.role === 'admin' || u.role === 'manager').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Administrators
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Permission Settings
          </Typography>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Permission changes take effect immediately. Use caution when modifying user permissions.
          </Alert>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Role-Based Permissions
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Administrator
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <FormControlLabel
                      control={<Switch checked={true} disabled />}
                      label="Override Rates"
                    />
                    <FormControlLabel
                      control={<Switch checked={true} disabled />}
                      label="Override Contract Limits"
                    />
                    <FormControlLabel
                      control={<Switch checked={true} disabled />}
                      label="Override Validation"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Manager
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <FormControlLabel
                      control={<Switch checked={true} disabled />}
                      label="Override Rates"
                    />
                    <FormControlLabel
                      control={<Switch checked={false} disabled />}
                      label="Override Contract Limits"
                    />
                    <FormControlLabel
                      control={<Switch checked={true} disabled />}
                      label="Override Validation"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Analyst
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <FormControlLabel
                      control={<Switch checked={false} disabled />}
                      label="Override Rates"
                    />
                    <FormControlLabel
                      control={<Switch checked={false} disabled />}
                      label="Override Contract Limits"
                    />
                    <FormControlLabel
                      control={<Switch checked={false} disabled />}
                      label="Override Validation"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Viewer
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <FormControlLabel
                      control={<Switch checked={false} disabled />}
                      label="Override Rates"
                    />
                    <FormControlLabel
                      control={<Switch checked={false} disabled />}
                      label="Override Contract Limits"
                    />
                    <FormControlLabel
                      control={<Switch checked={false} disabled />}
                      label="Override Validation"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            System Settings
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Configure global system settings and defaults for the pricing calculator.
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Default Settings
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                      label="Default Overhead Rate"
                      type="number"
                      defaultValue="30"
                      InputProps={{ endAdornment: '%' }}
                      size="small"
                    />
                    <TextField
                      label="Default G&A Rate"
                      type="number"
                      defaultValue="15"
                      InputProps={{ endAdornment: '%' }}
                      size="small"
                    />
                    <TextField
                      label="Default Fee Rate"
                      type="number"
                      defaultValue="10"
                      InputProps={{ endAdornment: '%' }}
                      size="small"
                    />
                    <TextField
                      label="Wrap Rate"
                      type="number"
                      value={settings.wrapRate}
                      onChange={(e) => setWrapRate(parseFloat(e.target.value) || 0)}
                      InputProps={{ endAdornment: '%' }}
                      size="small"
                      helperText="System-wide wrap rate applied to all labor categories"
                    />
                    <FormControl size="small">
                      <InputLabel>Default Contract Type</InputLabel>
                      <Select defaultValue="FFP">
                        <MenuItem value="FFP">FFP - Firm Fixed Price</MenuItem>
                        <MenuItem value="T&M">T&M - Time & Materials</MenuItem>
                        <MenuItem value="CPFF">CPFF - Cost Plus Fixed Fee</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Security Settings
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Require authentication for all actions"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Log all permission overrides"
                    />
                    <FormControlLabel
                      control={<Switch />}
                      label="Enable audit trail"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Require approval for rate overrides"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <LCATManagement />
        </TabPanel>
      </Paper>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit User Permissions</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedUser.name} ({selectedUser.email})
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Role: {selectedUser.role.toUpperCase()}
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Permissions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedUser.permissions.canOverrideRates}
                      onChange={(e) => handlePermissionChange('canOverrideRates', e.target.checked)}
                    />
                  }
                  label="Can Override Rates"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedUser.permissions.canOverrideContractLimits}
                      onChange={(e) => handlePermissionChange('canOverrideContractLimits', e.target.checked)}
                    />
                  }
                  label="Can Override Contract Limits"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedUser.permissions.canOverrideValidation}
                      onChange={(e) => handlePermissionChange('canOverrideValidation', e.target.checked)}
                    />
                  }
                  label="Can Override Validation"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;

