import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import db from './db.mjs';
import * as aws from './aws-service.mjs';
import { initScheduler } from './scheduler.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'hibernate-top-secret';

// Start background scheduler
initScheduler();

app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// --- AUTH ROUTES ---

app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    try {
        const passwordHash = await argon2.hash(password);
        const stmt = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
        const info = stmt.run(email, passwordHash);
        res.json({ message: 'User registered', userId: info.lastInsertRowid });
    } catch (err) {
        if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Email already exists' });
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user || !(await argon2.verify(user.password_hash, password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email } });
});

// --- AWS ROLE ROUTES ---

app.get('/api/role', authenticate, (req, res) => {
    const role = db.prepare('SELECT * FROM aws_roles WHERE user_id = ? AND is_active = 1').get(req.userId);
    res.json(role || null);
});

app.post('/api/role', authenticate, (req, res) => {
    const { roleArn, region } = req.body;
    if (!roleArn) return res.status(400).json({ error: 'Role ARN is required' });

    // For simplicity, we only allow one active role per user
    db.prepare('UPDATE aws_roles SET is_active = 0 WHERE user_id = ?').run(req.userId);
    db.prepare('INSERT INTO aws_roles (user_id, role_arn, region) VALUES (?, ?, ?)').run(req.userId, roleArn, region || 'ap-south-1');

    res.json({ success: true });
});

// --- INSTANCE ROUTES ---

app.get('/api/instances', authenticate, async (req, res) => {
    const role = db.prepare('SELECT * FROM aws_roles WHERE user_id = ? AND is_active = 1').get(req.userId);
    if (!role) return res.status(400).json({ error: 'AWS Role not configured' });

    try {
        const creds = await aws.assumeClientRole(role.role_arn, role.region);
        const instances = await aws.listInstances(creds, role.region);
        res.json(instances);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/instances/:id/toggle', authenticate, async (req, res) => {
    const { action } = req.body; // 'start' or 'stop'
    const role = db.prepare('SELECT * FROM aws_roles WHERE user_id = ? AND is_active = 1').get(req.userId);
    if (!role) return res.status(400).json({ error: 'AWS Role not configured' });

    try {
        const creds = await aws.assumeClientRole(role.role_arn, role.region);
        await aws.startStopInstance(creds, req.params.id, action, role.region);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SCHEDULING ROUTES ---

app.get('/api/schedules', authenticate, (req, res) => {
    const schedules = db.prepare('SELECT * FROM schedules WHERE user_id = ?').all(req.userId);
    res.json(schedules);
});

app.post('/api/schedules', authenticate, (req, res) => {
    const { instanceId, startTime, stopTime, days } = req.body;
    db.prepare('INSERT INTO schedules (user_id, instance_id, start_time, stop_time, days) VALUES (?, ?, ?, ?, ?)')
        .run(req.userId, instanceId, startTime, stopTime, days.join(','));
    res.json({ success: true });
});

app.delete('/api/schedules/:id', authenticate, (req, res) => {
    db.prepare('DELETE FROM schedules WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
