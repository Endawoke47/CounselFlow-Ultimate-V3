import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { QueryRunner, Repository } from 'typeorm';
import { CategoriesService } from '../categories.service';
import { Category } from '../entities/category.entity';

// Mock the nestjs-paginate module
jest.mock('nestjs-paginate', () => ({
  ...jest.requireActual('nestjs-paginate'),
  paginate: jest.fn(),
}));

describe('CategoriesService - find', () => {
  let service: CategoriesService;
  let mockRepository: Repository<Category>;
  let mockPaginate: jest.Mock;

  const mockCategories: Category[] = [
    {
      id: 1,
      name: 'Category 1',
      companies: [],
      createdAt: new Date('2024-03-25'),
      updatedAt: new Date('2024-03-25'),
      deletedAt: null,
    },
    {
      id: 2,
      name: 'Category 2',
      companies: [],
      createdAt: new Date('2024-03-25'),
      updatedAt: new Date('2024-03-25'),
      deletedAt: null,
    },
    {
      id: 3,
      name: 'Category 3',
      companies: [],
      createdAt: new Date('2024-03-25'),
      updatedAt: new Date('2024-03-25'),
      deletedAt: null,
    },
  ];

  const createPaginatedResponse = (
    data: Category[],
    page = 1,
    limit = 10,
  ): Paginated<Category> => ({
    data,
    meta: {
      itemsPerPage: limit,
      totalItems: data.length,
      currentPage: page,
      totalPages: Math.ceil(data.length / limit),
      sortBy: [['name', 'ASC']],
      searchBy: ['name'],
      search: '',
      select: ['id', 'name', 'createdAt', 'updatedAt'],
      filter: {},
    },
    links: {
      first: '',
      previous: '',
      current: '',
      next: '',
      last: '',
    },
  });

  beforeEach(async () => {
    // Reset the mock before each test
    mockPaginate = paginate as jest.Mock;
    mockPaginate.mockClear();

    mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue({
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest
          .fn()
          .mockResolvedValue([mockCategories, mockCategories.length]),
      }),
      metadata: {
        columns: [
          { propertyName: 'id', type: 'number' },
          { propertyName: 'name', type: 'string' },
          { propertyName: 'createdAt', type: 'Date' },
          { propertyName: 'updatedAt', type: 'Date' },
          { propertyName: 'deletedAt', type: 'Date' },
        ],
        relations: [
          { propertyName: 'companies' },
          { propertyName: 'projects' },
          { propertyName: 'targetCategories' },
        ],
        primaryColumns: [{ propertyName: 'id' }],
      },
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

  it('should return paginated categories with default parameters', async () => {
    const query: PaginateQuery = {
      page: 1,
      limit: 10,
      path: '',
    };

    const expectedResponse = createPaginatedResponse(mockCategories);
    mockPaginate.mockResolvedValue(expectedResponse);

    const result = await service.find(query);

    expect(result).toEqual(expectedResponse);
    expect(mockPaginate).toHaveBeenCalledWith(
      query,
      expect.any(Object),
      expect.objectContaining({
        sortableColumns: ['id', 'name', 'createdAt', 'updatedAt', 'deletedAt'],
        searchableColumns: ['name'],
        filterableColumns: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
        defaultSortBy: [['id', 'DESC']],
        ignoreSelectInQueryParam: false,
        withDeleted: false,
      }),
    );
  });

  it('should handle custom page and limit parameters', async () => {
    const query: PaginateQuery = {
      page: 2,
      limit: 5,
      path: '',
    };

    const expectedResponse = createPaginatedResponse(mockCategories, 2, 5);
    mockPaginate.mockResolvedValue(expectedResponse);

    const result = await service.find(query);

    expect(result).toEqual(expectedResponse);
    expect(result.meta.currentPage).toBe(2);
    expect(result.meta.itemsPerPage).toBe(5);
  });

  it('should handle sorting parameters', async () => {
    const query: PaginateQuery = {
      page: 1,
      limit: 10,
      path: '',
      sortBy: [['name', 'DESC']],
    };

    const expectedResponse = {
      ...createPaginatedResponse(mockCategories),
      meta: {
        ...createPaginatedResponse(mockCategories).meta,
        sortBy: [['name', 'DESC']],
      },
    };
    mockPaginate.mockResolvedValue(expectedResponse);

    const result = await service.find(query);

    expect(result).toEqual(expectedResponse);
    expect(result.meta.sortBy).toEqual([['name', 'DESC']]);
  });

  it('should handle filtering', async () => {
    const query: PaginateQuery = {
      page: 1,
      limit: 10,
      path: '',
      filter: {
        name: 'test',
      },
    };

    const filteredCategories = mockCategories.filter(cat =>
      cat.name.includes('test'),
    );
    const expectedResponse = createPaginatedResponse(filteredCategories);
    mockPaginate.mockResolvedValue(expectedResponse);

    const result = await service.find(query);

    expect(result).toEqual(expectedResponse);
  });

  it('should handle transaction management', async () => {
    const mockRepositoryWithTransaction = {
      createQueryBuilder: jest.fn().mockReturnValue({
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest
          .fn()
          .mockResolvedValue([mockCategories, mockCategories.length]),
      }),
      metadata: {
        columns: [
          { propertyName: 'id', type: 'number' },
          { propertyName: 'name', type: 'string' },
          { propertyName: 'createdAt', type: 'Date' },
          { propertyName: 'updatedAt', type: 'Date' },
          { propertyName: 'deletedAt', type: 'Date' },
        ],
        relations: [
          { propertyName: 'companies' },
          { propertyName: 'projects' },
          { propertyName: 'targetCategories' },
        ],
        primaryColumns: [{ propertyName: 'id' }],
      },
    };

    const mockQueryRunner = {
      manager: {
        getRepository: jest.fn().mockReturnValue(mockRepositoryWithTransaction),
      },
    } as unknown as QueryRunner;

    const query: PaginateQuery = {
      page: 1,
      limit: 10,
      path: '',
    };

    const expectedResponse = createPaginatedResponse(mockCategories);
    mockPaginate.mockResolvedValue(expectedResponse);

    const result = await service.find(query, false, mockQueryRunner);

    expect(result).toEqual(expectedResponse);
    expect(mockQueryRunner.manager.getRepository).toHaveBeenCalledWith(
      Category,
    );
  });
});
