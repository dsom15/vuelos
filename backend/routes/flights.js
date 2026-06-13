const express = require('express');
const router = express.Router();

let reservations = [
  {
    id: 1,
    origen: 'Bogotá (BOG)',
    destino: 'Cartagena (CTG)',
    fechaIda: '2025-08-15',
    fechaRegreso: '2025-08-22',
    numPasajeros: 2
  },
  {
    id: 2,
    origen: 'Medellín (MDE)',
    destino: 'San Andrés (ADZ)',
    fechaIda: '2025-08-20',
    fechaRegreso: '2025-08-27',
    numPasajeros: 4
  }
];

router.get('/reservations', (req, res) => {
  res.json({
    status: 'success',
    total: reservations.length,
    vuelos: reservations
  });
});

router.post('/reservations', (req, res) => {
  const { origen, destino, fechaIda, fechaRegreso, numPasajeros } = req.body;

  if (!origen || !destino || !fechaIda || !fechaRegreso || !numPasajeros) {
    return res.status(400).json({
      status: 'error',
      message: 'Todos los campos son obligatorios'
    });
  }

  const newReservation = {
    id: reservations.length > 0 ? reservations[reservations.length - 1].id + 1 : 1,
    origen,
    destino,
    fechaIda,
    fechaRegreso,
    numPasajeros
  };

  reservations.push(newReservation);

  res.status(201).json({
    status: 'success',
    message: 'Reserva creada correctamente',
    vuelo: newReservation
  });
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);

  const reservation = reservations.find(item => item.id === id);

  if (!reservation) {
    return res.status(404).json({
      status: 'error',
      message: 'Reserva no encontrada'
    });
  }

  res.json({
    status: 'success',
    vuelo: reservation
  });
});

module.exports = router;
