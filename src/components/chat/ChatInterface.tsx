'use client';

import { useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { MessageBubble } from './MessageBubble';
import { InputBox } from './InputBox';
import { useSyncExtractedData } from '@/hooks/useExtractedData';
import { useExtractedDataContext } from '@/context/ExtractedDataContext';

export function ChatInterface() {
  const { setUpdating } = useExtractedDataContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, data } = useChat({
    api: '/api/chat',
    onResponse: () => {
      // Set updating state when AI starts responding
      setUpdating(true);
    },
  });

  // Sync extracted data from stream to context (bridges to ValueBoard)
  useSyncExtractedData(data);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b border-terminal-border">
        <h1 className="text-xl font-bold">PROBLEM_HACKER v1.0</h1>
        <p className="text-sm opacity-70">// Validating business value...</p>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>

      <InputBox
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
