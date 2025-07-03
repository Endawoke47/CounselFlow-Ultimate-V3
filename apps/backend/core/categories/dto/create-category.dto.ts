import { TCreateCategoryRequest } from '1pd-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto implements TCreateCategoryRequest {
  @ApiProperty({
    description: 'Category name',
    example: 'Technology',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name!: string;
}
