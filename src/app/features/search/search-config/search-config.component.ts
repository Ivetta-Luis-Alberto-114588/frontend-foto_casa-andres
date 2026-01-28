import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SearchConfigService } from '../../../core/services/search-config.service';
import { SchedulerService } from '../../../core/services/scheduler.service';
import { SearchConfig } from '../../../core/models';

@Component({
  selector: 'app-search-config',
  templateUrl: './search-config.component.html',
  styleUrls: ['./search-config.component.css']
})
export class SearchConfigComponent implements OnInit, OnDestroy {
  configs: SearchConfig[] = [];
  private subscription?: Subscription;

  constructor(
    private searchConfigService: SearchConfigService,
    private schedulerService: SchedulerService
  ) {}

  ngOnInit(): void {
    this.subscription = this.searchConfigService.getAll().subscribe({
      next: (configs) => {
        this.configs = configs;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  toggleActive(id: string): void {
    this.searchConfigService.toggleActive(id);
  }

  deleteConfig(id: string): void {
    if (confirm('¿Está seguro de que desea eliminar esta configuración?')) {
      this.searchConfigService.delete(id);
    }
  }

  executeNow(id: string): void {
    this.schedulerService.executeSearchNow(id);
  }

  getFrequencyLabel(frequency: string): string {
    switch (frequency) {
      case 'daily': return 'Diario';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensual';
      default: return frequency;
    }
  }

  getStatusBadgeClass(active: boolean): string {
    return active ? 'bg-success' : 'bg-secondary';
  }

  getStatusLabel(active: boolean): string {
    return active ? 'Activo' : 'Inactivo';
  }

  formatDate(date?: Date): string {
    if (!date) return 'Nunca';
    return new Date(date).toLocaleString('es-ES');
  }
}
