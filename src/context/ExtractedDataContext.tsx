'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ExtractedData } from '@/types';

interface ExtractedDataContextType {
  data: ExtractedData | null;
  isUpdating: boolean;
  updateData: (newData: ExtractedData) => void;
  setUpdating: (updating: boolean) => void;
}

const ExtractedDataContext = createContext<ExtractedDataContextType | null>(null);

export function ExtractedDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ExtractedData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateData = useCallback((newData: ExtractedData) => {
    setData(newData);
    setIsUpdating(false);
  }, []);

  const setUpdating = useCallback((updating: boolean) => {
    setIsUpdating(updating);
  }, []);

  return (
    <ExtractedDataContext.Provider value={{ data, isUpdating, updateData, setUpdating }}>
      {children}
    </ExtractedDataContext.Provider>
  );
}

export function useExtractedDataContext() {
  const context = useContext(ExtractedDataContext);
  if (!context) {
    throw new Error('useExtractedDataContext must be used within ExtractedDataProvider');
  }
  return context;
}
