import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll(customerId: string): Promise<CategoryDocument[]> {
    return this.categoryModel.find({ customerId, isActive: true });
  }

  async findOne(id: string, customerId: string): Promise<CategoryDocument | null> {
    return this.categoryModel.findOne({ _id: id, customerId, isActive: true });
  }

  async create(customerId: string, name: string, description?: string): Promise<CategoryDocument> {
    
    const category = new this.categoryModel({
      customerId,
      name,
      description,
    });
    console.log("Category", category);
    return category.save();
  }

  async update(id: string, customerId: string, name?: string, description?: string): Promise<CategoryDocument | null> {
    const updateData: any = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    return this.categoryModel.findOneAndUpdate(
      { _id: id, customerId, isActive: true },
      updateData,
      { new: true },
    );
  }

  async delete(id: string, customerId: string): Promise<boolean> {
    const result = await this.categoryModel.findOneAndUpdate(
      { _id: id, customerId, isActive: true },
      { isActive: false, updatedAt: new Date() },
    );
    return !!result;
  }
}
