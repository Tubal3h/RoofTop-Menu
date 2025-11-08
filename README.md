# Menu - Spritzeria Barberini

Applicazione Angular per la visualizzazione del menu digitale del ristorante Spritzeria Barberini con supporto multilingua, aggiornamenti in tempo reale e design elegante.

## Descrizione del Progetto

**Menu** è un'applicazione web moderna e responsiva realizzata con Angular 20 che permette ai clienti di visualizzare il menu di un ristorante di lusso. L'app supporta tre lingue (italiano, inglese, francese), dispone di animazioni eleganti e aggiornamenti in tempo reale degli articoli disponibili tramite WebSocket.

### Caratteristiche Principali

- **Design Lussuoso**: Palette di colori premium (oro e nero) con font eleganti (Playfair Display e Montserrat)
- **Multilingua**: Supporto completo per italiano, inglese e francese con cambio lingua dinamico
- **Animazioni Eleganti**: Splash screen con apertura porte, effetti hover, transizioni smooth
- **Tempo Reale**: Aggiornamenti istantanei degli articoli tramite WebSocket (Socket.io)
- **Responsive**: Ottimizzato per desktop, tablet e mobile
- **Accessibilità**: Supporto per screen reader, ARIA labels, prefers-reduced-motion
- **Dark Mode**: Design optimizzato per OLED e dark mode
- **Performance**: OnPush ChangeDetectionStrategy, caching intelligente, lazy loading

### Stack Tecnologico

- **Frontend Framework**: Angular 20 (Standalone Components)
- **Linguaggio**: TypeScript
- **Styling**: SCSS con variabili CSS
- **Font**: Google Fonts (Playfair Display, Montserrat)
- **Icons**: FontAwesome
- **Traduzioni**: ngx-translate
- **Real-time**: Socket.io
- **HTTP**: HttpClient
- **State Management**: RxJS (Observables, BehaviorSubject)

## Struttura del Progetto

```
src/
├── app/
│   ├── core/
│   │   └── services/
│   │       ├── menu-data/
│   │       │   └── menu-data.ts          (Servizio gestione dati menu con caching)
│   │       └── socket-service/
│   │           └── socket.service.ts      (Servizio WebSocket in tempo reale)
│   ├── features/
│   │   ├── menu/
│   │   │   ├── menu.ts                   (Componente principale menu)
│   │   │   ├── menu.html                 (Template menu)
│   │   │   └── menu.scss                 (Stili menu)
│   │   ├── splash-screen/
│   │   │   ├── splash-screen.ts          (Componente splash screen)
│   │   │   ├── splash-screen.html        (Template splash)
│   │   │   └── splash-screen.scss        (Stili splash)
│   │   └── language-switcher/
│   │       ├── language-switcher.ts      (Componente cambio lingua)
│   │       ├── language-switcher.html    (Template switcher)
│   │       └── language-switcher.scss    (Stili switcher)
│   ├── app.ts                            (Componente root)
│   ├── app.html                          (Template root)
│   └── app.scss                          (Stili root)
├── styles.scss                           (Stili globali, variabili CSS)
├── main.ts                               (Bootstrap dell'app)
└── environment.ts                        (Configurazione environment)

assets/
├── i18n/
│   ├── it.json                           (Traduzioni italiano)
│   ├── en.json                           (Traduzioni inglese)
│   └── fr.json                           (Traduzioni francese)
├── images/
│   ├── logo.png                          (Logo dell'app)
│   ├── left-door.png                     (Porta sinistra splash)
│   └── right-door.png                    (Porta destra splash)
```

## Installazione e Setup

### Prerequisiti

- Node.js (v18 o superiore)
- npm o yarn
- Angular CLI v20 o superiore

### Passi di Installazione

1. **Clona il repository**
```bash
git clone <repository-url>
cd menu
```

2. **Installa le dipendenze**
```bash
npm install
```

3. **Configura l'environment**
Modifica `src/environment.ts` con l'URL del tuo backend:
```typescript
export const environment = {
  apiUrl: 'http://localhost:3000'  // URL del backend
};
```

4. **Avvia il server di sviluppo**
```bash
ng serve
```

5. **Apri il browser**
Naviga su `http://localhost:4200/`

## Sviluppo

### Server di Sviluppo

```bash
ng serve
```

L'app si ricaricherà automaticamente ogni volta che modifichi i file. Apri il browser su `http://localhost:4200/`.

### Generazione di Nuovi Componenti

```bash
ng generate component nome-componente
```

### Generazione di Nuovi Servizi

```bash
ng generate service core/services/nome-servizio
```

Per una lista completa dei comandi di scaffolding:
```bash
ng generate --help
```

## Build

### Build di Produzione

```bash
ng build
```

I file compilati verranno salvati nella cartella `dist/`. Il build di produzione è ottimizzato per performance e velocità con:
- Minificazione del codice
- Tree-shaking
- Lazy loading
- AOT compilation

### Build per Ambienti Specifici

```bash
ng build --configuration production
```

## Testing

### Unit Tests

Esegui i test unitari con Karma:
```bash
ng test
```

### End-to-End Tests (E2E)

Esegui i test end-to-end:
```bash
ng e2e
```

Nota: Angular CLI non include un framework E2E di default. Puoi scegliere tra Cypress, Playwright o Protractor.

## Configurazione

### Variabili CSS Globali (styles.scss)

```scss
:root {
  --font-primary: 'Montserrat', sans-serif;      /* Font principale */
  --font-headings: 'Playfair Display', serif;    /* Font titoli */
  
  --color-background: #121212;   /* Nero profondo */
  --color-text: #E0E0E0;         /* Bianco non abbagliante */
  --color-primary: #D4AF37;      /* Oro elegante */
  --color-border: #333;          /* Bordi discreti */
}
```

### Configurazione i18n (app.ts)

Le lingue supportate sono configurate nel componente root:
```typescript
translate.addLangs(['it', 'en', 'fr']);
translate.setDefaultLang('it');
```

### Configurazione WebSocket

La connessione WebSocket è gestita da `SocketService`:
```typescript
private readonly backendUrl = environment.apiUrl;
reconnectionAttempts: 5        // Tentativi di riconnessione
timeout: 15000                  // Timeout 15 secondi
```

## Architettura e Flussi

### Flusso di Caricamento Menu

1. **App Startup** → `app.ts` inizializza le lingue
2. **Menu Component** → Chiama `MenuDataService.getMenuData()`
3. **Caching** → Se in cache, ritorna subito; altrimenti HTTP GET
4. **Backend Response** → Dati menu arrivano dal server
5. **Data Processing** → Menu ordinato per prezzo
6. **Rendering** → Template renderizza categorie e articoli

### Flusso Aggiornamenti Real-time

1. **Server Event** → Backend emette `menu_item_updated` via Socket.io
2. **Socket Listener** → `SocketService.listen()` riceve l'evento
3. **Data Update** → `MenuDataService.updateMenuItemLocally()` aggiorna cache
4. **Observable Emit** → BehaviorSubject emette nuovo menu
5. **UI Update** → Component riceve dati e template si ri-renderizza

### Flusso Cambio Lingua

1. **User Click** → User clicca link nel `LanguageSwitcher`
2. **useLanguage()** → Chiama `TranslateService.use(lang)`
3. **Event Emission** → ngx-translate emette `onLangChange`
4. **Menu Update** → Menu component ascolta e aggiorna `currentLang`
5. **Template Re-render** → `getLocalizedText()` estrae testi nella nuova lingua

## Componenti Principali

### Menu Component (`menu.ts`)
- Gestisce il caricamento e visualizzazione del menu
- Implementa scroll-to-top con listener
- Integra language switcher e splash screen
- OnPush change detection per performance

### Splash Screen Component (`splash-screen.ts`)
- Animazione di apertura porte elegante
- Emette evento al termine animazione
- Responsive e accessibile

### Language Switcher Component (`language-switcher.ts`)
- Permette cambio lingua dinamico
- Evidenzia lingua attuale
- Effetti hover per UX

### Menu Data Service (`menu-data.ts`)
- Gestione centralizzata dati menu
- Caching intelligente
- Listener WebSocket per aggiornamenti real-time
- Aggiornamento immutabile per Angular change detection

### Socket Service (`socket.service.ts`)
- Gestione connessione WebSocket
- Observable pattern per gli eventi
- Cleanup automatico delle risorse
- Integrazione con Angular NgZone

## Performance

### Ottimizzazioni Implementate

- **OnPush ChangeDetectionStrategy**: Only check when input changes
- **Caching**: Menu in cache dopo primo caricamento
- **distinctUntilChanged()**: Evita emissioni duplicate
- **Track functions**: Ottimizza rendering in cicli @for
- **Lazy loading**: Componenti standalone
- **Tree-shaking**: Rimozione codice inutilizzato in build
- **Font display swap**: Evita FOUT (Flash of Unstyled Text)

## Accessibilità

- **ARIA Labels**: Per elementi interattivi
- **Alt Text**: Per tutte le immagini
- **prefers-reduced-motion**: Supporto per utenti sensibili alle animazioni
- **Color Contrast**: Ratios conformi a WCAG AA
- **Semantic HTML**: Struttura corretta con heading, lists, ecc.
- **Screen Reader Friendly**: role="presentation" per elementi decorativi

## Supporto Browser

- Chrome/Edge (v90+)
- Firefox (v88+)
- Safari (v15+)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Risoluzione Problemi

### Errore: "Cannot find module '@angular/...'
Soluzione: Esegui `npm install`

### WebSocket Connection Refused
Verifica che il backend sia online e che `environment.apiUrl` sia corretto

### Traduzioni Non Caricano
Verifica che i file JSON siano in `src/assets/i18n/`

### Problemi di Performance
Controlla la DevTools Performance e verifica che OnPush detection sia attivo

## Contribuire

Per contribuire al progetto:

1. Fork il repository
2. Crea un branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit i tuoi cambiamenti (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## Licenza

Questo progetto è licenziato sotto la MIT License - vedi il file LICENSE per i dettagli.

## Autore

**Macwell Tubale**
- Website: [macwelltubale.it](https://www.macwelltubale.it)
- GitHub: [@macwelltubale](https://github.com/macwelltubale)

## Contatti e Supporto

Per domande, bug report o feature requests, apri un issue nel repository.

## Changelog

### v1.0.0 (2025-11-08)
- ✅ Launch iniziale
- ✅ Supporto multilingua (IT, EN, FR)
- ✅ Animazione splash screen
- ✅ Aggiornamenti real-time WebSocket
- ✅ Design responsive
- ✅ Accessibilità WCAG AA
- ✅ Caching intelligente

## Risorse Utili

- [Angular Documentation](https://angular.dev)
- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [RxJS Documentation](https://rxjs.dev)
- [Socket.io Documentation](https://socket.io)
- [ngx-translate Documentation](https://github.com/ngx-translate/core)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Menu** - Bringing Digital Excellence to Restaurant Dining ✨
