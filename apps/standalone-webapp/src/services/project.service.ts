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
      console.log('🔍 ProjectService.getProject - Fetching project:', id);
      console.log('🔍 ProjectService.getProject - URL:', `${this.baseUrl}/projects/${id}`);
      
      const response = await fetch(`${this.baseUrl}/projects/${id}`);
      const data = await response.json();
      
      console.log('🔍 ProjectService.getProject - Response status:', response.status);
      console.log('🔍 ProjectService.getProject - Response data:', JSON.stringify(data, null, 2));
      
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
      console.log('🔍 ProjectService.createProject - Input data:', JSON.stringify(projectData, null, 2));
      
      const response = await fetch(`${this.baseUrl}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      console.log('🔍 ProjectService.createProject - Response status:', response.status);
      console.log('🔍 ProjectService.createProject - Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('🔍 ProjectService.createProject - Raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('🔍 ProjectService.createProject - Parsed response:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('🔍 ProjectService.createProject - JSON parse error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
      
      if (!response.ok) {
        console.error('🔍 ProjectService.createProject - Error response:', data);
        throw new Error(data.message || data.error || 'Failed to create project');
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
    console.log('🔍 ProjectService.convertApiProjectToFrontend - Input:', JSON.stringify(apiProject, null, 2));
    
    const converted = {
      id: apiProject.id,
      name: apiProject.name,
      description: apiProject.description,
      lastModified: apiProject.updatedAt,
      status: 'draft', // Default status
      contractVehicle: apiProject.contractVehicle,
      overheadRate: apiProject.settings?.overheadRate || 0.30,
      gaRate: apiProject.settings?.gaRate || 0.15,
      feeRate: apiProject.settings?.feeRate || 0.10,
      laborCategories: apiProject.laborCategories || apiProject.laborCategoriesData || [],
      otherDirectCosts: apiProject.otherDirectCosts || [],
      tags: apiProject.tags || [],
    };
    
    console.log('🔍 ProjectService.convertApiProjectToFrontend - Output:', JSON.stringify(converted, null, 2));
    
    return converted;
  }

  /**
   * Convert frontend project format to API format
   */
  public static convertFrontendProjectToApi(frontendProject: ProjectData): any {
    return {
      name: frontendProject.name,
      description: frontendProject.description,
      contractVehicle: frontendProject.contractVehicle,
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
