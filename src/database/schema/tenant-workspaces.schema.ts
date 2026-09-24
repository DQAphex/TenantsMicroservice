import {
  pgTable,
  uuid,
  integer,
  timestamp,
  varchar
} from 'drizzle-orm/pg-core';
import { statusEnum } from './enums';
import { tenants } from './tenants.schema';

export const tenantWorkspaces = pgTable('tenant_workspaces', {
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.tenantId),

  workspaceId: uuid('workspace_id')
    .defaultRandom()
    .primaryKey(),
  
  workspaceNombre: varchar('workspace_nombre', { length: 100 })
    .notNull(),

  maxMemberLimitId: uuid('max_member_limit_id'),

  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull(),

  status: statusEnum('status')
    .default('ACTIVE')
    .notNull(),
  createdAt: timestamp('created_at')
    .defaultNow()
    .notNull()
});