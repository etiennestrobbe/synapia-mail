import { IsString, IsOptional, Length, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'Category name must be a string' })
  @Length(1, 100, { message: 'Category name must be between 1 and 100 characters' })
  @Matches(/^[a-zA-Z0-9\s\-_]+$/, {
    message: 'Category name can only contain letters, numbers, spaces, hyphens, and underscores'
  })
  name: string;

  @IsOptional()
  @IsString({ message: 'Category description must be a string' })
  @Length(0, 500, { message: 'Category description must not exceed 500 characters' })
  description?: string;
}
