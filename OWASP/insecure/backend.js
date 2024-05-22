const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const logHelper = require('./logHelper');

const app = express();
app.use(bodyParser.json());

const users = [{ uuid: '123e4567-e89b-12d3-a456-426614174000', username: 'user', password: bcrypt.hashSync('password123', 10) }]; // Simple user storage

let loginAttempts = {}; // To store failed login attempts

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    const sourceIp = req.ip;
    const location = req.headers['x-location'] || 'unknown';
    const systemComponent = 'express-backend';

    if (!user) {
        logAttempt(username, 'unknown');
        return res.status(401).send('Invalid username or password');
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).send('Invalid username or password');
    }
    logAttempt(username, user.uuid, true);
    res.send('Login successful');
});

const logAttempt = (username, uuid, success) => {
    if (!loginAttempts[username]) {
        loginAttempts[username] = { count: 0, lockUntil: null };
    }

    

    const currentTime = Date.now();
    if (loginAttempts[username].lockUntil && currentTime < loginAttempts[username].lockUntil) {
        logHelper.log('Account locked', uuid);
        return;
    }

    loginAttempts[username].count++;
    logHelper.log('Failed login attempt', uuid);

    if (loginAttempts[username].count >= 3) {
        loginAttempts[username].lockUntil = currentTime + 30000; // lock for 30 seconds
        logHelper.log('Account locked', uuid);
    }

    if (success) {
        loginAttempts[username].count = 0; // reset counter on success
        logHelper.log('Successful login', uuid);
        return;
    }
};

app.listen(3000, () => {
    console.log('Server running on port 3000');
});