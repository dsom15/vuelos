const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = 'supersecret_for_demo';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
        req.user = user;
        next();
    });
};

router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT id, origin, destination, departure_date, return_date, passengers, created_at FROM flight_forms WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT id, origin, destination, departure_date, return_date, passengers, created_at FROM flight_forms WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    const { destination, origin, departure_date, return_date, passengers } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO flight_forms (user_id, destination, origin, departure_date, return_date, passengers) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, destination, origin, departure_date, return_date, passengers]
        );
        res.status(201).json({
            message: 'Flight form saved successfully',
            formId: Number(result.insertId),
            reservation: {
                id: Number(result.insertId),
                origin,
                destination,
                departure_date,
                return_date,
                passengers
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

module.exports = router;
