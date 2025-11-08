/*
  COMPONENTE MENU PRINCIPALE
  Gestisce il caricamento dei dati del menu, lingue multiple, ordinamento, e interazioni UI
  Utilizza OnPush ChangeDetectionStrategy per ottimizzare le prestazioni
*/

import { Component, OnInit, OnDestroy, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SplashScreen } from '@app/features/splash-screen/splash-screen';
import { LanguageSwitcher } from '@app/features/language-switcher/language-switcher';
import { MenuDataService, PublicMenuData, MenuCategory, MenuItem } from '@app/core/services/menu-data/menu-data';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faInstagram, faFacebook, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

/*
  TYPE DEFINITION - LINGUE SUPPORTATE
  Limita il tipo di linguaggio a solo queste 3 opzioni
  Se si prova ad assegnare una lingua diversa, TypeScript darà errore in compilazione
*/
type SupportedLanguage = 'it' | 'en' | 'fr';

/*
  DECORATOR @Component
  selector: 'app-menu' = il tag HTML per usare questo componente è <app-menu>
  standalone: true = componente standalone (non necessita di NgModule)
  imports: [] = componenti e moduli disponibili in questo componente
  templateUrl: './menu.html' = file HTML del template
  styleUrl: './menu.scss' = file SCSS per gli stili
  changeDetection: ChangeDetectionStrategy.OnPush = ottimizzazione performance (leggi sotto)
*/
@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, TranslateModule, SplashScreen, LanguageSwitcher, FontAwesomeModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Menu implements OnInit, OnDestroy {
  /*
    OBSERVABLE DEI DATI MENU
    ? = proprietà opzionale (potrebbe essere undefined)
    Observable<PublicMenuData> = emette un oggetto PublicMenuData quando i dati arrivano dal server
    Il template usa il pipe 'async' per sottoscriversi automaticamente
  */
  public publicData$?: Observable<PublicMenuData>;

  /*
    FLAG PER VISUALIZZARE/NASCONDERE SPLASH SCREEN
    true all'avvio, diventa false dopo che l'animazione finisce
  */
  public isSplashing = true;

  /*
    LINGUA CORRENTE SELEZIONATA
    Inizialmente 'it' (italiano), cambia quando l'utente usa il language switcher
  */
  public currentLang: SupportedLanguage = 'it';

  /*
    ICONE FONTAWESOME
    Importate dal modulo fontawesome-svg-core
    faInstagram, faFacebook, faTwitter = icone social
    faArrowUp = icona freccia su per il pulsante scroll-to-top
  */
  faInstagram = faInstagram;
  faFacebook = faFacebook;
  faTwitter = faTwitter;
  faArrowUp = faArrowUp;

  /*
    FLAG PER MOSTRARE/NASCONDERE PULSANTE SCROLL TO TOP
    false inizialmente, diventa true quando l'utente scrolla più di 300px
  */
  public showScrollButton = false;

  /*
    CONSTRUCTOR - DEPENDENCY INJECTION
    menuDataService: servizio che carica i dati dal backend
    translate: servizio ngx-translate per gestire le traduzioni
    cdr: ChangeDetectorRef per forzare il rilevamento dei cambiamenti (quando usiamo OnPush)
  */
  constructor(
    private menuDataService: MenuDataService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    /*
      INIZIALIZZA LA LINGUA CORRENTE
      1. Prova a prendere la lingua attualmente impostata (translate.currentLang)
      2. Se non esiste, usa la lingua predefinita (translate.defaultLang)
      3. Se nemmeno quella esiste, usa 'it' come fallback
      'as SupportedLanguage' = casting di tipo (assicura che il valore sia uno delle 3 lingue)
    */
    this.currentLang = (this.translate.currentLang || this.translate.defaultLang || 'it') as SupportedLanguage;

    /*
      SOTTOSCRIZIONE AL CAMBIO LINGUA
      Quando l'utente cambia lingua tramite language-switcher:
      1. onLangChange emette un evento con la nuova lingua
      2. Aggiorna currentLang al nuovo valore
      3. Chiama cdr.markForCheck() per dire ad Angular di rilevare i cambiamenti (OnPush strategy)
    */
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang as SupportedLanguage;
      this.cdr.markForCheck();
    });
  }

  /*
    LIFECYCLE HOOK - NGONIT
    Viene eseguito una sola volta dopo che il componente è inizializzato
    Qui carichiamo i dati dal backend
  */
  ngOnInit(): void {
    /*
      CARICAMENTO DATI MENU CON ORDINAMENTO
      1. this.menuDataService.getMenuData() = HTTP call che ritorna un Observable
      2. .pipe() = applica operatori RxJS alla sequenza di dati
      3. map() = trasforma i dati ricevuti
      4. this.sortCategoriesByPrice(data) = ordina gli articoli per prezzo
      5. Risultato assegnato a this.publicData$ per uso nel template
    */
    this.publicData$ = this.menuDataService.getMenuData().pipe(
      map(data => this.sortCategoriesByPrice(data))
    );
  }

  /*
    LIFECYCLE HOOK - NGONDESTROY
    Viene eseguito quando il componente viene distrutto (rimosso dal DOM)
    Qui potremmo ripulire subscription, timers, event listeners se necessario
    In questo caso è vuoto perché usiamo Observable (che si puliscono automaticamente con async pipe)
  */
  ngOnDestroy(): void {
    // Cleanup se necessario
  }

  /*
    METODO PRIVATE - ORDINA GLI ARTICOLI PER PREZZO
    Riceve l'intero oggetto menu e ritorna una copia ordinata
    Non modifica l'oggetto originale (programmazione funzionale)
  */
  private sortCategoriesByPrice(menuData: PublicMenuData): PublicMenuData {
    return {
      /*
        SPREAD OPERATOR (...menuData)
        Copia tutte le proprietà da menuData nell'oggetto nuovo
        Permette di modificare solo 'categories' lasciando il resto invariato
      */
      ...menuData,
      /*
        MAP SULLE CATEGORIE
        .map() trasforma ogni categoria in una nuova categoria ordinata
      */
      categories: menuData.categories.map(category => ({
        /*
          SPREAD DELLA CATEGORIA
          Copia tutte le proprietà dalla categoria originale
        */
        ...category,
        /*
          SORT DEGLI ARTICOLI
          [...category.items] = crea una copia dell'array (non modifica l'originale)
          .sort((a, b) => a.price - b.price) = ordina per prezzo crescente
          Se a.price < b.price ritorna numero negativo → a viene prima
          Se a.price > b.price ritorna numero positivo → b viene prima
          Se a.price === b.price ritorna 0 → ordine non cambia
        */
        items: [...category.items].sort((a, b) => a.price - b.price)
      }))
    };
  }

  /*
    CALLBACK PER QUANDO L'ANIMAZIONE SPLASH FINISCE
    Viene chiamato dall'evento (animationFinished) dal componente SplashScreen
    isSplashing diventa false, la splash screen scompare dal DOM
  */
  onSplashFinished(): void {
    this.isSplashing = false;
    /*
      markForCheck()
      Con ChangeDetectionStrategy.OnPush, Angular non controlla i cambiamenti di default
      markForCheck() dice "ehi Angular, qualcosa è cambiato, controlla il template"
      Necessario perché isSplashing è una variabile locale (non un Observable)
    */
    this.cdr.markForCheck();
  }

  /*
    METODO PUBLIC - ESTRAE IL TESTO NELLA LINGUA CORRENTE
    I dati del menu hanno testi in tutte le lingue: { it: "...", en: "...", fr: "..." }
    Questo metodo ritorna il testo nella lingua corrente dell'utente
    
    Parametri:
    - text: oggetto con testi in diverse lingue (opzionale)
    - fallback: testo da mostrare se text è undefined (default '')
    
    Logica:
    1. Se text non esiste, ritorna fallback
    2. Ritorna text[this.currentLang] (testo nella lingua attuale)
    3. Se non esiste, ritorna text['it'] (fallback italiano)
    4. Se neanche quella esiste, ritorna fallback
  */
  public getLocalizedText(
    text: { it: string; en: string; fr: string } | undefined,
    fallback: string = ''
  ): string {
    if (!text) return fallback;
    return text[this.currentLang] || text['it'] || fallback;
  }

  /*
    METODO PUBLIC - CONVERTE ARRAY DI ALLERGENI IN STRINGA
    Riceve un array di allergeni e ritorna una stringa formattata: "1, 3, 7"
    
    Logica:
    1. Controlla se l'array esiste e ha elementi
    2. .map(a => a?.number) = estrae il numero da ogni allergene
       (a?.number = optional chaining, ritorna undefined se a è null/undefined)
    3. .filter(n => n !== undefined) = rimuove i numeri undefined
    4. .join(', ') = unisce i numeri con virgola e spazio
  */
  public getAllergenNumbers(allergens: any[]): string {
    if (!allergens || allergens.length === 0) {
      return '';
    }
    return allergens.map(a => a?.number).filter(n => n !== undefined).join(', ');
  }

  /*
    METODO TRACK - PER OTTIMIZZARE CICLI @FOR
    Angular chiama questo metodo per ogni elemento del ciclo
    Ritorna un ID univoco per identificare ogni categoria
    
    Benefit: Se la lista cambia, Angular sa quale elemento è quale
    e non re-renderizza elementi che non sono cambiati
    
    Parametri:
    - _index: indice dell'elemento (non usato, prefisso _ indica inutilizzato)
    - category: l'elemento attuale
    
    Ritorna: category._id (ID univoco dal database)
  */
  trackByCategoryId(_index: number, category: MenuCategory): string {
    return category._id;
  }

  /*
    METODO TRACK - PER CICLO DEGLI ARTICOLI
    Stesso pattern del precedente, ma per gli articoli
  */
  trackByItemId(_index: number, item: MenuItem): string {
    return item._id;
  }

  /*
    METODO TRACK - PER CICLO DEGLI ALLERGENI
    Stesso pattern, ma per gli allergeni
    allergen._id || allergen.id = prova _id, se non esiste usa id
    (per compatibilità con diverse strutture dati)
  */
  trackByAllergenId(_index: number, allergen: any): string {
    return allergen._id || allergen.id;
  }

  /*
    DECORATORE @HOSTLISTENER - ASCOLTA GLI EVENTI DELLA FINESTRA
    'window:scroll' = ascolta l'evento scroll della finestra
    [] = nessun parametro per questo listener
    
    Viene eseguito ogni volta che l'utente scrolla la pagina
  */
  @HostListener('window:scroll', [])
  onWindowScroll() {
    /*
      LEGGE LA POSIZIONE DELLO SCROLL
      Prova tre modi diversi per leggere la posizione (compatibilità browser)
      window.pageYOffset = standard moderno
      document.documentElement.scrollTop = Firefox/IE
      document.body.scrollTop = alcuni browser
      || 0 = se tutti sono 0, usa 0 come default
    */
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    /*
      MOSTRA/NASCONDI PULSANTE SCROLL TO TOP
      Se scroll > 300px = mostra il pulsante (l'utente ha scrollato parecchio)
      Se scroll ≤ 300px = nascondi il pulsante (siamo in alto)
    */
    if (scrollPosition > 300) {
      this.showScrollButton = true;
    } else {
      this.showScrollButton = false;
    }

    /*
      FORZA ANGULAR A RILEVARE IL CAMBIAMENTO
      Necessario con OnPush strategy perché showScrollButton è una variabile locale
      Non è un Observable, quindi Angular non sa che è cambiata
      markForCheck() dice "controlla il template di questo componente"
    */
    this.cdr.markForCheck();
  }

  /*
    METODO PUBLIC - SCROLL SMOOTH AL TOP
    Viene chiamato quando l'utente clicca il pulsante scroll-to-top
    
    window.scrollTo() = scroll alla posizione specificata
    { top: 0, behavior: 'smooth' } = opzioni
    - top: 0 = scrolla fino al top (y = 0)
    - behavior: 'smooth' = effetto di scroll smooth (non immediato)
  */
  public scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}