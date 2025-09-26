/**
 * Export Panel Component
 * Provides export functionality for pricing calculations
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  TableChart as ExcelIcon,
  PictureAsPdf as PdfIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { ExportService, ExportOptions } from '../services/export.service';
import { CalculationResult, PricingSettings, LaborCategoryInput, OtherDirectCostInput } from '@pricing-calculator/types';

interface ExportPanelProps {
  calculationResult: CalculationResult | null;
  laborCategories: LaborCategoryInput[];
  otherDirectCosts: OtherDirectCostInput[];
  settings: PricingSettings;
  projectName?: string;
  contractVehicle?: string;
  disabled?: boolean;
}

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  calculationResult,
  laborCategories,
  otherDirectCosts,
  settings,
  projectName,
  contractVehicle,
  disabled = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const availableTemplates = await ExportService.getAvailableTemplates();
      setTemplates(availableTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = async (template: string = 'basic') => {
    if (!calculationResult) {
      setExportError('No calculation results to export');
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      const options: ExportOptions = {
        projectName,
        contractVehicle,
        template: template as 'basic' | 'va-spruce' | 'gsa-mas'
      };

      if (template === 'basic') {
        await ExportService.exportToExcel(
          calculationResult,
          laborCategories,
          otherDirectCosts,
          settings,
          options
        );
      } else {
        await ExportService.exportWithTemplate(
          template as 'va-spruce' | 'gsa-mas',
          calculationResult,
          laborCategories,
          otherDirectCosts,
          settings,
          options
        );
      }

      setLastExport(template);
      handleClose();
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const canExport = calculationResult && !disabled;

  return (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" component="h2">
            Export Results
          </Typography>
          {lastExport && (
            <Chip
              icon={<CheckCircleIcon />}
              label={`Last exported: ${templates.find(t => t.id === lastExport)?.name || lastExport}`}
              color="success"
              size="small"
            />
          )}
        </Box>

        {exportError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setExportError(null)}>
            {exportError}
          </Alert>
        )}

        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={isExporting ? <CircularProgress size={20} /> : <ExcelIcon />}
            onClick={() => handleExport('basic')}
            disabled={!canExport || isExporting}
            color="success"
          >
            {isExporting ? 'Exporting...' : 'Export Excel'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<MoreVertIcon />}
            onClick={handleExportClick}
            disabled={!canExport || isExporting}
          >
            More Options
          </Button>

          <Button
            variant="outlined"
            startIcon={<PdfIcon />}
            disabled={true} // PDF export not implemented yet
            color="error"
          >
            Export PDF (Coming Soon)
          </Button>
        </Box>

        {!canExport && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Complete your pricing calculation to enable export functionality.
          </Alert>
        )}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          {templates.map((template) => (
            <MenuItem
              key={template.id}
              onClick={() => handleExport(template.id)}
              disabled={isExporting}
            >
              <ListItemIcon>
                <ExcelIcon />
              </ListItemIcon>
              <ListItemText
                primary={template.name}
                secondary={template.description}
              />
            </MenuItem>
          ))}
        </Menu>

        {templates.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Available Templates:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {templates.map((template) => (
                <Chip
                  key={template.id}
                  label={template.name}
                  size="small"
                  variant="outlined"
                  onClick={() => handleExport(template.id)}
                  disabled={!canExport || isExporting}
                />
              ))}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ExportPanel;
