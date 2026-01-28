export interface SearchConfig {
  id?: string;
  url: string;
  searchTerm?: string;
  priceMax?: number;
  email: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  browser: 'chromium' | 'brave';
  active: boolean;
  createdAt?: Date;
  lastExecuted?: Date;
}

export interface SearchConfigCreate {
  url: string;
  searchTerm?: string;
  priceMax?: number;
  email: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  browser: 'chromium' | 'brave';
}
