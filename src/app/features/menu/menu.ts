import { Component, OnInit, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
// Importa i componenti figli
import { SplashScreen } from '@app/features/splash-screen/splash-screen'; 
import { LanguageSwitcher } from '@app/features/language-switcher/language-switcher';
// Importa il nostro nuovo Service
import { MenuDataService, PublicMenuData } from '@app/core/services/menu-data/menu-data';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faInstagram, faFacebook, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

interface MenuItem {
  id: string;
  price: number;
  allergens: number[];
  frozen?: boolean;
}
interface MenuCategory {
  id: string;
  items: MenuItem[];
}
interface Allergen {
  id: string;
  number: number;
}

@Component({
  selector: 'app-menu',
  imports: [CommonModule, TranslateModule, SplashScreen, LanguageSwitcher, FontAwesomeModule ],
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu implements OnInit{
  public publicData$?: Observable<PublicMenuData>;
  public isSplashing = true;
  public currentLang: string;

  faInstagram = faInstagram;
  faFacebook = faFacebook;
  faTwitter = faTwitter;
  faArrowUp = faArrowUp;

  public showScrollButton = false;

  constructor(
    private menuDataService: MenuDataService, // Inietta il service
    private translate: TranslateService
  ) {
    // Imposta la lingua corrente
    this.currentLang = this.translate.currentLang || this.translate.defaultLang || 'it';
    
    // Ascolta i cambi di lingua
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
    });
  }

  ngOnInit(): void {
    // Carichiamo i dati del menu dal file JSON
    this.publicData$ = this.menuDataService.getMenuData();
  }

  // Questo metodo viene chiamato dallo splash screen quando finisce l'animazione
  onSplashFinished(): void {
    this.isSplashing = false;
  }

  /**
   * Prende l'array di oggetti allergene e restituisce solo
   * una stringa di numeri (es. "1, 4, 7")
   */
  public getAllergenNumbers(allergens: any[]): string {
    if (!allergens || allergens.length === 0) {
      return ''; // Ritorna stringa vuota se non ci sono allergeni
    }
    // Questo è lo stesso codice che avevi nel template
    return allergens.map(a => a.number).join(', ');
  }

  /**
   * HostListener che controlla lo scroll della finestra
   */
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Mostra il tasto se l'utente ha scrollato più di 300px
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollPosition > 300) {
      this.showScrollButton = true;
    } else {
      this.showScrollButton = false;
    }
  }

  /**
   * Metodo chiamato al click del tasto per tornare su
   */
  public scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
