import rateLimit from 'express-rate-limit';
import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Rate limiting: 100 requests per minute per IP
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limit for agent runs: 20 per minute
export const agentRunLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 agent runs per windowMs
  message: {
    error: 'Too many agent requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation middleware
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Validation rules for categorization
export const validateCategorization = [
  body('emailContent')
    .isObject()
    .withMessage('emailContent must be an object'),
  body('emailContent.subject')
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Subject must be a string between 1-1000 characters'),
  body('emailContent.body')
    .isString()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Body must be a string between 1-10000 characters'),
  body('emailContent.from')
    .isString()
    .isLength({ min: 1, max: 254 })
    .withMessage('From must be a valid email address')
    .isEmail()
    .normalizeEmail(),
  body('categories')
    .isArray({ min: 1, max: 50 })
    .withMessage('Categories must be an array with 1-50 items'),
  body('categories.*')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each category must be a string 1-100 characters'),
  handleValidationErrors
];

// Validation rules for agent run
export const validateAgentRun = [
  param('name')
    .isString()
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Agent name must contain only alphanumeric characters, hyphens, and underscores'),
  body('data')
    .isObject()
    .withMessage('Data must be an object'),
  body('modelConfig')
    .optional()
    .isObject()
    .withMessage('modelConfig must be an object if provided'),
  body('modelConfig.provider')
    .optional()
    .isIn(['openai', 'anthropic', 'openrouter', 'gemini', 'mistral'])
    .withMessage('Invalid provider'),
  body('modelConfig.model')
    .optional()
    .isString()
    .withMessage('Model must be a string'),
  handleValidationErrors
];

// Validation rules for config update
export const validateConfigUpdate = [
  body('defaultProvider')
    .optional()
    .isIn(['openai', 'anthropic', 'openrouter', 'gemini', 'mistral'])
    .withMessage('Invalid default provider'),
  body('defaultModel')
    .optional()
    .isString()
    .withMessage('Default model must be a string'),
  body('apiKeys')
    .optional()
    .isObject()
    .withMessage('API keys must be an object'),
  handleValidationErrors
];

// Validation rules for prompt update
export const validatePromptUpdate = [
  param('name')
    .isString()
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Agent name must contain only alphanumeric characters, hyphens, and underscores'),
  body('systemPrompt')
    .optional()
    .isString()
    .isLength({ max: 10000 })
    .withMessage('System prompt must be a string with max 10000 characters'),
  body('userPromptTemplate')
    .optional()
    .isString()
    .isLength({ max: 10000 })
    .withMessage('User prompt template must be a string with max 10000 characters'),
  handleValidationErrors
];
