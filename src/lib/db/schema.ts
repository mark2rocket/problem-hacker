import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { ExtractedData } from '@/types';

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  structuredData: jsonb('structured_data').$type<ExtractedData>(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id),
  role: text('role').$type<'user' | 'assistant'>(),
  content: text('content'),
  createdAt: timestamp('created_at').defaultNow(),
});
