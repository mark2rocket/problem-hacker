import { db } from './client';
import { sessions, messages } from './schema';
import { eq } from 'drizzle-orm';
import { ExtractedData } from '@/types';

export async function createSession(): Promise<string> {
  const [session] = await db.insert(sessions).values({}).returning();
  return session.id;
}

export async function addMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
) {
  await db.insert(messages).values({ sessionId, role, content });
}

export async function updateStructuredData(
  sessionId: string,
  data: ExtractedData
) {
  await db
    .update(sessions)
    .set({ structuredData: data, updatedAt: new Date() })
    .where(eq(sessions.id, sessionId));
}

export async function getSession(sessionId: string) {
  return db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
    with: { messages: true },
  });
}
