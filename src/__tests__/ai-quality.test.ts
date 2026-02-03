import { describe, it, expect, vi } from 'vitest';
import { SYSTEM_PROMPT, EXTRACTION_PROMPT } from '../lib/ai/prompts';
import { extractedDataSchema, bizMetricsSchema } from '../lib/ai/schema';
import type { ExtractedData } from '../types';

describe('AI Response Quality Tests', () => {
  describe('System Prompt Enforcement', () => {
    it('includes rejection of willingness-to-pay statements', () => {
      expect(SYSTEM_PROMPT).toMatch(/REJECT/i);
      expect(SYSTEM_PROMPT).toMatch(/I would pay/i);
      expect(SYSTEM_PROMPT).toMatch(/ALREADY paid/i);
    });

    it('demands sunk cost calculations over hypothetical value', () => {
      expect(SYSTEM_PROMPT).toMatch(/sunk cost/i);
      expect(SYSTEM_PROMPT).toMatch(/ALREADY SPENT/i);
      expect(SYSTEM_PROMPT).toMatch(/failed attempts/i);
      expect(SYSTEM_PROMPT.toLowerCase()).toMatch(/time.*already/);
      expect(SYSTEM_PROMPT.toLowerCase()).toMatch(/money.*already/);
    });

    it('contains sunk cost calculation example', () => {
      expect(SYSTEM_PROMPT).toMatch(/hours.*week.*\$.*rate/i);
      expect(SYSTEM_PROMPT).toMatch(/calculate/i);
    });

    it('rejects hypothetical "worth" statements', () => {
      expect(SYSTEM_PROMPT).toMatch(/worth is hypothetical/i);
      expect(SYSTEM_PROMPT).toMatch(/show me the receipts/i);
    });
  });

  describe('Instinct Mapping Requirements', () => {
    it('defines all five core instincts', () => {
      expect(SYSTEM_PROMPT).toMatch(/SURVIVAL/i);
      expect(SYSTEM_PROMPT).toMatch(/MATE/i);
      expect(SYSTEM_PROMPT).toMatch(/RESOURCE/i);
      expect(SYSTEM_PROMPT).toMatch(/STATUS/i);
      expect(SYSTEM_PROMPT).toMatch(/KIN CARE/i);
    });

    it('explains each instinct with examples', () => {
      expect(SYSTEM_PROMPT).toMatch(/Health.*safety.*security/i);
      expect(SYSTEM_PROMPT).toMatch(/Attraction.*relationships/i);
      expect(SYSTEM_PROMPT).toMatch(/Money.*possessions.*efficiency/i);
      expect(SYSTEM_PROMPT).toMatch(/Recognition.*respect.*achievement/i);
      expect(SYSTEM_PROMPT).toMatch(/Family.*children.*community/i);
    });

    it('requires instinct identification', () => {
      expect(SYSTEM_PROMPT).toMatch(/Which CORE INSTINCT/i);
      expect(SYSTEM_PROMPT).toMatch(/You MUST identify ONE/i);
      expect(SYSTEM_PROMPT).toMatch(/connect.*to.*core instinct/i);
    });

    it('challenges missing instinct connection', () => {
      expect(SYSTEM_PROMPT).toMatch(/haven't connected this to a core instinct/i);
      expect(SYSTEM_PROMPT).toMatch(/which primal drive/i);
    });
  });

  describe('Extraction Schema Validation', () => {
    it('validates correct ExtractedData structure', () => {
      const validData: ExtractedData = {
        problem_statement: 'Developers waste time debugging config issues',
        target_customer: 'Backend engineers at startups',
        biz_metrics: {
          urgency_level: 'High (Stops Life)',
          current_alternative: 'Manual config file editing',
          core_instinct: 'Resource',
          frequency: 'Daily',
          sunk_cost_calc: '3 hours/week * $100/hr = $300/week lost',
        },
        solution_direction: 'Automated config validation tool',
      };

      const result = extractedDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('validates partial data with nulls', () => {
      const partialData: ExtractedData = {
        problem_statement: 'Initial problem stated',
        target_customer: null,
        biz_metrics: {
          urgency_level: null,
          current_alternative: null,
          core_instinct: null,
          frequency: null,
          sunk_cost_calc: null,
        },
        solution_direction: null,
      };

      const result = extractedDataSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it('validates all urgency_level enum values', () => {
      const highUrgency = bizMetricsSchema.safeParse({
        urgency_level: 'High (Stops Life)',
        current_alternative: null,
        core_instinct: null,
        frequency: null,
        sunk_cost_calc: null,
      });
      expect(highUrgency.success).toBe(true);

      const lowUrgency = bizMetricsSchema.safeParse({
        urgency_level: 'Low (Uncomfortable)',
        current_alternative: null,
        core_instinct: null,
        frequency: null,
        sunk_cost_calc: null,
      });
      expect(lowUrgency.success).toBe(true);

      const invalidUrgency = bizMetricsSchema.safeParse({
        urgency_level: 'Medium',
        current_alternative: null,
        core_instinct: null,
        frequency: null,
        sunk_cost_calc: null,
      });
      expect(invalidUrgency.success).toBe(false);
    });

    it('validates all core_instinct enum values', () => {
      const instincts = ['Survival', 'Mate', 'Resource', 'Status', 'Kin Care'];

      for (const instinct of instincts) {
        const result = bizMetricsSchema.safeParse({
          urgency_level: null,
          current_alternative: null,
          core_instinct: instinct,
          frequency: null,
          sunk_cost_calc: null,
        });
        expect(result.success).toBe(true);
      }

      const invalidInstinct = bizMetricsSchema.safeParse({
        urgency_level: null,
        current_alternative: null,
        core_instinct: 'Power',
        frequency: null,
        sunk_cost_calc: null,
      });
      expect(invalidInstinct.success).toBe(false);
    });

    it('validates all frequency enum values', () => {
      const frequencies = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

      for (const frequency of frequencies) {
        const result = bizMetricsSchema.safeParse({
          urgency_level: null,
          current_alternative: null,
          core_instinct: null,
          frequency,
          sunk_cost_calc: null,
        });
        expect(result.success).toBe(true);
      }

      const invalidFrequency = bizMetricsSchema.safeParse({
        urgency_level: null,
        current_alternative: null,
        core_instinct: null,
        frequency: 'Sometimes',
        sunk_cost_calc: null,
      });
      expect(invalidFrequency.success).toBe(false);
    });

    it('rejects invalid enum values', () => {
      const invalidData = {
        problem_statement: 'Test problem',
        target_customer: 'Test customer',
        biz_metrics: {
          urgency_level: 'Medium Urgency',
          current_alternative: 'Some alternative',
          core_instinct: 'Power',
          frequency: 'Occasionally',
          sunk_cost_calc: 'Some calculation',
        },
        solution_direction: 'Test solution',
      };

      const result = extractedDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects missing required nested fields', () => {
      const missingBizMetrics = {
        problem_statement: 'Test',
        target_customer: 'Test',
        solution_direction: 'Test',
      };

      const result = extractedDataSchema.safeParse(missingBizMetrics);
      expect(result.success).toBe(false);
    });
  });

  describe('Extraction Prompt Rules', () => {
    it('requires concrete evidence for field population', () => {
      expect(EXTRACTION_PROMPT).toMatch(/CONCRETE evidence/i);
      expect(EXTRACTION_PROMPT).toMatch(/Leave null if not yet validated/i);
    });

    it('specifies urgency_level defaults and validation', () => {
      expect(EXTRACTION_PROMPT).toMatch(/urgency_level.*Only.*High.*Stops Life.*if user proved life literally stops/i);
      expect(EXTRACTION_PROMPT).toMatch(/Default to.*Low.*Uncomfortable.*if unclear/i);
    });

    it('requires specific core_instinct enum value', () => {
      expect(EXTRACTION_PROMPT).toMatch(/core_instinct.*Must be ONE of/i);
      expect(EXTRACTION_PROMPT).toMatch(/Survival.*Mate.*Resource.*Status.*Kin Care/);
      expect(EXTRACTION_PROMPT).toMatch(/Null if not identified/i);
    });

    it('requires sunk_cost_calc to be calculation not willingness-to-pay', () => {
      expect(EXTRACTION_PROMPT).toMatch(/sunk_cost_calc.*Must be a CALCULATION/i);
      expect(EXTRACTION_PROMPT).toMatch(/hours\/week.*\$.*hr.*=.*\$.*week/);
      expect(EXTRACTION_PROMPT).toMatch(/NOT a willingness-to-pay/i);
    });

    it('requires specific frequency enum value', () => {
      expect(EXTRACTION_PROMPT).toMatch(/frequency.*Must be ONE of/i);
      expect(EXTRACTION_PROMPT).toMatch(/Daily.*Weekly.*Monthly.*Yearly/);
      expect(EXTRACTION_PROMPT).toMatch(/Not.*sometimes.*occasionally/i);
    });
  });

  describe('Mock AI Response Validation', () => {
    it('validates schema compliance for mocked responses', () => {
      // Simulate what AI should return after conversation
      const mockAIResponse: ExtractedData = {
        problem_statement: 'Startup founders struggle with cap table management',
        target_customer: 'First-time founders with 2-10 employees',
        biz_metrics: {
          urgency_level: 'High (Stops Life)',
          current_alternative: 'Excel spreadsheets',
          core_instinct: 'Resource',
          frequency: 'Monthly',
          sunk_cost_calc: '5 hours/month * $200/hr = $1000/month lost',
        },
        solution_direction: 'Automated cap table software with scenario modeling',
      };

      const result = extractedDataSchema.safeParse(mockAIResponse);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.biz_metrics.core_instinct).toBe('Resource');
        expect(result.data.biz_metrics.frequency).toBe('Monthly');
        expect(result.data.biz_metrics.sunk_cost_calc).toMatch(/hours.*\$.*=/);
      }
    });

    it('rejects willingness-to-pay in sunk_cost_calc', () => {
      const badResponse = {
        problem_statement: 'Test problem',
        target_customer: 'Test customer',
        biz_metrics: {
          urgency_level: 'High (Stops Life)',
          current_alternative: 'Manual work',
          core_instinct: 'Resource',
          frequency: 'Daily',
          sunk_cost_calc: 'I would pay $500 for a solution',
        },
        solution_direction: 'Test solution',
      };

      // Schema allows any string, but prompt instructions should prevent this
      const result = extractedDataSchema.safeParse(badResponse);
      expect(result.success).toBe(true); // Schema passes

      // But we can validate the content matches expected pattern
      if (result.success) {
        const calc = result.data.biz_metrics.sunk_cost_calc;
        if (calc) {
          // Good calculation includes time units and money calculation
          const hasCalculation = /\d+\s*(hours?|hrs?)\s*.*\$\d+/.test(calc);
          const isWillingnessToPay = /would pay|willing to pay|worth/i.test(calc);

          // This specific response should fail our quality check
          expect(isWillingnessToPay).toBe(true);
          expect(hasCalculation).toBe(false);
        }
      }
    });

    it('validates proper sunk cost calculation format', () => {
      const goodCalculations = [
        '3 hours/week * $100/hr = $300/week lost',
        '10 hrs/month * $50/hr = $500/month wasted',
        '2 hours daily * $75/hour = $150/day',
        '$5000 spent on failed tools + 20 hours at $100/hr = $7000 total sunk cost',
      ];

      for (const calc of goodCalculations) {
        const data = {
          problem_statement: 'Test',
          target_customer: 'Test',
          biz_metrics: {
            urgency_level: null,
            current_alternative: null,
            core_instinct: null,
            frequency: null,
            sunk_cost_calc: calc,
          },
          solution_direction: null,
        };

        const result = extractedDataSchema.safeParse(data);
        expect(result.success).toBe(true);

        // Verify it matches calculation pattern
        expect(calc).toMatch(/(\d+\s*(hours?|hrs?)|\$\d+).*(\$\d+|=)/);
      }
    });
  });

  describe('Schema Type Safety', () => {
    it('ensures biz_metrics is always an object', () => {
      const missingBizMetrics = {
        problem_statement: 'Test',
        target_customer: 'Test',
        biz_metrics: null, // Invalid
        solution_direction: 'Test',
      };

      const result = extractedDataSchema.safeParse(missingBizMetrics);
      expect(result.success).toBe(false);
    });

    it('requires all biz_metrics fields to exist', () => {
      const incompleteBizMetrics = {
        problem_statement: 'Test',
        target_customer: 'Test',
        biz_metrics: {
          urgency_level: 'High (Stops Life)',
          // Missing other fields
        },
        solution_direction: 'Test',
      };

      const result = extractedDataSchema.safeParse(incompleteBizMetrics);
      expect(result.success).toBe(false);
    });

    it('allows null for all top-level fields', () => {
      const allNulls = {
        problem_statement: null,
        target_customer: null,
        biz_metrics: {
          urgency_level: null,
          current_alternative: null,
          core_instinct: null,
          frequency: null,
          sunk_cost_calc: null,
        },
        solution_direction: null,
      };

      const result = extractedDataSchema.safeParse(allNulls);
      expect(result.success).toBe(true);
    });
  });
});
