#!/bin/bash

# OVH VPS Deployment Script for SynapIA Mail
# This script sets up the complete production environment on OVH VPS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN_NAME=""
VAULT_TOKEN=""
ENCRYPTION_KEY=""
MONGO_USERNAME=""
MONGO_PASSWORD=""
MICROSOFT_CLIENT_ID=""
MICROSOFT_CLIENT_SECRET=""
JWT_SECRET=""

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   log_error "This script should not be run as root"
   exit 1
fi

# Generate secure random values
generate_secrets() {
    log_info "Generating secure secrets..."

    if [ -z "$VAULT_TOKEN" ]; then
        VAULT_TOKEN=$(openssl rand -hex 32)
        log_success "Generated Vault token"
    fi

    if [ -z "$ENCRYPTION_KEY" ]; then
        ENCRYPTION_KEY=$(openssl rand -hex 32)
        log_success "Generated encryption key"
    fi

    if [ -z "$MONGO_USERNAME" ]; then
        MONGO_USERNAME="synapia_admin"
    fi

    if [ -z "$MONGO_PASSWORD" ]; then
        MONGO_PASSWORD=$(openssl rand -hex 16)
        log_success "Generated MongoDB password"
    fi

    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(openssl rand -hex 32)
        log_success "Generated JWT secret"
    fi
}

# Setup environment variables
setup_environment() {
    log_info "Setting up environment variables..."

    cat > .env << EOF
# OVH VPS Production Environment Variables
NODE_ENV=production
JWT_SECRET=${JWT_SECRET}

# Database Configuration
MONGODB_URI=mongodb://mongodb:27017/synapia_mail_db
MONGO_USERNAME=${MONGO_USERNAME}
MONGO_PASSWORD=${MONGO_PASSWORD}

# Vault Configuration
VAULT_URL=http://vault:8200
VAULT_TOKEN=${VAULT_TOKEN}
ENCRYPTION_KEY=${ENCRYPTION_KEY}

# Microsoft OAuth Configuration
MICROSOFT_CLIENT_ID=${MICROSOFT_CLIENT_ID}
MICROSOFT_CLIENT_SECRET=${MICROSOFT_CLIENT_SECRET}
MICROSOFT_TENANT_ID=common
MICROSOFT_REDIRECT_URI=https://${DOMAIN_NAME}/api/email-connections/outlook/callback

# AI Backend Configuration
IA_BACKEND_URL=http://ia-backend:3002

# Frontend Configuration
FRONTEND_URL=https://${DOMAIN_NAME}
EOF

    log_success "Environment file created"
}

# Setup SSL certificates directory
setup_ssl() {
    log_info "Setting up SSL certificate directories..."

    mkdir -p ssl
    chmod 755 ssl

    log_success "SSL directories created"
}

# Install SSL certificates (Let's Encrypt)
setup_ssl_certificates() {
    if [ -n "$DOMAIN_NAME" ]; then
        log_info "Setting up SSL certificates for ${DOMAIN_NAME}..."

        # Install certbot if not present
        if ! command -v certbot &> /dev/null; then
            log_info "Installing certbot..."
            sudo apt update
            sudo apt install -y certbot
        fi

        # Get SSL certificate
        log_info "Obtaining SSL certificate..."
        sudo certbot certonly --standalone -d ${DOMAIN_NAME}

        # Copy certificates
        sudo cp /etc/letsencrypt/live/${DOMAIN_NAME}/fullchain.pem ssl/
        sudo cp /etc/letsencrypt/live/${DOMAIN_NAME}/privkey.pem ssl/

        # Set proper permissions
        sudo chown $(whoami):$(whoami) ssl/*.pem
        chmod 600 ssl/*.pem

        log_success "SSL certificates configured"
    else
        log_warning "DOMAIN_NAME not set. Please configure SSL manually."
    fi
}

# Build and deploy
deploy_services() {
    log_info "Building and deploying services..."

    # Build images
    docker-compose build --no-cache

    # Start services
    docker-compose up -d

    log_success "Services deployed successfully"
}

# Health checks
health_check() {
    log_info "Performing health checks..."

    # Wait for services to start
    sleep 30

    # Check service health
    if curl -f http://localhost:3000/health &> /dev/null; then
        log_success "Backend health check passed"
    else
        log_warning "Backend health check failed"
    fi

    if curl -f http://localhost:8200/v1/sys/health &> /dev/null; then
        log_success "Vault health check passed"
    else
        log_warning "Vault health check failed"
    fi

    log_success "Health checks completed"
}

# Main deployment function
main() {
    echo "=== SynapIA Mail OVH VPS Deployment ==="
    echo

    # Get domain name
    if [ -z "$DOMAIN_NAME" ]; then
        read -p "Enter your domain name (e.g., mail.yourdomain.com): " DOMAIN_NAME
    fi

    # Get Microsoft OAuth credentials
    if [ -z "$MICROSOFT_CLIENT_ID" ] || [ -z "$MICROSOFT_CLIENT_SECRET" ]; then
        echo
        log_warning "Microsoft OAuth credentials required for email connections"
        read -p "Enter Microsoft Client ID: " MICROSOFT_CLIENT_ID
        read -s -p "Enter Microsoft Client Secret: " MICROSOFT_CLIENT_SECRET
        echo
    fi

    # Generate secrets
    generate_secrets

    # Setup components
    setup_environment
    setup_ssl
    setup_ssl_certificates
    deploy_services
    health_check

    echo
    log_success "=== Deployment Complete ==="
    echo
    echo "Access your application at: https://${DOMAIN_NAME}"
    echo "Vault UI (admin only): https://${DOMAIN_NAME}/vault/"
    echo
    echo "Important: Save these credentials securely:"
    echo "Vault Token: ${VAULT_TOKEN}"
    echo "MongoDB Username: ${MONGO_USERNAME}"
    echo "MongoDB Password: ${MONGO_PASSWORD}"
    echo "JWT Secret: ${JWT_SECRET}"
    echo "Encryption Key: ${ENCRYPTION_KEY}"
    echo
    log_warning "Keep these values secure and back them up!"
}

# Run main function
main "$@"
