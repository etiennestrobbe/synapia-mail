# Synapia Mail - Global Docker Compose Setup

This setup provides a complete Docker Compose configuration to run all Synapia Mail services together.

## Services Included

- **frontend** (Port 3001): Next.js React application
- **backend** (Port 3000): NestJS API server
- **ia-backend** (Port 3002): Express.js AI backend for email categorization
- **mongodb** (Port 27017): MongoDB database
- **vault** (Port 8200): HashiCorp Vault for secrets management

## Prerequisites

- Docker and Docker Compose installed
- Git (to clone repositories if needed)

## Quick Start

1. **Clone the repositories** (if not already done):
   ```bash
   # Assuming you're in the code directory
   cd synapia-mail-backend && npm install
   cd ../synapia-mail-frontend && npm install
   cd ../synapia-mail-ia-backend && npm install
   cd ..
   ```

2. **Configure environment variables**:
   Edit the `.env` file in the `code` directory with your actual values:
   - Set your Microsoft OAuth credentials
   - Add your LLM API keys (OpenAI, Anthropic, etc.)
   - Update MongoDB credentials if needed

3. **Start all services**:
   ```bash
   cd code
   docker compose up --build
   ```

4. **Access the applications**:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - IA Backend API: http://localhost:3002
   - Vault UI: http://localhost:8200 (Token: hvs.dev-token)

## Environment Variables

### Required
- `VAULT_TOKEN`: Vault root token (default: hvs.dev-token)
- `MONGO_USERNAME`: MongoDB username
- `MONGO_PASSWORD`: MongoDB password
- `MICROSOFT_CLIENT_ID`: Microsoft OAuth client ID
- `MICROSOFT_CLIENT_SECRET`: Microsoft OAuth client secret
- `MICROSOFT_REDIRECT_URI`: OAuth redirect URI

### Optional (for AI features)
- `OPENAI_API_KEY`: OpenAI API key
- `ANTHROPIC_API_KEY`: Anthropic API key
- `LLM_PROVIDER`: Default LLM provider (default: openai)
- `LLM_DEFAULT_MODEL`: Default LLM model (default: gpt-3.5-turbo)

## Service Dependencies

- Frontend depends on Backend
- Backend depends on MongoDB, Vault, and IA Backend
- IA Backend depends on MongoDB and Vault

## Database Configuration

The IA Backend now persists its configuration (LLM settings, API keys) in MongoDB instead of memory-only storage. This addresses the TODO item about missing database functionality.

## Development vs Production

This setup is configured for development with:
- Vault in dev mode
- Exposed ports for all services
- Volume mounts for data persistence

For production deployment, consider:
- Using production Vault configuration
- Setting up proper secrets management
- Configuring reverse proxy (nginx)
- Using environment-specific .env files

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000-3002, 27017, 8200 are available
2. **Build failures**: Make sure all npm dependencies are installed in each service directory
3. **Vault connection issues**: Check VAULT_TOKEN and network connectivity
4. **MongoDB connection**: Verify MONGO_USERNAME and MONGO_PASSWORD

### Logs

View logs for specific services:
```bash
docker compose logs backend
docker compose logs ia-backend
docker compose logs mongodb
```

### Stopping Services

```bash
docker compose down
```

To also remove volumes (⚠️ will delete data):
```bash
docker compose down -v
```

## Architecture Overview

```
Frontend (3001) ←→ Backend (3000) ←→ IA Backend (3002)
     ↓                    ↓                    ↓
   MongoDB (27017)    MongoDB (27017)    MongoDB (27017)
     ↓                    ↓                    ↓
   Vault (8200)       Vault (8200)       Vault (8200)
```

All services communicate through the `synapia-network` Docker network.
