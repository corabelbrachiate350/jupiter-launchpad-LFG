# Setup Guide

## Quick Start

### 1. Start PostgreSQL Database

Using Docker Compose:
```bash
docker-compose up -d
```

Or use your own PostgreSQL instance and update the `DATABASE_URL` in `backend/.env`.

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Configure Environment

**Backend** (`backend/.env`):
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
DATABASE_URL="postgresql://jupiter:jupiter_password@localhost:5432/jupiter_launchpad?schema=public"
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_NETWORK=mainnet-beta
ADMIN_WALLET_ADDRESS=your-admin-wallet-address
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3001/api
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### 4. Set Up Database

```bash
cd backend
npm run db:generate
npm run db:migrate
npm run db:seed  # Creates admin user
```

### 5. Start Development Servers

From root directory:
```bash
npm run dev
```

Or separately:
```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

### 6. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Prisma Studio: `cd backend && npm run db:studio` (opens at http://localhost:5555)

## Admin Setup

1. Set `ADMIN_WALLET_ADDRESS` in `backend/.env` to your Solana wallet address
2. Run `npm run db:seed` in the backend directory
3. Use that wallet to connect and access admin features

## Production Deployment

### Build

```bash
npm run build
```

### Environment Variables

Make sure to set all environment variables in your production environment.

### Database

Run migrations in production:
```bash
cd backend
NODE_ENV=production npm run db:migrate
```

### Running

```bash
# Backend
cd backend
npm start

# Frontend (serve built files)
cd frontend
npm run preview
```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Verify database credentials

### Solana RPC Issues

- Use a reliable RPC endpoint (consider using a paid service like QuickNode or Helius for production)
- Check `SOLANA_RPC_URL` in `.env`

### Port Conflicts

- Change `PORT` in `backend/.env` if 3001 is taken
- Change port in `frontend/vite.config.ts` if 3000 is taken

### Wallet Connection Issues

- Ensure you're using a supported wallet (Phantom, Solflare, etc.)
- Check browser console for errors
- Verify Solana network settings

