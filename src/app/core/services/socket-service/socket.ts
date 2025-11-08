/*
  SERVIZIO SOCKET
  Gestisce la connessione WebSocket al backend usando Socket.io
  Fornisce metodi per connessione, ascolto eventi e disconnessione
  Interfaccia tra il frontend e il server per comunicazioni in tempo reale
*/

import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

/*
  DECORATOR @INJECTABLE
  providedIn: 'root' = singleton, una sola istanza per tutta l'app
  Disponibile in tutti i servizi e componenti che lo richiedono
*/
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  /*
    PROPRIETÀ SOCKET
    private socket?: Socket
    
    Socket è l'istanza della connessione WebSocket (da Socket.io)
    ? = optional, può essere undefined se non ancora connesso
    
    private = accessibile solo da questo servizio
    I componenti non accedono direttamente al socket
    Usano i metodi pubblici di questo servizio (connect, listen, disconnect)
    
    Perché non pubblico?
    - Encapsulation: nasconde i dettagli implementativi
    - Sicurezza: componenti non possono fare emit direttamente
    - Flessibilità: possiamo cambiare Socket.io senza rovinare componenti
  */
  private socket?: Socket;

  /*
    URL DEL BACKEND
    private readonly backendUrl = environment.apiUrl
    
    environment.apiUrl = variabile dalle env (es: "http://localhost:3000")
    readonly = non può essere modificato dopo l'inizializzazione
    
    Usato in connect() per stabilire la connessione al server
    Esempio: io("http://localhost:3000")
  */
  private readonly backendUrl = environment.apiUrl;

  /*
    CONSTRUCTOR - DEPENDENCY INJECTION
    private ngZone: NgZone
    
    NgZone è un servizio Angular che controlla quando Angular fa change detection
    
    Perché ngZone?
    WebSocket events arrivano FUORI dalla "zone" di Angular
    Se non le rimettiamo nella zone con ngZone.run(), Angular non rileva i cambiamenti
    Risultato: il template non si aggiorna quando arrivano dati dal server
    
    Solution:
    ngZone.run(() => subscriber.next(data))
    Questo dice ad Angular: "ehi, qualcosa è cambiato, controlla il template"
  */
  constructor(private ngZone: NgZone) {}

  /*
    METODO PUBLIC - CONNETTI AL BACKEND
    Stabilisce la connessione WebSocket al server
    Se già connesso, non fa nulla (early return)
  */
  public connect(): void {
    /*
      CHECK: GIÀ CONNESSO?
      if (this.socket) return
      
      Se this.socket esiste (non undefined), significa siamo già connessi
      Non ricolllegati, questo evita connessioni duplicate
      return = esci dal metodo, non fare nulla di più
    */
    if (this.socket) return;

    /*
      CREA LA CONNESSIONE WEBSOCKET
      io(url, options) crea una nuova istanza di Socket.io
      
      this.backendUrl = URL del server (es: "http://localhost:3000")
      
      options:
      - reconnectionAttempts: 5
        Se la connessione viene persa, tenta di riconnettersi 5 volte
        Dopo 5 tentativi falliti, smette di provare
        Perché 5? Compromesso tra persistenza e evitare di "bombardare" il server
      
      - timeout: 15000
        Timeout 15 secondi per la connessione iniziale
        Se il server non risponde in 15 secondi, fallisce il tentativo
        15 secondi = ragionevole per connessioni lente
    */
    this.socket = io(this.backendUrl, {
      reconnectionAttempts: 5,
      timeout: 15000,
    });

    /*
      LOG: CONNESSIONE INIZIATA
      Info all'utente/sviluppatore che stiamo tentando di connetterci
      Utile per debugging, per verificare che il servizio sta funzionando
    */
    console.log(`[SocketService] Tenta connessione a: ${this.backendUrl}`);

    /*
      LISTENER 1: CONNESSIONE RIUSCITA
      .on('connect', callback)
      
      Si attiva quando la connessione al server è stabilita con successo
      Significa: possiamo comunicare bidirezionalmente con il server
      
      Per il nostro uso:
      - MenuDataService ascolterà 'menu_item_updated'
      - 'menu_item_sold_out'
      - 'menu_reset'
      
      Questi event cominciano ad arrivare solo DOPO il 'connect'
    */
    this.socket.on('connect', () => {
      console.log('✅ SocketService: Connesso con successo!');
    });

    /*
      LISTENER 2: DISCONNESSIONE
      .on('disconnect', callback)
      
      Si attiva quando la connessione viene persa
      Può succedere per vari motivi:
      - Utente chiude il browser/app
      - Wi-Fi si disconnette
      - Server si riavvia
      - Timeout della connessione
      - Errore di rete
      
      reason: stringa che spiega il motivo della disconnessione
      Esempi: "client namespace disconnect", "ping timeout", "transport close"
      
      Log: segnaliamo la disconnessione (utile per debugging)
    */
    this.socket.on('disconnect', (reason: string) => {
      console.warn('❌ SocketService: Disconnesso:', reason);
    });

    /*
      LISTENER 3: ERRORE DI CONNESSIONE
      .on('connect_error', callback)
      
      Si attiva quando c'è un errore durante la connessione
      Questo NON è lo stesso di 'disconnect'
      'connect_error' = non siamo mai riusciti a connetterci
      'disconnect' = eravamo connessi, poi abbiamo perso la connessione
      
      err: oggetto con i dettagli dell'errore
      err.message: descrizione leggibile dell'errore
      
      Esempi di errori:
      - "Connection refused" (server non è online)
      - "Network error" (problemi di rete)
      - "Authentication error" (se avessimo auth)
      - "CORS error" (se configurazione CORS sbagliata)
      
      Log: segnaliamo l'errore per debugging
    */
    this.socket.on('connect_error', (err: any) => {
      console.error('❌ SocketService: Errore Connessione:', err.message);
    });
  }

  /*
    METODO PUBLIC - ASCOLTA EVENTI DAL SERVER
    Crea un Observable che emette quando un evento specifico arriva dal server
    
    Parametri:
    - eventName: string = nome dell'evento da ascoltare (es: "menu_item_updated")
    
    Ritorno:
    - Observable<T> = emette dati di tipo T quando l'evento arriva
    
    Questo metodo è GENERICO (usa TypeScript generics <T>)
    Possiamo usarlo per qualsiasi tipo di evento e qualsiasi tipo di dato
  */
  public listen<T>(eventName: string): Observable<T> {
    /*
      CREA UN OBSERVABLE CUSTOM
      new Observable<T>(subscriber => { ... })
      
      Observable è un pattern per flussi di dati asincroni
      subscriber = oggetto che riceve i dati e li propaga agli ascoltatori
      
      Cosa fa questo Observable?
      1. Si connette al socket se non già connesso
      2. Registra un handler per l'evento specifico
      3. Quando l'evento arriva, chiama subscriber.next(data)
      4. Gli iscritti all'Observable ricevono i dati
      5. Quando l'Observable viene cancellato, rimuove il handler
    */
    return new Observable<T>(subscriber => {
      /*
        CHECK: CONNESSIONE STABILITA?
        if (!this.socket) this.connect()
        
        Se il socket non esiste ancora (non connesso):
        Chiama connect() per stabilire la connessione
        
        Questo assicura che anche se listen() è chiamato prima di connect(),
        la connessione viene istituita automaticamente
      */
      if (!this.socket) this.connect();

      /*
        CREA UN HANDLER PER L'EVENTO
        const handler = (data: T) => { ... }
        
        Questo handler sarà chiamato ogni volta che il server emette l'evento
        data: i dati inviati dal server (tipo T)
        
        Dentro il handler:
        this.ngZone.run(() => subscriber.next(data))
        
        ngZone.run() assicura che Angular consideri questo un cambiamento
        subscriber.next(data) propaga i dati a chi sta ascoltando l'Observable
        
        Perché ngZone.run()?
        Events da WebSocket arrivano FUORI dalla Angular zone
        Se non li rimettiamo dentro, Angular non sa che deve re-renderizzare
        Risultato: il template non si aggiorna anche se abbiamo nuovi dati
        
        Soluzione: ngZone.run() mette il cambio DENTRO la zone di Angular
        Così Angular sa di fare change detection e aggiornare il template
      */
      const handler = (data: T) => {
        this.ngZone.run(() => subscriber.next(data));
      };

      /*
        REGISTRA IL HANDLER CON IL SOCKET
        this.socket?.on(eventName, handler)
        
        ? = optional chaining, solo se socket esiste
        .on(eventName, handler) dice al socket:
        "quando l'evento 'eventName' arriva dal server, chiama handler"
        
        Esempi:
        - socket.on('menu_item_updated', handler)
        - socket.on('menu_item_sold_out', handler)
        - socket.on('menu_reset', handler)
      */
      this.socket?.on(eventName, handler);

      /*
        PULIZIA QUANDO L'OBSERVABLE VIENE CANCELLATO
        return () => { ... }
        
        Quando l'Observable viene distrutto (il subscriber si disiscrive),
        questa funzione di cleanup viene eseguita
        
        Cosa fa?
        this.socket?.off(eventName, handler)
        
        .off() rimuove il listener per l'evento
        Evita memory leak: se non rimuoviamo i listener,
        rimangono attivi in memoria anche quando non servono più
        
        Questa è una best practice per gli Observable:
        "subscribe crea una risorsa → unsubscribe cancella la risorsa"
      */
      return () => {
        this.socket?.off(eventName, handler);
      };
    });
  }

  /*
    METODO PUBLIC - DISCONNETTI MANUALMENTE
    Chiude la connessione WebSocket e pulisce le risorse
    Usato quando l'utente esce dall'app o logout
  */
  public disconnect(): void {
    /*
      DISCONNETTI IL SOCKET
      this.socket?.disconnect()
      
      ? = optional chaining, solo se socket esiste
      Chiude la connessione al server
      Stoppa l'invio/ricezione di dati
    */
    this.socket?.disconnect();

    /*
      PULISCI LA VARIABILE
      this.socket = undefined
      
      Imposta socket a undefined
      Questo permette a future chiamate a connect() di creare una nuova connessione
      (il check "if (this.socket) return" fallirà perché socket = undefined)
    */
    this.socket = undefined;

    /*
      LOG: DISCONNESSIONE MANUALE
      Info che la disconnessione è stata fatta intenzionalmente dall'utente
      Non è un errore, è una azione normale (es: logout, chiusura app)
    */
    console.log('ℹ️ SocketService: Disconnesso manualmente');
  }
}

/*
  FLUSSO COMPLETO DELLA COMUNICAZIONE WEBSOCKET:
  
  1. INIZIALIZZAZIONE (al startup dell'app)
     MenuDataService.constructor()
     → Chiama socketService.connect()
     → Socket si connette al backend
     → Server notifico "✅ Connesso"
  
  2. SETUP DEI LISTENER (sempre in MenuDataService.constructor)
     → socketService.listen('menu_item_updated')
     → socketService.listen('menu_item_sold_out')
     → socketService.listen('menu_reset')
     
     Ogni listen() crea un Observable che rimane in ascolto
  
  3. EVENTO DAL SERVER (ad esempio: prezzo cambia)
     → Backend emette: socket.emit('menu_item_updated', {...})
     → Tutti i client connessi ricevono l'evento
  
  4. HANDLER ESEGUITO
     → Socket.on('menu_item_updated') si attiva
     → handler(data) viene eseguito
     → ngZone.run(() => subscriber.next(data))
     → Angular sa che qualcosa è cambiato
  
  5. PROPAGAZIONE AI SUBSCRIBER
     → Observable emette i dati
     → MenuDataService.updateMenuItemLocally() riceve i dati
     → Menu in cache viene aggiornato
     → BehaviorSubject emette il nuovo menu
  
  6. UI AGGIORNATA
     → Menu component riceve il nuovo menu
     → Template si ri-renderizza
     → Utente vede il menu aggiornato in tempo reale
  
  TUTTO ACCADE IN < 100ms !!!
  
  7. DISCONNESSIONE (al logout/chiusura app)
     → socketService.disconnect()
     → Socket si disconnette dal server
     → Handler rimossi (cleanup)
     → Risorse liberate
  
  VANTAGGI DI QUESTO PATTERN:
  - Observable = facile da sottoscrivere/disiscrivere
  - ngZone.run() = integrazione perfetta con Angular
  - Cleanup automatico = niente memory leak
  - Generico <T> = riusabile per qualsiasi tipo di evento
  - Encapsulation = componenti non sanno come funziona il socket
  
  USO NEL CODICE:
  
  MenuDataService:
  this.socketService.listen<UpdatedItem>('menu_item_updated')
    .subscribe(updatedItem => {
      this.updateMenuItemLocally(updatedItem);
    });
  
  Finché il subscribe è attivo, continua ad ascoltare
  Quando il servizio viene distrutto, l'Observable si disiscrive automaticamente
  E il handler viene rimosso dal socket (cleanup)
*/