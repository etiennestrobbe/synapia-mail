import { Controller, Post, Body, UseGuards, Request, Get, Headers } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from '../schemas/customer.schema';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('outlook/callback')
  async outlookCallback(@Body() body: { code: string; state: string }) {
    // TODO: Implement Outlook OAuth callback
    // This will handle the SSO from Azure AD
    return { message: 'Outlook callback not implemented yet' };
  }

  @Post('debug-user')
  async debugUser(@Body() body: { email: string }) {
    // Find customer by email for debugging
    const customer = await this.customerModel.findOne({ email: body.email });
    if (customer) {
      return {
        exists: true,
        email: customer.email,
        hasPassword: !!customer.password,
        passwordLength: customer.password?.length,
        isActive: customer.isActive
      };
    }
    return { exists: false };
  }


}
