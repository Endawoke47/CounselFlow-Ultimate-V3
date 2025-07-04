# CounselFlow Ultimate V3 🏛️⚖️

**Enterprise-Grade AI Legal Management Platform**

CounselFlow Ultimate V3 is a comprehensive, full-stack AI-powered legal practice management system built with modern technologies. It provides law firms and legal professionals with powerful tools for client management, matter tracking, contract analysis, document generation, and practice administration.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)

## ✨ Key Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** with secure token management
- **Role-Based Access Control (RBAC)** - Admin, Staff, Client, Guest roles
- **Session Management** with automatic token refresh
- **Password Security** with bcrypt hashing

### 👥 Client Management
- Complete client relationship management
- Contact information and communication tracking
- Matter association and revenue tracking
- Advanced search and filtering capabilities

### 🤖 AI-Powered Services
- **Contract Analysis** - AI-powered risk assessment and key term extraction
- **Document Generation** - Template-based legal document creation
- **Legal Research** - Intelligent content analysis and recommendations
- **Risk Assessment** - Automated contract risk scoring

### 📊 Practice Management
- **Dashboard Analytics** - Real-time practice insights
- **Matter Tracking** - Case and project management
- **Task Management** - Deadline tracking and workflow automation
- **Document Library** - Centralized file management

### 🛡️ Admin Panel
- **User Management** - Create, edit, and manage user accounts
- **Role Assignment** - Flexible permission management
- **System Configuration** - Platform settings and customization
- **Audit Logging** - Comprehensive activity tracking

## 🏗️ Architecture

### Backend Stack
- **FastAPI** - High-performance Python web framework
- **PostgreSQL** - Robust relational database
- **SQLAlchemy** - Python SQL toolkit and ORM
- **Redis** - In-memory caching and session storage
- **LangChain** - AI framework for language models
- **OpenAI GPT** - Advanced language processing
- **Pydantic** - Data validation and settings management

### Frontend Stack
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript development
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Radix UI** - Accessible component primitives
- **Zustand** - Lightweight state management
- **React Query** - Server state management
- **Lucide Icons** - Beautiful icon library

## 📁 Project Structure

```
CounselFlow-Ultimate/
├── backend/
│   ├── app/
│   │   ├── api/                    # API endpoints
│   │   │   ├── auth.py            # Authentication routes
│   │   │   ├── clients.py         # Client management
│   │   │   └── ai.py              # AI services
│   │   ├── core/                  # Core functionality
│   │   │   ├── config.py          # Application settings
│   │   │   ├── database.py        # Database configuration
│   │   │   ├── security.py        # Security utilities
│   │   │   └── deps.py            # Dependencies
│   │   ├── models/                # Database models
│   │   │   ├── user.py           # User model
│   │   │   ├── client.py         # Client model
│   │   │   ├── matter.py         # Matter model
│   │   │   ├── contract.py       # Contract model
│   │   │   ├── task.py           # Task model
│   │   │   └── document.py       # Document model
│   │   ├── schemas/               # Pydantic schemas
│   │   │   ├── user.py           # User schemas
│   │   │   ├── client.py         # Client schemas
│   │   │   └── matter.py         # Matter schemas
│   │   ├── services/              # Business logic
│   │   │   └── ai_service.py     # AI integration
│   │   └── main.py               # Application entry point
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── app/                      # Next.js App Router
│   │   ├── (dashboard)/          # Protected dashboard routes
│   │   │   ├── dashboard/        # Main dashboard
│   │   │   ├── clients/          # Client management
│   │   │   ├── ai/               # AI services
│   │   │   │   ├── contract-analysis/
│   │   │   │   └── document-generator/
│   │   │   └── admin/            # Admin panel
│   │   │       └── users/        # User management
│   │   ├── auth/                 # Authentication pages
│   │   │   └── login/            # Login page
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   └── providers.tsx         # App providers
│   ├── components/               # Reusable components
│   │   ├── ui/                   # UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── badge.tsx
│   │   │   └── textarea.tsx
│   │   └── layout/               # Layout components
│   │       ├── layout.tsx        # Main layout
│   │       ├── sidebar.tsx       # Navigation sidebar
│   │       └── header.tsx        # Top header
│   ├── lib/                      # Utility libraries
│   │   ├── api.ts                # API client
│   │   ├── auth.ts               # Authentication state
│   │   └── utils.ts              # Utility functions
│   ├── package.json              # Node.js dependencies
│   └── tsconfig.json             # TypeScript configuration
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 13+
- Redis 6+

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Endawoke47/CounselFlow-Ultimate-V3.git
   cd CounselFlow-Ultimate-V3
   ```

2. **Set up Python environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and API keys
   ```

4. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb counselflow_v3
   
   # Run migrations
   python -m alembic upgrade head
   ```

5. **Start the backend server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your API endpoint
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/counselflow_v3
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
OPENAI_API_KEY=your-openai-api-key
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📊 Database Schema

### Core Models

- **Users** - Authentication and user management
- **Clients** - Client information and relationships
- **Matters** - Legal cases and projects
- **Contracts** - Contract documents and analysis
- **Tasks** - Task management and deadlines
- **Documents** - File storage and metadata

### Relationships
- Users can manage multiple Clients
- Clients can have multiple Matters
- Matters can contain multiple Tasks and Documents
- Contracts are linked to Clients and Matters

## 🤖 AI Services

### Contract Analysis
- **Risk Assessment** - Automated risk level scoring
- **Key Terms Extraction** - Important clause identification
- **Obligation Mapping** - Party responsibilities and deadlines
- **Recommendations** - AI-generated suggestions

### Document Generation
- **Template Library** - Pre-built legal document templates
- **Smart Fields** - Dynamic content generation
- **Compliance Checking** - Automated compliance verification
- **Export Options** - Multiple format support

## 🔐 Security Features

### Authentication
- JWT tokens with automatic refresh
- Secure password hashing with bcrypt
- Session management and timeout
- Multi-factor authentication ready

### Authorization
- Role-based access control (RBAC)
- Resource-level permissions
- API endpoint protection
- Frontend route guards

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF token implementation

## 🎯 User Roles & Permissions

### Admin
- Full system access
- User management and role assignment
- System configuration
- All client and matter data

### Staff
- Client and matter management
- Document access and editing
- Task management
- Basic reporting

### Client
- Own matter access only
- Document viewing
- Communication with staff
- Basic dashboard

### Guest
- Limited read-only access
- Public information viewing
- No data modification
- Restricted navigation

## 📱 API Documentation

The API follows RESTful conventions and includes:

### Authentication Endpoints
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `GET /auth/me` - Current user profile

### Client Management
- `GET /clients` - List clients
- `POST /clients` - Create client
- `GET /clients/{id}` - Get client details
- `PUT /clients/{id}` - Update client
- `DELETE /clients/{id}` - Delete client

### AI Services
- `POST /ai/analyze-contract` - Contract analysis
- `POST /ai/generate-document` - Document generation
- `GET /ai/templates` - Available templates

## 🔧 Development

### Code Style
- **Backend**: Black formatter, isort imports, flake8 linting
- **Frontend**: Prettier formatting, ESLint rules, TypeScript strict mode

### Testing
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Backend
docker build -t counselflow-backend .

# Frontend
npm run build
npm start
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Cloud Deployment
- **Backend**: Deploy to AWS ECS, Google Cloud Run, or Azure Container Instances
- **Frontend**: Deploy to Vercel, Netlify, or AWS S3 + CloudFront
- **Database**: Use managed PostgreSQL (AWS RDS, Google Cloud SQL)
- **Cache**: Use managed Redis (AWS ElastiCache, Google Memorystore)

## 📈 Performance

### Backend Optimizations
- Database connection pooling
- Redis caching for frequent queries
- Async/await for I/O operations
- Background tasks for heavy operations

### Frontend Optimizations
- Code splitting and lazy loading
- Image optimization
- Static site generation where applicable
- Bundle size optimization

## 🛟 Support & Contributing

### Getting Help
- Check the [Issues](https://github.com/Endawoke47/CounselFlow-Ultimate-V3/issues) page
- Review the API documentation at `/docs`
- Contact support: support@counselflow.com

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- FastAPI for the excellent Python web framework
- Next.js team for the React framework
- OpenAI for AI capabilities
- shadcn for the beautiful UI components
- All contributors and the open-source community

## 🎯 Platform Capabilities

### 🔍 **Dashboard Overview**
- **Real-time Analytics** - Live KPI tracking and performance metrics
- **Activity Feed** - Recent actions, matters, and deadlines
- **Quick Actions** - One-click access to common tasks
- **Role-based Views** - Customized dashboards per user role
- **Performance Indicators** - Revenue, client count, matter status

### 👥 **Client Management System**
- **Complete Client Profiles** - Contact info, communication history, revenue tracking
- **Client Categorization** - Corporate, Individual, Startup, Enterprise, Non-Profit
- **Advanced Search & Filtering** - Find clients by name, email, type, status
- **Matter Association** - Link clients to multiple legal matters
- **Communication Log** - Track all client interactions

### 🤖 **AI-Powered Legal Services**

#### Contract Analysis Engine
- **Risk Assessment** - Automated risk level scoring (High/Medium/Low)
- **Key Terms Extraction** - Identify critical clauses and obligations
- **Party Obligations** - Map responsibilities and deadlines
- **Compliance Checking** - Verify regulatory compliance
- **Recommendations** - AI-generated improvement suggestions

#### Document Generation Platform
- **Template Library** - Pre-built legal document templates:
  - Non-Disclosure Agreements (NDAs)
  - Service Agreements
  - Privacy Policies
  - Employment Contracts
  - Licensing Agreements
- **Smart Field Population** - Dynamic content generation
- **Multi-format Export** - PDF, DOCX, TXT formats
- **Version Control** - Track document revisions

### 🛡️ **Admin Control Panel**
- **User Management** - Create, edit, activate/deactivate users
- **Role Assignment** - Granular permission control
- **System Configuration** - Platform settings and customization
- **Security Monitoring** - Real-time security alerts
- **Audit Trails** - Complete action logging

### 🔐 **Enterprise Security**
- **Multi-layered Authentication** - JWT tokens with refresh mechanism
- **Password Security** - bcrypt hashing with salt
- **Input Validation** - Both client and server-side validation
- **SQL Injection Protection** - Parameterized queries with SQLAlchemy
- **XSS Prevention** - Content sanitization
- **CSRF Protection** - Token-based request validation

### 📊 **Data Management**
- **PostgreSQL Database** - ACID-compliant relational storage
- **Redis Caching** - High-performance data caching
- **Database Models**:
  - Users (Authentication, roles, profiles)
  - Clients (Contact info, categorization)
  - Matters (Legal cases, projects)
  - Contracts (Documents, analysis results)
  - Tasks (Deadlines, assignments)
  - Documents (File metadata, versions)

### 🎨 **User Interface Excellence**
- **Modern Design** - Clean, professional interface with shadcn/ui
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Accessibility** - WCAG compliant with Radix UI primitives
- **Dark/Light Mode** - User preference support
- **Intuitive Navigation** - Role-based sidebar with clear organization

### 🔄 **Workflow Automation**
- **Task Management** - Automated deadline tracking
- **Notification System** - Real-time alerts and reminders
- **Status Updates** - Automatic progress tracking
- **Integration Ready** - RESTful APIs for third-party tools

### 📈 **Analytics & Reporting**
- **Practice Metrics** - Revenue tracking, client growth
- **Matter Analytics** - Case progress, time tracking
- **User Activity** - Login patterns, feature usage
- **Custom Reports** - Flexible data visualization

### 🌐 **API-First Architecture**
- **RESTful Endpoints** - Complete CRUD operations
- **OpenAPI Documentation** - Interactive API docs at `/docs`
- **Type-safe Schemas** - Pydantic validation models
- **Error Handling** - Comprehensive error responses
- **Rate Limiting** - API abuse prevention

## 🏢 Repository Structure & Content

### Backend Implementation (`/backend/`)
```
app/
├── api/                        # API Endpoints
│   ├── auth.py                # Authentication & JWT management
│   ├── clients.py             # Client CRUD operations
│   └── ai.py                  # AI service integrations
├── core/                      # Core System Components
│   ├── config.py              # Environment configuration
│   ├── database.py            # Database connections
│   ├── security.py            # Security utilities
│   └── deps.py                # Dependency injection
├── models/                    # Database Models
│   ├── user.py               # User model with roles
│   ├── client.py             # Client information
│   ├── matter.py             # Legal matters
│   ├── contract.py           # Contract documents
│   ├── task.py               # Task management
│   └── document.py           # File storage
├── schemas/                   # Pydantic Schemas
│   ├── user.py               # User validation
│   ├── client.py             # Client validation
│   └── matter.py             # Matter validation
├── services/                  # Business Logic
│   └── ai_service.py         # AI integrations
└── main.py                   # Application entry point
```

### Frontend Implementation (`/frontend/`)
```
app/
├── (dashboard)/              # Protected Routes
│   ├── dashboard/           # Main dashboard
│   ├── clients/             # Client management
│   ├── ai/                  # AI services
│   │   ├── contract-analysis/
│   │   └── document-generator/
│   └── admin/               # Admin panel
│       └── users/           # User management
├── auth/                    # Authentication
│   └── login/               # Login page
├── layout.tsx               # Root layout
├── page.tsx                 # Home page
└── providers.tsx            # App providers

components/
├── ui/                      # UI Components
│   ├── button.tsx          # Button component
│   ├── card.tsx            # Card layouts
│   ├── input.tsx           # Form inputs
│   ├── dialog.tsx          # Modal dialogs
│   ├── badge.tsx           # Status badges
│   └── textarea.tsx        # Text areas
└── layout/                 # Layout Components
    ├── layout.tsx          # Main layout
    ├── sidebar.tsx         # Navigation
    └── header.tsx          # Top header

lib/
├── api.ts                  # API client
├── auth.ts                 # Authentication state
└── utils.ts                # Utility functions
```

### Key Features Implemented
- ✅ **Complete Authentication System** with JWT and RBAC
- ✅ **Full Client Management** with CRUD operations
- ✅ **AI Contract Analysis** with risk assessment
- ✅ **AI Document Generation** with templates
- ✅ **Admin User Management** with role control
- ✅ **Responsive Dashboard** with real-time data
- ✅ **Comprehensive Error Handling** client and server-side
- ✅ **Type-safe Development** with TypeScript throughout
- ✅ **Modern UI Components** with shadcn/ui and Radix
- ✅ **State Management** with Zustand and React Query

---

**Built with ❤️ for the legal community**

*Empowering legal professionals with AI-driven technology*

