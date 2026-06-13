import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';
  private postmanSaveUrl = 'https://75c2bb60-0974-41f3-91fd-881b13f2a237.mock.pstmn.io/vuelos';
  private postmanReservationsUrl = 'https://bfc26515-244a-4fdd-a458-f7fc70ff91bd.mock.pstmn.io/Agencia/Reserva';

  constructor(private http: HttpClient) { }

  // --- Autenticación: va al backend local (MySQL), NO a Postman ---

  // Registro: guarda el usuario en MySQL con contraseña hasheada (bcrypt)
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  // Login paso 1: envía { username, password } para validarlos en el backend
  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }

  // Login paso 2: valida el código 2FA y devuelve el JWT si es correcto
  verify2fa(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/verify-2fa`, data);
  }

  // --- Vuelos: van al mock de Postman ---

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
      this.postmanSaveUrl,
      mappedData,
      { headers }
    );
  }

  getReservations(): Observable<any> {
    return this.http.get(this.postmanReservationsUrl);
  }

  getFlight(id: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/flights/${id}`, { headers });
  }
}
