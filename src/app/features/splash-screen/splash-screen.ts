/*
  COMPONENTE SPLASH SCREEN
  Gestisce l'animazione di apertura porte e l'emissione dell'evento al termine
  Componente standalone con OnPush ChangeDetectionStrategy per prestazioni ottimali
*/

import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

/*
  DECORATOR @Component
  selector: 'app-splash-screen' = tag HTML per usare questo componente
  standalone: true = componente standalone (non necessita di NgModule)
  imports: [CommonModule, TranslateModule] = moduli disponibili
  templateUrl: './splash-screen.html' = file HTML del template
  styleUrl: './splash-screen.scss' = file SCSS degli stili
  changeDetection: ChangeDetectionStrategy.OnPush = ottimizzazione performance
*/
@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './splash-screen.html',
  styleUrl: './splash-screen.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SplashScreen {
  /*
    OUTPUT EVENT EMITTER
    @Output() = rende questa proprietà un evento che il parent component può ascoltare
    EventEmitter<void> = emette un evento senza dati (void = niente)
    
    Nel parent component (menu.ts):
    (animationFinished)="onSplashFinished()"
    
    Quando questo evento viene emesso, chiama onSplashFinished() nel parent
  */
  @Output() animationFinished = new EventEmitter<void>();

  /*
    FLAG PER CONTROLLARE L'ANIMAZIONE
    false = porte chiuse, logo invisibile, hint visibile
    true = porte si aprono, logo appare, hint scompare
    
    Nel template HTML:
    [class.opening]="startAnimation"
    Quando è true, aggiunge la classe CSS 'opening' che attiva le animazioni SCSS
  */
  startAnimation = false;

  /*
    METODO PUBLIC - AVVIA L'ANIMAZIONE DI APERTURA
    Viene chiamato dal template quando l'utente clicca:
    (click)="startOpening()"
  */
  startOpening(): void {
    /*
      ATTIVA LE ANIMAZIONI
      Quando startAnimation diventa true:
      1. Nel template, [class.opening]="startAnimation" aggiunge la classe 'opening'
      2. I CSS (con @at-root .splash-wrapper.opening) attivano le transizioni
      3. Le porte iniziano a scorrere ai lati
      4. Il logo appare gradualmente
      5. L'hint scompare
    */
    this.startAnimation = true;

    /*
      TIMELINE DELLE ANIMAZIONI (gestita interamente dal CSS)
      
      0.0s: startAnimation diventa true, classe 'opening' aggiunta
      
      0.0-1.0s: ANIMAZIONE PORTE
      - Porte scivolano ai lati con transform: translateX(±101%)
      - Durata: 1s con cubic-bezier(0.6, 0.04, 0.98, 0.335)
      - Effetto: veloci all'inizio, lente alla fine
      
      0.4s: LOGO APPARE
      - Dopo 0.4s di delay, il logo inizia ad apparire
      - opacity: 0 → 1 in 0.5s
      - Overlay luminoso (::before) appare gradualmente
      
      0.4-1.2s: ANIMAZIONE GALLEGGIAMENTO LOGO
      - While doors are opening, il logo fa il movimento logoFloatShort
      - Dura 0.8s, fa un movimento su/giù con legger scale
      
      1.4s: LOGO INIZIA A SCOMPARIRE
      - Inizia l'animazione logoFadeOut
      - opacity: 1 → 0 in 0.5s
      - transform: scale(1) → scale(0.8)
      
      0.9s: FADE OUT DELL'INTERO WRAPPER (con 0.9s di delay, quindi 1.8s totale)
      - L'intero componente inizia a scomparire
      - opacity: 1 → 0 in 0.6s
      - backdrop-filter: blur appare per effetto elegante
      
      TOTAL: ~2.4 secondi dall'inizio
    */
    
    /*
      EMIT DELL'EVENTO DOPO CHE L'ANIMAZIONE È COMPLETA
      Settiamo il timeout a 2400ms (2.4 secondi) per essere sicuri che
      tutte le animazioni CSS siano finite prima di emettere l'evento
      
      Quando questo evento viene emesso:
      1. Il parent component (menu.ts) riceve l'evento tramite (animationFinished)
      2. Chiama onSplashFinished()
      3. isSplashing diventa false
      4. Condizione @if (isSplashing) diventa false
      5. Il componente splash-screen viene rimosso dal DOM
      6. Il menu principale diventa visibile
    */
    setTimeout(() => {
      this.animationFinished.emit();
    }, 2400);
  }
}

/*
  FLUSSO COMPLETO DEL COMPONENTE:
  
  1. CARICAMENTO INIZIALE
     - startAnimation = false
     - CSS non applica la classe 'opening'
     - Porte chiuse, logo invisibile, hint pulsante visibile
  
  2. UTENTE CLICCA OVUNQUE
     - Evento (click)="startOpening()" si attiva
     - startOpening() viene eseguito
  
  3. ANIMAZIONE INIZIA
     - startAnimation = true
     - Template applica [class.opening]="startAnimation"
     - CSS anima le porte, logo e hint
     - setTimeout conta i 2.4 secondi
  
  4. ANIMAZIONE COMPLETA (dopo 2.4s)
     - animationFinished.emit() viene chiamato
     - Parent component riceve l'evento
     - onSplashFinished() nel parent viene eseguito
     - isSplashing diventa false
     - @if (isSplashing) nel template del parent diventa false
     - Questo componente viene rimosso dal DOM
     - Menu principale diventa visibile
  
  NOTA: Tutte le transizioni e animazioni sono gestite dal CSS/SCSS
  TypeScript solo controlla quando iniziare e quando finire
*/