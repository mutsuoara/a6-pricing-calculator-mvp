/**
 * Project Service
 * Handles project persistence operations
 */

export interface ProjectData {
  id: string;
  name: string;
  description?: string;
  lastModified: string;
  status: 'draft' | 'active' | 'archived';
  contractVehicle?: string;
  overheadRate: number;
  gaRate: number;
  feeRate: number;
  laborCategories: any[];
  otherDirectCosts: any[];
  tags?: string[];
}

export interface ProjectResponse {
  success: boolean;
  project?: ProjectData;
  projects?: ProjectData[];
  message: string;
  error?: string;
}

class ProjectService {
  private static baseUrl = '/api/pricing';

  /**
   * Get all projects
   */
  public static async getProjects(): Promise<ProjectResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/projects`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch projects');
      }

      return data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch projects',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get a specific project by ID
   */
  public static async getProject(id: string): Promise<ProjectResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch project');
      }

      return data;
    } catch (error) {
      console.error('Error fetching project:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch project',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create a new project
   */
  public static async createProject(projectData: Partial<ProjectData>): Promise<ProjectResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create project');
      }

      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create project',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update an existing project
   */
  public static async updateProject(id: string, projectData: Partial<ProjectData>): Promise<ProjectResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update project');
      }

      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update project',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete a project
   */
  public static async deleteProject(id: string): Promise<ProjectResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete project');
      }

      return data;
    } catch (error) {
      console.error('Error deleting project:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete project',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Convert API project format to frontend format
   */
  public static convertApiProjectToFrontend(apiProject: any): ProjectData {
    return {
      id: apiProject.id,
      name: apiProject.name,
      description: apiProject.description,
      lastModified: apiProject.updatedAt,
      status: 'draft', // Default status
      contractVehicle: undefined,
      overheadRate: apiProject.settings?.overheadRate || 0.30,
      gaRate: apiProject.settings?.gaRate || 0.15,
      feeRate: apiProject.settings?.feeRate || 0.10,
      laborCategories: apiProject.laborCategories || [],
      otherDirectCosts: apiProject.otherDirectCosts || [],
      tags: apiProject.tags || [],
    };
  }

  /**
   * Convert frontend project format to API format
   */
  public static convertFrontendProjectToApi(frontendProject: ProjectData): any {
    return {
      name: frontendProject.name,
      description: frontendProject.description,
      settings: {
        overheadRate: frontendProject.overheadRate,
        gaRate: frontendProject.gaRate,
        feeRate: frontendProject.feeRate,
      },
      laborCategories: frontendProject.laborCategories,
      otherDirectCosts: frontendProject.otherDirectCosts,
      tags: frontendProject.tags,
    };
  }
}

export default ProjectService;
