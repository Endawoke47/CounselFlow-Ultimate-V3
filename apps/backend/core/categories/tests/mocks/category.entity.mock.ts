import { Category } from '../../entities/category.entity';

export const mockCategory: Category = {
  id: 1,
  name: 'Test Category',
  companies: [],
  createdAt: new Date('2024-03-25T10:00:00Z'),
  updatedAt: new Date('2024-03-25T10:00:00Z'),
  deletedAt: null,
};

export const mockCategories: Category[] = [
  mockCategory,
  {
    ...mockCategory,
    id: 2,
    name: 'Test Category 2',
  },
  {
    ...mockCategory,
    id: 3,
    name: 'Test Category 3',
  },
];
