export interface TFindOneCategoryResponse {
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
  createdAt: string;
  
  /**
   * The date and time the category was last updated
   */
  updatedAt: string;
  
  /**
   * The date and time the category was deleted (if applicable)
   */
  deletedAt: string | null;
}
