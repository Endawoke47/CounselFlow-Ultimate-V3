import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { CategoriesService } from '../categories.service';
import { Category } from '../entities/category.entity';

describe('CategoriesService - findOne', () => {
  let service: CategoriesService;
  let mockRepository: Repository<Category>;

  const mockCategory: Category = {
    id: 1,
    name: 'Test Category',
    companies: [],
    createdAt: new Date('2024-03-25'),
    updatedAt: new Date('2024-03-25'),
    deletedAt: null,
  };

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
    } as unknown as Repository<Category>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns category when it exists', async () => {
    // Arrange
    const categoryId = 1;
    jest.spyOn(mockRepository, 'findOne').mockResolvedValue(mockCategory);

    // Act
    const result = await service.findOne(categoryId);

    // Assert
    expect(result).toEqual(mockCategory);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: categoryId },
      withDeleted: false,
    });
  });

  it('throws NotFoundException for non-existent ID', async () => {
    // Arrange
    const nonExistentId = 999;
    jest.spyOn(mockRepository, 'findOne').mockResolvedValue(null);

    // Act & Assert
    await expect(service.findOne(nonExistentId)).rejects.toThrow(
      new NotFoundException(`Category with ID ${nonExistentId} not found`),
    );
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: nonExistentId },
      withDeleted: false,
    });
  });

  it('uses transaction manager when provided', async () => {
    // Arrange
    const categoryId = 1;
    const mockRepositoryWithTransaction = {
      findOne: jest.fn().mockResolvedValue(mockCategory),
    };
    const mockQueryRunner = {
      manager: {
        getRepository: jest.fn().mockReturnValue(mockRepositoryWithTransaction),
      },
    } as unknown as QueryRunner;

    // Act
    const result = await service.findOne(categoryId, false, mockQueryRunner);

    // Assert
    expect(result).toEqual(mockCategory);
    expect(mockQueryRunner.manager.getRepository).toHaveBeenCalledWith(
      Category,
    );
    expect(mockRepositoryWithTransaction.findOne).toHaveBeenCalledWith({
      where: { id: categoryId },
      withDeleted: false,
    });
  });
});
