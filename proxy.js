// --- VirusTotal Proxy Endpoint ---
app.get('/api/virustotal/domains/:domain', async (req, res) => {
  const { domain } = req.params;
  const apiKey = process.env.VIRUSTOTAL_API_KEY || process.env.VIRUS_TOTAL_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'VirusTotal API key not configured on server.' });
  }
  try {
    const url = `https://www.virustotal.com/api/v3/domains/${domain}`;
    const vtRes = await fetch(url, {
      headers: { 'x-apikey': apiKey }
    });
    const data = await vtRes.json();
    res.status(vtRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from VirusTotal', details: err.message });
  }
});

// --- Domain Resolution Proxy Endpoint ---
app.get('/api/resolve-domain', async (req, res) => {
  const { domain } = req.query;
  if (!domain) {
    return res.status(400).json({ error: 'Missing domain parameter' });
  }
  try {
    // Example: Use DNS-over-HTTPS (Cloudflare)
    const dnsRes = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`, {
      headers: { 'accept': 'application/dns-json' }
    });
    const data = await dnsRes.json();
    res.status(dnsRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve domain', details: err.message });
  }
});

import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';
import Parser from 'rss-parser';
import { existsSync } from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// In-memory store for API keys (in production, use a database)
const apiKeys = new Map();

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:8080', 'https://skyidrowsecurity.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-api-key',
    'Cache-Control',
    'Pragma',
    'Expires',
    'Surrogate-Control'
  ],
  credentials: true,
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 600 // Cache preflight request for 10 minutes
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to prevent caching for all API routes
app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
  next();
});

// API Key Management Routes
app.options('/api/keys', cors()); // Enable preflight for POST
app.post('/api/keys', (req, res) => {
    try {
        const { service, key, name, description } = req.body;
        
        if (!service || !key) {
            return res.status(400).json({ error: 'Service and key are required' });
        }
        
        const id = Date.now().toString();
        const newKey = {
            id,
            service,
            name: name || service,
            description: description || '',
            lastUsed: null,
            createdAt: new Date().toISOString(),
            maskedKey: '*'.repeat(8) + key.slice(-4)
        };
        
        // Store the actual key (in production, encrypt this)
        apiKeys.set(id, { ...newKey, key });
        
        // Return the key info (without the actual key)
        res.status(201).json(newKey);
    } catch (error) {
        console.error('Error saving API key:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.options('/api/keys', cors()); // Enable preflight for GET
app.get('/api/keys', (req, res) => {
    try {
        const keys = Array.from(apiKeys.values()).map(({ key, ...rest }) => rest);
        res.json(keys);
    } catch (error) {
        console.error('Error retrieving API keys:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.options('/api/keys/:id', cors()); // Enable preflight for DELETE
app.delete('/api/keys/:id', (req, res) => {
    try {
        const { id } = req.params;
        if (!apiKeys.has(id)) {
            return res.status(404).json({ error: 'API key not found' });
        }
        
        apiKeys.delete(id);
        res.status(200).json({ message: 'API key deleted successfully' });
    } catch (error) {
        console.error('Error deleting API key:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Middleware to validate API key for protected routes
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
        return res.status(401).json({ error: 'API key is required' });
    }
    
    // In a real app, you would validate the key against your database
    // and check permissions, rate limits, etc.
    const isValid = Array.from(apiKeys.values()).some(k => k.key === apiKey);
    
    if (!isValid) {
        return res.status(403).json({ error: 'Invalid API key' });
    }
    
    next();
};

// Example protected route
app.get('/api/protected', validateApiKey, (req, res) => {
    res.json({ message: 'This is a protected route' });
});

// Enhanced CORS configuration
app.use(cors({
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Log all requests with detailed information
app.use((req, res, next) => {
    const start = Date.now();
    const requestId = Math.random().toString(36).substr(2, 9);
    
    console.log(`\n[${new Date().toISOString()}] [${requestId}] ${req.method} ${req.originalUrl}`);
    console.log(`[${requestId}] Headers:`, JSON.stringify(req.headers, null, 2));
    console.log(`[${requestId}] Query:`, JSON.stringify(req.query, null, 2));
    
    // Log response finish
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
        const duration = Date.now() - start;
        console.log(`[${requestId}] Response: ${res.statusCode} (${duration}ms)`);
        if (chunk) {
            try {
                console.log(`[${requestId}] Response Body:`, chunk.toString().substring(0, 500));
            } catch (e) {
                console.log(`[${requestId}] Could not log response body`);
            }
        }
        originalEnd.apply(res, arguments);
    };
    
    next();
});

// SERP Search endpoint with CVE data
app.get('/api/serp-search', async (req, res) => {
    // Set response headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    console.log(`[${new Date().toISOString()}] [${requestId}] New search request`, { 
        url: req.originalUrl,
        query: req.query,
        headers: req.headers
    });
    
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'No search query provided'
            });
        }

        // Generate mock CVE data based on the query
        const generateCVEData = (baseId, year = 2025) => {
            const cveId = `CVE-${year}-${1000 + Math.floor(Math.random() * 9000)}`;
            const severity = ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)];
            const cvss = (Math.random() * 4 + 4).toFixed(1);
            
            return {
                id: cveId,
                title: `Vulnerability in ${q} - ${cveId}`,
                description: `A security vulnerability was discovered in ${q} that could allow an attacker to ${['execute arbitrary code', 'gain elevated privileges', 'cause a denial of service', 'bypass security restrictions'][Math.floor(Math.random() * 4)]}.`,
                severity: severity,
                cvss: cvss,
                affected_versions: `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}.x`,
                published_date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                reference: `https://nvd.nist.gov/vuln/detail/${cveId}`,
                status: 'Analyzed',
                vendor: q.split(' ')[0] || 'Vendor',
                product: q || 'Product'
            };
        };

        // Generate multiple CVEs for the search results
        const results = Array.from({ length: 5 }, (_, i) => generateCVEData(i));

        const response = {
            success: true,
            count: results.length,
            query: q,
            timestamp: new Date().toISOString(),
            results: results
        };
        
        console.log(`[${requestId}] Sending response:`, JSON.stringify(response, null, 2));
        res.json(response);
    } catch (error) {
        console.error(`[${requestId}] Search error:`, error);
        const errorResponse = {
            success: false,
            error: 'Failed to perform search',
            message: error.message,
            requestId: requestId
        };
        console.error(`[${requestId}] Sending error response:`, errorResponse);
        res.status(500).json(errorResponse);
    }
});

// IP Geolocation endpoint with rate limit handling
app.get('/api/ipgeo/:ip', async (req, res) => {
    try {
        const { ip } = req.params;
        console.log(`Fetching geolocation for IP: ${ip}`);
        
        // First try ipapi.co
        try {
            const response = await fetch(`https://ipapi.co/${ip}/json/`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            
            if (response.status === 429) {
                console.log('ipapi.co rate limit reached, trying fallback service...');
                throw new Error('Rate limited by ipapi.co');
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.reason || 'Failed to fetch IP geolocation');
            }
            
            // Format response to match frontend expectations
            const responseData = {
                success: true,
                ip: data.ip,
                city: data.city,
                region: data.region,
                country: data.country_name,
                country_code: data.country_code || 'XX',
                latitude: data.latitude,
                longitude: data.longitude,
                timezone: data.timezone || 'UTC',
                org: data.org || 'Unknown',
                connection: {
                    isp: data.org,
                    org: data.org
                },
                as: data.asn || '',
                status: 'success',
                source: 'ipapi.co'
            };
            
            return res.json(responseData);
            
        } catch (primaryError) {
            console.log('Primary geolocation service failed, trying fallback...', primaryError.message);
            
            // Fallback to ip-api.com
            try {
                const fallbackResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,org,timezone,isp,as`);
                const fallbackData = await fallbackResponse.json();
                
                if (fallbackData.status !== 'success') {
                    throw new Error(fallbackData.message || 'Fallback service failed');
                }
                
                // Format response to match frontend expectations
                const responseData = {
                    success: true,
                    ip: ip,
                    city: fallbackData.city,
                    region: fallbackData.regionName,
                    country: fallbackData.country,
                    country_code: fallbackData.countryCode || 'XX',
                    latitude: fallbackData.lat,
                    longitude: fallbackData.lon,
                    timezone: fallbackData.timezone || 'UTC',
                    org: fallbackData.org || 'Unknown',
                    connection: {
                        isp: fallbackData.isp,
                        org: fallbackData.org
                    },
                    as: fallbackData.as || '',
                    status: 'success',
                    source: 'ip-api.com (fallback)'
                };
                
                return res.json(responseData);
                
            } catch (fallbackError) {
                console.error('All geolocation services failed:', fallbackError);
                
                // Return a default response that matches frontend expectations
                const defaultResponse = {
                    success: true,
                    ip: ip,
                    city: 'Unknown',
                    region: 'Unknown',
                    country: 'Unknown',
                    country_code: 'XX',
                    latitude: 0,
                    longitude: 0,
                    timezone: 'UTC',
                    org: 'Unknown',
                    connection: {
                        isp: 'Unknown',
                        org: 'Unknown'
                    },
                    as: '',
                    status: 'success',
                    source: 'fallback',
                    note: 'Geolocation services are currently unavailable. Using default location.'
                };
                
                return res.json(defaultResponse);
            }
        }
    } catch (error) {
        console.error('IP Geolocation Error:', error);
        res.status(200).json({
            success: false,
            error: 'Failed to fetch IP geolocation',
            message: error.message,
            details: 'The geolocation service is currently unavailable. Please try again later.'
        });
    }
});

// --- Multer setup for wordlist uploads ---
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'C:/Users/Anil/AppData/Local/Programs/Python/Python310/Scripts/wordlists');
    },
    filename: function (req, file, cb) {
      // Only allow .txt files, sanitize filename
      const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '');
      cb(null, safeName);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.endsWith('.txt')) {
      return cb(new Error('Only .txt files allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 1024 * 1024 } // 1MB max
});

// --- Upload wordlist endpoint ---
app.post('/api/upload-wordlist', (req, res, next) => {
  upload.single('wordlist')(req, res, function (err) {
    if (err) {
      // Multer error or file filter error
      return res.status(400).json({ error: err.message || 'Upload failed' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    return res.json({ filename: req.file.filename });
  });
});


// (Removed duplicate /api/urlbuster route. Only the robust version below remains.)

// --- Nmap Scan Proxy Route ---
const nmapScanTimestamps = {};

app.get('/api/nmap-scan', async (req, res) => {
  const { ip } = req.query;
  if (!ip || typeof ip !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid ip parameter' });
  }
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipRegex.test(ip)) {
    return res.status(400).json({ error: 'Invalid IPv4 address' });
  }
  const now = Date.now();
  if (nmapScanTimestamps[ip] && now - nmapScanTimestamps[ip] < 60000) {
    return res.status(429).json({ error: 'Scan rate limit exceeded. Please wait before scanning this IP again.' });
  }
  nmapScanTimestamps[ip] = now;
  try {
    exec(`nmap -Pn -T4 --open ${ip}`, { timeout: 30000 }, async (error, stdout, stderr) => {
      const lines = stdout.split('\n');
      const portLines = lines.filter(l => l.match(/^\d+\/tcp/));
      const openPorts = portLines.map(l => {
        const [portProto, state, service] = l.trim().split(/\s+/);
        return { port: portProto.split('/')[0], protocol: portProto.split('/')[1], state, service };
      });


      let ipinfo = {};
      try {
        const ipinfoRes = await fetch(`https://ipinfo.io/${ip}/json`);
        ipinfo = await ipinfoRes.json();
        // Map latitude/longitude to lat/lng if present
        if (typeof ipinfo.latitude === 'number' && typeof ipinfo.longitude === 'number') {
          ipinfo.lat = ipinfo.latitude;
          ipinfo.lng = ipinfo.longitude;
        } else if (typeof ipinfo.lat !== 'number' && typeof ipinfo.loc === 'string') {
          // ipinfo.io returns 'loc' as 'lat,lng' string
          const [latStr, lngStr] = ipinfo.loc.split(',');
          const lat = parseFloat(latStr);
          const lng = parseFloat(lngStr);
          if (!isNaN(lat) && !isNaN(lng)) {
            ipinfo.lat = lat;
            ipinfo.lng = lng;
          }
        }
      } catch (e) {}

      let googleDnsInfo = null;
      if (ip === '8.8.8.8' || ip === '8.8.4.4') {
        googleDnsInfo = {
          description: 'Google Public DNS',
          docs: 'https://developers.google.com/speed/public-dns',
        };
      }

      if (error && openPorts.length === 0 && stdout.includes('filtered')) {
        return res.json({ ip, openPorts: [], ipinfo, googleDnsInfo, raw: stdout, filtered: true, fullLog: stdout + '\n' + stderr });
      }
      if (error && openPorts.length === 0) {
        return res.status(500).json({ error: 'Nmap scan failed', details: stderr || error.message, fullLog: stdout + '\n' + stderr });
      }
      res.json({ ip, openPorts, ipinfo, googleDnsInfo, raw: stdout, fullLog: stdout + '\n' + stderr });
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});



// --- API Monitoring HTML Dashboard ---
// Serves a simple HTML dashboard at /api/monitor for human viewing
app.get('/api/monitor', async (req, res) => {
    const start = Date.now();
    const checks = [
        {
            key: 'VIRUS_TOTAL', label: 'VirusTotal',
            check: async () => {
                try {
                    const r = await fetch('https://www.virustotal.com/api/v3/ip_addresses/8.8.8.8', {
                        headers: { 'x-apikey': process.env.VIRUS_TOTAL_KEY || '' }
                    });
                    return r.status === 200 ? { ok: true } : { ok: false, status: r.status };
                } catch (e) { return { ok: false, error: e.message }; }
            }
        },
        { key: 'ABUSE_IPDB', label: 'AbuseIPDB', check: async () => {
            try {
                const r = await fetch('https://api.abuseipdb.com/api/v2/check?ipAddress=8.8.8.8&maxAgeInDays=90', {
                    headers: { 'Key': process.env.ABUSE_IPDB_KEY || '', 'Accept': 'application/json' }
                });
                return r.status === 200 ? { ok: true } : { ok: false, status: r.status };
            } catch (e) { return { ok: false, error: e.message }; }
        } },
        { key: 'SHODAN', label: 'Shodan', check: async () => {
            try {
                const r = await fetch('https://api.shodan.io/shodan/host/8.8.8.8?key=' + (process.env.SHODAN_KEY || ''));
                return r.status === 200 ? { ok: true } : { ok: false, status: r.status };
            } catch (e) { return { ok: false, error: e.message }; }
        } },
        { key: 'URLSCAN', label: 'URLScan', check: async () => {
            try {
                const r = await fetch('https://urlscan.io/api/v1/search/?q=domain:example.com', {
                    headers: { 'API-Key': process.env.URLSCAN_KEY || '' }
                });
                return r.status === 200 ? { ok: true } : { ok: false, status: r.status };
            } catch (e) { return { ok: false, error: e.message }; }
        } },
        { key: 'IP_API', label: 'IP-API', check: async () => {
            try {
                const r = await fetch('http://ip-api.com/json/8.8.8.8');
                return r.status === 200 ? { ok: true } : { ok: false, status: r.status };
            } catch (e) { return { ok: false, error: e.message }; }
        } },
        { key: 'SERP_API', label: 'SerpAPI', check: async () => {
            try {
                const r = await fetch('https://serpapi.com/search.json?q=example&api_key=' + (process.env.SERP_API_KEY || ''));
                return r.status === 200 ? { ok: true } : { ok: false, status: r.status };
            } catch (e) { return { ok: false, error: e.message }; }
        } },
        { key: 'NVD_API', label: 'NVD', check: async () => {
            try {
                const r = await fetch('https://services.nvd.nist.gov/rest/json/cves/1.0?keyword=windows');
                return r.status === 200 ? { ok: true } : { ok: false, status: r.status };
            } catch (e) { return { ok: false, error: e.message }; }
        } },
        { key: 'Guardian_API_KEY', label: 'Guardian News', check: async () => {
            try {
                const r = await fetch('https://content.guardianapis.com/search?q=cyber&api-key=' + (process.env.Guardian_API_KEY || ''));
                return r.status === 200 ? { ok: true } : { ok: false, status: r.status };
            } catch (e) { return { ok: false, error: e.message }; }
        } },
    ];

    const statuses = await Promise.all(checks.map(async (svc) => {
        const t0 = Date.now();
        const result = await svc.check();
        return {
            key: svc.key,
            label: svc.label,
            ok: result.ok,
            status: result.status,
            error: result.error,
            latency: Date.now() - t0,
            checkedAt: new Date().toISOString()
        };
    }));

    // Render a simple HTML dashboard
    res.setHeader('Content-Type', 'text/html');
    res.send(`
    <html>
    <head>
      <title>API Monitoring Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; background: #181c24; color: #f3f3f3; margin: 0; padding: 0; }
        h1 { background: #232946; color: #fff; margin: 0; padding: 1rem; }
        table { width: 90%; margin: 2rem auto; border-collapse: collapse; background: #232946; border-radius: 8px; overflow: hidden; }
        th, td { padding: 1rem; border-bottom: 1px solid #333; text-align: left; }
        th { background: #232946; color: #eebbc3; }
        tr:last-child td { border-bottom: none; }
        .ok { color: #4ade80; font-weight: bold; }
        .fail { color: #f87171; font-weight: bold; }
        .latency { color: #facc15; }
        .errormsg { color: #f87171; font-size: 0.95em; }
        .status { font-size: 0.95em; color: #a1a1aa; }
        .footer { text-align: center; margin: 2rem 0 1rem 0; color: #a1a1aa; font-size: 0.95em; }
      </style>
    </head>
    <body>
      <h1>API Monitoring Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Status</th>
            <th>HTTP</th>
            <th>Latency (ms)</th>
            <th>Error</th>
            <th>Last Checked</th>
          </tr>
        </thead>
        <tbody>
          ${statuses.map(svc => `
            <tr>
              <td>${svc.label}</td>
              <td class="${svc.ok ? 'ok' : 'fail'}">${svc.ok ? 'Online' : 'Error'}</td>
              <td class="status">${svc.status || '-'}</td>
              <td class="latency">${svc.latency}</td>
              <td class="errormsg">${svc.error || '-'}</td>
              <td class="status">${new Date(svc.checkedAt).toLocaleTimeString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">Last updated: ${new Date().toLocaleString()} &middot; Total check time: ${Date.now() - start} ms</div>
    </body>
    </html>
    `);
});


// --- Dedicated API monitoring dashboard routing (MUST be last!) ---
// Redirect all root ("/"), non-API, and non-static requests to /api/monitor for a locked-down proxy server
app.use((req, res, next) => {
  // Allow API routes and static assets (e.g., /api/*, /public/*, /data/*, /sample_data/*, /services/*, /favicon.ico, /robots.txt, etc.)
  if (
    req.path.startsWith('/api/') ||
    req.path.startsWith('/public/') ||
    req.path.startsWith('/data/') ||
    req.path.startsWith('/sample_data/') ||
    req.path.startsWith('/services/') ||
    req.path === '/favicon.ico' ||
    req.path === '/robots.txt' ||
    req.path.endsWith('.ico') ||
    req.path.endsWith('.svg') ||
    req.path.endsWith('.png') ||
    req.path.endsWith('.jpg') ||
    req.path.endsWith('.js') ||
    req.path.endsWith('.css') ||
    req.path.endsWith('.json')
  ) {
    return next();
  }
  // Redirect all other requests (including /, /index.html, etc.) to /api/monitor
  return res.redirect(302, '/api/monitor');
});

// URL Buster endpoint
app.get('/api/urlbuster', (req, res) => {
    try {
        const { ip, wordlist } = req.query;
        
        if (!ip) {
            console.error('[URLBuster] Error: IP address is required');
            return res.status(400).json({ 
                success: false,
                error: 'IP address is required',
                details: 'No IP address provided in the request'
            });
        }
        
        console.log(`[URLBuster] Starting scan for IP: ${ip}`);
        
        // Prefer system wordlists directory first
        const systemWordlistsDir = 'C:/Users/Anil/AppData/Local/Programs/Python/Python310/Scripts/wordlists';
        let wordlistPath = null;
        if (wordlist) {
            // If user provided a wordlist, check if it's an absolute path or just a filename
            if (path.isAbsolute(wordlist)) {
                wordlistPath = wordlist;
            } else {
                // Check in system wordlists dir first, then in project wordlists dir
                const sysPath = path.join(systemWordlistsDir, wordlist);
                const projPath = path.join(process.cwd(), 'wordlists', wordlist);
                if (existsSync(sysPath)) {
                    wordlistPath = sysPath;
                } else if (existsSync(projPath)) {
                    wordlistPath = projPath;
                } else {
                    // If not found, treat as provided (may error below)
                    wordlistPath = wordlist;
                }
            }
        } else {
            // No wordlist provided, use system default first, then project default
            const sysDefault = path.join(systemWordlistsDir, 'common.txt');
            const projDefault = path.join(process.cwd(), 'wordlists', 'common.txt');
            if (existsSync(sysDefault)) {
                wordlistPath = sysDefault;
            } else {
                wordlistPath = projDefault;
            }
        }

        console.log(`[URLBuster] Using wordlist: ${wordlistPath}`);

        // Check if wordlist exists
        if (!existsSync(wordlistPath)) {
            const errorMsg = `Wordlist not found at: ${wordlistPath}`;
            console.error(`[URLBuster] ${errorMsg}`);
            return res.status(404).json({ 
                success: false,
                error: 'Wordlist not found',
                details: errorMsg,
                path: wordlistPath
            });
        }
        
        // Try to find urlbuster in common locations
        const possiblePaths = [
            path.join(process.env.LOCALAPPDATA, 'Programs', 'Python', 'Python310', 'Scripts', 'urlbuster'),
            path.join(process.env.PROGRAMFILES, 'Python310', 'Scripts', 'urlbuster'),
            path.join(process.env.PROGRAMFILES, 'Python', 'Python310', 'Scripts', 'urlbuster'),
            path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Programs', 'Python', 'Python310', 'Scripts', 'urlbuster'),
            'urlbuster' // Try in PATH
        ];
        
        let urlbusterPath = null;
        for (const possiblePath of possiblePaths) {
            try {
                if (existsSync(possiblePath)) {
                    urlbusterPath = possiblePath;
                    console.log(`[URLBuster] Found at: ${urlbusterPath}`);
                    break;
                }
            } catch (e) {
                console.log(`[URLBuster] Check failed for: ${possiblePath}`);
            }
        }
        
        if (!urlbusterPath) {
            const errorMsg = 'Could not find urlbuster in common locations. Please ensure it is installed and in your PATH.';
            console.error(`[URLBuster] ${errorMsg}`);
            return res.status(500).json({
                success: false,
                error: 'URLBuster not found',
                details: errorMsg,
                searchedPaths: possiblePaths
            });
        }
        
        // Always use python and set PYTHONIOENCODING=utf-8 to avoid Unicode errors on Windows
        const command = `python "${urlbusterPath}" -W "${wordlistPath}" "http://${ip}/FUZZ" --timeout 5 --delay 0.5`;
        const timeoutMs = 300000; // 5 minutes
        const startTime = Date.now();
        console.log(`[URLBuster] Executing command: ${command}`);
        // Set env for Unicode output
        const execOptions = { timeout: timeoutMs, env: { ...process.env, PYTHONIOENCODING: 'utf-8' } };
        exec(command, execOptions, (error, stdout, stderr) => {
            const duration = Date.now() - startTime;
            console.log(`[URLBuster] Command completed in ${duration}ms`);
            if (stdout) console.log(`[URLBuster] Command output:\n${stdout}`);
            if (stderr) console.error(`[URLBuster] Command stderr:\n${stderr}`);
            if (error) {
                const errorMsg = `Command failed: ${error.message}`;
                console.error(`[URLBuster] ${errorMsg}`);
                return res.status(500).json({
                    success: false,
                    error: 'URLBuster execution failed',
                    details: errorMsg,
                    command: command,
                    stderr: stderr || 'No error output',
                    stdout: stdout || 'No output',
                    code: error.code,
                    signal: error.signal,
                    duration: `${duration}ms`
                });
            }
            try {
                // Parse the output to extract found directories (as strings)
                const lines = stdout.split('\n');
                const directories = [];
                lines.forEach(line => {
                    // Look for lines that indicate a found directory
                    const match = line.match(/^\s*(\d{3})\s+(\S+)\s+/);
                    if (match) {
                        directories.push(match[2].trim());
                    }
                });
                console.log(`[URLBuster] Successfully found ${directories.length} directories`);
                return res.json({
                    success: true,
                    command: command,
                    directories,
                    duration: `${duration}ms`
                });
            } catch (parseError) {
                console.error('[URLBuster] Error parsing output:', parseError);
                return res.status(500).json({
                    success: false,
                    error: 'Error parsing URLBuster output',
                    details: parseError.message,
                    stdout: stdout || 'No output',
                    stderr: stderr || 'No error output',
                    command: command
                });
            }
        });
        
    } catch (error) {
        console.error('[URLBuster] Unexpected error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Traceroute endpoint
app.get('/api/traceroute/:ip', async (req, res) => {
  console.log(`[Traceroute] Request for IP: ${req.params.ip}`);
  
  // Set response headers
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
    'Access-Control-Allow-Origin': 'http://localhost:8080',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Expose-Headers': 'Content-Length,Content-Type'
  };
  
  const { ip } = req.params;
  
  if (!ip) {
    return res.status(400).json({ success: false, error: 'IP address is required' });
  }

  // Basic IP validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) {
    return res.status(400).json({ success: false, error: 'Invalid IPv4 address format' });
  }

  try {
    // Use the system's traceroute command
    const command = process.platform === 'win32' 
      ? `tracert -d -h 3 ${ip}`  // Windows - limit to 3 hops
      : `traceroute -n -m 3 ${ip}`; // Linux/Mac - limit to 3 hops
      
    console.log(`[Traceroute] Executing command: ${command}`);
    
    const { stdout, stderr } = await new Promise((resolve, reject) => {
      exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
        if (error && !stdout) {
          reject(error);
          return;
        }
        resolve({ stdout, stderr });
      });
    });

    // Parse the output
    const hops = [];
    const lines = stdout.split('\n').filter(line => line.trim() !== '');
    
    console.log(`[Traceroute] Raw output (${lines.length} lines):`);
    
    for (const line of lines) {
      // Skip header lines
      if (line.includes('Tracing route') || line.includes('traceroute to')) continue;
      if (line.includes('over a maximum of') || line.includes('with')) continue;
      
      // Clean up the line and add to results
      const cleanLine = line.replace(/\s+/g, ' ').trim();
      if (cleanLine) {
        console.log(`[Traceroute] Adding hop: ${cleanLine}`);
        hops.push(cleanLine);
        // Limit to 3 hops
        if (hops.length >= 3) break;
      }
    }
    
    const response = {
      success: true,
      hops: hops,
      rawOutput: stdout
    };

    if (response.hops.length === 0) {
      const errorMsg = 'No valid traceroute results found';
      console.error(`[Traceroute] ${errorMsg}`);
      const errorResponse = JSON.stringify({
        success: false,
        error: errorMsg,
        rawOutput: 'No traceroute data available'
      });
      
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(errorResponse)
      });
      return res.end(errorResponse);
    }
    
    console.log(`[Traceroute] Sending response with ${response.hops.length} hops`);
    const responseData = JSON.stringify(response);
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(responseData),
      ...headers
    });
    res.end(responseData);

  } catch (error) {
    console.error('[Traceroute] Error:', error);
    const errorResponse = JSON.stringify({
      success: false,
      error: error.message || 'Failed to execute traceroute',
      details: error.stderr || error.stdout || 'No additional details'
    });
    
    res.writeHead(500, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(errorResponse)
    });
    res.end(errorResponse);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start the server with error handling
let server;

function startServer() {
    // Close existing server if it's running
    if (server) {
        server.close(() => {
            console.log('Restarting server...');
            createServer();
        });
        return;
    }
    
    createServer();
}

function createServer() {
    try {
        server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`Proxy server running on http://localhost:${PORT}`);
            console.log('Press Ctrl+C to stop the server');
        });

        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use.`);
                process.exit(1);
            } else {
                console.error('Server error:', error);
                process.exit(1);
            }
            setTimeout(startServer, 5000);
        });

        // Handle process termination
        process.on('SIGINT', () => {
            console.log('\nShutting down server...');
            server.close(() => {
                console.log('Server has been stopped.');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        // Attempt to restart the server after a delay
        setTimeout(startServer, 5000);
    }
}

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process, just log the error
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    if (server) {
        server.close(() => {
            console.log('Server has been stopped.');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Don't exit the process, just log the error
});

// Start the server
startServer();
