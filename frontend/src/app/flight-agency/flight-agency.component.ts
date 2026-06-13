import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-flight-agency',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './flight-agency.component.html',
  styleUrls: ['./flight-agency.component.css']
})
export class FlightAgencyComponent implements OnInit {
  // Datos del formulario (enlazados con [(ngModel)] en el HTML)
  flight = {
    destination: '',
    origin: '',
    departure_date: '',
    return_date: '',
    passengers: 1
  };

  successMessage = '';
  errorMessage = '';
  lastReservationId: number | null = null;
  reservation: any = null;       // Última reserva guardada
  reservations: any[] = [];       // Lista que se muestra al dar clic en "Ver reservas"
  showReservation = false;        // Controla si se muestra el panel de reservas

  constructor(private api: ApiService, private router: Router) {}

  // Al entrar a la página: si no hay token JWT, redirige al login
  ngOnInit(): void {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  /**
   * Se ejecuta al enviar el formulario "Reservar Vuelo".
   * 1. Toma los datos del formulario
   * 2. Llama a api.saveFlight() → POST al mock de Postman (/vuelos)
   * 3. Si responde OK, muestra mensaje de éxito y el botón "Ver reservas"
   */
  bookFlight() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const bookedFlight = { ...this.flight };

    this.api.saveFlight(bookedFlight, token).subscribe({
      next: (res) => {
        // Postman puede devolver res.vuelo o res.vuelos[0] según el ejemplo configurado
        const saved = res.vuelo ?? res.vuelos?.[0];

        this.successMessage = '¡Reserva de vuelo guardada con éxito!';
        this.errorMessage = '';
        this.lastReservationId = saved?.id ?? res.formId ?? null;

        // Convierte campos del mock (español) al formato que usa el HTML (inglés)
        this.reservation = this.mapReservation(saved) ?? this.mapReservation({
          origen: bookedFlight.origin,
          destino: bookedFlight.destination,
          fechaIda: bookedFlight.departure_date,
          fechaRegreso: bookedFlight.return_date,
          numPasajeros: bookedFlight.passengers
        });

        // Limpia el formulario después de reservar
        this.flight = {
          destination: '',
          origin: '',
          departure_date: '',
          return_date: '',
          passengers: 1
        };

        this.showReservation = false;
      },
      error: (err) => {
        const status = err.status ? ` (${err.status})` : '';
        this.errorMessage =
          (err.error?.message || err.error?.error || err.message || 'Error al guardar el vuelo') + status;
        this.successMessage = '';
      }
    });
  }

  /**
   * Se ejecuta al dar clic en "Ver reservas".
   * Llama a api.getReservations() → GET al mock de Postman (/Agencia/Reserva)
   * y muestra el JSON fijo configurado en Postman (array res.vuelos).
   */
  viewReservation() {
    this.api.getReservations().subscribe({
      next: (res) => {
        const list = res.vuelos ?? [];

        if (list.length === 0) {
          this.errorMessage = 'No hay reservas registradas';
          this.showReservation = false;
          this.reservations = [];
          return;
        }

        this.reservations = list.map((item: any) => this.mapReservation(item));
        this.reservation = this.reservations[0];
        this.showReservation = true;
        this.errorMessage = '';
      },
      error: (err) => {
        const status = err.status ? ` (${err.status})` : '';
        this.errorMessage =
          (err.error?.message || err.error?.error || err.message || 'Error al cargar las reservas') + status;
        this.showReservation = false;
      }
    });
  }

  hideReservation() {
    this.showReservation = false;
  }

  /**
   * Traduce los nombres de campos del mock/backend (español)
   * al formato que usa la plantilla HTML (inglés).
   * Ejemplo: origen → origin, fechaIda → departure_date
   */
  private mapReservation(raw: any) {
    if (!raw) return null;

    return {
      id: raw.id,
      origin: raw.origen ?? raw.origin,
      destination: raw.destino ?? raw.destination,
      departure_date: raw.fechaIda ?? raw.departure_date,
      return_date: raw.fechaRegreso ?? raw.return_date,
      passengers: raw.numPasajeros ?? raw.passengers,
      created_at: raw.created_at ?? null
    };
  }
}
