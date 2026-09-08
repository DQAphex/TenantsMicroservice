import {
  pgTable,
  uuid,
  timestamp,
} from 'drizzle-orm/pg-core';

import { tenants } from './tenants.schema';
import { statusEnum } from './enums';

export const members = pgTable('members', {
  memberId: uuid('member_id')
    .defaultRandom()
    .primaryKey(),

  iamUserId: uuid('iam_user_id')
    .notNull(),

  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.tenantId),

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