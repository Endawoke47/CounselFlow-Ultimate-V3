import { TPaginatedResponse } from '../common/TPagination';

/**
 * Category item in the list
 */
export type TCategoryItem = {
  /**
   * The unique identifier of the category
   */
  id: number;
  
  /**
   * The name of the category
   */
  name: string;
  
  /**
   * The date and time the category was created
   */
  createdAt: Date;
  
  /**
   * The date and time the category was last updated
   */
  updatedAt: Date;
  
  /**
   * The date and time the category was deleted (if applicable)
   */
  deletedAt?: Date | null;
};

/**
 * Response type for finding multiple categories
 * Uses nestjs-typeorm-paginate structure
 */
export type TFindManyCategoriesResponse = TPaginatedResponse<TCategoryItem>;
