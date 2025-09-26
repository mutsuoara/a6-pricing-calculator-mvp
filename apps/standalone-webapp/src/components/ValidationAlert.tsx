/**
 * Validation Alert Component
 * Displays validation errors, warnings, and override options
 */

import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  Typography,
  Stack,
  Divider,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { ValidationError, OverridePermissions } from '../types/labor-category';

interface ValidationAlertProps {
  errors: ValidationError[];
  warnings: ValidationError[];
  permissions?: OverridePermissions;
  onOverride?: (field: string) => void;
  onDismiss?: (field: string) => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
}

export const ValidationAlert: React.FC<ValidationAlertProps> = ({
  errors,
  warnings,
  permissions,
  onOverride,
  onDismiss,
  expanded = false,
  onToggleExpanded,
}) => {
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;
  const hasIssues = hasErrors || hasWarnings;

  if (!hasIssues) {
    return (
      <Alert severity="success" icon={<CheckCircleIcon />}>
        <AlertTitle>Validation Passed</AlertTitle>
        All inputs are within acceptable ranges.
      </Alert>
    );
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  const canOverrideAny = errors.some(e => e.canOverride) || warnings.some(w => w.canOverride);
  const hasOverridePermission = permissions?.canOverrideValidation || permissions?.canOverrideContractLimits;

  return (
    <Box>
      {/* Summary Alert */}
      <Alert
        severity={hasErrors ? 'error' : 'warning'}
        icon={hasErrors ? <ErrorIcon /> : <WarningIcon />}
        action={
          hasIssues && onToggleExpanded ? (
            <IconButton
              color="inherit"
              size="small"
              onClick={onToggleExpanded}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          ) : undefined
        }
      >
        <AlertTitle>
          {hasErrors ? 'Validation Errors' : 'Validation Warnings'}
        </AlertTitle>
        {hasErrors && (
          <Typography variant="body2">
            {errors.length} error{errors.length !== 1 ? 's' : ''} found. 
            {canOverrideAny && hasOverridePermission && ' Some can be overridden.'}
          </Typography>
        )}
        {!hasErrors && hasWarnings && (
          <Typography variant="body2">
            {warnings.length} warning{warnings.length !== 1 ? 's' : ''} found.
            {warnings.some(w => w.canOverride) && hasOverridePermission && ' Some can be overridden.'}
          </Typography>
        )}
      </Alert>

      {/* Detailed Issues */}
      <Collapse in={expanded}>
        <Box mt={2}>
          {/* Errors */}
          {hasErrors && (
            <Box mb={2}>
              <Typography variant="h6" color="error" gutterBottom>
                Errors ({errors.length})
              </Typography>
              <Stack spacing={1}>
                {errors.map((error, index) => (
                  <Alert
                    key={`error-${index}`}
                    severity="error"
                    icon={getSeverityIcon(error.severity)}
                    action={
                      error.canOverride && hasOverridePermission && onOverride ? (
                        <Button
                          size="small"
                          color="inherit"
                          onClick={() => onOverride(error.field)}
                        >
                          Override
                        </Button>
                      ) : onDismiss ? (
                        <Button
                          size="small"
                          color="inherit"
                          onClick={() => onDismiss(error.field)}
                        >
                          Dismiss
                        </Button>
                      ) : undefined
                    }
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {error.field}
                    </Typography>
                    <Typography variant="body2">
                      {error.message}
                    </Typography>
                    {error.overrideReason && (
                      <Chip
                        label={error.overrideReason}
                        size="small"
                        color="warning"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Alert>
                ))}
              </Stack>
            </Box>
          )}

          {/* Warnings */}
          {hasWarnings && (
            <Box>
              <Typography variant="h6" color="warning.main" gutterBottom>
                Warnings ({warnings.length})
              </Typography>
              <Stack spacing={1}>
                {warnings.map((warning, index) => (
                  <Alert
                    key={`warning-${index}`}
                    severity="warning"
                    icon={getSeverityIcon(warning.severity)}
                    action={
                      warning.canOverride && hasOverridePermission && onOverride ? (
                        <Button
                          size="small"
                          color="inherit"
                          onClick={() => onOverride(warning.field)}
                        >
                          Override
                        </Button>
                      ) : onDismiss ? (
                        <Button
                          size="small"
                          color="inherit"
                          onClick={() => onDismiss(warning.field)}
                        >
                          Dismiss
                        </Button>
                      ) : undefined
                    }
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {warning.field}
                    </Typography>
                    <Typography variant="body2">
                      {warning.message}
                    </Typography>
                    {warning.overrideReason && (
                      <Chip
                        label={warning.overrideReason}
                        size="small"
                        color="warning"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Alert>
                ))}
              </Stack>
            </Box>
          )}

          {/* Override Information */}
          {canOverrideAny && hasOverridePermission && (
            <Box mt={2}>
              <Divider sx={{ mb: 2 }} />
              <Alert severity="info" icon={<InfoIcon />}>
                <AlertTitle>Override Available</AlertTitle>
                <Typography variant="body2">
                  You have permission to override some validation rules. 
                  Click "Override" on individual issues to proceed with your current values.
                </Typography>
              </Alert>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default ValidationAlert;
