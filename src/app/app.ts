import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
 
})
export class App {
  constructor(private translate: TranslateService) {
    // Imposta le lingue disponibili
    translate.addLangs(['it', 'en', 'fr']);

    // Imposta la lingua di default
    translate.setDefaultLang('it');

    // Prova a usare la lingua del browser, altrimenti usa 'it'
    const browserLang = translate.getBrowserLang();
    translate.use(browserLang?.match(/it|en|fr/) ? browserLang : 'it');
  }
}
