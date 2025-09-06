# Whitepine Civic Platform

A comprehensive civic engagement platform inspired by the same [Hadenosaunee legend](https://www.haudenosauneeconfederacy.com/confederacys-creation/) which marks the very [foundation](https://www.haudenosauneeconfederacy.com/influence-on-democracy/) of the United States of America, shown in the thirteen arrows clutched by the eagle's talon.

Built in 2025 with Next.js 15, Express.js, and MongoDB Atlas.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- AWS CLI (for deployment)

### Development Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd whitepine
   npm install
   ```

2. **Environment setup:**
   ```bash
   npm run setup:env
   # Edit .env with your MongoDB Atlas connection string and JWT secrets
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```
   This starts both frontend (port 3000) and backend (port 5000) concurrently.

4. **Access the application:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000/v1](http://localhost:5000/v1)

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, App Router
- **Backend**: Express.js with MongoDB Atlas integration
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT with role-based access control (RBAC)
- **Styling**: Federal Standard color palette with Tailwind CSS
- **Deployment**: AWS S3 + CloudFront CDN

### Project Structure

```
usa/
├── src/app/                    # Next.js App Router
│   ├── components/             # React components
│   ├── contexts/              # React contexts (Auth, etc.)
│   ├── lab/                   # Development/testing pages
│   ├── admin/                 # Admin interface
│   ├── profile/               # User profiles
│   └── layout.tsx             # Root layout
├── server/                    # Express.js backend
│   ├── models/                # MongoDB models
│   ├── routes/v1/             # API endpoints
│   ├── middleware/            # Auth, validation, security
│   ├── utils/                 # Utility functions
│   └── index.js               # Express server
├── public/                    # Static assets
├── scripts/                   # Build and deployment scripts
└── specifications/            # API and system documentation
```

## 🔐 Authentication & Authorization

### JWT Token System
- **Access Token**: 15-minute expiration, sent in `Authorization: Bearer <token>` header
- **Refresh Token**: 7-day expiration, stored in HTTP-only cookie
- **Token Rotation**: Automatic refresh with new tokens

### Role-Based Access Control (RBAC)

**User Roles:**
- **Admin**: Full system access, user management, configuration
- **Moderator**: Content management, user warnings, basic management
- **Developer**: Technical access, analytics, development tools
- **User**: Standard permissions for creating content and voting

**Scope-Based Permissions:**
- `users:read`, `users:write`, `users:delete`
- `media:read`, `media:write`, `media:delete`
- `roles:read`, `roles:assign`
- `gov:read`, `identities:read`

### Frontend Permission System

The UI is fully aware of user roles and scopes:

```typescript
// Role checking
const { user, hasRole, hasScope } = useAuth();

// Conditional rendering
{isAdmin(user) && <AdminPanel />}
{hasScope('users:write') && <CreateUserButton />}
```

## 🎨 Design System

### Federal Standard Color Palette

The application uses a comprehensive Federal Standard color palette with 36 distinct colors:

- **Primary**: `fs-15056` (Deep Royal Blue)
- **Secondary**: `fs-14272` (Sage Green)
- **Accent**: `fs-15187` (Cyan)
- **Neutral**: `fs-16152` (Medium Gray)
- **Success**: `fs-14260` (Green)
- **Warning**: `fs-16357` (Beige)
- **Error**: `fs-16350` (Terracotta)

See [FEDERAL_COLORS_README.md](./FEDERAL_COLORS_README.md) for complete color documentation.

## 📚 API Documentation

### Base URL
```
http://localhost:5000/v1
```

### Key Endpoints

**Authentication:**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh
- `GET /auth/me` - Current user profile

**Users:**
- `GET /users` - List users (requires `users:read`)
- `GET /users/:id` - Get user profile
- `PATCH /users/:id` - Update user (ownership required)
- `GET /users/:id/roles` - Get user roles

**Government Data:**
- `GET /gov/jurisdictions` - List jurisdictions
- `GET /gov/offices` - List government offices
- `GET /gov/officials` - List government officials

**Media:**
- `POST /media/upload` - Upload files
- `GET /media/:id` - Get media details

See [API Documentation](./public/library/project-specs/api-documentation.md) for complete endpoint reference.

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:ui           # Frontend only (port 3000)
npm run server:dev       # Backend only (port 5000)

# Building
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run migrate          # Run database migrations
npm run test:models      # Test database models

# Utilities
npm run kill             # Kill running server processes
npm run rebuild:library  # Rebuild library catalog
npm run setup:uploads    # Setup upload directory symlink
```

### Environment Variables

Create a `.env` file with:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whitepine

# JWT Secrets
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/v1
NODE_ENV=development

# AWS (for deployment)
AWS_REGION=us-east-1
AWS_S3_BUCKET=whitepine
AWS_CLOUDFRONT_DISTRIBUTION_ID=E224EA6ZP3GGQH
```

## 🚀 Deployment

### AWS S3 + CloudFront Deployment

The application is configured for deployment to AWS S3 with CloudFront CDN:

```bash
# Full deployment
npm run deploy:full

# Step by step
npm run deploy:build    # Build static export
npm run deploy:s3       # Upload to S3
npm run deploy:html     # Upload HTML files
npm run deploy:invalidate # Invalidate CloudFront
```

### GitHub Actions

Automated deployment on push to `main` branch using GitHub Actions with OIDC authentication.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🧪 Testing & Development Tools

### Lab Environment

Access development tools at `/lab`:

- **Role Testing**: `/lab/role-test` - Test user roles and permissions
- **Government Browser**: `/lab/government-browser` - Browse government data
- **API Testing**: Various API testing utilities

### Admin Interface

Admin users can access:

- **Role Management**: `/admin/roles` - Manage user roles
- **User Management**: User administration tools
- **System Configuration**: Platform settings

## 📖 Documentation

- [API Documentation](./public/library/project-specs/api-documentation.md)
- [User Role System](./public/library/project-specs/User_Role_System.md)
- [Database Schema](./public/library/project-specs/database-schema.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Federal Colors](./FEDERAL_COLORS_README.md)

## 🔧 Configuration

### Security Features

- **Rate Limiting**: Configurable rate limits for different endpoints
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers middleware
- **Input Validation**: Joi schema validation
- **Password Hashing**: bcrypt with configurable salt rounds

### Performance

- **Static Export**: Next.js static export for optimal performance
- **CDN**: CloudFront global distribution
- **Caching**: Optimized cache headers for static assets
- **Database Indexing**: Optimized MongoDB indexes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support and questions:
- Check the documentation in `/public/library/project-specs/`
- Review the API documentation
- Test with the lab environment at `/lab`

---

**Built with ❤️ in California**