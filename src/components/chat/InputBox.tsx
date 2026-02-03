'use client';

import { FormEvent } from 'react';

interface InputBoxProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function InputBox({ value, onChange, onSubmit, isLoading }: InputBoxProps) {
  return (
    <form onSubmit={onSubmit} className="p-4 border-t border-terminal-border">
      <div className="flex items-center gap-2">
        <span className="text-terminal-green">$</span>
        <input
          type="text"
          value={value}
          onChange={onChange}
          disabled={isLoading}
          placeholder="Enter your startup idea..."
          className="flex-1 bg-transparent border-none outline-none text-terminal-green placeholder:opacity-50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="text-terminal-green font-mono disabled:opacity-50 hover:opacity-80 transition-opacity"
        >
          {isLoading ? '[PROCESSING...]' : '[SEND]'}
        </button>
      </div>
    </form>
  );
}
