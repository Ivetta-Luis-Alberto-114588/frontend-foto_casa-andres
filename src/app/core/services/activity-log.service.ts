import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ActivityLog {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
  configId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  private logs: ActivityLog[] = [];
  private logsSubject = new BehaviorSubject<ActivityLog[]>([]);
  public logs$ = this.logsSubject.asObservable();

  private maxLogs = 100;

  constructor() {
    this.loadLogs();
  }

  private loadLogs(): void {
    const stored = localStorage.getItem('activityLogs');
    if (stored) {
      this.logs = JSON.parse(stored).map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
      this.logsSubject.next(this.logs);
    }
  }

  private saveLogs(): void {
    localStorage.setItem('activityLogs', JSON.stringify(this.logs));
    this.logsSubject.next(this.logs);
  }

  log(type: 'info' | 'success' | 'error' | 'warning', message: string, details?: string, configId?: string): void {
    const newLog: ActivityLog = {
      id: this.generateId(),
      timestamp: new Date(),
      type,
      message,
      details,
      configId
    };

    this.logs.unshift(newLog);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    this.saveLogs();
    console.log(`[${type.toUpperCase()}] ${message}`, details || '');
  }

  info(message: string, details?: string, configId?: string): void {
    this.log('info', message, details, configId);
  }

  success(message: string, details?: string, configId?: string): void {
    this.log('success', message, details, configId);
  }

  error(message: string, details?: string, configId?: string): void {
    this.log('error', message, details, configId);
  }

  warning(message: string, details?: string, configId?: string): void {
    this.log('warning', message, details, configId);
  }

  getAll(): Observable<ActivityLog[]> {
    return this.logs$;
  }

  getRecent(count: number = 10): ActivityLog[] {
    return this.logs.slice(0, count);
  }

  clearAll(): void {
    this.logs = [];
    this.saveLogs();
  }

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
