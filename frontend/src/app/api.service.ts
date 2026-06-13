import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }

  verify2fa(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/verify-2fa`, data);
  }

  saveFlight(data: any, token: string): Observable<any> {
    const headers = { 'Authorization': `Bearer ${token}` };
    const mappedData = {
      origen: data.origin,
      destino: data.destination,
      fechaIda: data.departure_date,
      fechaRegreso: data.return_date,
      numPasajeros: data.passengers
    };
    return this.http.post(
      'https://75c2bb60-0974-41f3-91fd-881b13f2a237.mock.pstmn.io/vuelos',
      mappedData,
      { headers }
    );
  }

  getReservations(): Observable<any> {
    return this.http.get(
      'https://bfc26515-244a-4fdd-a458-f7fc70ff91bd.mock.pstmn.io/Agencia/Reserva'
    );
  }

  getFlight(id: number, token: string): Observable<any> {
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.get(`${this.apiUrl}/flights/${id}`, { headers });
  }
}
