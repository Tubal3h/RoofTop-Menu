import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-language-switcher',
  imports: [CommonModule],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss'
})
export class LanguageSwitcher {
  // Esponiamo il servizio al template
  constructor(public translate: TranslateService) {}

  useLanguage(lang: string): void {
    this.translate.use(lang);
  }
}
