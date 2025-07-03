import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';
import { TUpdateCategoryRequest } from '1pd-types';

export class UpdateCategoryDto
  extends PartialType(CreateCategoryDto)
  implements TUpdateCategoryRequest {}
