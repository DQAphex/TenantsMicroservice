import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PaginationDto } from '../global/paginacion.dto';
import { DRIZZLE } from '../database/database.provider';
import { tenantTypeEnum, statusEnum } from '../database/schema/enums';

const mockTenant = {
  tenantId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'Empresa de Prueba SpA',
  rut: 12345678,
  dv: '9',
  type: 'EMPRESA',
  status: 'ACTIVE',
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:00:00Z'),
};

const mockTenantsArray = [
  mockTenant,
  {
    ...mockTenant,
    tenantId: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    name: 'Otra Empresa Ltda',
    rut: 87654321,
    dv: '5',
    type: 'PERSONA_NATURAL',
  },
];

const createTenantDto: CreateTenantDto = {
  name: 'Empresa de Prueba SpA',
  rut: 12345678,
  dv: '9',
  type: 'EMPRESA',
};

const updateTenantDto: UpdateTenantDto = {
  name: 'Empresa Actualizada SpA',
};

const paginationDto: PaginationDto = {
  page: 1,
  limit: 10,
};

const [ACTIVE, INACTIVE] = statusEnum.enumValues;

const createQueryPromise = (result: any) => Promise.resolve(result);

const mockDb = {
  insert: jest.fn().mockReturnValue({
    values: jest.fn().mockReturnValue({
      returning: jest.fn(),
    }),
  }),
  select: jest.fn(),
  update: jest.fn(),
};

describe('TenantsService', () => {
  let service: TenantsService;
  let db: typeof mockDb;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: DRIZZLE,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    db = module.get(DRIZZLE);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a tenant', async () => {
      const returningMock = jest.fn().mockResolvedValueOnce([mockTenant]);
      db.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: returningMock,
        }),
      });

      const result = await service.create(createTenantDto);

      expect(db.insert).toHaveBeenCalledTimes(1);
      const insertCall = db.insert.mock.results[0].value;
      expect(insertCall.values).toHaveBeenCalledWith({
        name: createTenantDto.name,
        rut: createTenantDto.rut,
        dv: createTenantDto.dv,
        type: createTenantDto.type,
      });
      expect(returningMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTenant);
    });

    it('should handle database error on create', async () => {
      const returningMock = jest.fn().mockRejectedValueOnce(new Error('DB Error'));
      db.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: returningMock,
        }),
      });

      await expect(service.create(createTenantDto)).rejects.toThrow('DB Error');
    });
  });

  describe('findAll', () => {
    it('should return paginated tenants with meta', async () => {
      // Mock the two select calls: first for data, second for count
      const dataPromise = createQueryPromise(mockTenantsArray);
      const countPromise = createQueryPromise([{ total: '2' }]);

      // Create chain objects that are thenable
      const dataChain = {
        from: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnValue(dataPromise),
        then: jest.fn((resolve) => dataPromise.then(resolve)),
      };

      const countChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => countPromise.then(resolve)),
      };

      db.select
        .mockReturnValueOnce(dataChain)
        .mockReturnValueOnce(countChain);

      const result = await service.findAll(paginationDto);

      expect(db.select).toHaveBeenCalledTimes(2);
      expect(dataChain.from).toHaveBeenCalledTimes(1);
      expect(dataChain.orderBy).toHaveBeenCalledTimes(1);
      expect(dataChain.limit).toHaveBeenCalledWith(paginationDto.limit);
      expect(dataChain.offset).toHaveBeenCalledWith((paginationDto.page - 1) * paginationDto.limit);
      expect(countChain.from).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        data: mockTenantsArray,
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('should calculate totalPages correctly for multiple pages', async () => {
      const dataPromise = createQueryPromise([mockTenant]);
      const countPromise = createQueryPromise([{ total: '25' }]);

      const dataChain = {
        from: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnValue(dataPromise),
        then: jest.fn((resolve) => dataPromise.then(resolve)),
      };

      const countChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => countPromise.then(resolve)),
      };

      db.select
        .mockReturnValueOnce(dataChain)
        .mockReturnValueOnce(countChain);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(result.meta).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
    });

    it('should return empty data when no tenants exist', async () => {
      const dataPromise = createQueryPromise([]);
      const countPromise = createQueryPromise([{ total: '0' }]);

      const dataChain = {
        from: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnValue(dataPromise),
        then: jest.fn((resolve) => dataPromise.then(resolve)),
      };

      const countChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => countPromise.then(resolve)),
      };

      db.select
        .mockReturnValueOnce(dataChain)
        .mockReturnValueOnce(countChain);

      const result = await service.findAll(paginationDto);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a tenant when found', async () => {
      const promise = createQueryPromise([mockTenant]);
      const chain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => promise.then(resolve)),
      };
      db.select.mockReturnValueOnce(chain);

      const result = await service.findOne(mockTenant.tenantId);

      expect(db.select).toHaveBeenCalledTimes(1);
      expect(chain.from).toHaveBeenCalledTimes(1);
      expect(chain.where).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTenant);
    });

    it('should throw NotFoundException when tenant not found', async () => {
      const promise = createQueryPromise([]);
      const chain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => promise.then(resolve)),
      };
      db.select.mockReturnValueOnce(chain);

      const promiseRejection = service.findOne('non-existent-id');

      await expect(promiseRejection).rejects.toThrow(NotFoundException);
      await expect(promiseRejection).rejects.toThrow(
        `Tenant con id non-existent-id no encontrado`,
      );
    });
  });

  describe('update', () => {
    it('should update and return tenant with message', async () => {
      const updatedTenant = { ...mockTenant, ...updateTenantDto };

      const findOnePromise = createQueryPromise([mockTenant]);
      const findOneChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => findOnePromise.then(resolve)),
      };
      db.select.mockReturnValueOnce(findOneChain);

      const updatePromise = createQueryPromise([updatedTenant]);
      const updateChain = {
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue(updatePromise),
            then: jest.fn((resolve) => updatePromise.then(resolve)),
          }),
        }),
      };
      db.update.mockReturnValueOnce(updateChain);

      const result = await service.update(mockTenant.tenantId, updateTenantDto);

      expect(db.update).toHaveBeenCalledTimes(1);
      expect(updateChain.set).toHaveBeenCalledWith(updateTenantDto);
      expect(updateChain.set.mock.results[0].value.where).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        mesage: `Tenant con id ${mockTenant.tenantId} actualizado correctamente`,
        data: [updatedTenant],
      });
    });

    it('should throw NotFoundException when updating non-existent tenant', async () => {
      const findOnePromise = createQueryPromise([]);
      const findOneChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => findOnePromise.then(resolve)),
      };
      db.select.mockReturnValueOnce(findOneChain);

      await expect(
        service.update('non-existent-id', updateTenantDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleStatus', () => {
    it('should toggle status from ACTIVE to INACTIVE', async () => {
      const activeTenant = { ...mockTenant, status: ACTIVE };
      const inactiveTenant = { ...mockTenant, status: INACTIVE };

      const findOnePromise = createQueryPromise([activeTenant]);
      const findOneChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => findOnePromise.then(resolve)),
      };
      db.select.mockReturnValueOnce(findOneChain);

      const updatePromise = createQueryPromise([inactiveTenant]);
      const updateChain = {
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue(updatePromise),
            then: jest.fn((resolve) => updatePromise.then(resolve)),
          }),
        }),
      };
      db.update.mockReturnValueOnce(updateChain);

      const result = await service.toggleStatus(mockTenant.tenantId);

      expect(db.update).toHaveBeenCalledTimes(1);
      const updateCall = db.update.mock.results[0].value;
      expect(updateCall.set).toHaveBeenCalledWith({ status: INACTIVE });
      expect(updateCall.set.mock.results[0].value.where).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        mesage: `Tenant con id ${mockTenant.tenantId} eliminado correctamente`,
        data: [inactiveTenant],
      });
    });

    it('should toggle status from INACTIVE to ACTIVE', async () => {
      const inactiveTenant = { ...mockTenant, status: INACTIVE };
      const activeTenant = { ...mockTenant, status: ACTIVE };

      const findOnePromise = createQueryPromise([inactiveTenant]);
      const findOneChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => findOnePromise.then(resolve)),
      };
      db.select.mockReturnValueOnce(findOneChain);

      const updatePromise = createQueryPromise([activeTenant]);
      const updateChain = {
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue(updatePromise),
            then: jest.fn((resolve) => updatePromise.then(resolve)),
          }),
        }),
      };
      db.update.mockReturnValueOnce(updateChain);

      const result = await service.toggleStatus(mockTenant.tenantId);

      expect(db.update).toHaveBeenCalledTimes(1);
      const updateCall = db.update.mock.results[0].value;
      expect(updateCall.set).toHaveBeenCalledWith({ status: ACTIVE });
      expect(result.data[0].status).toBe(ACTIVE);
    });

    it('should throw NotFoundException when toggling non-existent tenant', async () => {
      const findOnePromise = createQueryPromise([]);
      const findOneChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => findOnePromise.then(resolve)),
      };
      db.select.mockReturnValueOnce(findOneChain);

      await expect(service.toggleStatus('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});