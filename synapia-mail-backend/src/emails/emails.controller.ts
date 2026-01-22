import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EmailsService } from './emails.service';

@Controller('emails')
@UseGuards(JwtAuthGuard)
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Post('categorize')
  categorizeEmails(@Request() req) {
    return this.emailsService.fetchAndCategorizeEmails(req.user.customerId);
  }

  @Get()
  getCategorizedEmails(@Request() req) {
    return this.emailsService.getCategorizedEmails(req.user.customerId);
  }

  @Get('credits')
  getCredits(@Request() req) {
    return this.emailsService.getCustomerCredits(req.user.customerId);
  }
}
