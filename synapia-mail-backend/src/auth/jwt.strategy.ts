import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtStrategy {
  name = 'jwt'; // Strategy name for Passport

  constructor(
    @Inject(JwtService) private jwtService: JwtService,
  ) {}

  async authenticate(req: any) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return this.fail('No token provided', 401);
      }

      const token = authHeader.substring(7);

      // Verify token using the same JwtService
      const payload = await this.jwtService.verifyAsync(token);

      // Create user object
      const user = {
        userId: payload.sub,
        email: payload.email,
        customerId: payload.customerId
      };

      return this.success(user);

    } catch (error) {
      return this.fail('Invalid token', 401);
    }
  }

  success(user: any) {
    // Simulate Passport success
    this.redirect = null;
    this.pass();
    return { user };
  }

  fail(message: string, status: number = 401) {
    // Simulate Passport failure
    this.redirect = null;
    const error = new Error(message);
    (error as any).status = status;
    throw error;
  }

  pass() {
    // Simulate Passport pass
    return true;
  }

  redirect: any = null;
}
