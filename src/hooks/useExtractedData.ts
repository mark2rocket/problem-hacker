'use client';

import { useEffect } from 'react';
import { useExtractedDataContext } from '@/context/ExtractedDataContext';
import { ExtractedData } from '@/types';

/**
 * Hook that bridges useChat's data stream to the ExtractedDataContext.
 *
 * Data Flow:
 * 1. API returns StreamData with extractedData annotation
 * 2. useChat receives it via `data` property
 * 3. This hook watches `data` and updates context
 * 4. ValueBoard subscribes to context and re-renders
 *
 * @param chatData - The `data` property from useChat hook
 */
export function useSyncExtractedData(chatData: unknown[] | undefined) {
  const { updateData, setUpdating } = useExtractedDataContext();

  useEffect(() => {
    if (!chatData || chatData.length === 0) return;

    // Find the most recent extractedData in the stream
    const latest = chatData
      .filter((item): item is { extractedData: ExtractedData } =>
        typeof item === 'object' && item !== null && 'extractedData' in item
      )
      .pop();

    if (latest?.extractedData) {
      updateData(latest.extractedData);
    }
  }, [chatData, updateData]);
}

/**
 * Hook for ValueBoard to consume extracted data.
 * Returns current extracted data and updating state.
 */
export function useExtractedData() {
  const { data, isUpdating } = useExtractedDataContext();
  return { data, isUpdating };
}
