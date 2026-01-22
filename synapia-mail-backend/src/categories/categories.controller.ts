import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Request() req) {
    return this.categoriesService.findAll(req.user.customerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new BadRequestException('Invalid category ID format');
    }
    return this.categoriesService.findOne(id, req.user.customerId);
  }

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
    return this.categoriesService.create(
      req.user.customerId,
      createCategoryDto.name,
      createCategoryDto.description
    );
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req,
  ) {
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new BadRequestException('Invalid category ID format');
    }
    return this.categoriesService.update(
      id,
      req.user.customerId,
      updateCategoryDto.name,
      updateCategoryDto.description
    );
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new BadRequestException('Invalid category ID format');
    }
    return this.categoriesService.delete(id, req.user.customerId);
  }
}
