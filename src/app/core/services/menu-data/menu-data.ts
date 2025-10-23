// src/app/core/services/menu-data/menu-data.ts
import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { tap, filter } from 'rxjs/operators';
import { environment } from '@env/environment';
import { SocketService } from '@app/core/services/socket-service/socket';

// Definiamo le interfacce
export interface MenuItem {
  _id: string;
  name: { it: string; en: string; fr: string };
  description?: { it: string; en: string; fr: string };
  price: number;
  quantitaDisponibile: number;
  disponibile: boolean;
  frozen?: boolean;
  allergens?: any[];
  ingredients?: { it: string; en: string; fr: string };
}

export interface MenuCategory {
  _id: string;
  name: { it: string; en: string; fr: string };
  items: MenuItem[];
}

export interface PublicMenuData {
  categories: MenuCategory[];
  allergens: any[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuDataService implements OnDestroy {
  
  private readonly apiUrl = `${environment.apiUrl}/public/menu-data`;
  
  // BehaviorSubject per mantenere i dati sempre aggiornati
  private menuDataSubject = new BehaviorSubject<PublicMenuData | null>(null);
  public menuData$: Observable<PublicMenuData> = this.menuDataSubject.pipe(
    filter(data => data !== null) // ✅ Filtra i null
  ) as Observable<PublicMenuData>;
  
  private subscriptions = new Subscription();

  constructor(
    private http: HttpClient,
    private socketService: SocketService
  ) {
    this.initializeSocketListeners();
  }

  /**
   * Carica i dati del menu dal backend
   */
  getMenuData(): Observable<PublicMenuData> {
    // Se i dati sono già caricati, ritorna il BehaviorSubject filtrato
    const cached = this.menuDataSubject.value;
    if (cached) {
      return this.menuData$;
    }

    // Altrimenti, carica dal backend
    return this.http.get<PublicMenuData>(this.apiUrl).pipe(
      tap(data => {
        console.log('[MenuDataService] Menu caricato dal backend:', data);
        this.menuDataSubject.next(data);
      })
    );
  }

  /**
   * Inizializza i listener Socket per gli aggiornamenti in tempo reale
   */
  private initializeSocketListeners(): void {
    // Connetti il socket
    this.socketService.connect();

    // Ascolta aggiornamenti su singoli piatti del menu
    this.subscriptions.add(
      this.socketService.listen<{
        _id: string;
        quantitaDisponibile: number;
        disponibile: boolean;
        name?: { it: string; en: string; fr: string };
      }>('menu_item_updated').subscribe(updatedItem => {
        console.log('[MenuDataService] Menu item aggiornato via Socket:', updatedItem);
        this.updateMenuItemLocally(updatedItem);
      })
    );

    // Ascolta quando un piatto è completamente esaurito
    this.subscriptions.add(
      this.socketService.listen<{ _id: string }>('menu_item_sold_out').subscribe(data => {
        console.log('[MenuDataService] Piatto esaurito:', data._id);
        this.updateMenuItemLocally({
          _id: data._id,
          quantitaDisponibile: 0,
          disponibile: false
        });
      })
    );

    // Ascolta quando il menu viene resettato
    this.subscriptions.add(
      this.socketService.listen<PublicMenuData>('menu_reset').subscribe(newMenuData => {
        console.log('[MenuDataService] Menu resettato:', newMenuData);
        this.menuDataSubject.next(newMenuData);
      })
    );
  }

  /**
   * Aggiorna un piatto nel menu locale (in modo immutabile)
   */
  private updateMenuItemLocally(updatedItem: {
    _id: string;
    quantitaDisponibile: number;
    disponibile: boolean;
  }): void {
    const currentMenu = this.menuDataSubject.value;
    
    if (!currentMenu) {
      console.warn('[MenuDataService] Menu non caricato ancora');
      return;
    }

    // ✅ Crea una copia immutabile del menu con tipizzazione corretta
    const updatedMenu: PublicMenuData = {
      ...currentMenu,
      categories: currentMenu.categories.map((category: MenuCategory) => ({
        ...category,
        items: (category.items || []).map((item: MenuItem) => {
          if (item._id === updatedItem._id) {
            console.log(
              `[MenuDataService] Aggiornamento piatto ${item._id}: ` +
              `quantita=${updatedItem.quantitaDisponibile}, ` +
              `disponibile=${updatedItem.disponibile}`
            );
            // ✅ Aggiorna il piatto con tipizzazione corretta
            return {
              ...item,
              quantitaDisponibile: updatedItem.quantitaDisponibile,
              disponibile: updatedItem.disponibile
            };
          }
          return item;
        })
      }))
    };

    // Emetti i dati aggiornati
    this.menuDataSubject.next(updatedMenu);
    console.log('[MenuDataService] Menu aggiornato e emesso');
  }

  /**
   * Forza il ricaricamento del menu dal backend
   */
  reloadMenu(): Observable<PublicMenuData> {
    return this.http.get<PublicMenuData>(this.apiUrl).pipe(
      tap(data => {
        console.log('[MenuDataService] Menu ricaricato manualmente:', data);
        this.menuDataSubject.next(data);
      })
    );
  }

  /**
   * Ottieni i dati attuali senza Observable (se necessario)
   */
  getCurrentMenuData(): PublicMenuData | null {
    return this.menuDataSubject.value;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
