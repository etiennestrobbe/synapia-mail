import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from '../schemas/customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    private authService: AuthService,
  ) {}

  async populateCustomers(createCustomerDtos: CreateCustomerDto[]): Promise<CustomerDocument[]> {
    const customers: CustomerDocument[] = [];

    for (const dto of createCustomerDtos) {
      // Check if customer with this email already exists
      const existingCustomer = await this.customerModel.findOne({ email: dto.email });
      if (existingCustomer) {
        throw new BadRequestException(`Customer with email ${dto.email} already exists`);
      }

      // Hash the password
      const hashedPassword = await this.authService.hashPassword(dto.password);

      // Create the customer
      const customer = new this.customerModel({
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        subscriptionPlan: dto.subscriptionPlan,
        creditsRemaining: dto.totalCredits, // Start with full credits
        totalCredits: dto.totalCredits,
        warningThreshold: dto.warningThreshold ?? 80,
        categorizationConfidenceThreshold: dto.categorizationConfidenceThreshold ?? 0.7,
        isActive: true,
      });

      customers.push(customer);
    }

    // Bulk insert
    return this.customerModel.insertMany(customers);
  }
}
