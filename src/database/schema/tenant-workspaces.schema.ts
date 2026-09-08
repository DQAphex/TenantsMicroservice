import {
  pgTable,
  uuid,
  timestamp,
} from 'drizzle-orm/pg-core';

import { tenants } from './tenants.schema';

export const tenantWorkspaces = pgTable('tenant_workspaces', {
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.tenantId),

  workspaceId: uuid('workspace_id')
    .notNull(),

  createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull(),
});