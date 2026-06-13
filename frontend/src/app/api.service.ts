import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const mappedData = {
      origen: data.origin,
      destino: data.destination,
      fechaIda: data.departure_date,
      fechaRegreso: data.return_date,
      numPasajeros: data.passengers
    };

    return this.http.post(
      `${this.apiUrl}/flights/reservations`,
      mappedData,
      { headers }
    );
  }

  getReservations(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(
      `${this.apiUrl}/flights/reservations`,
      { headers }
    );
  }

  getFlight(id: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/flights/${id}`, { headers });
  }
}
