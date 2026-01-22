import { IsString, IsNotEmpty, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  subscriptionPlan: string;

  @IsNumber()
  @Min(0)
  totalCredits: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  warningThreshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  categorizationConfidenceThreshold?: number;
}
