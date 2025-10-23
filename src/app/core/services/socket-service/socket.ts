// src/app/core/services/socket-service/socket.service.ts
import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket?: Socket;
  private readonly backendUrl = environment.apiUrl;

  constructor(private ngZone: NgZone) {}

  /**
   * Connetti il socket al backend
   */
  connect(): void {
    if (this.socket) return;

    this.socket = io(this.backendUrl, {
      reconnectionAttempts: 5,
      timeout: 15000,
    });

    console.log(`[SocketService] Tenta connessione a: ${this.backendUrl}`);

    this.socket.on('connect', () => {
      console.log('✅ SocketService: Connesso con successo!');
    });

    this.socket.on('disconnect', (reason: string) => {
      console.warn('❌ SocketService: Disconnesso:', reason);
    });

    this.socket.on('connect_error', (err: any) => {
      console.error('❌ SocketService: Errore Connessione:', err.message);
    });
  }

  /**
   * Ascolta eventi dal server tramite observable
   */
  listen<T>(eventName: string): Observable<T> {
    return new Observable<T>(subscriber => {
      if (!this.socket) this.connect();
      
      const handler = (data: T) => {
        this.ngZone.run(() => subscriber.next(data));
      };
      
      this.socket?.on(eventName, handler);

      return () => {
        this.socket?.off(eventName, handler);
      };
    });
  }

  /**
   * Disconnessione manuale
   */
  disconnect(): void {
    this.socket?.disconnect();
    this.socket = undefined;
    console.log('ℹ️ SocketService: Disconnesso manualmente');
  }
}
