import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '@env/environment';

// Definiamo l'interfaccia di risposta
export interface PublicMenuData {
  categories: any[]; // Questo array conterrà i piatti annidati
  allergens: any[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuDataService {

  // !!! METTI QUI L'URL DEL TUO SERVER BACKEND !!!
  private apiUrl = `${environment.apiUrl}/public/menu-data`; 

  constructor(private http: HttpClient) {}

  // Unica chiamata che carica tutto
  getMenuData(): Observable<PublicMenuData> {
    return this.http.get<PublicMenuData>(this.apiUrl).pipe(
      tap(data => console.log('Dati ricevuti dal server:', data)) // Utile per debug
    );
  }
}