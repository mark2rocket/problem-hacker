'use client';

interface ProblemSectionProps {
  statement: string | null | undefined;
  customer: string | null | undefined;
}

export function ProblemSection({ statement, customer }: ProblemSectionProps) {
  if (!statement && !customer) {
    return (
      <section className="opacity-50">
        <h3 className="font-bold mb-2 text-sm opacity-70">[PROBLEM_SPACE]</h3>
        <p className="text-sm italic">Awaiting problem statement...</p>
      </section>
    );
  }

  return (
    <section>
      <h3 className="font-bold mb-2 text-sm opacity-70">[PROBLEM_SPACE]</h3>
      <div className="space-y-3">
        {statement && (
          <div>
            <h4 className="text-xs font-semibold opacity-60 mb-1">Statement:</h4>
            <p className="text-terminal-green leading-relaxed">{statement}</p>
          </div>
        )}
        {customer && (
          <div>
            <h4 className="text-xs font-semibold opacity-60 mb-1">Target Customer:</h4>
            <p className="text-terminal-green leading-relaxed">{customer}</p>
          </div>
        )}
      </div>
    </section>
  );
}
