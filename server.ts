import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Initializing configuration
dotenv.config();

const app = express();
const PORT = 3000;

// ==================== REVERSE PROXY FOR EXTERNAL BACKEND ====================
let TARGET_API_URL = (process.env.VITE_API_BASE_URL || '').trim();

// Strip quotes from .env
if ((TARGET_API_URL.startsWith("'") && TARGET_API_URL.endsWith("'")) || 
    (TARGET_API_URL.startsWith('"') && TARGET_API_URL.endsWith('"'))) {
  TARGET_API_URL = TARGET_API_URL.slice(1, -1).trim();
}

// Helper: fetch ke backend
async function fetchBackend(subPath: string, method: string, body?: Buffer, incomingHeaders?: Record<string, string>) {
  const targetBase = TARGET_API_URL.endsWith('/') ? TARGET_API_URL.slice(0, -1) : TARGET_API_URL;
  const url = `${targetBase}${subPath}`;
  
  const headers: Record<string, string> = {};
  if (incomingHeaders) {
    for (const [key, val] of Object.entries(incomingHeaders)) {
      if (val && typeof val === 'string') {
        const lowerKey = key.toLowerCase();
        if (!['host', 'origin', 'referer', 'content-length', 'connection'].includes(lowerKey)) {
          headers[key] = val;
        }
      }
    }
  }
  
  const fetchOpts: RequestInit = {
    method,
    headers,
  };
  
  if (body && method !== 'GET' && method !== 'HEAD') {
    fetchOpts.body = body as any;
  }
  
  return fetch(url, fetchOpts);
}

if (TARGET_API_URL) {
  console.log(`🔌 Reverse Proxy active! Forwarding /api/* to: ${TARGET_API_URL}`);
  
  // Raw parser untuk /api agar body tidak diubah
  app.use('/api', express.raw({ type: '*/*', limit: '20mb' }));
  
  // ===== 1. SPECIAL HANDLER: /api/all-data =====
  // Kalau backend punya endpoint ini, pakai langsung. Kalau 404, aggregate dari endpoint per-resource.
  app.get('/api/all-data', async (req, res) => {
    try {
      // Coba dulu ke backend langsung
      const direct = await fetchBackend('/all-data', 'GET', undefined, req.headers as Record<string, string>);
      
      if (direct.status === 200) {
        const buf = Buffer.from(await direct.arrayBuffer());
        res.status(200).send(buf);
        console.log(`✅ /api/all-data served directly from backend (${buf.length} bytes)`);
        return;
      }
      
      // Fallback: aggregate dari endpoint per-resource secara paralel
      console.log(`⚠️ Backend /all-data returned ${direct.status}, aggregating from individual endpoints...`);
      
      const resourceMap = [
        { key: 'users', paths: ['/users', '/user'] },
        { key: 'vehicles', paths: ['/vehicles', '/vehicle'] },
        { key: 'drivers', paths: ['/drivers', '/driver'] },
        { key: 'maintenanceLogs', paths: ['/maintenance', '/maintenance-logs', '/maintenanceLog'] },
        { key: 'dailyChecklists', paths: ['/checklists', '/daily-checklists', '/dailyChecklist'] },
        { key: 'expenses', paths: ['/expenses', '/expense'] },
        { key: 'activityLogs', paths: ['/activities', '/activity-logs', '/activityLog'] },
        { key: 'notifications', paths: ['/notifications', '/notification'] },
      ];
      
      const result: any = {};
      
      await Promise.all(
        resourceMap.map(async ({ key, paths }) => {
          for (const path of paths) {
            try {
              const resp = await fetchBackend(path, 'GET', undefined, req.headers as Record<string, string>);
              if (resp.status === 200) {
                const data = await resp.json();
                result[key] = Array.isArray(data) ? data : [data];
                console.log(`   ✅ ${key}: ${result[key].length} items from ${path}`);
                return; // next resource
              }
            } catch (e) {
              // coba path alternatif berikutnya
            }
          }
          // Kalau semua path gagal
          result[key] = [];
          console.log(`   ⚠️ ${key}: no endpoint found, using empty array`);
        })
      );
      
      res.json(result);
      console.log(`✅ /api/all-data aggregated successfully`);
      
    } catch (err) {
      console.error(`❌ Error in /api/all-data aggregation:`, err);
      res.status(500).json({ error: 'Failed to aggregate data', message: (err as Error).message });
    }
  });
  
  // ===== 2. SPECIAL HANDLER: /api/database/status =====
  app.get('/api/database/status', async (req, res) => {
    try {
      const ping = await fetchBackend('/vehicles', 'HEAD', undefined, req.headers as Record<string, string>);
      const isConnected = ping && (ping.status === 200 || ping.status === 204);
      
      res.json({
        connected: isConnected,
        provider: isConnected ? 'External Spring Boot Backend' : 'Unavailable',
        configured: true,
        url: TARGET_API_URL,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ /api/database/status: ${isConnected ? 'CONNECTED' : 'DISCONNECTED'}`);
      
    } catch (err) {
      res.json({
        connected: false,
        provider: 'Error',
        configured: true,
        url: TARGET_API_URL,
        error: (err as Error).message,
        timestamp: new Date().toISOString()
      });
      console.error(`❌ /api/database/status error:`, err);
    }
  });
  
  // ===== 3. CATCH-ALL PROXY untuk endpoint lain =====
  app.all('/api/*', async (req, res) => {
    try {
      const subPath = req.originalUrl.replace(/^\/api/, '');
      const destinationUrl = `${TARGET_API_URL.endsWith('/') ? TARGET_API_URL.slice(0, -1) : TARGET_API_URL}${subPath}`;
      
      console.log(`🔀 [${req.method}] ${req.originalUrl} → ${destinationUrl}`);
      
      const response = await fetchBackend(subPath, req.method, Buffer.isBuffer(req.body) ? req.body : undefined, req.headers as Record<string, string>);
      
      // Forward status dan headers
      res.status(response.status);
      response.headers.forEach((val, key) => {
        const lowerKey = key.toLowerCase();
        if (!['content-encoding', 'transfer-encoding', 'connection'].includes(lowerKey)) {
          res.setHeader(key, val);
        }
      });
      
      const buf = Buffer.from(await response.arrayBuffer());
      
      if (response.status < 200 || response.status >= 300) {
        console.error(`❌ Backend ${response.status}: ${buf.toString('utf8').substring(0, 500)}`);
      } else {
        console.log(`✅ Proxied ${buf.length} bytes (${response.status})`);
      }
      
      res.send(buf);
      
    } catch (err) {
      console.error(`❌ Proxy failure for ${req.originalUrl}:`, err);
      res.status(502).json({
        error: 'Proxy failed to delegate request',
        message: (err as Error).message || String(err)
      });
    }
  });
}

// Fallback to local body parser for mock API
app.use(express.json());

// Path to persistent fallback JSON storage
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default initial simulation seed data matching initial React state
const INITIAL_DB = {
  users: [
    { id: 'user-admin', email: 'admin@csrj.id', fullName: 'Andi Saputra', role: 'admin', phone: '+62 812-3456-7890', employeeId: 'ADM-2026-001', avatarText: 'AS' },
    { id: 'user-driver1', email: 'budi@csrj.id', fullName: 'Budi Santoso', role: 'driver', phone: '+62 813-9876-5432', employeeId: 'DRV-2026-002', avatarText: 'BS' },
    { id: 'user-driver2', email: 'hendra@csrj.id', fullName: 'Hendra Wijaya', role: 'driver', phone: '+62 821-1111-2222', employeeId: 'DRV-2026-003', avatarText: 'HW' }
  ],
  vehicles: [
    { id: 'v-1', plateNumber: 'B 1234 XYZ', model: 'Toyota Hiace', year: 2020, color: 'Putih', mileage: 45200, status: 'operational', driverName: 'Andi Saputra', driverId: 'user-admin', chassisNumber: 'MHYGAS12345678' },
    { id: 'v-2', plateNumber: 'B 9876 ABC', model: 'Toyota Hiace', year: 2019, color: 'Silver', mileage: 78500, status: 'maintenance', driverName: 'Budi Santoso', driverId: 'user-driver1', chassisNumber: 'MHYGAS87654321' },
    { id: 'v-3', plateNumber: 'B 5678 DEF', model: 'Mitsubishi Fuso', year: 2021, color: 'Kuning', mileage: 32100, status: 'operational', driverName: 'Hendra Wijaya', driverId: 'user-driver2', chassisNumber: 'MHYGAS56781234' },
    { id: 'v-4', plateNumber: 'B 8888 GHI', model: 'Isuzu Elf', year: 2022, color: 'Putih', mileage: 18900, status: 'operational', driverName: 'Rudi Hartono', driverId: '', chassisNumber: 'MHYGAS99999999' },
    { id: 'v-5', plateNumber: 'B 5550 KLM', model: 'Isuzu Elf', year: 2018, color: 'Abu-Abu', mileage: 95300, status: 'operational', driverName: 'Joko Susilo', driverId: '', chassisNumber: 'MHYGAS55554444' },
    { id: 'v-6', plateNumber: 'B 2222 NBC', model: 'Mitsubishi Fuso', year: 2020, color: 'Oranye', mileage: 52400, status: 'maintenance', driverName: 'Bambang Tri', driverId: '', chassisNumber: 'MHYGAS22221111' }
  ],
  drivers: [
    { id: 'dr-1', name: 'Andi Saputra', phone: '+62 812-3456-7890', simNumber: 'A 123456', simExpiry: '2028-08-15', assignedVehiclePlate: 'B 1234 XYZ', status: 'active', accountEmail: 'admin@csrj.id', avatarText: 'AS' },
    { id: 'dr-2', name: 'Budi Santoso', phone: '+62 813-9876-5432', simNumber: 'A 234567', simExpiry: '2027-11-20', assignedVehiclePlate: 'B 9876 ABC', status: 'active', accountEmail: 'budi@csrj.id', avatarText: 'BS' },
    { id: 'dr-3', name: 'Hendra Wijaya', phone: '+62 821-1111-2222', simNumber: 'A 345678', simExpiry: '2029-03-10', assignedVehiclePlate: 'B 5678 DEF', status: 'active', accountEmail: 'hendra@csrj.id', avatarText: 'HW' },
    { id: 'dr-4', name: 'Rudi Hartono', phone: '+62 822-3333-4444', simNumber: 'A 456789', simExpiry: '2028-06-25', assignedVehiclePlate: 'B 8888 GHI', status: 'active', accountEmail: 'rudi@csrj.id', avatarText: 'RH' },
    { id: 'dr-5', name: 'Joko Susilo', phone: '+62 823-5555-6666', simNumber: 'A 567890', simExpiry: '2027-09-12', assignedVehiclePlate: 'B 5550 KLM', status: 'active', accountEmail: 'joko@csrj.id', avatarText: 'JS' },
    { id: 'dr-6', name: 'Bambang Tri', phone: '+62 824-7777-8888', simNumber: 'A 678901', simExpiry: '2028-12-30', assignedVehiclePlate: 'B 2222 NBC', status: 'active', accountEmail: 'bambang@csrj.id', avatarText: 'BT' }
  ],
  maintenanceLogs: [
    { id: 'm-1', vehiclePlate: 'B 9876 ABC', vehicleModel: 'Toyota Hiace', serviceType: 'Mesin', date: '2026-05-15', cost: 4500000, workshop: 'Bengkel Astra Sentra', status: 'ongoing', notes: 'Pemeriksaan sistem pengapian dan penggantian timing belt.' },
    { id: 'm-2', vehiclePlate: 'B 1234 XYZ', vehicleModel: 'Toyota Hiace', serviceType: 'Oli', date: '2026-05-10', cost: 850000, workshop: 'Prima Toyota Cawang', status: 'completed', notes: 'Ganti oli mesin Shell Helix, saringan oli, saringan udara.' },
    { id: 'm-3', vehiclePlate: 'B 5550 KLM', vehicleModel: 'Isuzu Elf', serviceType: 'Rem', date: '2026-05-08', cost: 2200000, workshop: 'Isuzu Prima Motor', status: 'completed', notes: 'Penggantian piringan rem depan dan minyak rem lengkap.' },
    { id: 'm-4', vehiclePlate: 'B 2222 NBC', vehicleModel: 'Mitsubishi Fuso', serviceType: 'Ban', date: '2026-06-05', cost: 3800000, workshop: 'Sentra Ban Bekas & Baru', status: 'upcoming', notes: 'Rencana ganti dua ban depan Bridgestone radial.' }
  ],
  dailyChecklists: [
    { id: 'ch-1', vehiclePlate: 'B 1234 XYZ', driverName: 'Andi Saputra', date: '2026-05-30', time: '08:15', results: { engineOil: 'ok', brake: 'ok', tires: 'ok', lights: 'ok', wipers: 'ok', ac: 'ok', battery: 'ok', steering: 'ok' }, notes: 'Kondisi kendaraan sangat baik, siap jalan.', status: 'passed' },
    { id: 'ch-2', vehiclePlate: 'B 5678 DEF', driverName: 'Hendra Wijaya', date: '2026-05-30', time: '08:30', results: { engineOil: 'ok', brake: 'ok', tires: 'ok', lights: 'ok', wipers: 'ok', ac: 'ok', battery: 'ok', steering: 'ok' }, notes: 'Tekanan ban oke, AC dingin.', status: 'passed' },
    { id: 'ch-3', vehiclePlate: 'B 8888 GHI', driverName: 'Rudi Hartono', date: '2026-05-29', time: '09:00', results: { engineOil: 'ok', brake: 'issue', tires: 'ok', lights: 'ok', wipers: 'ok', ac: 'ok', battery: 'ok', steering: 'ok' }, notes: 'Pegangan rem terasa agak longgar, perlu pengancangan ringan.', status: 'failed' },
    { id: 'ch-4', vehiclePlate: 'B 5550 KLM', driverName: 'Joko Susilo', date: '2026-05-29', time: '09:20', results: { engineOil: 'ok', brake: 'ok', tires: 'ok', lights: 'ok', wipers: 'ok', ac: 'ok', battery: 'ok', steering: 'ok' }, notes: 'Aman tanpa kendala.', status: 'passed' }
  ],
  expenses: [
    { id: 'ex-1', date: '2026-05-29', vehiclePlate: 'B 1234 XYZ', category: 'fuel', description: 'Pembelian Pertamax 50 Liter', amount: 750000, driverName: 'Andi Saputra' },
    { id: 'ex-2', date: '2026-05-29', vehiclePlate: 'B 9876 ABC', category: 'toll', description: 'Tol Jakarta - Cikampek', amount: 145000, driverName: 'Budi Santoso' },
    { id: 'ex-3', date: '2026-05-28', vehiclePlate: 'B 5678 DEF', category: 'fuel', description: 'Solar Biosolar 80 Liter', amount: 1080000, driverName: 'Hendra Wijaya' },
    { id: 'ex-4', date: '2026-05-28', vehiclePlate: 'B 1234 XYZ', category: 'parking', description: 'Parkir Mall Kelapa Gading', amount: 25000, driverName: 'Andi Saputra' },
    { id: 'ex-5', date: '2026-05-27', vehiclePlate: 'B 8888 GHI', category: 'oil', description: 'Ganti oli darurat Castrol 4L', amount: 480000, driverName: 'Rudi Hartono' },
    { id: 'ex-6', date: '2026-05-27', vehiclePlate: 'B 5550 KLM', category: 'fuel', description: 'Biosolar 100 Liter', amount: 1350000, driverName: 'Joko Susilo' },
    { id: 'ex-7', date: '2026-05-26', vehiclePlate: 'B 1234 XYZ', category: 'toll', description: 'Tol Cipularang Barat', amount: 95000, driverName: 'Andi Saputra' }
  ],
  activityLogs: [
    { id: 'log-1', username: 'Andi Saputra', role: 'admin', action: 'Sistem Inisialisasi', details: 'Database lokal diinisialisasi dengan data default armada.', timestamp: '2026-05-29T10:00:00Z' },
    { id: 'log-2', username: 'Andi Saputra', role: 'admin', action: 'Registrasi Kendaraan', details: 'Kendaraan Isuzu Elf (B 8888 GHI) berhasil ditambahkan.', timestamp: '2026-05-29T11:30:00Z' },
    { id: 'log-3', username: 'Budi Santoso', role: 'driver', action: 'Ubah Data Driver', details: 'Mengubah pembagian armada penugasan.', timestamp: '2026-05-29T14:45:00Z' },
    { id: 'log-4', username: 'System', role: 'admin', action: 'Peringatan Pemeliharaan', details: 'Pecahan status Toyota Hiace (B 9876 ABC) dirubah ke perbaikan.', timestamp: '2026-05-30T00:10:00Z' }
  ],
  notifications: [
    { id: 'nt-1', type: 'overdue', title: 'Pemeliharaan Terlambat', message: 'Toyota Hiace B 9876 ABC telah melewati batas masa servis rutin mesin berkala.', date: '2026-05-28', vehiclePlate: 'B 9876 ABC', read: false },
    { id: 'nt-2', type: 'tax', title: 'Pajak Kendaraan Segera Jatuh Tempo', message: 'Masa pajak tahunan Isuzu Elf B 5550 KLM segera berakhir dalam 7 hari.', date: '2026-05-29', vehiclePlate: 'B 5550 KLM', read: false },
    { id: 'nt-3', type: 'failed_checklist', title: 'Checklist Harian Gagal', message: 'Pemeriksaan harian pada B 8888 GHI mendeteksi adanya kendala di bagian Rem.', date: '2026-05-29', vehiclePlate: 'B 8888 GHI', read: true }
  ]
};

// If DB file doesn't exist, create it with default data
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2));
}

function readLocalDB() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_DB;
  }
}

function writeLocalDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error writing local JSON db:', e);
  }
}

// 0. GET /api/database/status fallback
app.get('/api/database/status', (req, res) => {
  res.json({
    connected: false,
    provider: 'Local Fallback JSON File',
    configured: false
  });
});

// 1. GET /api/all-data fallback
app.get('/api/all-data', (req, res) => {
  const db = readLocalDB();
  res.json(db);
});

// 2. SAVING BULK STATE fallback
app.post('/api/state/save', (req, res) => {
  const fields = req.body;
  const db = readLocalDB();
  const next = { ...db, ...fields };
  writeLocalDB(next);
  res.json({ success: true });
});

// 3. VEHICLE CRUD fallback
app.post('/api/vehicles', (req, res) => {
  const vehicle = req.body;
  const db = readLocalDB();
  db.vehicles = [vehicle, ...db.vehicles];
  writeLocalDB(db);
  res.json({ success: true, entity: vehicle });
});

app.put('/api/vehicles/:id', (req, res) => {
  const id = req.params.id;
  const fields = req.body;
  const db = readLocalDB();
  db.vehicles = db.vehicles.map((v: any) => v.id === id ? { ...v, ...fields } : v);
  writeLocalDB(db);
  res.json({ success: true, entity: db.vehicles.find((v: any) => v.id === id) });
});

app.delete('/api/vehicles/:id', (req, res) => {
  const id = req.params.id;
  const db = readLocalDB();
  db.vehicles = db.vehicles.filter((v: any) => v.id !== id);
  writeLocalDB(db);
  res.json({ success: true, id });
});

// 4. DRIVER CRUD fallback
app.post('/api/drivers', (req, res) => {
  const driver = req.body;
  const db = readLocalDB();
  db.drivers = [driver, ...db.drivers];
  writeLocalDB(db);
  res.json({ success: true, entity: driver });
});

app.put('/api/drivers/:id', (req, res) => {
  const id = req.params.id;
  const fields = req.body;
  const db = readLocalDB();
  db.drivers = db.drivers.map((d: any) => d.id === id ? { ...d, ...fields } : d);
  writeLocalDB(db);
  res.json({ success: true, entity: db.drivers.find((d: any) => d.id === id) });
});

app.delete('/api/drivers/:id', (req, res) => {
  const id = req.params.id;
  const db = readLocalDB();
  db.drivers = db.drivers.filter((d: any) => d.id !== id);
  writeLocalDB(db);
  res.json({ success: true, id });
});

// 5. MAINTENANCE CRUD fallback
app.post('/api/maintenance', (req, res) => {
  const log = req.body;
  const db = readLocalDB();
  db.maintenanceLogs = [log, ...db.maintenanceLogs];
  writeLocalDB(db);
  res.json({ success: true, entity: log });
});

app.put('/api/maintenance/:id', (req, res) => {
  const id = req.params.id;
  const fields = req.body;
  const db = readLocalDB();
  db.maintenanceLogs = db.maintenanceLogs.map((m: any) => m.id === id ? { ...m, ...fields } : m);
  writeLocalDB(db);
  res.json({ success: true, entity: db.maintenanceLogs.find((m: any) => m.id === id) });
});

app.delete('/api/maintenance/:id', (req, res) => {
  const id = req.params.id;
  const db = readLocalDB();
  db.maintenanceLogs = db.maintenanceLogs.filter((m: any) => m.id !== id);
  writeLocalDB(db);
  res.json({ success: true, id });
});

// 6. CHECKLISTS SUBMISSION fallback
app.post('/api/checklists', (req, res) => {
  const checklist = req.body;
  const db = readLocalDB();
  db.dailyChecklists = [checklist, ...db.dailyChecklists];
  writeLocalDB(db);
  res.json({ success: true, entity: checklist });
});

// 7. EXPENSES CRUD fallback
app.post('/api/expenses', (req, res) => {
  const expense = req.body;
  const db = readLocalDB();
  db.expenses = [expense, ...db.expenses];
  writeLocalDB(db);
  res.json({ success: true, entity: expense });
});

app.delete('/api/expenses/:id', (req, res) => {
  const id = req.params.id;
  const db = readLocalDB();
  db.expenses = db.expenses.filter((e: any) => e.id !== id);
  writeLocalDB(db);
  res.json({ success: true, id });
});

// 8. NOTIFICATIONS update fallback
app.put('/api/notifications/:id', (req, res) => {
  const id = req.params.id;
  const fields = req.body;
  const db = readLocalDB();
  db.notifications = db.notifications.map((n: any) => n.id === id ? { ...n, ...fields } : n);
  writeLocalDB(db);
  res.json({ success: true, entity: db.notifications.find((n: any) => n.id === id) });
});

// 9. ACTIVITIES creation fallback
app.post('/api/activities', (req, res) => {
  const activity = req.body;
  const db = readLocalDB();
  db.activityLogs = [activity, ...db.activityLogs];
  writeLocalDB(db);
  res.json({ success: true, entity: activity });
});

// --- CLIENT SERVER INTERACTION & STATIC SERVING ---
async function startAppServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CSRJ Fleet Server running nicely on port ${PORT}`);
    console.log(`💡 DB connections freed up. Direct integrations point to VITE_API_BASE_URL context.`);
  });
}

startAppServer();
