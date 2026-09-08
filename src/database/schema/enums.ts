import { pgEnum } from 'drizzle-orm/pg-core';

export const tenantTypeEnum = pgEnum('tenant_type', [
  'PERSONA_NATURAL',
  'EMPRESA',
]);

export const statusEnum = pgEnum('status', [
  'ACTIVE',
  'INACTIVE',
]);