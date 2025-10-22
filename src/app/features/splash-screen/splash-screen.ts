import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash-screen',
  imports: [CommonModule],
  templateUrl: './splash-screen.html',
  styleUrl: './splash-screen.scss'
})
export class SplashScreen implements OnInit{
  @Output() animationFinished = new EventEmitter<void>();
  startAnimation = false;

  ngOnInit(): void {
    // Puoi ritardare l'avvio o avviarlo al click
    // Per un test, avviamolo dopo 1 secondo
    setTimeout(() => this.startOpening(), 1000);
  }

  startOpening(): void {
    if (this.startAnimation) return; // Previene doppi click

    this.startAnimation = true;

    // Emette l'evento DOPO che l'animazione CSS è finita
    // La nostra animazione dura 0.8s (transform) + 1s (opacity delay) = 1.8s
    setTimeout(() => {
      this.animationFinished.emit();
    }, 1800); 
  }
}
