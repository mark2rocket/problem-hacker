export interface ExtractedData {
  problem_statement: string | null;
  target_customer: string | null;
  biz_metrics: {
    urgency_level: 'High (Stops Life)' | 'Low (Uncomfortable)' | null;
    current_alternative: string | null;
    core_instinct: 'Survival' | 'Mate' | 'Resource' | 'Status' | 'Kin Care' | null;
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | null;
    sunk_cost_calc: string | null;
  };
  solution_direction: string | null;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface Session {
  id: string;
  messages: Message[];
  extractedData: ExtractedData;
}
