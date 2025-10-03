/**
 * Project Selection Dialog Component
 * Allows users to select and load existing projects
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FolderOpen as OpenIcon,
} from '@mui/icons-material';
import ProjectService, { ProjectData } from '../services/project.service';

interface ProjectSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectProject: (project: ProjectData) => void;
}

export const ProjectSelectionDialog: React.FC<ProjectSelectionDialogProps> = ({
  open,
  onClose,
  onSelectProject,
}) => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Load projects when dialog opens
  useEffect(() => {
    if (open) {
      loadProjects();
    }
  }, [open]);

  // Filter projects based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
      setFilteredProjects(filtered);
    }
  }, [projects, searchTerm]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ProjectService.getProjects();
      
      if (response.success && response.projects) {
        const convertedProjects = response.projects.map(ProjectService.convertApiProjectToFrontend);
        setProjects(convertedProjects);
        setFilteredProjects(convertedProjects);
      } else {
        throw new Error(response.message || 'Failed to load projects');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setError(error instanceof Error ? error.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (project: ProjectData) => {
    setSelectedProjectId(project.id);
  };

  const handleOpenProject = () => {
    if (selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId);
      if (project) {
        onSelectProject(project);
        onClose();
      }
    }
  };

  const handleDeleteProject = async (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        const response = await ProjectService.deleteProject(projectId);
        
        if (response.success) {
          // Remove project from local state
          setProjects(prev => prev.filter(p => p.id !== projectId));
          setFilteredProjects(prev => prev.filter(p => p.id !== projectId));
          
          if (selectedProjectId === projectId) {
            setSelectedProjectId(null);
          }
        } else {
          throw new Error(response.message || 'Failed to delete project');
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        setError(error instanceof Error ? error.message : 'Failed to delete project');
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div">
            Select Project
          </Typography>
          <Button
            variant="outlined"
            onClick={loadProjects}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <SearchIcon />}
          >
            Refresh
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          placeholder="Search projects by name, description, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Loading projects...
            </Typography>
          </Box>
        ) : filteredProjects.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              {searchTerm ? 'No projects match your search.' : 'No projects found.'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Create a new project to get started.
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredProjects.map((project) => (
              <ListItem
                key={project.id}
                button
                selected={selectedProjectId === project.id}
                onClick={() => handleSelectProject(project)}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {project.name}
                      </Typography>
                      <Chip
                        label={project.status}
                        size="small"
                        color={project.status === 'active' ? 'success' : 'default'}
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      {project.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {project.description}
                        </Typography>
                      )}
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="caption" color="text.secondary">
                          Modified: {formatDate(project.lastModified)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Categories: {project.laborCategories.length}
                        </Typography>
                        {project.tags && project.tags.length > 0 && (
                          <Box display="flex" gap={0.5}>
                            {project.tags.slice(0, 3).map((tag, index) => (
                              <Chip
                                key={index}
                                label={tag}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: '20px' }}
                              />
                            ))}
                            {project.tags.length > 3 && (
                              <Typography variant="caption" color="text.secondary">
                                +{project.tags.length - 3} more
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box display="flex" gap={0.5}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleOpenProject}
          variant="contained"
          disabled={!selectedProjectId}
          startIcon={<OpenIcon />}
        >
          Open Project
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectSelectionDialog;
