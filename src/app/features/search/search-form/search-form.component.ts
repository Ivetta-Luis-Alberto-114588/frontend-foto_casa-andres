import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SearchConfigService } from '../../../core/services/search-config.service';
import { WebScraperService } from '../../../core/services/web-scraper.service';
import { EmailService } from '../../../core/services/email.service';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css']
})
export class SearchFormComponent implements OnInit {
  searchForm: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private searchConfigService: SearchConfigService,
    private webScraperService: WebScraperService,
    private emailService: EmailService
  ) {
    this.searchForm = this.fb.group({
      url: ['https://www.fotocasa.es/', [Validators.required, Validators.pattern('https?://.+')]],
      searchTerm: ['', Validators.required],
      priceMax: [null, [Validators.min(0)]],
      email: ['', [Validators.required, Validators.email]],
      frequency: ['daily', Validators.required],
      browser: ['chromium', Validators.required]
    });
  }

  ngOnInit(): void {}

  get f() {
    return this.searchForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.searchForm.invalid) {
      return;
    }

    const formValue = this.searchForm.value;

    if (!this.webScraperService.validateUrl(formValue.url)) {
      this.errorMessage = 'La URL ingresada no es válida';
      return;
    }

    if (!this.emailService.validateEmail(formValue.email)) {
      this.errorMessage = 'El email ingresado no es válido';
      return;
    }

    const config = this.searchConfigService.create({
      url: formValue.url,
      searchTerm: formValue.searchTerm,
      priceMax: formValue.priceMax || undefined,
      email: formValue.email,
      frequency: formValue.frequency,
      browser: formValue.browser
    });

    this.successMessage = `Configuración creada exitosamente. ID: ${config.id}`;
    this.searchForm.reset({ url: 'https://www.fotocasa.es/', frequency: 'daily', browser: 'chromium', priceMax: null });
    this.submitted = false;
  }

  onCancel(): void {
    this.searchForm.reset({ url: 'https://www.fotocasa.es/', frequency: 'daily', browser: 'chromium', priceMax: null });
    this.submitted = false;
    this.successMessage = '';
    this.errorMessage = '';
  }
}
