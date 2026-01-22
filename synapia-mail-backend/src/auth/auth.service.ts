import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Customer, CustomerDocument } from '../schemas/customer.schema';
import { AuditService } from '../common/services/audit.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async validateCustomer(email: string, password: string): Promise<any> {
    const customer = await this.customerModel.findOne({ email, isActive: true });
    if (!customer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return customer;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async login(customer: any) {
    const payload = { email: customer.email, sub: customer._id, customerId: customer._id };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        subscriptionPlan: customer.subscriptionPlan,
        creditsRemaining: customer.creditsRemaining,
        warningThreshold: customer.warningThreshold,
      },
    };
  }

  async getCustomerById(customerId: string): Promise<CustomerDocument | null> {
    return this.customerModel.findById(customerId);
  }
}
