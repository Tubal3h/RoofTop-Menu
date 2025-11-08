/*
  COMPONENTE ROOT (PRINCIPALE) DELL'APPLICAZIONE
  Componente radice di Angular che avvia tutta l'applicazione
  Gestisce la configurazione delle lingue multilingue
*/

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

/*
  DECORATOR @Component
  selector: 'app-root' = tag HTML per renderizzare questo componente
  imports: [RouterOutlet] = moduli disponibili in questo componente
    RouterOutlet = direttiva Angular che renderizza i componenti del routing
  templateUrl: './app.html' = file HTML del template
  styleUrl: './app.scss' = file SCSS degli stili
*/
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  /*
    CONSTRUCTOR - DEPENDENCY INJECTION
    private translate: TranslateService
    
    TranslateService è un servizio da ngx-translate/core
    Gestisce tutte le operazioni di traduzione/i18n (internazionalization)
    
    Il constructor viene eseguito una sola volta quando l'applicazione si avvia
    Perfetto per configurazioni globali come le lingue
  */
  constructor(private translate: TranslateService) {
    /*
      STEP 1: AGGIUNGE LE LINGUE DISPONIBILI ALL'APPLICAZIONE
      translate.addLangs() registra le lingue che l'app supporta
      
      Array: ['it', 'en', 'fr']
      - 'it' = italiano
      - 'en' = english
      - 'fr' = français
      
      Questo tells ngx-translate quali lingue cercare nei file di traduzione
      I file di traduzione si trovano in src/assets/i18n/:
      - it.json (traduzioni italiano)
      - en.json (traduzioni inglese)
      - fr.json (traduzioni francese)
      
      Se ngx-translate riceve una lingua non in questa lista,
      sarà in grado di usarla ma non sarà considerata "ufficiale"
    */
    translate.addLangs(['it', 'en', 'fr']);

    /*
      STEP 2: IMPOSTA LA LINGUA DI DEFAULT
      translate.setDefaultLang('it')
      
      Questa è la lingua di fallback usata quando:
      1. L'utente non ha una lingua salvata
      2. Il browser ha una lingua non supportata
      3. Non si riesce a rilevare la lingua del browser
      4. Non si riesce a caricare il file di traduzione per una lingua
      
      Se getLocalizedText() non trova una traduzione in una lingua,
      fallback all'italiano (la lingua di default)
      
      In questo caso: 'it' = italiano è il default
    */
    translate.setDefaultLang('it');

    /*
      STEP 3: RILEVA LA LINGUA DEL BROWSER E LA USA SE SUPPORTATA
      
      translate.getBrowserLang()
      Legge la lingua dalle impostazioni del browser/sistema operativo
      Esempi di ritorno:
      - 'it' se l'utente ha impostato italiano
      - 'en' se l'utente ha impostato english
      - 'fr' se l'utente ha impostato français
      - 'de' se l'utente ha impostato deutsch (tedesco)
      - 'es' se l'utente ha impostato español (spagnolo)
      - null se non riesce a rilevare
      
      browserLang?.match(/it|en|fr/)
      Controlla se la lingua rilevata è una delle 3 supportate
      ?.match() = optional chaining (ritorna null se browserLang è null)
      /it|en|fr/ = regex che cerca solo queste 3 lingue
      
      Esempi:
      - 'it'.match(/it|en|fr/) → ['it'] (match trovato, truthy)
      - 'en'.match(/it|en|fr/) → ['en'] (match trovato, truthy)
      - 'de'.match(/it|en|fr/) → null (match non trovato, falsy)
      
      ? : OPERATORE TERNARIO
      condition ? valueIfTrue : valueIfFalse
      
      Se match trovato:
      → usa browserLang (es: 'it', 'en', 'fr')
      
      Se match non trovato o browserLang è null:
      → usa 'it' come fallback
    */
    const browserLang = translate.getBrowserLang();
    translate.use(browserLang?.match(/it|en|fr/) ? browserLang : 'it');

    /*
      SPIEGAZIONE PRATICA CON ESEMPI:
      
      Scenario 1: Utente nel browser ha italiano
      - getBrowserLang() ritorna 'it'
      - 'it'.match(/it|en|fr/) ritorna ['it'] (truthy)
      - translate.use('it') ← usa italiano ✓
      
      Scenario 2: Utente nel browser ha francese
      - getBrowserLang() ritorna 'fr'
      - 'fr'.match(/it|en|fr/) ritorna ['fr'] (truthy)
      - translate.use('fr') ← usa francese ✓
      
      Scenario 3: Utente nel browser ha tedesco (non supportato)
      - getBrowserLang() ritorna 'de'
      - 'de'.match(/it|en|fr/) ritorna null (falsy)
      - translate.use('it') ← fallback a italiano ✓
      
      Scenario 4: getBrowserLang() non riesce a rilevare
      - getBrowserLang() ritorna null
      - null?.match() ritorna null (falsy) a causa dell'optional chaining
      - translate.use('it') ← fallback a italiano ✓
    */
  }
}

/*
  SOMMARIO DELLA CONFIGURAZIONE:
  
  1. STARTUP APPLICAZIONE
     App component viene caricato (root component)
     Constructor viene eseguito automaticamente
  
  2. SETUP LINGUE
     - Registra 3 lingue supportate: it, en, fr
     - Imposta italiano come default
     - Rileva la lingua del browser
  
  3. SELEZIONE LINGUA INIZIALE
     - Se lingua del browser è supportata → usala
     - Altrimenti → usa italiano (default)
  
  4. DOPO LA CONFIGURAZIONE
     - TranslateService è pronto per l'uso in tutta l'app
     - Componenti possono usare il pipe 'translate' nei template
     - Componenti possono usare getLocalizedText() per estrarre testi multilingua
     - Componenti possono ascoltare onLangChange per reagire ai cambi lingua
  
  5. FLOW DELLA TRADUZIONE
     Menu component riceve i dati dal backend (in tutte le lingue)
     User vede il menu nella lingua che hanno impostato
     Se cambiano lingua, le key come 'ui.ingredients_label' vengono tradotte
     se cambiano il componente, gli articoli si riadattano alla nuova lingua
  
  NOTA IMPORTANTE:
  Questo è un SETUP GLOBALE
  Viene eseguito UNA SOLA VOLTA all'avvio dell'applicazione
  Non viene mai re-eseguito durante l'uso dell'app
  
  Per cambiare lingua durante l'uso:
  L'utente clicca il language-switcher component
  Che chiama translate.use('nuova_lingua')
  Questo emette l'evento onLangChange
  Tutti i componenti sottoscritti reagiscono
*/