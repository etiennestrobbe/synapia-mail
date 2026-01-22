# Vault Production Configuration for OVH VPS
# This file configures HashiCorp Vault for production use

# Storage backend - using file storage for simplicity on VPS
storage "file" {
  path = "/vault/data"
}

# TCP listener configuration
listener "tcp" {
  address       = "0.0.0.0:8200"
  tls_disable   = 1  # SSL termination handled by Nginx
  cluster_addr  = "0.0.0.0:8201"
}

# API and cluster addresses
api_addr     = "http://0.0.0.0:8200"
cluster_addr = "http://0.0.0.0:8201"

# Enable Vault UI
ui = true

# Development mode settings (for initial setup)
# In production, remove these and use proper initialization
disable_mlock = true

# Logging
log_level = "info"

# Telemetry (optional - for monitoring)
# telemetry {
#   prometheus_retention_time = "30s"
#   disable_hostname = true
# }
