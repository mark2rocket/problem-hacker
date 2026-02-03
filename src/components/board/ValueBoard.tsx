'use client';

import { useExtractedData } from '@/hooks/useExtractedData';
import { ProblemSection } from './ProblemSection';
import { BizMetrics } from './BizMetrics';
import { InstinctBadge } from './InstinctBadge';
import { SunkCostDisplay } from './SunkCostDisplay';

export function ValueBoard() {
  // Consumes data from ExtractedDataContext (produced by ChatInterface)
  const { data, isUpdating } = useExtractedData();

  return (
    <div className="p-4 space-y-6">
      <header>
        <h2 className="text-lg font-bold border-b border-terminal-border pb-2">
          [HACKER&apos;S REPORT]
        </h2>
        {isUpdating && (
          <span className="text-yellow-500 animate-pulse text-sm mt-1 block">
            UPDATING...
          </span>
        )}
      </header>

      <ProblemSection
        statement={data?.problem_statement}
        customer={data?.target_customer}
      />

      <BizMetrics metrics={data?.biz_metrics} />

      <section>
        <h3 className="font-bold mb-2 text-sm opacity-70">[CORE_INSTINCT]</h3>
        <InstinctBadge instinct={data?.biz_metrics?.core_instinct ?? null} />
      </section>

      <section>
        <h3 className="font-bold mb-2 text-sm opacity-70">[SUNK_COST]</h3>
        <SunkCostDisplay calculation={data?.biz_metrics?.sunk_cost_calc ?? null} />
      </section>

      {data?.solution_direction && (
        <section>
          <h3 className="font-bold mb-2 text-sm opacity-70">[SOLUTION_VECTOR]</h3>
          <p className="text-terminal-green">{data.solution_direction}</p>
        </section>
      )}
    </div>
  );
}
