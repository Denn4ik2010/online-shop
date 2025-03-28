import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileService } from '../file/file.service';
import { Order } from '../enum/order.enum';

const mockFiles: Express.Multer.File[] = [
  {
    fieldname: 'image',
    originalname: 'file1.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('mockImageData'), // Моковані дані
    size: 12345,
    stream: null,
    destination: '',
    filename: 'file1.jpg',
    path: '',
  },
  {
    fieldname: 'image',
    originalname: 'file2.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('mockImageData'),
    size: 12345,
    stream: null,
    destination: '',
    filename: 'file2.jpg',
    path: '',
  },
];

describe('ProductService', () => {
  let service: ProductService;
  let repository: ProductRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: {
            count: jest.fn(),
            findAll: jest.fn(),
            findProducts: jest.fn(),
            findById: jest.fn(),
            countCategoryProducts: jest.fn(),
            findCategoryProducts: jest.fn(),
            countUserProducts: jest.fn(),
            findUserProducts: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: FileService,
          useValue: {
            createImages: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get<ProductRepository>(ProductRepository);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should return category products with default sorting', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'title',
        price: 50,
        userId: 1,
        description: 'description',
        images: ['1', '2'],
        categories: [{ id: 1, name: 'test', description: 'test' }],
      },
    ];

    jest.spyOn(repository, 'countCategoryProducts').mockResolvedValue(1);
    jest
      .spyOn(repository, 'findCategoryProducts')
      .mockResolvedValue(mockProducts);

    const products = await service.getCategoryProducts(
      1,
      {
        page: 1,
        pageSize: 1,
      },
      {sortBy: 'id', order: Order.DESC},
    );

    expect(repository.countCategoryProducts).toHaveBeenCalledWith(1);
    expect(repository.findCategoryProducts).toHaveBeenCalledWith(1, 0, 1, {sortBy: 'id', order: Order.DESC});
    expect(products).toEqual({
      products: mockProducts,
      total: 1,
      pageSize: 1,
      page: 1,
      totalPages: 1,
      prevPage: null,
      nextPage: null,
    });
  });

  it('should return user products with default sorting', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'title',
        price: 50,
        userId: 1,
        description: 'description',
        images: ['1', '2'],
        categories: [{ id: 1, name: 'test', description: 'test' }],
      },
    ];

    jest.spyOn(repository, 'countUserProducts').mockResolvedValue(1);
    jest.spyOn(repository, 'findUserProducts').mockResolvedValue(mockProducts);

    const products = await service.getUserProducts(
      1,
      {
        page: 1,
        pageSize: 1,
      },
      { sortBy: 'id', order: Order.DESC },
    );

    expect(repository.countUserProducts).toHaveBeenCalledWith(1);
    expect(repository.findUserProducts).toHaveBeenCalledWith(1, 0, 1, {
      sortBy: 'id',
      order: Order.DESC,
    });
    expect(products).toEqual({
      products: mockProducts,
      total: 1,
      pageSize: 1,
      page: 1,
      totalPages: 1,
      prevPage: null,
      nextPage: null,
    });
  });

  it('should return all products without filters with default sorting', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'title',
        price: 50,
        userId: 1,
        description: 'description',
        images: ['1', '2'],
        categories: [{ id: 1, name: 'test', description: 'test' }],
      },
    ];

    jest.spyOn(repository, 'count').mockResolvedValue(1);
    jest.spyOn(repository, 'findAll').mockResolvedValue(mockProducts);

    const products = await service.getAll(
      { page: 1, pageSize: 1 },
      { sortBy: 'id', order: Order.DESC },
    );

    expect(repository.findAll).toHaveBeenCalledWith(0, 1, {
      sortBy: 'id',
      order: Order.DESC,
    });
    expect(products).toEqual({
      products: mockProducts,
      total: 1,
      pageSize: 1,
      page: 1,
      totalPages: 1,
      prevPage: null,
      nextPage: null,
    });
  });

  it('should return all products finded by title with default sorting', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'title',
        price: 50,
        userId: 1,
        description: 'description',
        images: ['1', '2'],
        categories: [{ id: 1, name: 'test', description: 'test' }],
      },
    ];

    jest.spyOn(repository, 'count').mockResolvedValue(1);
    jest.spyOn(repository, 'findProducts').mockResolvedValue(mockProducts);

    const products = await service.search(
      { title: 'Test' },
      { pageSize: 1, page: 1 },
      {sortBy: 'id', order: Order.DESC}
    );

    expect(repository.findProducts).toHaveBeenCalledWith(
      { title: 'Test' },
      0,
      1,
      {sortBy: 'id', order: Order.DESC}
    );
    expect(products).toEqual({
      products: mockProducts,
      total: 1,
      pageSize: 1,
      page: 1,
      totalPages: 1,
      prevPage: null,
      nextPage: null,
    });
  });

  it('should return all products finded by title and price range with default sorting', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'title',
        price: 50,
        userId: 1,
        description: 'description',
        images: ['1', '2'],
        categories: [{ id: 1, name: 'test', description: 'test' }],
      },
    ];

    jest.spyOn(repository, 'count').mockResolvedValue(1);
    jest.spyOn(repository, 'findProducts').mockResolvedValue(mockProducts);

    const products = await service.search(
      { title: 'Test', minPrice: 20, maxPrice: 20 },
      { pageSize: 1, page: 1 },
      {}
    );

    expect(repository.findProducts).toHaveBeenCalledWith(
      { title: 'Test', minPrice: 20, maxPrice: 20 },
      0,
      1,
      {}
    );
    expect(products).toEqual({
      products: mockProducts,
      total: 1,
      pageSize: 1,
      page: 1,
      totalPages: 1,
      prevPage: null,
      nextPage: null,
    });
  });

  it('should filter products by title and price, range  and category ids with default sorting', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'title',
        price: 50,
        userId: 1,
        description: 'description',
        images: ['1', '2'],
        categories: [{ id: 1, name: 'test', description: 'test' }],
      },
    ];

    jest.spyOn(repository, 'count').mockResolvedValue(1);
    jest.spyOn(repository, 'findProducts').mockResolvedValue(mockProducts);

    const products = await service.search(
      { title: 'Test', minPrice: 20, maxPrice: 20, categoryIds: [1] },
      { pageSize: 1, page: 1 },
      {sortBy: 'id', order: Order.DESC}
    );

    expect(repository.findProducts).toHaveBeenCalledWith(
      { title: 'Test', minPrice: 20, maxPrice: 20, categoryIds: [1] },
      0,
      1,
      {sortBy: 'id', order: Order.DESC}
    );
    expect(products).toEqual({
      products: mockProducts,
      total: 1,
      pageSize: 1,
      page: 1,
      totalPages: 1,
      prevPage: null,
      nextPage: null,
    });
  });

  it('should find product by id', async () => {
    const productId = 3;
    const mockProduct = {
      id: 1,
      title: 'title',
      price: 50,
      userId: 1,
      description: 'description',
      images: ['1', '2'],
      categories: [{ id: 1, name: 'test', description: 'test' }],
    };

    jest.spyOn(repository, 'findById').mockResolvedValue(mockProduct);

    const product = await service.getById(productId);

    expect(repository.findById).toHaveBeenCalledWith(productId);

    expect(product).toEqual(mockProduct);
  });

  it('should create product', async () => {
    const userId = 1;
    const images = ['1', '2'];

    const dto: CreateProductDto = {
      title: 'Test Product',
      description: 'Test Description',
      price: 100,
      categoryIds: [1],
    };
    const mockProduct = {
      id: 1,
      title: dto.title,
      price: dto.price,
      userId,
      description: dto.description,
      images,
      categories: [{ id: 1, name: 'test', description: 'test' }],
    };

    jest.spyOn(repository, 'create').mockResolvedValue(mockProduct);

    const product = await service.create(userId, dto, mockFiles);

    expect(product).toEqual(mockProduct);
  });

  it('should update all fields in product', async () => {
    const productId = 2;
    const userId = 1;
    const images = ['image1.jpg', 'image2.jpg'];
    const dto: UpdateProductDto = {
      title: 'Updated Title',
      description: 'Updated Description',
      price: 100,
      categoryIds: [1],
    };

    const mockProduct = {
      id: productId,
      userId,
      title: dto.title,
      description: dto.description,
      price: dto.price,
      images,
      categories: [{ id: 1, name: 'test', description: 'test' }],
    };

    jest.spyOn(repository, 'findById').mockResolvedValue(mockProduct);
    jest.spyOn(repository, 'update').mockResolvedValue(mockProduct);

    const product = await service.update(userId, productId, dto, mockFiles);

    expect(product).toEqual(mockProduct);
  });

  it('should update only title in product', async () => {
    const userId = 1;
    const productId = 1;
    const imageNames = ['image1.jpg'];
    const dto: UpdateProductDto = {
      title: 'Updated Title',
    };

    const mockProduct = {
      id: productId,
      userId: 1,
      title: dto.title,
      description: 'Old Description',
      price: 50,
      images: imageNames,
      categories: [{ id: 1, name: 'test', description: 'test' }],
    };

    jest.spyOn(repository, 'findById').mockResolvedValue(mockProduct);
    jest.spyOn(repository, 'update').mockResolvedValue(mockProduct);

    const product = await service.update(userId, productId, dto);

    expect(product).toEqual(mockProduct);
  });

  it('should update only price in product', async () => {
    const userId = 1;
    const productId = 1;
    const dto: UpdateProductDto = {
      price: 52,
    };
    const imageNames = ['image1.jpg'];

    const mockProduct = {
      id: productId,
      userId: 1,
      title: 'Old title',
      description: 'Old Description',
      price: dto.price,
      images: imageNames,
      categories: [{ id: 1, name: 'test', description: 'test' }],
    };

    jest.spyOn(repository, 'findById').mockResolvedValue(mockProduct);
    jest.spyOn(repository, 'update').mockResolvedValue(mockProduct);

    const product = await service.update(userId, productId, dto);

    expect(product).toEqual(mockProduct);
  });

  it('should update images in product', async () => {
    const userId = 1;
    const productId = 1;
    const imageName = ['1.jpg'];
    const dto: UpdateProductDto = {};
    const mockProduct = {
      id: productId,
      userId: 1,
      title: 'Old title',
      description: 'Old Description',
      price: 50,
      images: imageName,
      categories: [{ id: 1, name: 'test', description: 'test' }],
    };

    jest.spyOn(repository, 'findById').mockResolvedValue(mockProduct);
    jest.spyOn(repository, 'update').mockResolvedValue(mockProduct);

    const product = await service.update(userId, productId, dto, mockFiles);

    expect(product).toEqual(mockProduct);
  });

  it('should delete product by id', async () => {
    const mockProduct = {
      id: 1,
      userId: 1,
      price: 22,
      title: 'TEST',
      description: 'Test',
      images: ['13', '14'],
      categories: [{ id: 1, name: 'test', description: 'test' }],
    };

    jest.spyOn(repository, 'findById').mockResolvedValue(mockProduct);

    await service.delete(1, 1);

    expect(repository.delete).toHaveBeenCalledWith(1);
  });
});
