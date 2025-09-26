/**
 * User Permissions Selector Component
 * Allows users to set their override permissions for testing/demo purposes
 */

import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  TextField,
  Grid,
  Alert,
} from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';
import { OverridePermissions } from '../types/labor-category';

interface UserPermissionsSelectorProps {
  permissions: OverridePermissions;
  onPermissionsChange: (permissions: OverridePermissions) => void;
  disabled?: boolean;
}

export const UserPermissionsSelector: React.FC<UserPermissionsSelectorProps> = ({
  permissions,
  onPermissionsChange,
  disabled = false,
}) => {
  const handleRoleChange = (role: string) => {
    onPermissionsChange({
      ...permissions,
      userRole: role,
      // Set permissions based on role
      canOverrideRates: role === 'admin' || role === 'manager',
      canOverrideContractLimits: role === 'admin',
      canOverrideValidation: role === 'admin' || role === 'manager',
    });
  };

  const handlePermissionChange = (field: keyof OverridePermissions, value: boolean) => {
    onPermissionsChange({
      ...permissions,
      [field]: value,
    });
  };

  const handleReasonChange = (reason: string) => {
    onPermissionsChange({
      ...permissions,
      reason: reason || undefined,
    });
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <SecurityIcon color="primary" />
          <Typography variant="h6">
            User Permissions
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={disabled}>
              <InputLabel>User Role</InputLabel>
              <Select
                value={permissions.userRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                label="User Role"
              >
                <MenuItem value="viewer">Viewer</MenuItem>
                <MenuItem value="analyst">Analyst</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Override Reason (Optional)"
              value={permissions.reason || ''}
              onChange={(e) => handleReasonChange(e.target.value)}
              disabled={disabled}
              placeholder="e.g., Special project requirements"
            />
          </Grid>
        </Grid>

        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Override Permissions
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={permissions.canOverrideRates}
                    onChange={(e) => handlePermissionChange('canOverrideRates', e.target.checked)}
                    disabled={disabled}
                  />
                }
                label="Override Rate Limits"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={permissions.canOverrideContractLimits}
                    onChange={(e) => handlePermissionChange('canOverrideContractLimits', e.target.checked)}
                    disabled={disabled}
                  />
                }
                label="Override Contract Limits"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={permissions.canOverrideValidation}
                    onChange={(e) => handlePermissionChange('canOverrideValidation', e.target.checked)}
                    disabled={disabled}
                  />
                }
                label="Override Validation"
              />
            </Grid>
          </Grid>
        </Box>

        {permissions.userRole === 'admin' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Administrator:</strong> You have full override permissions for all validation rules.
            </Typography>
          </Alert>
        )}

        {permissions.userRole === 'manager' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Manager:</strong> You can override rate limits and validation rules, but not contract vehicle limits.
            </Typography>
          </Alert>
        )}

        {(permissions.userRole === 'viewer' || permissions.userRole === 'analyst') && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>{permissions.userRole === 'viewer' ? 'Viewer' : 'Analyst'}:</strong> You cannot override validation rules. 
              All rates must be within acceptable limits.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default UserPermissionsSelector;
