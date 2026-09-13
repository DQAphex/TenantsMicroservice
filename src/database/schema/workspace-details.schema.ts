import {
  pgTable,
  uuid,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';

import { statusEnum } from './enums';

export const workspaceDetails = pgTable('workspace_details', {
  workspaceDetailsId: uuid('workspace_details_id')
    .defaultRandom()
    .primaryKey(),

  workspaceId: uuid('workspace_id')
    .notNull(),
  
  maxMemberLimitId: integer('max_member_limit_id'),

  capacity: integer('capacity')
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