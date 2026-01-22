import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from '../schemas/customer.schema';

@Injectable()
export class ConfigService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async getCategorizationThreshold(customerId: string): Promise<number> {
    const customer = await this.customerModel.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return customer.categorizationConfidenceThreshold;
  }

  async updateCategorizationThreshold(customerId: string, threshold: number): Promise<number> {
    if (threshold < 0 || threshold > 1) {
      throw new Error('Threshold must be between 0 and 1');
    }

    const customer = await this.customerModel.findByIdAndUpdate(
      customerId,
      { categorizationConfidenceThreshold: threshold },
      { new: true }
    );

    if (!customer) {
      throw new Error('Customer not found');
    }

    return customer.categorizationConfidenceThreshold;
  }
}
