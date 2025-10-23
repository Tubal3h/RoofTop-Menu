// src/app/features/menu/menu.ts
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

type SupportedLanguage = 'it' | 'en' | 'fr';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, TranslateModule, SplashScreen, LanguageSwitcher, FontAwesomeModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Menu implements OnInit, OnDestroy {
  public publicData$?: Observable<PublicMenuData>;
  public isSplashing = true;
  public currentLang: SupportedLanguage = 'it';

  faInstagram = faInstagram;
  faFacebook = faFacebook;
  faTwitter = faTwitter;
  faArrowUp = faArrowUp;

  public showScrollButton = false;

  constructor(
    private menuDataService: MenuDataService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentLang = (this.translate.currentLang || this.translate.defaultLang || 'it') as SupportedLanguage;
    
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang as SupportedLanguage;
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    // ✅ Applica l'ordinamento per prezzo dopo aver caricato i dati
    this.publicData$ = this.menuDataService.getMenuData().pipe(
      map(data => this.sortCategoriesByPrice(data))
    );
  }

  ngOnDestroy(): void {
    // Cleanup se necessario
  }

  /**
   * ✅ Ordina i piatti per prezzo all'interno di ogni categoria
   * Mantiene le categorie nello stesso ordine
   */
  private sortCategoriesByPrice(menuData: PublicMenuData): PublicMenuData {
    return {
      ...menuData,
      categories: menuData.categories.map(category => ({
        ...category,
        items: [...category.items].sort((a, b) => a.price - b.price) // Ordina per prezzo crescente
      }))
    };
  }

  onSplashFinished(): void {
    this.isSplashing = false;
    this.cdr.markForCheck();
  }

  public getLocalizedText(
    text: { it: string; en: string; fr: string } | undefined, 
    fallback: string = ''
  ): string {
    if (!text) return fallback;
    return text[this.currentLang] || text['it'] || fallback;
  }

  public getAllergenNumbers(allergens: any[]): string {
    if (!allergens || allergens.length === 0) {
      return '';
    }
    return allergens.map(a => a?.number).filter(n => n !== undefined).join(', ');
  }

  trackByCategoryId(_index: number, category: MenuCategory): string {
    return category._id;
  }

  trackByItemId(_index: number, item: MenuItem): string {
    return item._id;
  }

  trackByAllergenId(_index: number, allergen: any): string {
    return allergen._id || allergen.id;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollPosition > 300) {
      this.showScrollButton = true;
    } else {
      this.showScrollButton = false;
    }
    this.cdr.markForCheck();
  }

  public scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
