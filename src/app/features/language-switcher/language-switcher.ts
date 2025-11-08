/*
  COMPONENTE LANGUAGE SWITCHER
  Consente all'utente di cambiare la lingua dell'applicazione
  Component standalone minimalista con soli 2 elementi principali
*/

import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

/*
  DECORATOR @Component
  selector: 'app-language-switcher' = tag HTML per usare il componente
  imports: [CommonModule] = moduli disponibili
    CommonModule = necessario per *ngFor directive
  templateUrl: './language-switcher.html' = file template
  styleUrl: './language-switcher.scss' = file stili
*/
@Component({
  selector: 'app-language-switcher',
  imports: [CommonModule],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss'
})
export class LanguageSwitcher {
  /*
    CONSTRUCTOR - DEPENDENCY INJECTION
    public translate: TranslateService
    
    TranslateService è iniettato come PUBLIC (non private)
    Perché public?
    
    Nel template HTML usiamo:
    <a *ngFor="let lang of translate.getLangs()"
       (click)="useLanguage(lang)"
       [class.active]="translate.currentLang === lang">
    
    Il template accede direttamente a:
    - translate.getLangs() ← pubblica
    - translate.currentLang ← pubblica
    
    Se fosse private, il template non potrebbe accedervi
    Errore: "Cannot read property 'getLangs' of undefined"
    
    In Angular:
    - private: accessibile solo dalla classe TypeScript
    - public: accessibile da template E classe TypeScript
    
    Pratica consigliata per componenti standalone semplici:
    Se il servizio è usato nel template → public
    Se il servizio è usato solo in TypeScript → private
  */
  constructor(public translate: TranslateService) {}

  /*
    METODO PUBLIC - CAMBIA LA LINGUA
    useLanguage(lang: string): void
    
    lang: stringa con il codice della lingua
    Esempi: 'it', 'en', 'fr'
    
    void: il metodo non ritorna nulla
  */
  public useLanguage(lang: string): void {
    /*
      CHIAMA IL METODO USE DI NGXTRANSLATE
      this.translate.use(lang)
      
      TranslateService.use() cambia la lingua attualmente attiva
      Catena di eventi che si triggera:
      
      1. translate.use('en') viene chiamato
      2. TranslateService carica il file en.json
      3. Emette l'evento onLangChange
      4. Tutti i subscriber reagiscono
      
      Chi ascolta l'evento?
      Nel menu.ts constructor:
      
      this.translate.onLangChange.subscribe((event) => {
        this.currentLang = event.lang as SupportedLanguage;
        this.cdr.markForCheck();
      });
      
      Quando onLangChange viene emesso:
      - Menu component aggiorna currentLang
      - Chiama cdr.markForCheck() per dire ad Angular di controllare il template
      - Template si ri-renderizza
      - getLocalizedText() estrae i testi nella nuova lingua
      - All'utente viene mostrato il menu nella nuova lingua
      
      Simultaneamente, nel language-switcher template:
      [class.active]="translate.currentLang === lang"
      Si rivaluta e i link si aggiornano visivamente
    */
    this.translate.use(lang);
  }
}

/*
  FLUSSO COMPLETO DEL CAMBIO LINGUA:
  
  1. UTENTE CLICCA UN LINK LINGUISTICO
     Template HTML:
     <a (click)="useLanguage(lang)">
     Passa 'it', 'en', o 'fr'
  
  2. METODO USElanguage VIENE ESEGUITO
     this.translate.use('en')
     TranslateService inizia il cambio lingua
  
  3. NGXTRANSLATE CARICA I FILE
     Carica src/assets/i18n/en.json
     Contiene tutte le traduzioni per l'inglese
  
  4. EVENTO ONLANGCHANGE EMESSO
     ngx-translate emette l'evento con la nuova lingua
  
  5. COMPONENTI ASCOLTANO L'EVENTO
     menu.component.ts ha questa sottoscrizione:
     
     this.translate.onLangChange.subscribe((event) => {
       this.currentLang = event.lang;
       this.cdr.markForCheck();
     });
     
     Quando riceve l'evento:
     - Aggiorna currentLang
     - Forza Angular a rilevare i cambiamenti
     - Template si ri-renderizza
  
  6. TEMPLATE SI AGGIORNA
     Menu.component.html usa getLocalizedText():
     {{ getLocalizedText(item.name) }}
     
     Ora estrae il testo nella nuova lingua
  
  7. UI SI AGGIORNA VISIVAMENTE
     - Menu mostra i contenuti nella nuova lingua
     - Language switcher evidenzia il nuovo link active
     - Tutto è sincronizzato
  
  TIMING: Tutto accade quasi istantaneamente (< 100ms)
  
  VANTAGGI DI QUESTO PATTERN:
  - Decoupled: language-switcher non sa come gli altri componenti reagiscono
  - Reattivo: il cambio lingua è automatico per chi ascolta onLangChange
  - Scalabile: aggiungere un nuovo componente che reagisce è facile
    (basta fare un subscribe a onLangChange)
  - Centralizzato: ngx-translate gestisce lo stato della lingua globalmente
*/

/*
  DESIGN PHILOSOPHY DI QUESTO COMPONENTE:
  
  Questo è un componente PRESENTATION-ONLY (presentazione)
  Non contiene logica di business
  Ha una responsabilità sola: permettere all'utente di scegliere la lingua
  
  Caratteristiche:
  - Nessuno stato interno (nessun @Input, @Output)
  - Nessun if/for logico, solo nel template
  - Una sola public method: useLanguage()
  - Dipendenza iniettata: TranslateService
  
  Il componente è essenzialmente un "bottone con loop"
  Fa questo:
  1. Loop sulle lingue disponibili
  2. Renderizza un link per ogni lingua
  3. Evidenzia la lingua attiva
  4. Chiama TranslateService.use() al click
  
  Tutto il resto è gestito da:
  - TranslateService (gestione globale della lingua)
  - Menu.component (reagisce ai cambi lingua)
  - Stili SCSS (feedback visivo)
*/