const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const db = require('../db');

const JWT_SECRET = 'supersecret_for_demo';

// POST /api/auth/register
// Crea un usuario nuevo en MySQL.
// La contraseña NO se guarda en texto plano: se hashea con bcrypt antes de insertarla.
router.post('/register', async (req, res) => {
    const { name, address, phone, dob, username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Genera el secreto para autenticación de dos factores (2FA)
        const secret = speakeasy.generateSecret({ name: `Sabados (${username})` });

        const [result] = await db.execute(
            'INSERT INTO users (name, address, phone, dob, username, password, two_factor_secret) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, address, phone, dob, username, hashedPassword, secret.base32]
        );

        qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
            res.status(201).json({
                message: 'User registered successfully',
                userId: result.insertId,
                qrCode: data_url,
                secret: secret.base32
            });
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Username already exists' });
        }
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// POST /api/auth/login
// Aquí se valida usuario y contraseña:
// 1. Busca el username en la tabla `users` de MySQL
// 2. Compara la contraseña ingresada con el hash guardado (bcrypt.compare)
// 3. Si no existe o no coincide → 401 "Invalid credentials"
// 4. Si coincide → devuelve userId para el paso 2FA (aún no entrega el JWT)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        const user = users[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({ message: 'Step 1 complete', userId: user.id });
    } catch (error) {
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// POST /api/auth/verify-2fa
// Segundo paso del login: valida el código de 6 dígitos de la app 2FA.
// Si es correcto, genera y devuelve el token JWT para usar en la app.
router.post('/verify-2fa', async (req, res) => {
    const { userId, token } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.two_factor_secret,
            encoding: 'base32',
            token: token
        });

        if (verified) {
            const jwtToken = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ message: 'Login successful', token: jwtToken });
        } else {
            res.status(401).json({ error: 'Invalid 2FA token' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

module.exports = router;
