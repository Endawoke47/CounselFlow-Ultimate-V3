/**
 * Common pagination metadata interface based on nestjs-typeorm-paginate
 */
export interface TPaginationMeta {
  /**
   * Number of items per page
   */
  itemsPerPage: number;
  
  /**
   * Total number of items
   */
  totalItems: number;
  
  /**
   * Current page number
   */
  currentPage: number;
  
  /**
   * Total number of pages
   */
  totalPages: number;
  
  /**
   * Sort criteria
   * [field, direction][]
   */
  sortBy?: [string, string][];
}

/**
 * Pagination links interface
 */
export interface TPaginationLinks {
  /**
   * URL for the first page
   */
  first?: string;
  
  /**
   * URL for the previous page
   */
  previous?: string;
  
  /**
   * URL for the current page
   */
  current: string;
  
  /**
   * URL for the next page
   */
  next?: string;
  
  /**
   * URL for the last page
   */
  last?: string;
}

/**
 * Generic paginated response type based on nestjs-typeorm-paginate
 */
export interface TPaginatedResponse<T> {
  /**
   * List of items
   */
  data: T[];
  
  /**
   * Pagination metadata
   */
  meta: TPaginationMeta;
  
  /**
   * Pagination links
   */
  links: TPaginationLinks;
} 