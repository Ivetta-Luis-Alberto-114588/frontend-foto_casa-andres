export interface SearchResult {
  id: string;
  configId: string;
  url: string;
  searchTerm: string;
  content: string;
  description: string;
  executedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'sent';
  emailSent: boolean;
  error?: string;
}

export interface SearchResultSummary {
  id: string;
  url: string;
  description: string;
  executedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'sent';
}
