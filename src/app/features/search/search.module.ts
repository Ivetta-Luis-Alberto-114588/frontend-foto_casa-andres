import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SearchRoutingModule } from './search-routing.module';
import { SearchFormComponent } from './search-form/search-form.component';
import { SearchConfigComponent } from './search-config/search-config.component';


@NgModule({
  declarations: [
    SearchFormComponent,
    SearchConfigComponent
  ],
  imports: [
    CommonModule,
    SearchRoutingModule,
    ReactiveFormsModule
  ],
  exports: [
    SearchFormComponent,
    SearchConfigComponent
  ]
})
export class SearchModule { }
