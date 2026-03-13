import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, timer, retry, catchError, EMPTY } from 'rxjs';
import { SensorData } from '../entities/sensor_data';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket$: WebSocketSubject<SensorData> | null = null;
  private readonly RECONNECT_INTERVAL = 3000; // 3 seconds
  private readonly WS_URL = environment.websocketUrl;

  /**
   * Returns a stream of sensor data that automatically reconnects on failure.
   */
  getMessages(): Observable<SensorData> {
    return new Observable<SensorData>(observer => {
      const socket$ = this.connect();

      const sub = socket$.subscribe({
        next: val => observer.next(val),
        error: err => observer.error(err),
        complete: () => observer.error('closed')  // treat close as error so retry fires
      });

      return () => {
        sub.unsubscribe();
        this.socket$ = null;  // force a new subject on next connect()
      };
    }).pipe(
      retry({
        delay: (error) => {
          console.warn('WebSocket disconnected. Retrying in 3s...', error);
          this.socket$ = null;  // ensure connect() creates a fresh subject
          return timer(this.RECONNECT_INTERVAL);
        },
        resetOnSuccess: true
      }),
      catchError(err => {
        console.error('WebSocket permanently failed:', err);
        return EMPTY;
      })
    );
  }

  private connect(): WebSocketSubject<SensorData> {
    // If the socket doesn't exist or was closed, create a new one
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket({
        url: this.WS_URL,
        // Optional: Run logic when the connection is established
        openObserver: {
          next: () => console.log('WebSocket Connected to Python Server')
        },
        // Optional: Run logic when the connection closes
        closeObserver: {
          next: () => {
            console.warn('WebSocket Connection Closed');
          }
        }
      });
    }
    return this.socket$;
  }
}