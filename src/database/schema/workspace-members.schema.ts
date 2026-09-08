import {
  pgTable,
  uuid,
} from 'drizzle-orm/pg-core';

import { members } from './member.schema';

export const workspaceMembers = pgTable('workspace_members', {
  memberId: uuid('member_id')
    .notNull()
    .references(() => members.memberId),

  workspaceId: uuid('workspace_id')
    .notNull(),
});