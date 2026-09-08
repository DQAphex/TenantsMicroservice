import {
  pgTable,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { members } from './member.schema';

export const membersData = pgTable('members_data', {
  userId: uuid('user_id')
    .notNull(),

  memberId: uuid('member_id')
    .notNull()
    .references(() => members.memberId),

  name: varchar('name', {
    length: 45,
  }).notNull(),

  lastname: varchar('lastname', {
    length: 45,
  }).notNull(),

  profilePicture: varchar('profile_picture', {
    length: 45,
  }),
});