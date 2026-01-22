import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { Customer } from './schemas/customer.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const customerModel = app.get<Model<Customer>>('CustomerModel');
  const authService = app.get(AuthService);

  // Hash the password
  const hashedPassword = await authService.hashPassword('password123');

  // Create test customer
  const testCustomer = new customerModel({
    name: 'Royal Immo Test',
    email: 'test@royal-immo.com',
    password: hashedPassword,
    subscriptionPlan: 'basic',
    creditsRemaining: 50,
    totalCredits: 100,
    warningThreshold: 80,
    isActive: true,
  });

  try {
    await testCustomer.save();
    console.log('Test customer created successfully');
    console.log('Email: test@royal-immo.com');
    console.log('Password: password123');
    console.log('Credits: 50/100');
  } catch (error) {
    console.error('Error creating test customer:', error);
  }

  await app.close();
}

seed();
