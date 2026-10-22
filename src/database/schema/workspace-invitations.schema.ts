import {
  pgTable,
  uuid,
  timestamp,
} from 'drizzle-orm/pg-core';

import { members } from './member.schema';
import {tenantWorkspaces} from './tenant-workspaces.schema';
import { statusEnum, invitationStatusEnum } from './enums';

export const workspaceInvitations = pgTable('workspace_invitation', {
  invitationId: uuid('invitation_id')
    .defaultRandom()
    .primaryKey(),

  receiverId: uuid('receiver_id')
    .notNull()
    .references(() => members.memberId),
  
  senderId: uuid('sender_id')
    .notNull()
    .references(() => members.memberId),

  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => tenantWorkspaces.workspaceId),

  createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),

  expirationDate: timestamp('expiration_date')
      .notNull(),

  status: invitationStatusEnum('status')
    .default('PENDING')
    .notNull(),

  statusUpdatedAt: timestamp('status_updated_at')
    .defaultNow()
    .notNull(),
});