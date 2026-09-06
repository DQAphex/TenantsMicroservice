import {
 pgTable,
 uuid,
 text,
 boolean,
 integer,
 decimal,
 timestamp,
 date,
 pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
// ─── Enums ───────────────────────────────────────────

// export const appointmentStatusEnum = pgEnum('appointment_status', [
//  'Pendiente',
//  'Cancelada',
//  'Completada',
// ])

// // ─── Users ───────────────────────────────────────────

// export const adminUsers = pgTable('admin_users', {
//   id:      uuid('id').primaryKey().defaultRandom(),
//   email:     text('email').notNull().unique(),
//   name:     text('name').notNull(),
//   createdAt:   timestamp('created_at').defaultNow().notNull(),
//   isActive:    boolean('is_active').default(true).notNull(),
// })

// // ─── Services ────────────────────────────────────────

// export const services = pgTable('services', { 
//   id:       uuid('id').primaryKey().defaultRandom(),
//   name:      text('name').notNull(),
//   description:   text('description'),
//   durationMinutes: integer('duration_minutes').default(60).notNull(),
//   isActive:    boolean('is_active').default(true).notNull(),
// }) 

// // ─── Availability ────────────────────────────────────

// export const availability = pgTable('availability', {
//   id:    uuid('id').primaryKey().defaultRandom(),
//   dayOfWeek: integer('day_of_week').notNull(), // 0=Dom, 6=Sab
//   startTime: text('start_time').notNull(),   // "HH:mm"
//   endTime:  text('end_time').notNull(),    // "HH:mm"
//   lunchStart: text('lunch_start'), // "HH:mm", nullable
//   lunchEnd: text('lunch_end'),   // "HH:mm", nullable
//   isActive: boolean('is_active').default(true).notNull(),
// })

// // ─── Blocked Dates ────────────────────────────────────

// export const blockedDates = pgTable('blocked_dates', {
//   id:          uuid('id').primaryKey().defaultRandom(),
//   blockedDate: date('blocked_date').notNull(),
//   hourSlot:    integer('hour_slot'),              // ← nullable, null = no aplica
//   isAllDay:    boolean('is_all_day').default(false).notNull(), // ← true = bloquea todo el día
//   reason:      text('reason'),
//   isActive:    boolean('is_active').default(true).notNull(),
// })

// // ─── Appointments ─────────────────────────────────────

// export const appointments = pgTable('appointments', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   serviceId: uuid('service_id').notNull().references(() => services.id),
//   appointmentDate: date('appointment_date').notNull(),
//   hourSlot: integer('hour_slot').notNull(), // 0-23
//   status: appointmentStatusEnum('status').default('Pendiente').notNull(),
//   notes: text('notes'),
//   cancellationReason: text('cancellation_reason'),
//   clientName: text('client_name').notNull(),
//   clientEmail: text('client_email'),
//   clientPhone: text('client_phone'),
//   clientCompany: text('client_company'),
//   meetUrl: text('meet_url'),
//   googleEventId: text('google_event_id'),
//   createdAt: timestamp('created_at').defaultNow().notNull()
// })

// // ─── Relations ────────────────────────────────────────

// export const servicesRelations = relations(services, ({ many }) => ({
//   appointments: many(appointments),
// }))
// export const appointmentsRelations = relations(appointments, ({ one }) => ({
//   service: one(services, {
//     fields: [appointments.serviceId],
//     references: [services.id],
//   }),
// }))