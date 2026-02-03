import { z } from 'zod';

export const bizMetricsSchema = z.object({
  urgency_level: z.enum(['High (Stops Life)', 'Low (Uncomfortable)']).nullable(),
  current_alternative: z.string().nullable(),
  core_instinct: z.enum(['Survival', 'Mate', 'Resource', 'Status', 'Kin Care']).nullable(),
  frequency: z.enum(['Daily', 'Weekly', 'Monthly', 'Yearly']).nullable(),
  sunk_cost_calc: z.string().nullable(),
});

export const extractedDataSchema = z.object({
  problem_statement: z.string().nullable(),
  target_customer: z.string().nullable(),
  biz_metrics: bizMetricsSchema,
  solution_direction: z.string().nullable(),
});

export type ExtractedData = z.infer<typeof extractedDataSchema>;
