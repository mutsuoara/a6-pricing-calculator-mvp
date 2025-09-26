/**
 * Seed LCAT Data Script
 * Populates the database with initial contract vehicles, A6 roles, and LCAT templates
 */

import { DatabaseService } from '../config/database';
import { ContractVehicle, A6Role, LaborCategoryTemplate } from '../models';

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000'; // Default tenant UUID for seed data

async function seedContractVehicles() {
  console.log('🌱 Seeding contract vehicles...');
  
  const vehicles = [
    {
      tenantId: TENANT_ID,
      name: 'GSA MAS',
      code: 'GSA_MAS',
      description: 'General Services Administration Multiple Award Schedule',
      rateStructure: 'burdened' as const,
      maxOverheadRate: 40,
      maxGaRate: 15,
      maxFeeRate: 10,
      complianceRequirements: ['GSA compliance', 'SAM registration', 'CPARS reporting'],
      isActive: true,
    },
    {
      tenantId: TENANT_ID,
      name: 'VA SPRUCE',
      code: 'VA_SPRUCE',
      description: 'Veterans Affairs Strategic Partnering for Readiness in Critical Endeavors',
      rateStructure: 'burdened' as const,
      maxOverheadRate: 35,
      maxGaRate: 12,
      maxFeeRate: 8,
      complianceRequirements: ['VA compliance', 'Veterans preference', 'Security clearance requirements'],
      isActive: true,
    },
    {
      tenantId: TENANT_ID,
      name: 'OPM (GSA)',
      code: 'OPM_GSA',
      description: 'Office of Personnel Management through GSA',
      rateStructure: 'burdened' as const,
      maxOverheadRate: 38,
      maxGaRate: 14,
      maxFeeRate: 9,
      complianceRequirements: ['OPM compliance', 'Federal employee regulations', 'GSA terms'],
      isActive: true,
    },
    {
      tenantId: TENANT_ID,
      name: 'HHS SWIFT (GSA)',
      code: 'HHS_SWIFT_GSA',
      description: 'Health and Human Services SWIFT through GSA',
      rateStructure: 'burdened' as const,
      maxOverheadRate: 42,
      maxGaRate: 16,
      maxFeeRate: 11,
      complianceRequirements: ['HHS compliance', 'Healthcare regulations', 'GSA terms', 'HIPAA compliance'],
      isActive: true,
    },
  ];

  for (const vehicleData of vehicles) {
    const [vehicle, created] = await ContractVehicle.findOrCreate({
      where: { code: vehicleData.code, tenantId: TENANT_ID },
      defaults: vehicleData,
    });
    
    if (created) {
      console.log(`✅ Created contract vehicle: ${vehicle.name}`);
    } else {
      console.log(`⏭️  Contract vehicle already exists: ${vehicle.name}`);
    }
  }
}

async function seedA6Roles() {
  console.log('🌱 Seeding A6 roles...');
  
  const roles = [
    // Engineering Department
    {
      tenantId: TENANT_ID,
      name: 'Junior Software Engineer',
      code: 'JSE',
      description: 'Entry-level software development role with focus on learning and growth',
      department: 'Engineering',
      level: 'junior' as const,
      careerPath: ['Mid Software Engineer', 'Senior Software Engineer'],
      requiredSkills: ['Programming fundamentals', 'Version control', 'Basic testing'],
      typicalClearanceLevel: 'None' as const,
      typicalLocation: 'Remote' as const,
      isActive: true,
    },
    {
      tenantId: TENANT_ID,
      name: 'Mid Software Engineer',
      code: 'MSE',
      description: 'Mid-level software development role with increasing responsibility',
      department: 'Engineering',
      level: 'mid' as const,
      careerPath: ['Senior Software Engineer', 'Technical Lead'],
      requiredSkills: ['Advanced programming', 'System design', 'Code review', 'Mentoring'],
      typicalClearanceLevel: 'Public Trust' as const,
      typicalLocation: 'Hybrid' as const,
      isActive: true,
    },
    {
      tenantId: TENANT_ID,
      name: 'Senior Software Engineer',
      code: 'SSE',
      description: 'Senior-level software development role with technical leadership',
      department: 'Engineering',
      level: 'senior' as const,
      careerPath: ['Technical Lead', 'Principal Engineer', 'Engineering Manager'],
      requiredSkills: ['Architecture design', 'Technical leadership', 'Mentoring', 'Cross-functional collaboration'],
      typicalClearanceLevel: 'Secret' as const,
      typicalLocation: 'On-site' as const,
      isActive: true,
    },
    {
      tenantId: TENANT_ID,
      name: 'Technical Lead',
      code: 'TL',
      description: 'Technical leadership role with team management responsibilities',
      department: 'Engineering',
      level: 'lead' as const,
      careerPath: ['Principal Engineer', 'Engineering Manager', 'Director of Engineering'],
      requiredSkills: ['Technical leadership', 'Team management', 'Strategic planning', 'Client interaction'],
      typicalClearanceLevel: 'Secret' as const,
      typicalLocation: 'On-site' as const,
      isActive: true,
    },
    {
      tenantId: TENANT_ID,
      name: 'DevOps Engineer',
      code: 'DOE',
      description: 'Infrastructure and deployment automation specialist',
      department: 'Engineering',
      level: 'senior' as const,
      careerPath: ['Senior DevOps Engineer', 'Infrastructure Architect'],
      requiredSkills: ['Cloud platforms', 'CI/CD', 'Infrastructure as Code', 'Monitoring'],
      typicalClearanceLevel: 'Secret' as const,
      typicalLocation: 'On-site' as const,
      isActive: true,
    },
    {
      tenantId: TENANT_ID,
      name: 'Data Scientist',
      code: 'DS',
      description: 'Data analysis and machine learning specialist',
      department: 'Engineering',
      level: 'senior' as const,
      careerPath: ['Senior Data Scientist', 'Data Engineering Lead'],
      requiredSkills: ['Machine learning', 'Statistical analysis', 'Python/R', 'Data visualization'],
      typicalClearanceLevel: 'Secret' as const,
      typicalLocation: 'Hybrid' as const,
      isActive: true,
    },
    
    // Management Department
    {
      tenantId: TENANT_ID,
      name: 'Project Manager',
      code: 'PM',
      description: 'Project management and delivery coordination',
      department: 'Management',
      level: 'mid' as const,
      careerPath: ['Senior Project Manager', 'Program Manager'],
      requiredSkills: ['Project management', 'Agile methodologies', 'Stakeholder management', 'Risk management'],
      typicalClearanceLevel: 'Public Trust' as const,
      typicalLocation: 'Hybrid' as const,
      isActive: true,
    },
    {
      tenantId: TENANT_ID,
      name: 'Program Manager',
      code: 'PGM',
      description: 'Program-level management and strategic oversight',
      department: 'Management',
      level: 'senior' as const,
      careerPath: ['Senior Program Manager', 'Director of Programs'],
      requiredSkills: ['Program management', 'Strategic planning', 'Client relationship management', 'Budget management'],
      typicalClearanceLevel: 'Secret' as const,
      typicalLocation: 'On-site' as const,
      isActive: true,
    },
    {
      tenantId: TENANT_ID,
      name: 'Scrum Master',
      code: 'SM',
      description: 'Agile process facilitation and team coaching',
      department: 'Management',
      level: 'mid' as const,
      careerPath: ['Senior Scrum Master', 'Agile Coach'],
      requiredSkills: ['Agile methodologies', 'Team facilitation', 'Process improvement', 'Conflict resolution'],
      typicalClearanceLevel: 'Public Trust' as const,
      typicalLocation: 'Hybrid' as const,
      isActive: true,
    },
    
    // Administrative Department
    {
      tenantId: TENANT_ID,
      name: 'Business Analyst',
      code: 'BA',
      description: 'Business requirements analysis and process improvement',
      department: 'Administrative',
      level: 'mid' as const,
      careerPath: ['Senior Business Analyst', 'Product Manager'],
      requiredSkills: ['Requirements analysis', 'Process mapping', 'Stakeholder communication', 'Documentation'],
      typicalClearanceLevel: 'Public Trust' as const,
      typicalLocation: 'Remote' as const,
      isActive: true,
    },
    {
      tenantId: TENANT_ID,
      name: 'Contract Specialist',
      code: 'CS',
      description: 'Contract management and compliance oversight',
      department: 'Administrative',
      level: 'senior' as const,
      careerPath: ['Senior Contract Specialist', 'Contract Manager'],
      requiredSkills: ['Contract law', 'Compliance management', 'Risk assessment', 'Negotiation'],
      typicalClearanceLevel: 'Public Trust' as const,
      typicalLocation: 'On-site' as const,
      isActive: true,
    },
    
    // Support Department
    {
      tenantId: TENANT_ID,
      name: 'Help Desk Technician',
      code: 'HDT',
      description: 'Technical support and user assistance',
      department: 'Support',
      level: 'junior' as const,
      careerPath: ['Senior Help Desk Technician', 'System Administrator'],
      requiredSkills: ['Technical troubleshooting', 'Customer service', 'Documentation', 'Ticketing systems'],
      typicalClearanceLevel: 'Public Trust' as const,
      typicalLocation: 'On-site' as const,
      isActive: true,
    },
    {
      tenantId: TENANT_ID,
      name: 'System Administrator',
      code: 'SA',
      description: 'System administration and infrastructure management',
      department: 'Support',
      level: 'mid' as const,
      careerPath: ['Senior System Administrator', 'Infrastructure Engineer'],
      requiredSkills: ['System administration', 'Network management', 'Security protocols', 'Backup and recovery'],
      typicalClearanceLevel: 'Secret' as const,
      typicalLocation: 'On-site' as const,
      isActive: true,
    },
  ];

  for (const roleData of roles) {
    const [role, created] = await A6Role.findOrCreate({
      where: { code: roleData.code, tenantId: TENANT_ID },
      defaults: roleData,
    });
    
    if (created) {
      console.log(`✅ Created A6 role: ${role.name}`);
    } else {
      console.log(`⏭️  A6 role already exists: ${role.name}`);
    }
  }
}

async function seedLCATTemplates() {
  console.log('🌱 Seeding LCAT templates...');
  
  // Get contract vehicles and A6 roles for mapping
  const vehicles = await ContractVehicle.findAll({ where: { tenantId: TENANT_ID } });
  const roles = await A6Role.findAll({ where: { tenantId: TENANT_ID } });
  
  const vehicleMap = vehicles.reduce((acc, v) => ({ ...acc, [v.code]: v.id }), {});
  const roleMap = roles.reduce((acc, r) => ({ ...acc, [r.code]: r.id }), {});

  const templates = [
    {
      tenantId: TENANT_ID,
      title: 'Senior Software Engineer',
      description: 'Lead development of complex software systems with advanced technical expertise',
      category: 'Technical' as const,
      experienceLevel: 'senior' as const,
      vehicleRates: {
        GSA_MAS: { baseRateMin: 85, baseRateMax: 120, typicalRate: 100, notes: 'GSA MAS rates for senior software engineering' },
        VA_SPRUCE: { baseRateMin: 80, baseRateMax: 115, typicalRate: 95, notes: 'VA SPRUCE rates for senior software engineering' },
        OPM_GSA: { baseRateMin: 82, baseRateMax: 118, typicalRate: 98, notes: 'OPM GSA rates for senior software engineering' },
        HHS_SWIFT_GSA: { baseRateMin: 88, baseRateMax: 125, typicalRate: 105, notes: 'HHS SWIFT GSA rates for senior software engineering' },
      },
      a6RoleMappings: [roleMap.SSE],
      typicalClearanceLevel: 'Secret' as const,
      typicalLocation: 'On-site' as const,
      typicalHours: 2080,
      tags: ['software', 'engineering', 'senior', 'development', 'technical'],
      complianceRequirements: ['Security clearance', 'Technical certification'],
      isActive: true,
    },
    {
      tenantId: TENANT_ID,
      title: 'Project Manager',
      description: 'Manage project delivery, timelines, and stakeholder coordination',
      category: 'Management' as const,
      experienceLevel: 'mid' as const,
      vehicleRates: {
        GSA_MAS: { baseRateMin: 70, baseRateMax: 95, typicalRate: 80, notes: 'GSA MAS project management rates' },
        VA_SPRUCE: { baseRateMin: 68, baseRateMax: 92, typicalRate: 78, notes: 'VA SPRUCE project management rates' },
        OPM_GSA: { baseRateMin: 72, baseRateMax: 97, typicalRate: 82, notes: 'OPM GSA project management rates' },
        HHS_SWIFT_GSA: { baseRateMin: 75, baseRateMax: 100, typicalRate: 85, notes: 'HHS SWIFT GSA project management rates' },
      },
      a6RoleMappings: [roleMap.PM],
      typicalClearanceLevel: 'Public Trust' as const,
      typicalLocation: 'Hybrid' as const,
      typicalHours: 2080,
      tags: ['management', 'project', 'coordination', 'mid'],
      complianceRequirements: ['Project management certification', 'Clearance eligibility'],
      isActive: true,
    },
    {
      tenantId: TENANT_ID,
      title: 'Business Analyst',
      description: 'Analyze business requirements and translate them into technical specifications',
      category: 'Administrative' as const,
      experienceLevel: 'mid' as const,
      vehicleRates: {
        GSA_MAS: { baseRateMin: 55, baseRateMax: 75, typicalRate: 65, notes: 'GSA MAS business analysis rates' },
        VA_SPRUCE: { baseRateMin: 53, baseRateMax: 73, typicalRate: 63, notes: 'VA SPRUCE business analysis rates' },
        OPM_GSA: { baseRateMin: 57, baseRateMax: 77, typicalRate: 67, notes: 'OPM GSA business analysis rates' },
        HHS_SWIFT_GSA: { baseRateMin: 60, baseRateMax: 80, typicalRate: 70, notes: 'HHS SWIFT GSA business analysis rates' },
      },
      a6RoleMappings: [roleMap.BA],
      typicalClearanceLevel: 'None' as const,
      typicalLocation: 'Remote' as const,
      typicalHours: 2080,
      tags: ['analysis', 'business', 'requirements', 'mid'],
      complianceRequirements: ['Business analysis certification'],
      isActive: true,
    },
    {
      tenantId: TENANT_ID,
      title: 'DevOps Engineer',
      description: 'Manage infrastructure, deployment pipelines, and system reliability',
      category: 'Technical' as const,
      experienceLevel: 'senior' as const,
      vehicleRates: {
        GSA_MAS: { baseRateMin: 80, baseRateMax: 115, typicalRate: 95, notes: 'GSA MAS DevOps rates' },
        VA_SPRUCE: { baseRateMin: 78, baseRateMax: 112, typicalRate: 93, notes: 'VA SPRUCE DevOps rates' },
        OPM_GSA: { baseRateMin: 82, baseRateMax: 117, typicalRate: 97, notes: 'OPM GSA DevOps rates' },
        HHS_SWIFT_GSA: { baseRateMin: 85, baseRateMax: 120, typicalRate: 100, notes: 'HHS SWIFT GSA DevOps rates' },
      },
      a6RoleMappings: [roleMap.DOE],
      typicalClearanceLevel: 'Secret' as const,
      typicalLocation: 'On-site' as const,
      typicalHours: 2080,
      tags: ['devops', 'infrastructure', 'senior', 'technical'],
      complianceRequirements: ['Security clearance', 'Cloud certification'],
      isActive: true,
    },
    {
      tenantId: TENANT_ID,
      title: 'Data Scientist',
      description: 'Analyze complex data sets and develop machine learning models',
      category: 'Technical' as const,
      experienceLevel: 'senior' as const,
      vehicleRates: {
        GSA_MAS: { baseRateMin: 90, baseRateMax: 130, typicalRate: 110, notes: 'GSA MAS data science rates' },
        VA_SPRUCE: { baseRateMin: 88, baseRateMax: 127, typicalRate: 108, notes: 'VA SPRUCE data science rates' },
        OPM_GSA: { baseRateMin: 92, baseRateMax: 132, typicalRate: 112, notes: 'OPM GSA data science rates' },
        HHS_SWIFT_GSA: { baseRateMin: 95, baseRateMax: 135, typicalRate: 115, notes: 'HHS SWIFT GSA data science rates' },
      },
      a6RoleMappings: [roleMap.DS],
      typicalClearanceLevel: 'Secret' as const,
      typicalLocation: 'Hybrid' as const,
      typicalHours: 2080,
      tags: ['data', 'science', 'ml', 'senior', 'technical'],
      complianceRequirements: ['Security clearance', 'Data science certification'],
      isActive: true,
    },
    {
      tenantId: TENANT_ID,
      title: 'Program Manager',
      description: 'Oversee multiple projects and strategic program coordination',
      category: 'Management' as const,
      experienceLevel: 'senior' as const,
      vehicleRates: {
        GSA_MAS: { baseRateMin: 85, baseRateMax: 120, typicalRate: 100, notes: 'GSA MAS program management rates' },
        VA_SPRUCE: { baseRateMin: 83, baseRateMax: 117, typicalRate: 98, notes: 'VA SPRUCE program management rates' },
        OPM_GSA: { baseRateMin: 87, baseRateMax: 122, typicalRate: 102, notes: 'OPM GSA program management rates' },
        HHS_SWIFT_GSA: { baseRateMin: 90, baseRateMax: 125, typicalRate: 105, notes: 'HHS SWIFT GSA program management rates' },
      },
      a6RoleMappings: [roleMap.PGM],
      typicalClearanceLevel: 'Secret' as const,
      typicalLocation: 'On-site' as const,
      typicalHours: 2080,
      tags: ['management', 'program', 'senior', 'leadership'],
      complianceRequirements: ['Program management certification', 'Security clearance'],
      isActive: true,
    },
    {
      tenantId: TENANT_ID,
      title: 'Cybersecurity Analyst',
      description: 'Monitor and protect systems from security threats and vulnerabilities',
      category: 'Technical' as const,
      experienceLevel: 'senior' as const,
      vehicleRates: {
        GSA_MAS: { baseRateMin: 80, baseRateMax: 115, typicalRate: 95, notes: 'GSA MAS cybersecurity rates' },
        VA_SPRUCE: { baseRateMin: 78, baseRateMax: 112, typicalRate: 93, notes: 'VA SPRUCE cybersecurity rates' },
        OPM_GSA: { baseRateMin: 82, baseRateMax: 117, typicalRate: 97, notes: 'OPM GSA cybersecurity rates' },
        HHS_SWIFT_GSA: { baseRateMin: 85, baseRateMax: 120, typicalRate: 100, notes: 'HHS SWIFT GSA cybersecurity rates' },
      },
      a6RoleMappings: [roleMap.SSE], // Map to Senior Software Engineer for now
      typicalClearanceLevel: 'Top Secret' as const,
      typicalLocation: 'On-site' as const,
      typicalHours: 2080,
      tags: ['security', 'cyber', 'senior', 'technical'],
      complianceRequirements: ['Top Secret clearance', 'Cybersecurity certification'],
      isActive: true,
    },
    {
      tenantId: TENANT_ID,
      title: 'Technical Writer',
      description: 'Create technical documentation and user guides',
      category: 'Administrative' as const,
      experienceLevel: 'mid' as const,
      vehicleRates: {
        GSA_MAS: { baseRateMin: 45, baseRateMax: 65, typicalRate: 55, notes: 'GSA MAS technical writing rates' },
        VA_SPRUCE: { baseRateMin: 43, baseRateMax: 63, typicalRate: 53, notes: 'VA SPRUCE technical writing rates' },
        OPM_GSA: { baseRateMin: 47, baseRateMax: 67, typicalRate: 57, notes: 'OPM GSA technical writing rates' },
        HHS_SWIFT_GSA: { baseRateMin: 50, baseRateMax: 70, typicalRate: 60, notes: 'HHS SWIFT GSA technical writing rates' },
      },
      a6RoleMappings: [roleMap.BA], // Map to Business Analyst for now
      typicalClearanceLevel: 'None' as const,
      typicalLocation: 'Remote' as const,
      typicalHours: 2080,
      tags: ['writing', 'documentation', 'mid', 'administrative'],
      complianceRequirements: ['Technical writing certification'],
      isActive: true,
    },
  ];

  for (const templateData of templates) {
    const [template, created] = await LaborCategoryTemplate.findOrCreate({
      where: { title: templateData.title, tenantId: TENANT_ID },
      defaults: templateData,
    });
    
    if (created) {
      console.log(`✅ Created LCAT template: ${template.title}`);
    } else {
      console.log(`⏭️  LCAT template already exists: ${template.title}`);
    }
  }
}

async function seedLCATData() {
  try {
    console.log('🚀 Starting LCAT data seeding...');
    
    // Initialize database connection
    const dbService = DatabaseService.getInstance();
    await dbService.connect();
    
    // Initialize models
    const { ModelManager } = await import('../models');
    await ModelManager.initializeModels();
    
    // Seed data
    await seedContractVehicles();
    await seedA6Roles();
    await seedLCATTemplates();
    
    console.log('✅ LCAT data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding LCAT data:', error);
    throw error;
  } finally {
    // Close database connection
    const dbService = DatabaseService.getInstance();
    await dbService.disconnect();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedLCATData()
    .then(() => {
      console.log('🎉 LCAT data seeding finished!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 LCAT data seeding failed:', error);
      process.exit(1);
    });
}

export { seedLCATData };
