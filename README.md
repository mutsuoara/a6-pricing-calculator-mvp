# Pricing Calculator MVP

A secure, production-ready pricing calculator for government contracting workflows, built with a modular architecture designed for future SaaS integration.

## 🏗️ Architecture

This project uses a monorepo structure with Yarn workspaces, designed for easy integration into larger platforms:

```
pricing-calculator-mvp/
├── packages/
│   ├── calculator-types/          # Shared TypeScript interfaces
│   ├── calculator-core/           # Reusable calculation engine
│   ├── calculator-api/            # REST API service
│   └── calculator-ui/             # React components library
├── apps/
│   └── standalone-webapp/         # Current MVP application
└── docs/
    └── integration-guide.md       # Future SaaS integration docs
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Yarn 1.22+
- PostgreSQL 13+
- Redis 6+

### Development Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd pricing-calculator-mvp
   yarn install
   ```

2. **Environment configuration:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start development environment:**
   ```bash
   # Using Docker (recommended)
   yarn docker:dev
   
   # Or manually
   yarn dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001

## 🛠️ Development

### Available Scripts

- `yarn dev` - Start all packages in development mode
- `yarn build` - Build all packages
- `yarn test` - Run all tests
- `yarn lint` - Lint all packages
- `yarn lint:fix` - Fix linting issues
- `yarn type-check` - Type check all packages
- `yarn clean` - Clean all build artifacts

### Package-specific Scripts

Each package has its own scripts:
- `yarn workspace @pricing-calculator/types build`
- `yarn workspace @pricing-calculator/core test`
- `yarn workspace @pricing-calculator/api dev`
- `yarn workspace pricing-calculator-webapp build`

## 🔧 Configuration

### Environment Variables

Key environment variables (see `env.example` for complete list):

- `NODE_ENV` - Environment (development/staging/production)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - Allowed CORS origins

### Database Setup

The application uses PostgreSQL with multi-tenant architecture:

```sql
-- Create database
CREATE DATABASE pricing_calculator;

-- The application will automatically create tables and run migrations
```

## 🔐 Security Features

- **Domain-restricted authentication** (agile6.com only)
- **JWT-based authentication** with refresh tokens
- **Role-based access control** (User, BD, Finance, Contracts, Admin)
- **Complete audit logging** for all operations
- **Data encryption** at rest for sensitive information
- **Security headers** and CORS configuration
- **Rate limiting** to prevent abuse

## 📊 Pricing Calculations

The calculator implements government contracting pricing with compounding burden rates:

1. **Base Rate** → Apply clearance premium
2. **Clearance Adjusted Rate** → Apply overhead (OH)
3. **Overhead Rate** → Apply G&A
4. **G&A Rate** → Apply fee
5. **Final Burdened Rate** × Effective Hours = Total Cost

### Supported Contract Types

- **FFP** (Firm Fixed Price)
- **T&M** (Time & Materials)
- **CPFF** (Cost Plus Fixed Fee)

### Clearance Levels

- **None**: 0% premium
- **Public Trust**: 5% premium
- **Secret**: 10% premium
- **Top Secret**: 20% premium

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run tests in watch mode
yarn test:watch
```

## 🐳 Docker

### Development

```bash
yarn docker:dev
```

### Production

```bash
yarn docker:build
yarn docker:prod
```

## 📦 Package Details

### @pricing-calculator/types
Shared TypeScript interfaces and types used across all packages.

### @pricing-calculator/core
Pure calculation engine with no dependencies on UI or API frameworks.

### @pricing-calculator/api
Express.js REST API with authentication, validation, and database integration.

### @pricing-calculator/ui
React component library with Material-UI for consistent government contracting UI.

## 🔄 Future SaaS Integration

This MVP is designed for easy integration into larger SaaS platforms:

- **Modular architecture** with clear package boundaries
- **Multi-tenant data model** with tenant isolation
- **API-first design** for service-to-service communication
- **Shared types package** for consistent interfaces
- **Docker containerization** for microservice deployment

See `docs/integration-guide.md` for detailed integration instructions.

## 📝 License

Proprietary - Agile6 Internal Use Only

## 🤝 Contributing

This is an internal Agile6 project. Please follow the established coding standards and create feature branches for all changes.

## 📞 Support

For questions or issues, please contact the development team or create an issue in the project repository.
