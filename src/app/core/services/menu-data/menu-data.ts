/*
  SERVIZIO MENU DATA
  Gestisce il caricamento, caching e aggiornamento in tempo reale dei dati del menu
  Interfaccia centrale tra il backend e i componenti Angular
*/

import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { tap, filter, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '@env/environment';
import { SocketService } from '@app/core/services/socket-service/socket';

/*
  INTERFACE - MENU ITEM
  Definisce la struttura di un singolo articolo del menu
*/
export interface MenuItem {
  /*
    _id: string
    ID univoco dell'articolo dal database MongoDB
    Usato come chiave primaria per identificare l'articolo
  */
  _id: string;

  /*
    name: { it: string; en: string; fr: string }
    Nome dell'articolo in 3 lingue
    Esempio: { it: "Spritz", en: "Spritz", fr: "Spritz" }
    O: { it: "Prosecco", en: "Prosecco", fr: "Prosecco" }
  */
  name: { it: string; en: string; fr: string };

  /*
    description?: { it: string; en: string; fr: string }
    Il ? significa optional (facoltativo, può essere undefined)
    Descrizione dell'articolo in 3 lingue
    Esempio: { it: "Aperitivo con prosecco e liquore", ... }
  */
  description?: { it: string; en: string; fr: string };

  /*
    price: number
    Prezzo dell'articolo in EUR
    Numero puro: 5.5, 8, 12.99, ecc.
  */
  price: number;

  /*
    quantitaDisponibile: number
    Quantità ancora disponibile in magazzino
    Numero intero: 0, 5, 100, ecc.
    0 = esaurito
    > 0 = ancora disponibile
  */
  quantitaDisponibile: number;

  /*
    disponibile: boolean
    Flag booleano che indica se l'articolo è disponibile
    true = disponibile, si può mostrare e ordinare
    false = non disponibile, mostra "Non Disponibile" in UI
  */
  disponibile: boolean;

  /*
    frozen?: boolean
    Optional - indica se l'articolo è surgelato/congelato
    true = è un piatto surgelato
    false o undefined = piatto fresco
    Nel template: @if (item.frozen) mostra "*Surgelato"
  */
  frozen?: boolean;

  /*
    allergens?: any[]
    Optional - array di allergeni presenti nell'articolo
    Ogni elemento ha almeno: { number: 1, _id: "...", name: {...} }
    Usato per mostrare i numeri allergeni (1, 3, 7, ecc.)
  */
  allergens?: any[];

  /*
    ingredients?: { it: string; en: string; fr: string }
    Optional - lista degli ingredienti in 3 lingue
    Esempio: { it: "Prosecco, liquore, soda", ... }
  */
  ingredients?: { it: string; en: string; fr: string };
}

/*
  INTERFACE - MENU CATEGORY
  Definisce la struttura di una categoria di menu
*/
export interface MenuCategory {
  /*
    _id: string
    ID univoco della categoria dal database
  */
  _id: string;

  /*
    name: { it: string; en: string; fr: string }
    Nome della categoria in 3 lingue
    Esempio: { it: "Aperitivi", en: "Aperitifs", fr: "Apéritifs" }
  */
  name: { it: string; en: string; fr: string };

  /*
    items: MenuItem[]
    Array di articoli che appartengono a questa categoria
    Esempio: una categoria "Aperitivi" contiene [Spritz, Prosecco, Vino]
  */
  items: MenuItem[];
}

/*
  INTERFACE - PUBLIC MENU DATA
  Struttura radice di tutti i dati del menu pubblico
*/
export interface PublicMenuData {
  /*
    categories: MenuCategory[]
    Array di tutte le categorie del menu
    Ogni categoria contiene i suoi articoli
  */
  categories: MenuCategory[];

  /*
    allergens: any[]
    Array globale di tutti gli allergeni presenti nel menu
    Legenda che spiega i numeri degli allergeni
    Esempio: [
      { number: 1, name: { it: "Glutine", en: "Gluten", fr: "Gluten" } },
      { number: 3, name: { it: "Uova", en: "Eggs", fr: "Oeufs" } }
    ]
  */
  allergens: any[];
}

/*
  DECORATOR @INJECTABLE
  providedIn: 'root' = il servizio è disponibile a tutta l'app (singleton)
  'root' significa che c'è una sola istanza del servizio per tutta l'applicazione
  Non duplicato in ogni componente che lo usa
*/
@Injectable({
  providedIn: 'root'
})
export class MenuDataService implements OnDestroy {
  /*
    URL API BACKEND
    ${environment.apiUrl} = legge l'URL base dalle variabili di ambiente
    In environment.ts potrebbe essere: "http://localhost:3000"
    Risultato: "http://localhost:3000/api/public/menu-data"
    
    readonly = non può essere cambiato dopo l'inizializzazione
    Migliora la sicurezza: previene accidenti di modifica
  */
  private readonly apiUrl = `${environment.apiUrl}/api/public/menu-data`;

  /*
    BEHAVIOR SUBJECT - STORE CENTRALE DEI DATI
    BehaviorSubject<PublicMenuData | null>
    
    BehaviorSubject è un tipo di Subject RxJS che:
    1. Emette valori come un Observable normale
    2. Mantiene SEMPRE l'ultimo valore emesso
    3. Quando qualcuno si sottoscrive, riceve SUBITO l'ultimo valore
    
    Differenza da Observable:
    - Observable: inizia a emettere QUANDO ti sottoscrivi
    - BehaviorSubject: ti dà subito l'ultimo valore, poi continua a emettere
    
    PublicMenuData | null:
    - null all'inizio (nessun dato caricato ancora)
    - PublicMenuData una volta che i dati arrivano dal backend
    
    private: il subject non è accessibile direttamente dai componenti
    I componenti devono usare menuData$ (l'Observable filtrato)
  */
  private menuDataSubject = new BehaviorSubject<PublicMenuData | null>(null);

  /*
    PUBLIC OBSERVABLE - I COMPONENTI SI SOTTOSCRIVONO A QUESTO
    this.menuData$ = this.menuDataSubject.pipe(...)
    
    .pipe() applica operatori RxJS:
    
    1. filter(data => data !== null)
       Filtra i valori null
       Solo PublicMenuData validi passano
       I componenti non vedono mai null
    
    2. distinctUntilChanged()
       Emette solo quando il valore cambia
       Se menuDataSubject emette lo stesso oggetto due volte
       distinctUntilChanged vede che è lo stesso → non emette
       Evita re-renderizzazioni inutili dei componenti
    
    as Observable<PublicMenuData>
    Type casting: il compilatore TypeScript sa che questo Observable
    non emetterà mai null (grazie al filter)
    
    Nel componente menu.ts:
    this.publicData$ = this.menuDataService.getMenuData()
    Nel template menu.html:
    @if (publicData$ | async; as data) {
      renderizza il menu
    }
  */
  public menuData$: Observable<PublicMenuData> = this.menuDataSubject.pipe(
    filter(data => data !== null),
    distinctUntilChanged()
  ) as Observable<PublicMenuData>;

  /*
    SUBSCRIPTION MANAGER
    new Subscription() contenitore per tutte le sottoscrizioni del servizio
    
    Perché? Per pulire le sottoscrizioni in ngOnDestroy
    Se non le cancelli, rimangono in memoria e causano memory leak
    
    Sottoscrizioni dentro questo servizio:
    - Ascolto socket 'menu_item_updated'
    - Ascolto socket 'menu_item_sold_out'
    - Ascolto socket 'menu_reset'
    
    Quando il servizio viene distrutto, tutte vengono cancellate
  */
  private subscriptions = new Subscription();

  /*
    CONSTRUCTOR - DEPENDENCY INJECTION
    Inietta due servizi:
    1. HttpClient - per fare richieste HTTP al backend
    2. SocketService - per ascoltare aggiornamenti in tempo reale
  */
  constructor(
    private http: HttpClient,
    private socketService: SocketService
  ) {
    /*
      Chiama il metodo di setup dei listener socket
      Questo viene eseguito UNA SOLA VOLTA quando il servizio è creato
    */
    this.initializeSocketListeners();
  }

  /*
    METODO PUBLIC - OTTIENE I DATI DEL MENU
    Questa è la funzione che i componenti chiamano
    
    Logica:
    1. Controlla se i dati sono già in cache
    2. Se sì, ritorna l'Observable cached (veloce, niente richiesta HTTP)
    3. Se no, fa una richiesta HTTP al backend
    4. Una volta ricevuti, salva in cache e emette
  */
  public getMenuData(): Observable<PublicMenuData> {
    /*
      CONTROLLA IL CACHE
      this.menuDataSubject.value = ultimo valore emesso (attualmente in memoria)
      Se non null, significa abbiamo già i dati
    */
    const cached = this.menuDataSubject.value;
    if (cached) {
      /*
        RETURN CACHED DATA
        Ritorna l'Observable memorizzato in cache
        Il subscribe nel componente riceve immediatamente i dati
        Nessuna richiesta HTTP al backend
        Velocità: istantanea (< 1ms)
      */
      return this.menuData$;
    }

    /*
      NO CACHE - FETCH DAL BACKEND
      this.http.get<PublicMenuData>(url)
      Fa una richiesta HTTP GET al backend
      Tipo di ritorno: Observable<PublicMenuData>
      
      .pipe(tap(...))
      tap() è un operatore RxJS che esegue side effects
      Cioè: esegui questo codice MA non modificare l'Observable
      
      tap(data => {
        ...logga...
        this.menuDataSubject.next(data)  ← emetti i dati al BehaviorSubject
      })
      
      Risultato:
      1. Dati arrivano dal backend
      2. Li logghiamo nella console
      3. Li emettiamo al menuDataSubject
      4. BehaviorSubject propaga ai componenti sottoscritti
      5. I dati sono salvati in cache per future richieste
    */
    return this.http.get<PublicMenuData>(this.apiUrl).pipe(
      tap(data => {
        console.log('[MenuDataService] Menu caricato dal backend:', data);
        this.menuDataSubject.next(data);
      })
    );
  }

  /*
    METODO PRIVATE - INIZIALIZZA I LISTENER SOCKET
    Connette al server WebSocket e ascolta 3 tipi di eventi:
    1. menu_item_updated - un articolo è stato aggiornato
    2. menu_item_sold_out - un articolo è esaurito
    3. menu_reset - il menu intero è stato resettato
  */
  private initializeSocketListeners(): void {
    /*
      CONNETTI AL SERVER WEBSOCKET
      Stabilisce la connessione per ascoltare aggiornamenti in tempo reale
    */
    this.socketService.connect();

    /*
      LISTENER 1: ARTICOLO AGGIORNATO
      Si attiva quando il backend notifica che un articolo è cambiato
      (prezzo, disponibilità, quantità, ecc.)
    */
    this.subscriptions.add(
      this.socketService.listen<{
        _id: string;
        quantitaDisponibile: number;
        disponibile: boolean;
        name?: { it: string; en: string; fr: string };
      }>('menu_item_updated').subscribe(updatedItem => {
        console.log('[MenuDataService] Menu item aggiornato via Socket:', updatedItem);
        /*
          Chiama il metodo che aggiorna l'articolo nel menu in cache
          Non ricarichiamo tutto il menu dal backend (lento)
          Aggiorniamo solo l'articolo specifico (veloce, in tempo reale)
        */
        this.updateMenuItemLocally(updatedItem);
      })
    );

    /*
      LISTENER 2: ARTICOLO ESAURITO
      Si attiva quando un articolo finisce in magazzino
      Evento specifico per il sold-out (caso frequente al ristorante)
    */
    this.subscriptions.add(
      this.socketService.listen<{ _id: string }>('menu_item_sold_out').subscribe(data => {
        console.log('[MenuDataService] Piatto esaurito:', data._id);
        /*
          Aggiorna l'articolo localmente con quantità 0 e disponibile = false
          Così gli utenti vedono subito "Non Disponibile" senza ricaricare
        */
        this.updateMenuItemLocally({
          _id: data._id,
          quantitaDisponibile: 0,
          disponibile: false
        });
      })
    );

    /*
      LISTENER 3: MENU RESETTATO
      Si attiva quando il menu intero viene modificato nel backend
      (cambio completo di articoli, categorie, prezzi, ecc.)
    */
    this.subscriptions.add(
      this.socketService.listen<PublicMenuData>('menu_reset').subscribe(newMenuData => {
        console.log('[MenuDataService] Menu resettato:', newMenuData);
        /*
          Ricevi i nuovi dati completi del menu
          Sostituisci il vecchio menu con il nuovo
          Tutti i componenti sottoscritti ricevono i nuovi dati
        */
        this.menuDataSubject.next(newMenuData);
      })
    );
  }

  /*
    METODO PRIVATE - AGGIORNA UN SINGOLO ARTICOLO IN CACHE
    Riceve un oggetto con i dati aggiornati di un articolo
    Lo trova nel menu e lo aggiorna immutabilmente
    
    Immutabilità = NON modificheriamo il vecchio oggetto
    Creiamo una copia nuova con i dati aggiornati
    
    Perché? Perché Angular usa change detection
    Se modificchiamo l'oggetto direttamente, Angular potrebbe non accorgersene
    Con immutabilità, Angular vede un nuovo oggetto = "qualcosa è cambiato"
  */
  private updateMenuItemLocally(updatedItem: {
    _id: string;
    quantitaDisponibile: number;
    disponibile: boolean;
  }): void {
    /*
      OTTIENI IL MENU CORRENTE
      currentMenu = il BehaviorSubject attualmente memorizzato
      Potrebbe essere null se il menu non è stato caricato ancora
    */
    const currentMenu = this.menuDataSubject.value;

    /*
      CHECK: IL MENU È STATO CARICATO?
      Se null, non possiamo aggiornare (non c'è nulla da aggiornare)
      Log un avviso e ritorna
    */
    if (!currentMenu) {
      console.warn('[MenuDataService] Menu non caricato ancora');
      return;
    }

    /*
      FLAG PER TRACCIARE SE L'ARTICOLO È STATO TROVATO
      Lo usiamo per ottimizzazione: una volta trovato, non cerchiamo più
    */
    let itemFound = false;

    /*
      CREA UNA COPIA IMMUTABILE DEL MENU
      updatedMenu = una copia nuova del menu con l'articolo aggiornato
      
      ...currentMenu = spread operator
      Copia tutte le proprietà dal menu attuale (categories, allergens)
      
      categories: currentMenu.categories.map(...)
      Itera su OGNI categoria e controlla se contiene l'articolo
      Se sì, aggiorna l'articolo in quella categoria
      Se no, ritorna la categoria invariata
    */
    const updatedMenu: PublicMenuData = {
      ...currentMenu,
      categories: currentMenu.categories.map((category: MenuCategory) => {
        /*
          OTTIMIZZAZIONE: SE L'ARTICOLO È GIÀ STATO TROVATO
          Nei cicli precedenti lo abbiamo trovato e aggiornato
          Ritorna questa categoria invariata (no need to search anymore)
        */
        if (itemFound) {
          return category;
        }

        /*
          CERCARE L'ARTICOLO IN QUESTA CATEGORIA
          category.items.findIndex() cerca l'indice dell'articolo con _id matching
          ?? -1 = se category.items è undefined, ritorna -1 (not found)
        */
        const itemIndex = category.items?.findIndex(item => item._id === updatedItem._id) ?? -1;

        /*
          L'ARTICOLO NON È IN QUESTA CATEGORIA
          Ritorna la categoria invariata
        */
        if (itemIndex === -1) {
          return category;
        }

        /*
          L'ARTICOLO È STATO TROVATO!
          Set itemFound = true così i cicli successivi saltano la ricerca
          Loga quali campi sono stati aggiornati
        */
        itemFound = true;
        console.log(
          `[MenuDataService] Aggiornamento piatto ${updatedItem._id}: ` +
          `quantita=${updatedItem.quantitaDisponibile}, ` +
          `disponibile=${updatedItem.disponibile}`
        );

        /*
          CREA UNA COPIA DEGLI ARTICOLI DELLA CATEGORIA
          [...category.items] = spread operator su array
          Crea un nuovo array (immutabile)
        */
        const updatedItems = [...category.items];

        /*
          AGGIORNA L'ARTICOLO ALL'INDICE TROVATO
          updatedItems[itemIndex] = nuovo oggetto articolo
          
          ...updatedItems[itemIndex] = copia l'articolo vecchio
          Mantiene tutte le proprietà che non cambiano (name, price, ecc.)
          
          quantitaDisponibile: updatedItem.quantitaDisponibile
          disponibile: updatedItem.disponibile
          Questi due campi vengono sovrascritti con i valori nuovi
        */
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          quantitaDisponibile: updatedItem.quantitaDisponibile,
          disponibile: updatedItem.disponibile
        };

        /*
          RITORNA LA CATEGORIA CON GLI ARTICOLI AGGIORNATI
          IMPORTANTE: NON filtriamo gli articoli non disponibili
          Anche se disponibile = false, l'articolo resta nel menu
          Nel template, ci penserà a mostrare "Non Disponibile"
        */
        return {
          ...category,
          items: updatedItems
        };
      })
    };

    /*
      EMETTI IL MENU AGGIORNATO
      menuDataSubject.next(updatedMenu)
      Notifica a tutti i subscriber che il menu è cambiato
      Tutti i componenti che ascoltano menuData$ ricevono il nuovo menu
      Le loro view si aggiornano automaticamente
    */
    this.menuDataSubject.next(updatedMenu);
    console.log('[MenuDataService] Menu aggiornato e emesso');
  }

  /*
    METODO PUBLIC - FORZA IL RICARICAMENTO DEL MENU
    Ignora la cache e ricarica tutto dal backend
    Utile se l'utente vuole aggiornare manualmente
  */
  public reloadMenu(): Observable<PublicMenuData> {
    /*
      Fa una nuova richiesta HTTP (ignora il cache)
      Riceve il menu fresco dal backend
      Lo emette al menuDataSubject (aggiorna la cache)
    */
    return this.http.get<PublicMenuData>(this.apiUrl).pipe(
      tap(data => {
        console.log('[MenuDataService] Menu ricaricato manualmente:', data);
        this.menuDataSubject.next(data);
      })
    );
  }

  /*
    METODO PUBLIC - OTTIENI I DATI ATTUALI SENZA OBSERVABLE
    A volte i componenti vogliono i dati una sola volta (non subscription)
    Questo metodo ritorna i dati sincronamente
    
    Ritorno: PublicMenuData | null
    - null se il menu non è stato caricato ancora
    - PublicMenuData se il menu è caricato
  */
  public getCurrentMenuData(): PublicMenuData | null {
    return this.menuDataSubject.value;
  }

  /*
    LIFECYCLE HOOK - NG ON DESTROY
    Viene eseguito quando il servizio viene distrutto
    (normalmente quando l'app si chiude)
    
    Responsabilità: cancellare tutte le sottoscrizioni attive
    Se non lo fai, i listener socket rimangono attivi in memoria
    Questo causa memory leak e perdita di performance
  */
  ngOnDestroy(): void {
    /*
      Unsubscribe da tutte le sottoscrizioni gestite da questo oggetto Subscription
      Questo include:
      - Listener socket 'menu_item_updated'
      - Listener socket 'menu_item_sold_out'
      - Listener socket 'menu_reset'
    */
    this.subscriptions.unsubscribe();
  }
}

/*
  RIASSUNTO ARCHITETTURA DEL SERVIZIO:
  
  1. FLUSSO DI CARICAMENTO INIZIALE
     - Componente chiama getMenuData()
     - Menu non è in cache → richiesta HTTP al backend
     - Backend ritorna PublicMenuData
     - tap() salva in cache (menuDataSubject)
     - Componente riceve i dati tramite Observable
  
  2. RICHIESTE SUCCESSIVE
     - Componente chiama getMenuData() di nuovo
     - Menu è in cache → ritorna immediatamente
     - Nessuna richiesta HTTP (veloce)
  
  3. AGGIORNAMENTI IN TEMPO REALE (WEBSOCKET)
     - Server notifica cambio articolo via WebSocket
     - Socket listener aggiorna l'articolo in cache localmente
     - Componenti sottoscritti ricevono immediatamente il menu aggiornato
     - Tutto in tempo reale, senza refresh manuale
  
  4. IMMUTABILITÀ
     - Ogni aggiornamento crea una copia nuova del menu
     - Angular change detection rileva il nuovo oggetto
     - View si aggiorna automaticamente
  
  5. PULIZIA (CLEANUP)
     - Quando app si chiude, ngOnDestroy cancella i listener socket
     - Previene memory leak
     - Chiude le connessioni al server
*/