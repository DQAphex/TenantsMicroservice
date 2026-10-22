import { pgEnum } from 'drizzle-orm/pg-core';

export const tenantTypeEnum = pgEnum('tenant_type', [
  'PERSONA_NATURAL',
  'EMPRESA',
]);

export type TenantType = (typeof tenantTypeEnum.enumValues)[number];

export const statusEnum = pgEnum('status', [
  'ACTIVE',
  'INACTIVE',
]);
export type Status = (typeof statusEnum.enumValues)[number];

export const invitationStatusEnum = pgEnum('invitation_status', [
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
]);