import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { CategoriesService } from '../categories.service';
import { Category } from '../entities/category.entity';

describe('CategoriesService - delete', () => {
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
      softDelete: jest.fn(),
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

  it('performs soft delete successfully', async () => {
    // Arrange
    const categoryId = 1;
    jest.spyOn(mockRepository, 'findOne').mockResolvedValue(mockCategory);
    jest.spyOn(mockRepository, 'softDelete').mockResolvedValue({
      affected: 1,
      raw: {},
      generatedMaps: [],
    });

    // Act
    await service.delete(categoryId);

    // Assert
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: categoryId },
      withDeleted: false,
    });
    expect(mockRepository.softDelete).toHaveBeenCalledWith(categoryId);
  });

  it('throws NotFoundException for non-existent ID', async () => {
    // Arrange
    const nonExistentId = 999;
    jest.spyOn(mockRepository, 'findOne').mockResolvedValue(null);

    // Act & Assert
    await expect(service.delete(nonExistentId)).rejects.toThrow(
      new NotFoundException(`Category with ID ${nonExistentId} not found`),
    );
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: nonExistentId },
      withDeleted: false,
    });
    expect(mockRepository.softDelete).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when delete operation fails', async () => {
    // Arrange
    const categoryId = 1;
    jest.spyOn(mockRepository, 'findOne').mockResolvedValue(mockCategory);
    jest.spyOn(mockRepository, 'softDelete').mockResolvedValue({
      affected: 0,
      raw: {},
      generatedMaps: [],
    });

    // Act & Assert
    await expect(service.delete(categoryId)).rejects.toThrow(
      new NotFoundException(`Failed to delete category with ID ${categoryId}`),
    );
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: categoryId },
      withDeleted: false,
    });
    expect(mockRepository.softDelete).toHaveBeenCalledWith(categoryId);
  });

  it('uses transaction manager when provided', async () => {
    // Arrange
    const categoryId = 1;
    const mockRepositoryWithTransaction = {
      findOne: jest.fn().mockResolvedValue(mockCategory),
      softDelete: jest.fn().mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      }),
    };
    const mockQueryRunner = {
      manager: {
        getRepository: jest.fn().mockReturnValue(mockRepositoryWithTransaction),
      },
    } as unknown as QueryRunner;

    // Act
    await service.delete(categoryId, mockQueryRunner);

    // Assert
    expect(mockQueryRunner.manager.getRepository).toHaveBeenCalledWith(
      Category,
    );
    expect(mockRepositoryWithTransaction.findOne).toHaveBeenCalledWith({
      where: { id: categoryId },
      withDeleted: false,
    });
    expect(mockRepositoryWithTransaction.softDelete).toHaveBeenCalledWith(
      categoryId,
    );
  });
});
