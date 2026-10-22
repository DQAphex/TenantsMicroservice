import {
  pgTable,
  uuid,
  timestamp,
} from 'drizzle-orm/pg-core';

import { members } from './member.schema';
import { statusEnum } from './enums';

export const workspaceMembers = pgTable('workspace_members', {
  memberId: uuid('member_id')
    .notNull()
    .references(() => members.memberId),

  workspaceId: uuid('workspace_id')
    .notNull(),

  createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),

  status: statusEnum('status')
    .default('ACTIVE')
    .notNull(),
});