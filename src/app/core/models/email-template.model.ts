export interface EmailTemplate {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export interface SearchResultEmail {
  url: string;
  finalUrl?: string;
  searchTerm?: string;
  description: string;
  content: string;
  contentHtml?: string;
  executedAt: Date;
}
