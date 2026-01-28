import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SearchConfig, SearchConfigCreate } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SearchConfigService {
  private configs: SearchConfig[] = [];
  private configsSubject = new BehaviorSubject<SearchConfig[]>([]);
  public configs$ = this.configsSubject.asObservable();

  constructor() {
    this.loadConfigs();
  }

  private loadConfigs(): void {
    const stored = localStorage.getItem('searchConfigs');
    if (stored) {
      this.configs = JSON.parse(stored);
      this.configsSubject.next(this.configs);
    }
  }

  private saveConfigs(): void {
    localStorage.setItem('searchConfigs', JSON.stringify(this.configs));
    this.configsSubject.next(this.configs);
  }

  getAll(): Observable<SearchConfig[]> {
    return this.configs$;
  }

  getById(id: string): SearchConfig | undefined {
    return this.configs.find(c => c.id === id);
  }

  create(config: SearchConfigCreate): SearchConfig {
    const newConfig: SearchConfig = {
      ...config,
      id: this.generateId(),
      active: true,
      createdAt: new Date()
    };
    this.configs.push(newConfig);
    this.saveConfigs();
    return newConfig;
  }

  update(id: string, updates: Partial<SearchConfig>): SearchConfig | undefined {
    const index = this.configs.findIndex(c => c.id === id);
    if (index !== -1) {
      this.configs[index] = { ...this.configs[index], ...updates };
      this.saveConfigs();
      return this.configs[index];
    }
    return undefined;
  }

  delete(id: string): boolean {
    const index = this.configs.findIndex(c => c.id === id);
    if (index !== -1) {
      this.configs.splice(index, 1);
      this.saveConfigs();
      return true;
    }
    return false;
  }

  toggleActive(id: string): SearchConfig | undefined {
    const config = this.getById(id);
    if (config) {
      return this.update(id, { active: !config.active });
    }
    return undefined;
  }

  getActiveConfigs(): SearchConfig[] {
    return this.configs.filter(c => c.active);
  }

  private generateId(): string {
    return `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
