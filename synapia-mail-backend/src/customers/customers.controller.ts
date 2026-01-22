import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post('populate')
  @UseGuards(ApiKeyGuard)
  async populateCustomers(@Body() createCustomerDtos: CreateCustomerDto[]) {
    return this.customersService.populateCustomers(createCustomerDtos);
  }
}
