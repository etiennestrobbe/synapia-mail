# SynapIA Mail - OVH VPS Deployment Guide

This guide provides complete instructions for deploying SynapIA Mail on an OVH VPS using Docker containers.

## 🏗️ Architecture Overview

```
Internet → Nginx (SSL/TLS) → [Frontend, API, Vault]
                           ↓
                     MongoDB + AI Backend
```

### Services:
- **Frontend**: Next.js application (port 3000)
- **Backend**: NestJS API server (port 3000)
- **Vault**: HashiCorp Vault for secrets (port 8200)
- **MongoDB**: Document database (port 27017)
- **Nginx**: Reverse proxy & SSL termination (ports 80/443)

## 📋 Prerequisites

### OVH VPS Requirements:
- Ubuntu 22.04 LTS or Debian 11+
- 2GB RAM minimum (4GB recommended)
- 20GB SSD storage
- Public IPv4 address
- Domain name pointed to VPS IP

### Required Software:
```bash
sudo apt update && sudo apt install -y \
  docker.io \
  docker-compose \
  curl \
  openssl \
  git
```

### Microsoft Azure Setup:
1. Go to [Azure Portal](https://portal.azure.com/)
2. **App Registrations** → **New Registration**
3. Configure:
   - Name: `SynapIA Mail`
   - Redirect URI: `https://your-domain.com/api/email-connections/outlook/callback`
4. **API Permissions**:
   - `Mail.Read`
   - `Mail.ReadWrite`
   - `User.Read`
   - `offline_access`
5. **Certificates & Secrets** → **New Client Secret**
6. Save **Application (client) ID** and **Client Secret**

## 🚀 Quick Deployment

### Option 1: Automated Deployment (Recommended)

```bash
# Clone repository
git clone your-repo-url synapia-mail
cd synapia-mail/code/synapia-mail-backend

# Run deployment script
./deploy-ovh.sh
```

The script will:
- Generate secure secrets
- Configure environment variables
- Setup SSL certificates
- Build and deploy all services

### Option 2: Manual Deployment

```bash
cd synapia-mail/code/synapia-mail-backend

# Generate secure secrets
VAULT_TOKEN=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)
MONGO_PASSWORD=$(openssl rand -hex 16)

# Edit .env file with your values
nano .env

# Setup SSL certificates
mkdir ssl
sudo certbot certonly --standalone -d your-domain.com
sudo cp /etc/letsencrypt/live/your-domain.com/*.pem ssl/

# Deploy services
docker-compose build
docker-compose up -d
```

## ⚙️ Configuration Files

### Environment Variables (.env)
```bash
# Application
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret

# Database
MONGODB_URI=mongodb://mongodb:27017/synapia_mail_db
MONGO_USERNAME=synapia_admin
MONGO_PASSWORD=your-mongo-password

# Vault (OAuth token encryption)
VAULT_URL=http://vault:8200
VAULT_TOKEN=your-vault-token
ENCRYPTION_KEY=your-32-char-encryption-key

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your-azure-client-id
MICROSOFT_CLIENT_SECRET=your-azure-client-secret
MICROSOFT_REDIRECT_URI=https://your-domain.com/api/email-connections/outlook/callback

# Services
IA_BACKEND_URL=http://ia-backend:3002
FRONTEND_URL=https://your-domain.com
```

### Docker Services

**Backend Service:**
```yaml
backend:
  build: .
  environment:
    - NODE_ENV=production
    # ... env vars
  depends_on:
    - mongodb
    - vault
```

**Vault Service:**
```yaml
vault:
  image: hashicorp/vault:1.15
  volumes:
    - ./vault.hcl:/vault/config/vault.hcl:ro
  environment:
    - VAULT_DEV_ROOT_TOKEN_ID=${VAULT_TOKEN}
```

## 🔐 Security Configuration

### SSL/TLS Setup
```bash
# Install Let's Encrypt certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/*.pem ssl/
sudo chown $USER:$USER ssl/*.pem
chmod 600 ssl/*.pem
```

### Firewall Configuration
```bash
# Configure UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

### Vault Security
```bash
# Access vault UI
open https://your-domain.com/vault/
# Login with your VAULT_TOKEN
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f vault

# Restart services
docker-compose restart
```

### Backup Strategy
```bash
# MongoDB backup
docker exec synapia-mail_mongodb_1 mongodump --out /backup

# Vault backup (critical!)
docker exec synapia-mail_vault_1 vault operator raft snapshot save /vault/backup.snap
```

### Updates
```bash
# Update and redeploy
git pull
docker-compose build --no-cache
docker-compose up -d
```

## 🔧 Troubleshooting

### Common Issues:

**1. SSL Certificate Issues:**
```bash
# Renew certificates
sudo certbot renew
sudo cp /etc/letsencrypt/live/your-domain.com/*.pem ssl/
docker-compose restart nginx
```

**2. Vault Connection Issues:**
```bash
# Check vault status
curl http://localhost:8200/v1/sys/health

# View vault logs
docker-compose logs vault
```

**3. Database Connection Issues:**
```bash
# Check MongoDB
docker exec synapia-mail_mongodb_1 mongo --eval "db.stats()"

# Reset database
docker-compose down
docker volume rm synapia-mail_mongodb_data
docker-compose up -d mongodb
```

**4. OAuth Issues:**
- Verify Azure app registration settings
- Check redirect URI matches exactly
- Ensure API permissions are granted

## 📈 Scaling Considerations

### Vertical Scaling (Same VPS):
- Increase VPS RAM/CPU
- Optimize MongoDB memory settings
- Add Redis for caching

### Horizontal Scaling (Multiple VPS):
- Use OVH Load Balancer
- Separate database to dedicated VPS
- Implement Redis cluster
- Use OVH Object Storage for file storage

## 💰 Cost Estimation

### OVH VPS Costs:
- **VPS SSD 1** (1 vCPU, 2GB RAM): ~€3/month
- **VPS SSD 2** (2 vCPU, 4GB RAM): ~€6/month
- **VPS SSD 3** (3 vCPU, 8GB RAM): ~€12/month

### Additional Services:
- **Domain Name**: ~€10-20/year
- **SSL Certificate**: Free (Let's Encrypt)
- **Email Services**: Included in VPS

**Total estimated cost: €15-30/month**

## 🎯 Production Checklist

- [ ] Domain name configured and pointing to VPS
- [ ] SSL certificates installed and auto-renewing
- [ ] Environment variables configured with secure secrets
- [ ] Microsoft Azure app registration completed
- [ ] Vault initialized and accessible
- [ ] Database backups configured
- [ ] Firewall properly configured
- [ ] Monitoring and alerting set up
- [ ] Regular security updates scheduled

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs -f`
2. Verify configuration files
3. Test individual services
4. Check OVH VPS resources

## 🔄 Migration Notes

**From Development to Production:**
1. Update all localhost URLs to domain names
2. Generate new secure secrets
3. Configure proper SSL certificates
4. Setup automated backups
5. Enable monitoring and alerting

---

**Your SynapIA Mail application is now ready for production deployment on OVH VPS!** 🚀
