import { Component, OnInit } from '@angular/core';
import { SchedulerService } from './core/services/scheduler.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'andres-project';

  constructor(private schedulerService: SchedulerService) {}

  ngOnInit(): void {
    this.schedulerService.startScheduler();
  }
}
