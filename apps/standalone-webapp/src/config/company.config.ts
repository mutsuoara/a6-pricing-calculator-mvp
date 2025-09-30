/**
 * Company Configuration
 * Centralized configuration for company-specific settings
 */

export interface CompanyConfig {
  name: string;
  shortName: string;
  rolePrefix: string; // e.g., "Agile Six" -> "Agile Six Roles"
  description: string;
  website?: string;
  logo?: string;
}

// Default company configuration
export const DEFAULT_COMPANY_CONFIG: CompanyConfig = {
  name: 'Agile Six',
  shortName: 'A6',
  rolePrefix: 'Agile Six',
  description: 'Agile Six - Digital transformation and technology consulting',
  website: 'https://agilesix.com',
};

// Company configuration store
class CompanyConfigService {
  private config: CompanyConfig = DEFAULT_COMPANY_CONFIG;

  /**
   * Get current company configuration
   */
  getConfig(): CompanyConfig {
    return { ...this.config };
  }

  /**
   * Update company configuration
   */
  updateConfig(newConfig: Partial<CompanyConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // In a real implementation, this would persist to localStorage or API
    localStorage.setItem('companyConfig', JSON.stringify(this.config));
  }

  /**
   * Load configuration from storage
   */
  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('companyConfig');
      if (stored) {
        this.config = { ...DEFAULT_COMPANY_CONFIG, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load company config from storage:', error);
    }
  }

  /**
   * Get company-specific labels
   */
  getLabels() {
    return {
      companyRoles: `${this.config.rolePrefix} Roles`,
      companyRole: `${this.config.rolePrefix} Role`,
      companyRoleManagement: `${this.config.rolePrefix} Role Management`,
      companyRoleTemplate: `${this.config.rolePrefix} Role Template`,
    };
  }

  /**
   * Get company-specific placeholders
   */
  getPlaceholders() {
    return {
      companyRoleName: `e.g., "Senior Software Engineer at ${this.config.name}"`,
      practiceArea: `e.g., "Engineering", "Product", "Design"`,
      payBand: `e.g., "Band 5", "Senior Level", "Principal Level"`,
    };
  }
}

// Export singleton instance
export const companyConfigService = new CompanyConfigService();

// Initialize from storage on module load
if (typeof window !== 'undefined') {
  companyConfigService.loadFromStorage();
}
