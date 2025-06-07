import { pgTable, text, timestamp, boolean, integer, uuid, varchar, date } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  aadharNumber: varchar('aadhar_number', { length: 12 }).unique().notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  address: text('address').notNull(),
  phoneNumber: varchar('phone_number', { length: 15 }).notNull(),
  isVerified: boolean('is_verified').default(false),
  hasVoted: boolean('has_voted').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Admins table
export const admins = pgTable('admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 50 }).default('election_officer'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Elections table
export const elections = pgTable('elections', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isActive: boolean('is_active').default(false),
  constituency: varchar('constituency', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Candidates table
export const candidates = pgTable('candidates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  party: varchar('party', { length: 255 }).notNull(),
  symbol: varchar('symbol', { length: 100 }).notNull(),
  constituency: varchar('constituency', { length: 255 }).notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  voteCount: integer('vote_count').default(0),
  electionId: uuid('election_id').references(() => elections.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Votes table
export const votes = pgTable('votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  candidateId: uuid('candidate_id').references(() => candidates.id).notNull(),
  electionId: uuid('election_id').references(() => elections.id).notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
  blockchainHash: text('blockchain_hash'),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertAdminSchema = createInsertSchema(admins);
export const selectAdminSchema = createSelectSchema(admins);
export const insertElectionSchema = createInsertSchema(elections);
export const selectElectionSchema = createSelectSchema(elections);
export const insertCandidateSchema = createInsertSchema(candidates);
export const selectCandidateSchema = createSelectSchema(candidates);
export const insertVoteSchema = createInsertSchema(votes);
export const selectVoteSchema = createSelectSchema(votes);

// Custom validation schemas
export const aadharVerificationSchema = z.object({
  aadharNumber: z.string().length(12, 'Aadhar number must be 12 digits'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  phoneNumber: z.string().length(10, 'Phone number must be 10 digits'),
});

export const voteSchema = z.object({
  candidateId: z.string().uuid('Invalid candidate ID'),
  electionId: z.string().uuid('Invalid election ID'),
});

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});