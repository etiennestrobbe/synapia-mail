# Synapia IA Backend API

This document describes the API endpoints available in the Synapia IA Backend for email processing and LLM management.

## 🔐 Authentication

All API endpoints (except `/health`) require API key authentication:

```
X-API-Key: your-secure-api-key-here
```

Set the `IA_BACKEND_API_KEY` environment variable to configure the API key.

## 📋 Available Endpoints

### Health Check
- **GET** `/health` - Check service status (no auth required)

### Models
- **GET** `/api/models` - List all available models by provider
- **GET** `/api/models/:provider` - List models for specific provider

### Configuration
- **GET** `/api/config` - Get current LLM configuration
- **PUT** `/api/config` - Update global LLM configuration

### Agents
- **GET** `/api/agents` - List all available agents
- **GET** `/api/agents/:name` - Get details of specific agent
- **PUT** `/api/agents/:name` - Update agent prompts
- **POST** `/api/agents/:name/run` - Execute agent with data

### Legacy (Backward Compatibility)
- **POST** `/api/categorize` - Direct email categorization

## 🤖 Available Agents

### 1. Email Categorization (`categorization`)
Categorizes emails into existing categories.

**Input Data:**
```json
{
  "categories": "Work,Personal,Spam",
  "subject": "Project deadline",
  "from": "boss@company.com",
  "body": "Meeting tomorrow at 10 AM"
}
```

### 2. Category Creation (`category-creation`)
Suggests new categories based on existing ones and email content.

**Input Data:**
```json
{
  "existingCategories": "Work,Personal,Spam",
  "subject": "New client inquiry",
  "body": "Interested in your services"
}
```

### 3. Urgency Detection (`urgency-detection`)
Determines if an email requires urgent attention.

**Input Data:**
```json
{
  "subject": "URGENT: Server Down",
  "from": "admin@company.com",
  "body": "Production server crashed"
}
```

## 🔧 Configuration

Set these environment variables:

```bash
# LLM Configuration
LLM_PROVIDER=openai
LLM_DEFAULT_MODEL=gpt-3.5-turbo

# API Keys
OPENAI_API_KEY=sk-your-key
ANTHROPIC_API_KEY=sk-ant-your-key
# ... other provider keys

# Security
IA_BACKEND_API_KEY=your-secure-api-key-here
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

## 📊 Postman Collection

Import `Synapia-IA-Backend.postman_collection.json` to test all endpoints.

**Collection Features:**
- ✅ Pre-configured authentication
- ✅ Sample requests for all agents
- ✅ Error testing scenarios
- ✅ Variable base URL configuration

## 🚀 Quick Start

1. Start the server: `npm run dev`
2. Import the Postman collection
3. Update the API key in collection variables
4. Test endpoints starting with the health check

## 🔒 Security Features

- API key authentication on all endpoints
- Rate limiting (100 req/min general, 20 req/min for agents)
- Input validation and sanitization
- CORS restrictions to allowed origins
- Request size limits (10MB)
- Comprehensive error handling

## 📝 Example Usage

### Running an Agent
```bash
curl -X POST http://localhost:3002/api/agents/categorization/run \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secure-api-key-here" \
  -d '{
    "data": {
      "categories": "Work,Personal,Spam",
      "subject": "Team meeting",
      "from": "manager@company.com",
      "body": "Reminder: team meeting at 2 PM"
    }
  }'
```

### Custom Model Override
```bash
curl -X POST http://localhost:3002/api/agents/categorization/run \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secure-api-key-here" \
  -d '{
    "data": { "categories": "Work,Personal", "subject": "Hello", "from": "friend@email.com", "body": "How are you?" },
    "modelConfig": { "provider": "anthropic", "model": "claude-3-sonnet-20240229" }
  }'
