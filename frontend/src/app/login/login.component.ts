import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Datos que el usuario escribe en el formulario (paso 1)
  credentials = {
    username: '',
    password: ''
  };

  // Paso 1: usuario y contraseña | Paso 2: código 2FA
  step = 1;
  // ID devuelto por el backend cuando usuario/contraseña son correctos
  userId: number | null = null;
  // Código de 6 dígitos de la app autenticadora (Google Authenticator, etc.)
  twoFactorToken = '';
  errorMessage = '';

  constructor(private api: ApiService, private router: Router) {}

  /**
   * Paso 1 del login: envía usuario y contraseña al backend.
   * El backend los valida contra la tabla `users` en MySQL.
   * Si son correctos, responde con userId y pasamos al paso 2FA.
   * Si son incorrectos, muestra error (401 Invalid credentials).
   */
  login() {
    this.api.login(this.credentials).subscribe({
      next: (res) => {
        this.userId = res.userId;
        this.step = 2;
        this.errorMessage = '';
      },
      error: (err) => {
        // err.error.error viene del backend: "Invalid credentials"
        this.errorMessage = err.error?.error || 'Error al iniciar sesión';
      }
    });
  }

  /**
   * Paso 2 del login: valida el código 2FA.
   * Si es correcto, el backend devuelve un JWT y se guarda en localStorage.
   * Ese token se usa después para acceder a rutas protegidas.
   */
  verify2fa() {
    if (!this.userId) return;

    this.api.verify2fa({ userId: this.userId, token: this.twoFactorToken }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['/flight-agency']);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Token inválido';
      }
    });
  }
}
