'use client';

import { ExtractedData } from '@/types';
import { generateMarkdown } from '@/lib/utils/markdown';

interface ExportButtonProps {
  data: ExtractedData | null;
}

export function ExportButton({ data }: ExportButtonProps) {
  const handleExport = () => {
    if (!data) return;

    const markdown = generateMarkdown(data);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `problem-validation-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      disabled={!data}
      className="px-4 py-2 bg-terminal-green text-terminal-bg disabled:opacity-50"
    >
      [EXPORT_REPORT]
    </button>
  );
}
