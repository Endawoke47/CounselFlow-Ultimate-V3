import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { mockCategories, mockCategory } from './category.entity.mock';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<any>;
};

export const createMockRepository = (): MockType<Repository<Category>> => ({
  create: jest.fn().mockReturnValue(mockCategory),
  save: jest.fn().mockResolvedValue(mockCategory),
  findOne: jest.fn().mockResolvedValue(mockCategory),
  find: jest.fn().mockResolvedValue(mockCategories),
  softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
  restore: jest.fn().mockResolvedValue({ affected: 1 }),
  merge: jest.fn().mockReturnValue(mockCategory),
});
