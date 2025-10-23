// src/app/features/splash-screen/splash-screen.ts
import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './splash-screen.html',
  styleUrl: './splash-screen.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SplashScreen {
  @Output() animationFinished = new EventEmitter<void>();

  startAnimation = false;

  /**
   * ✅ Avvia l'animazione di apertura elegante
   */
  startOpening(): void {
    this.startAnimation = true;

    // ✅ Timeline:
    // - 0.4s: doors start opening + center overlay appears
    // - 1.0s: doors fully opened
    // - 0.9s: fade out begins (with delay)
    // - 1.5s: total animation complete
    // Total: ~2.4s per sicurezza
    
    setTimeout(() => {
      this.animationFinished.emit();
    }, 2400);
  }
}
