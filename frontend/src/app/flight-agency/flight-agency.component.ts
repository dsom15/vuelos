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
  reservation: any = null;
  reservations: any[] = [];
  showReservation = false;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  bookFlight() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const bookedFlight = { ...this.flight };

    this.api.saveFlight(bookedFlight, token).subscribe({
      next: (res) => {
        this.successMessage = res.message || '¡Reserva de vuelo guardada con éxito!';
        this.errorMessage = '';
        this.lastReservationId = res.vuelo?.id ?? null;
        this.reservation = this.mapReservation(res.vuelo);
        this.showReservation = false;
        this.flight = { destination: '', origin: '', departure_date: '', return_date: '', passengers: 1 };
      },
      error: (err) => {
        const status = err.status ? ` (${err.status})` : '';
        this.errorMessage = (err.error?.message || err.error?.error || err.message || 'Error al guardar el vuelo') + status;
      }
    });
  }

  viewReservation() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.api.getReservations(token).subscribe({
      next: (res) => {
        const list = Array.isArray(res)
          ? res
          : (res.vuelos ?? res.reservations ?? res.data ?? []);

        if (list.length === 0) {
          this.errorMessage = 'No tienes reservas guardadas';
          this.showReservation = false;
          return;
        }

        this.reservations = list.map((item: any, index: number) =>
          this.mapReservation({ ...item, id: item.id ?? item.formId ?? index + 1 })
        );
        this.reservation = this.reservations[0];
        this.showReservation = true;
        this.errorMessage = '';
      },
      error: (err) => {
        const status = err.status ? ` (${err.status})` : '';
        this.errorMessage = (err.error?.error || err.message || 'Error al cargar la reserva') + status;
        this.showReservation = false;
      }
    });
  }

  hideReservation() {
    this.showReservation = false;
  }

  private mapReservation(raw: any) {
    if (!raw) return null;
    return {
      id: raw.id ?? raw.formId,
      origin: raw.origin ?? raw.origen,
      destination: raw.destination ?? raw.destino,
      departure_date: raw.departure_date ?? raw.fechaIda ?? raw.fechaida,
      return_date: raw.return_date ?? raw.fechaRegreso ?? raw.fecharegreso,
      passengers: raw.passengers ?? raw.numPasajeros ?? raw.numpasajeros,
      created_at: raw.created_at
    };
  }
}
