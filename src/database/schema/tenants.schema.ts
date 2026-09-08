import {
  pgTable,
  uuid,
  varchar,
  integer,
  char,
  timestamp,
} from 'drizzle-orm/pg-core';

import { tenantTypeEnum, statusEnum } from './enums';

export const tenants = pgTable('tenants', {
  tenantId: uuid('tenant_id')
    .defaultRandom()
    .primaryKey(),

  name: varchar('name', {
    length: 45,
  }).notNull(),

  rut: integer('rut')
    .notNull(),

  dv: char('dv', {
    length: 1,
  }).notNull(),

  type: tenantTypeEnum('type')
    .notNull(),

  createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull(),

  status: statusEnum('status')
    .default('ACTIVE')
    .notNull(),
});