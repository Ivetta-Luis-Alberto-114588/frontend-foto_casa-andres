import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResultsRoutingModule } from './results-routing.module';
import { ResultsListComponent } from './results-list/results-list.component';
import { ResultDetailComponent } from './result-detail/result-detail.component';


@NgModule({
  declarations: [
    ResultsListComponent,
    ResultDetailComponent
  ],
  imports: [
    CommonModule,
    ResultsRoutingModule
  ]
})
export class ResultsModule { }
