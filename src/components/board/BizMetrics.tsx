'use client';

import { ExtractedData } from '@/types';

interface BizMetricsProps {
  metrics: ExtractedData['biz_metrics'] | null | undefined;
}

export function BizMetrics({ metrics }: BizMetricsProps) {
  if (!metrics) {
    return (
      <section className="opacity-50">
        <h3 className="font-bold mb-2 text-sm opacity-70">[BIZ_METRICS]</h3>
        <p className="text-sm italic">Analyzing business value...</p>
      </section>
    );
  }

  const hasAnyMetric =
    metrics.urgency_level ||
    metrics.current_alternative ||
    metrics.frequency;

  if (!hasAnyMetric) {
    return (
      <section className="opacity-50">
        <h3 className="font-bold mb-2 text-sm opacity-70">[BIZ_METRICS]</h3>
        <p className="text-sm italic">Analyzing business value...</p>
      </section>
    );
  }

  return (
    <section>
      <h3 className="font-bold mb-2 text-sm opacity-70">[BIZ_METRICS]</h3>
      <div className="space-y-2 text-sm">
        {metrics.urgency_level && (
          <div className="flex items-start gap-2">
            <span className="opacity-60 min-w-[120px]">Urgency:</span>
            <span className={
              metrics.urgency_level.includes('High')
                ? 'text-red-400 font-semibold'
                : 'text-yellow-400'
            }>
              {metrics.urgency_level}
            </span>
          </div>
        )}

        {metrics.frequency && (
          <div className="flex items-start gap-2">
            <span className="opacity-60 min-w-[120px]">Frequency:</span>
            <span className="text-terminal-green">{metrics.frequency}</span>
          </div>
        )}

        {metrics.current_alternative && (
          <div className="flex items-start gap-2">
            <span className="opacity-60 min-w-[120px]">Alternative:</span>
            <span className="text-terminal-green">{metrics.current_alternative}</span>
          </div>
        )}
      </div>
    </section>
  );
}
