// src/app/features/splash-screen/splash-screen.ts
import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash-screen.html',
  styleUrl: './splash-screen.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SplashScreen {
  @Output() animationFinished = new EventEmitter<void>();

  startAnimation = false;

  /**
   * Avvia l'animazione di apertura delle porte
   */
  startOpening(): void {
    this.startAnimation = true;
    
    // ✅ Emetti l'evento quando l'animazione finisce
    // La somma dei tempi è: 0.8s (apertura porte) + 0.5s (fade-out) + 1s (delay) = 2.3s
    // Arrotondiamo a 2500ms per sicurezza
    setTimeout(() => {
      this.animationFinished.emit();
    }, 2500);
  }
}
