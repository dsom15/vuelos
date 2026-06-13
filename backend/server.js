// Importa Express para crear el servidor HTTP
const express = require('express');
// Permite que Angular (puerto 4200) se conecte al backend (puerto 3000) sin error de CORS
const cors = require('cors');
// Rutas de autenticación: login, registro y 2FA (validan contra MySQL)
const authRoutes = require('./routes/auth');
// Rutas de vuelos: reservas en memoria (usadas si Angular apunta al backend)
const flightRoutes = require('./routes/flights');

const app = express();
// Puerto del servidor; usa 3000 por defecto o el que venga en la variable de entorno PORT
const PORT = process.env.PORT || 3000;

// Habilita peticiones desde el frontend Angular
app.use(cors());
// Permite recibir y leer JSON en el body de las peticiones POST/PUT
app.use(express.json());

// Monta las rutas de autenticación bajo /api/auth
// Ejemplo: POST http://localhost:3000/api/auth/login
app.use('/api/auth', authRoutes);

// Monta las rutas de vuelos bajo /api/flights
// Ejemplo: GET http://localhost:3000/api/flights/reservations
app.use('/api/flights', flightRoutes);

// Ruta de prueba: al abrir http://localhost:3000 en el navegador
app.get('/', (req, res) => {
    res.send('API is running');
});

// Inicia el servidor y queda escuchando peticiones
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
