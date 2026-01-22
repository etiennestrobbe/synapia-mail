import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ConfigService } from './config.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('config')
@UseGuards(JwtAuthGuard)
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('categorization-threshold')
  async getCategorizationThreshold(@Request() req) {
    const customerId = req.user.customerId;
    const threshold = await this.configService.getCategorizationThreshold(customerId);
    return { threshold };
  }

  @Put('categorization-threshold')
  async updateCategorizationThreshold(
    @Request() req,
    @Body() body: { threshold: number }
  ) {
    const customerId = req.user.customerId;
    const threshold = await this.configService.updateCategorizationThreshold(customerId, body.threshold);
    return { threshold };
  }
}
