# 🚀 Jupiter Launchpad / LFG Ecosystem

A comprehensive launchpad platform for new Solana projects, inspired by Jupiter's LFG Launchpad. This platform provides early access and visibility for new projects through the Jupiter network, helping them gain user traffic, liquidity, and swap volume.

## Telegram

Contact me on Telegram: [@gigi0500](https://t.me/gigi0500)

## Features

### ✨ Core Features
- **Project Discovery**: Browse and discover new Solana projects
- **Project Submission**: Submit your project with token verification
- **Admin Panel**: Review and approve/reject project submissions
- **Metrics Tracking**: Track swap volume, liquidity, holders, and engagement
- **Trending Projects**: See projects with highest swap volume
- **Featured Projects**: Highlight special projects
- **Wallet Integration**: Connect with Solana wallets (Phantom, Solflare, etc.)
- **Favorites**: Save and track your favorite projects

### 🔧 Technical Stack

**Backend:**
- TypeScript
- Express.js
- Prisma ORM (PostgreSQL)
- Solana Web3.js
- JWT Authentication
- Rate Limiting

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Solana Wallet Adapter
- React Query

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Solana RPC endpoint (or use public endpoint)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd jupiter
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Set up environment variables**

Create `backend/.env`:
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
DATABASE_URL="postgresql://user:password@localhost:5432/jupiter_launchpad?schema=public"
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_NETWORK=mainnet-beta
ADMIN_WALLET_ADDRESS=your-admin-wallet-address
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001/api
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

4. **Set up the database**
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

5. **Create admin user** (optional)
```bash
# You can create an admin user via Prisma Studio or directly in the database
npx prisma studio
```

6. **Start development servers**
```bash
# From root directory
npm run dev
```

Or run separately:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Project Structure

```
jupiter/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, rate limiting, error handling
│   │   ├── services/        # Solana service, business logic
│   │   └── utils/           # Utilities
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   └── services/        # API clients
│   └── package.json
└── package.json            # Root workspace config
```

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects (with pagination, filtering)
- `GET /api/projects/:id` - Get project by ID
- `GET /api/projects/token/:tokenMint` - Get project by token mint
- `POST /api/projects` - Submit new project (requires auth)
- `POST /api/projects/:id/favorite` - Toggle favorite (requires auth)
- `GET /api/projects/featured/list` - Get featured projects

### Admin
- `GET /api/admin/projects` - Get all projects for admin review
- `PATCH /api/admin/projects/:id/status` - Update project status
- `GET /api/admin/stats` - Get dashboard statistics

### Metrics
- `GET /api/metrics/project/:id` - Get project metrics
- `GET /api/metrics/trending` - Get trending projects
- `POST /api/metrics/project/:id` - Update metrics (admin)

## Database Schema

### Key Models
- **User**: Wallet addresses and user information
- **Project**: Project submissions with token info, status, metrics
- **ProjectFavorite**: User favorites
- **ProjectMetric**: Historical metrics tracking
- **Admin**: Admin users with roles

## Development

### Running Tests
```bash
# Backend tests (when implemented)
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

### Building for Production
```bash
npm run build
```

### Database Migrations
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

## Environment Variables

### Backend
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - Secret for JWT tokens
- `DATABASE_URL` - PostgreSQL connection string
- `SOLANA_RPC_URL` - Solana RPC endpoint
- `ADMIN_WALLET_ADDRESS` - Admin wallet for initial setup

### Frontend
- `VITE_API_URL` - Backend API URL
- `VITE_SOLANA_RPC_URL` - Solana RPC endpoint

## Security Considerations

- JWT authentication for protected routes
- Rate limiting on API endpoints
- Input validation using Zod
- Helmet.js for security headers
- CORS configuration
- Wallet signature verification (to be implemented)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Acknowledgments

Inspired by Jupiter's LFG Launchpad ecosystem for Solana projects.

