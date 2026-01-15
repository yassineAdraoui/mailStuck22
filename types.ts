
export interface EmailInput {
  id: string;
  sender: string;
  subject: string;
  body: string;
}

export interface EmailAnalysis {
  summary: string;
  priorityScore: number;
}

export interface AnalysisResult extends EmailAnalysis {
  id: string;
  subject: string;
  sender: string;
}

export interface ApiResponse {
  analyses: EmailAnalysis[];
}
