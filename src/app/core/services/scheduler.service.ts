import { Injectable } from '@angular/core';
import { interval, Subscription, BehaviorSubject } from 'rxjs';
import { SearchConfigService } from './search-config.service';
import { WebScraperService } from './web-scraper.service';
import { EmailService } from './email.service';
import { ActivityLogService } from './activity-log.service';
import { SearchConfig, SearchResultEmail } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SchedulerService {
  private schedulerSubscription?: Subscription;
  private readonly CHECK_INTERVAL = 60000;

  // Estado de ejecuciones en progreso
  private executingConfigsSubject = new BehaviorSubject<Set<string>>(new Set());
  public executingConfigs$ = this.executingConfigsSubject.asObservable();

  constructor(
    private searchConfigService: SearchConfigService,
    private webScraperService: WebScraperService,
    private emailService: EmailService,
    private activityLog: ActivityLogService
  ) { }

  startScheduler(): void {
    if (this.schedulerSubscription) {
      return;
    }

    this.activityLog.info('Scheduler iniciado', 'Verificando búsquedas cada minuto');

    this.schedulerSubscription = interval(this.CHECK_INTERVAL).subscribe(() => {
      this.checkAndExecuteSearches();
    });

    this.checkAndExecuteSearches();
  }

  stopScheduler(): void {
    if (this.schedulerSubscription) {
      this.schedulerSubscription.unsubscribe();
      this.schedulerSubscription = undefined;
      this.activityLog.warning('Scheduler detenido');
    }
  }

  private checkAndExecuteSearches(): void {
    const activeConfigs = this.searchConfigService.getActiveConfigs();

    activeConfigs.forEach(config => {
      if (this.shouldExecuteSearch(config)) {
        this.executeSearch(config);
      }
    });
  }

  private shouldExecuteSearch(config: SearchConfig): boolean {
    if (!config.lastExecuted) {
      return true;
    }

    const now = new Date();
    const lastExec = new Date(config.lastExecuted);
    const hoursSinceLastExec = (now.getTime() - lastExec.getTime()) / (1000 * 60 * 60);

    switch (config.frequency) {
      case 'daily':
        return hoursSinceLastExec >= 24;
      case 'weekly':
        return hoursSinceLastExec >= 168;
      case 'monthly':
        return hoursSinceLastExec >= 720;
      default:
        return false;
    }
  }

  private executeSearch(config: SearchConfig): void {
    // Marcar como ejecutando
    const executing = this.executingConfigsSubject.value;
    if (executing.has(config.id!)) {
      this.activityLog.warning(
        'Búsqueda ya en progreso',
        `La configuración "${config.searchTerm || config.url}" ya está ejecutándose`,
        config.id
      );
      return;
    }

    executing.add(config.id!);
    this.executingConfigsSubject.next(executing);

    this.activityLog.info(
      '🔍 Iniciando búsqueda',
      `URL: ${config.url}${config.searchTerm ? `\nBuscando: "${config.searchTerm}"` : '\nExtrayendo contenido general'}`,
      config.id
    );

    this.webScraperService.scrapeWebsite({
      url: config.url,
      searchTerm: config.searchTerm || '',
      priceMax: config.priceMax,
      browser: config.browser || 'chromium'
    }).subscribe({
      next: (result) => {
        if (result.success) {
          const urlInfo = result.finalUrl ? `\nURL final: ${result.finalUrl}` : '';
          this.activityLog.success(
            '✓ Scraping completado',
            `Contenido extraído: ${result.content.substring(0, 200)}...${urlInfo}`,
            config.id
          );

          this.sendResultByEmail(config, result.content, result.description, result.contentHtml, result.finalUrl);

          this.searchConfigService.update(config.id!, {
            lastExecuted: new Date()
          });
        } else {
          this.activityLog.error(
            '❌ Error en scraping',
            result.error || 'Error desconocido',
            config.id
          );
        }

        // Remover de ejecutando
        const exec = this.executingConfigsSubject.value;
        exec.delete(config.id!);
        this.executingConfigsSubject.next(exec);
      },
      error: (error) => {
        this.activityLog.error(
          '❌ Error ejecutando búsqueda',
          error.message || error.toString(),
          config.id
        );

        const exec = this.executingConfigsSubject.value;
        exec.delete(config.id!);
        this.executingConfigsSubject.next(exec);
      }
    });
  }

  private sendResultByEmail(config: SearchConfig, content: string, description: string, contentHtml?: string, finalUrl?: string): void {
    this.activityLog.info(
      '📧 Enviando email',
      `Destinatario: ${config.email}`,
      config.id
    );

    const emailData: SearchResultEmail = {
      url: config.url,
      finalUrl: finalUrl || config.url,
      searchTerm: config.searchTerm || '',
      description: description,
      content: content,
      contentHtml: contentHtml || '',
      executedAt: new Date()
    };

    this.emailService.sendSearchResult(config.email, emailData).subscribe({
      next: (success) => {
        if (success) {
          this.activityLog.success(
            '✓ Email enviado',
            `Email enviado exitosamente a ${config.email}`,
            config.id
          );
        } else {
          this.activityLog.error(
            '❌ Error enviando email',
            `No se pudo enviar el email a ${config.email}`,
            config.id
          );
        }
      },
      error: (error) => {
        this.activityLog.error(
          '❌ Error en envío de email',
          error.message || error.toString(),
          config.id
        );
      }
    });
  }

  executeSearchNow(configId: string): void {
    const config = this.searchConfigService.getById(configId);
    if (config && config.active) {
      this.activityLog.info(
        '▶️ Ejecución manual',
        `Iniciando búsqueda manualmente para "${config.searchTerm || config.url}"`,
        config.id
      );
      this.executeSearch(config);
    } else if (config && !config.active) {
      this.activityLog.warning(
        'Configuración inactiva',
        'No se puede ejecutar una configuración desactivada',
        configId
      );
    }
  }

  isExecuting(configId: string): boolean {
    return this.executingConfigsSubject.value.has(configId);
  }
}
