const { exec } = require('child_process');
// Traceroute endpoint (3 hops)
app.get('/api/traceroute/:ip', (req, res) => {
    const ip = req.params.ip;
    const isWin = process.platform === 'win32';
    const cmd = isWin
        ? `tracert -h 3 ${ip}` // Windows: limit hops to 3
        : `traceroute -m 3 ${ip}`; // Unix: limit max hops to 3

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            return res.json({ success: false, error: stderr || error.message });
        }
        // Split output into lines, filter empty lines
        const hops = stdout.split('\n').filter(line => line.trim().length > 0);
        res.json({ success: true, hops });
    });
});
const express = require('express');
const app = express();
const PORT = 5001;

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
    console.log('Test endpoint hit!');
    res.json({ message: 'Test server is working!' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Test server running on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});
