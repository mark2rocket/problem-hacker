import { openai } from '@ai-sdk/openai';
import { streamText, StreamData, generateObject } from 'ai';
import { SYSTEM_PROMPT, EXTRACTION_PROMPT } from '@/lib/ai/prompts';
import { extractedDataSchema } from '@/lib/ai/schema';
import { updateStructuredData } from '@/lib/db/queries';

export async function POST(req: Request) {
  try {
    const { messages, sessionId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages format', { status: 400 });
    }

    // Create StreamData instance for sending extracted data alongside text
    const data = new StreamData();

    // Stream the conversational response
    const result = await streamText({
      model: openai('gpt-4o'),
      system: SYSTEM_PROMPT,
      messages,
      onFinish: async ({ text }) => {
        try {
          // After text generation completes, extract structured data
          const extractionResult = await generateObject({
            model: openai('gpt-4o'),
            schema: extractedDataSchema,
            prompt: EXTRACTION_PROMPT + '\n\nConversation:\n' +
              messages.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join('\n') +
              `\nassistant: ${text}`,
          });

          // Append extracted data to the stream
          data.append({ extractedData: extractionResult.object as any });

          // Persist to database
          if (sessionId) {
            await updateStructuredData(sessionId, extractionResult.object);
          }
        } catch (error) {
          console.error('Failed to extract or persist structured data:', error);
          // Don't fail the entire stream if extraction fails
          data.append({ extractedData: null, error: 'Extraction failed' });
        } finally {
          data.close();
        }
      },
    });

    // Return combined stream: text + data annotations
    return result.toDataStreamResponse({ data });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
