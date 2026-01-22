import { Injectable, Logger } from '@nestjs/common';

export interface AuditEvent {
  timestamp: Date;
  event: string;
  userId?: string;
  ip: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  status: 'success' | 'failure' | 'warning';
  details?: any;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  logAuthAttempt(username: string, success: boolean, ip: string, userAgent?: string): void {
    const event: AuditEvent = {
      timestamp: new Date(),
      event: 'AUTH_ATTEMPT',
      ip,
      userAgent,
      action: success ? 'login_success' : 'login_failure',
      status: success ? 'success' : 'failure',
      details: { username }
    };

    this.logEvent(event);
  }

  logApiAccess(userId: string, method: string, url: string, statusCode: number, ip: string, userAgent?: string): void {
    const event: AuditEvent = {
      timestamp: new Date(),
      event: 'API_ACCESS',
      userId,
      ip,
      userAgent,
      resource: url,
      action: method,
      status: statusCode >= 400 ? 'failure' : 'success',
      details: { statusCode }
    };

    this.logEvent(event);
  }

  logSecurityEvent(eventType: string, details: any, ip: string, userId?: string): void {
    const event: AuditEvent = {
      timestamp: new Date(),
      event: eventType,
      userId,
      ip,
      status: 'warning',
      details
    };

    this.logEvent(event);
  }

  logRateLimitExceeded(ip: string, url: string): void {
    const event: AuditEvent = {
      timestamp: new Date(),
      event: 'RATE_LIMIT_EXCEEDED',
      ip,
      resource: url,
      status: 'warning',
      details: { message: 'Rate limit exceeded for IP' }
    };

    this.logEvent(event);
  }

  private logEvent(event: AuditEvent): void {
    const logMessage = JSON.stringify({
      timestamp: event.timestamp.toISOString(),
      event: event.event,
      userId: event.userId || 'anonymous',
      ip: event.ip,
      userAgent: event.userAgent || 'unknown',
      resource: event.resource || 'unknown',
      action: event.action || 'unknown',
      status: event.status,
      details: event.details || {}
    });

    // Log to console/file (in production, this should go to a proper logging system)
    switch (event.status) {
      case 'success':
        this.logger.log(logMessage);
        break;
      case 'failure':
        this.logger.error(logMessage);
        break;
      case 'warning':
        this.logger.warn(logMessage);
        break;
    }
  }
}
