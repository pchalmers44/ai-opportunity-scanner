export type AutomationType = "API" | "Webhook" | "Task Queue" | "Agent";
export type Level = "Low" | "Medium" | "High";

export type RecommendedTool = {
  name: string;
  why: string;
};

export type Suggestion = {
  title: string;
  description: string;
  repetitiveTasks: string[];
  automationType: AutomationType;
  recommendedTools: RecommendedTool[];
  impact: Level;
  effort: Level;
  confidence: Level;
  priorityScore: number;
  nextSteps: string[];
  risks: string[];
};

export type ScanResponse = {
  result: Suggestion[];
  error?: string;
  requestId?: string;
};