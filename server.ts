import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import oracledb from 'oracledb';

// ============================================
// INITIALIZING CONFIGURATION
// ============================================
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Set default outFormat
;(oracledb as any).outFormat = oracledb.OUT_FORMAT_OBJECT;

// ============================================
// LOCAL JSON FALLBACK STORAGE
// ============================================
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default initial simulation seed data
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

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2));
}

function readLocalDB() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local DB, returning initial data:', e);
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

// ============================================
// ORACLE DATABASE INTEGRATION
// ============================================
let oracleConnectionPool: oracledb.Pool | null = null;
let isOracleActive = false;

// 🔒 Masking connection string untuk log (sembunyikan IP & password)
function maskConnectString(connectString: string): string {
  return connectString
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '***.***.***.***')
    .replace(/HOST\s*=\s*([^)]+)/i, 'HOST=***')
    .replace(/SID\s*=\s*(\w+)/i, 'SID=***');
}

// 🔒 Validasi environment variables
function validateOracleEnv(): { user: string; password: string; connectString: string } | null {
  const user = process.env.ORACLE_DB_USER;
  const password = process.env.ORACLE_DB_PASSWORD;
  const connectString = process.env.ORACLE_DB_CONNECT_STRING;

  if (!user || !password || !connectString) {
    return null;
  }

  // Hapus quote jika ada
  return {
    user,
    password,
    connectString: connectString.replace(/"/g, '').trim()
  };
}

// Sync data ke Oracle dengan error handling
async function syncWithOracle(dataType: string, id: string, entityData: any, operationType: 'INSERT' | 'UPDATE' | 'DELETE') {
  if (!isOracleActive || !oracleConnectionPool) return;

  let connection: oracledb.Connection | null = null;
  try {
    connection = await oracleConnectionPool.getConnection();
    const conn = connection!;

    // SQL operations untuk setiap tipe data
    const sqlOperations: Record<string, Record<string, Function>> = {
      vehicles: {
        DELETE: () => conn.execute(`DELETE FROM GAWB_T_VEHICLES WHERE ID = :id`, [id], { autoCommit: true }),
        INSERT: () => {
          const sql = `INSERT INTO GAWB_T_VEHICLES (ID, PLATE_NUMBER, MODEL, YEAR, COLOR, MILEAGE, STATUS, DRIVER_NAME, DRIVER_ID, CHASSIS_NUMBER) 
                       VALUES (:id, :plateNumber, :model, :year, :color, :mileage, :status, :driverName, :driverId, :chassisNumber)`;
          return conn.execute(sql, {
            id,
            plateNumber: entityData.plateNumber,
            model: entityData.model,
            year: Number(entityData.year),
            color: entityData.color,
            mileage: Number(entityData.mileage),
            status: entityData.status,
            driverName: entityData.driverName || '',
            driverId: entityData.driverId || '',
            chassisNumber: entityData.chassisNumber || ''
          }, { autoCommit: true });
        },
        UPDATE: () => {
          const sql = `UPDATE GAWB_T_VEHICLES SET PLATE_NUMBER = :plateNumber, MODEL = :model, YEAR = :year, COLOR = :color, 
                       MILEAGE = :mileage, STATUS = :status, DRIVER_NAME = :driverName, DRIVER_ID = :driverId, 
                       CHASSIS_NUMBER = :chassisNumber WHERE ID = :id`;
          return conn.execute(sql, {
            id,
            plateNumber: entityData.plateNumber,
            model: entityData.model,
            year: Number(entityData.year),
            color: entityData.color,
            mileage: Number(entityData.mileage),
            status: entityData.status,
            driverName: entityData.driverName || '',
            driverId: entityData.driverId || '',
            chassisNumber: entityData.chassisNumber || ''
          }, { autoCommit: true });
        }
      },
      drivers: {
        DELETE: () => conn.execute(`DELETE FROM GAWB_T_DRIVERS WHERE ID = :id`, [id], { autoCommit: true }),
        INSERT: () => {
          const sql = `INSERT INTO GAWB_T_DRIVERS (ID, NAME, PHONE, SIM_NUMBER, SIM_EXPIRY, ASSIGNED_VEHICLE_PLATE, STATUS, ACCOUNT_EMAIL, AVATAR_TEXT) 
                       VALUES (:id, :name, :phone, :simNumber, :simExpiry, :assignedVehiclePlate, :status, :accountEmail, :avatarText)`;
          return conn.execute(sql, {
            id,
            name: entityData.name,
            phone: entityData.phone,
            simNumber: entityData.simNumber,
            simExpiry: entityData.simExpiry,
            assignedVehiclePlate: entityData.assignedVehiclePlate || '',
            status: entityData.status,
            accountEmail: entityData.accountEmail || '',
            avatarText: entityData.avatarText || 'DR'
          }, { autoCommit: true });
        },
        UPDATE: () => {
          const sql = `UPDATE GAWB_T_DRIVERS SET NAME = :name, PHONE = :phone, SIM_NUMBER = :simNumber, SIM_EXPIRY = :simExpiry, 
                       ASSIGNED_VEHICLE_PLATE = :assignedVehiclePlate, STATUS = :status, ACCOUNT_EMAIL = :accountEmail, 
                       AVATAR_TEXT = :avatarText WHERE ID = :id`;
          return conn.execute(sql, {
            id,
            name: entityData.name,
            phone: entityData.phone,
            simNumber: entityData.simNumber,
            simExpiry: entityData.simExpiry,
            assignedVehiclePlate: entityData.assignedVehiclePlate || '',
            status: entityData.status,
            accountEmail: entityData.accountEmail || '',
            avatarText: entityData.avatarText || 'DR'
          }, { autoCommit: true });
        }
      },
      maintenanceLogs: {
        DELETE: () => conn.execute(`DELETE FROM GAWB_T_MAINTENANCE WHERE ID = :id`, [id], { autoCommit: true }),
        INSERT: () => {
          const sql = `INSERT INTO GAWB_T_MAINTENANCE (ID, VEHICLE_PLATE, VEHICLE_MODEL, SERVICE_TYPE, LOG_DATE, COST, WORKSHOP, STATUS, NOTES) 
                       VALUES (:id, :vehiclePlate, :vehicleModel, :serviceType, :log_date, :cost, :workshop, :status, :notes)`;
          return conn.execute(sql, {
            id,
            vehiclePlate: entityData.vehiclePlate,
            vehicleModel: entityData.vehicleModel,
            serviceType: entityData.serviceType,
            log_date: entityData.date,
            cost: Number(entityData.cost),
            workshop: entityData.workshop,
            status: entityData.status,
            notes: entityData.notes || ''
          }, { autoCommit: true });
        },
        UPDATE: () => {
          const sql = `UPDATE GAWB_T_MAINTENANCE SET VEHICLE_PLATE = :vehiclePlate, VEHICLE_MODEL = :vehicleModel, SERVICE_TYPE = :serviceType, 
                       LOG_DATE = :log_date, COST = :cost, WORKSHOP = :workshop, STATUS = :status, NOTES = :notes WHERE ID = :id`;
          return conn.execute(sql, {
            id,
            vehiclePlate: entityData.vehiclePlate,
            vehicleModel: entityData.vehicleModel,
            serviceType: entityData.serviceType,
            log_date: entityData.date,
            cost: Number(entityData.cost),
            workshop: entityData.workshop,
            status: entityData.status,
            notes: entityData.notes || ''
          }, { autoCommit: true });
        }
      },
      dailyChecklists: {
        INSERT: () => {
          const sql = `INSERT INTO GAWB_T_DAILY_CHECKLISTS (ID, VEHICLE_PLATE, DRIVER_NAME, LOG_DATE, LOG_TIME, RESULTS_JSON, NOTES, STATUS) 
                       VALUES (:id, :vehiclePlate, :driverName, :log_date, :log_time, :resultsJson, :notes, :status)`;
          return conn.execute(sql, {
            id,
            vehiclePlate: entityData.vehiclePlate,
            driverName: entityData.driverName,
            log_date: entityData.date,
            log_time: entityData.time,
            resultsJson: JSON.stringify(entityData.results),
            notes: entityData.notes || '',
            status: entityData.status
          }, { autoCommit: true });
        }
      },
      expenses: {
        DELETE: () => conn.execute(`DELETE FROM GAWB_T_EXPENSES WHERE ID = :id`, [id], { autoCommit: true }),
        INSERT: () => {
          const sql = `INSERT INTO GAWB_T_EXPENSES (ID, EXPENSE_DATE, VEHICLE_PLATE, CATEGORY, DESCRIPTION, AMOUNT, DRIVER_NAME) 
                       VALUES (:id, :expenseDate, :vehiclePlate, :category, :description, :amount, :driverName)`;
          return conn.execute(sql, {
            id,
            expenseDate: entityData.date,
            vehiclePlate: entityData.vehiclePlate,
            category: entityData.category,
            description: entityData.description,
            amount: Number(entityData.amount),
            driverName: entityData.driverName
          }, { autoCommit: true });
        }
      },
      activityLogs: {
        INSERT: () => {
          const sql = `INSERT INTO GAWB_T_ACTIVITY_LOGS (ID, USERNAME, USER_ROLE, ACTION_DONE, DETAILS, TIMESTAMP_STR) 
                       VALUES (:id, :username, :userRole, :actionDone, :details, :timestampStr)`;
          return conn.execute(sql, {
            id,
            username: entityData.username,
            userRole: entityData.role,
            actionDone: entityData.action,
            details: entityData.details,
            timestampStr: entityData.timestamp
          }, { autoCommit: true });
        }
      },
      notifications: {
        UPDATE: () => {
          const sql = `UPDATE GAWB_T_NOTIFICATIONS SET READ_STATUS = :readStatus WHERE ID = :id`;
          return conn.execute(sql, {
            id,
            readStatus: entityData.read ? 1 : 0
          }, { autoCommit: true });
        }
      }
    };

    const operation = sqlOperations[dataType]?.[operationType];
    if (operation) {
      await operation();
      console.log(`✅ Oracle synced: [${operationType}] ${dataType} (ID: ${id})`);
    } else {
      console.warn(`⚠️ No SQL operation defined for ${dataType} ${operationType}`);
    }
  } catch (err) {
    console.error(`❌ Error syncing Oracle for ${dataType}:`, err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing Oracle connection:', err);
      }
    }
  }
}

// Bootstrap tables dengan error handling yang lebih baik
async function bootstrapTables() {
  if (!oracleConnectionPool) return;
  let connection: oracledb.Connection | null = null;
  try {
    connection = await oracleConnectionPool.getConnection();

    const tables = [
      {
        name: 'GAWB_T_VEHICLES',
        sql: `CREATE TABLE GAWB_T_VEHICLES (
          ID VARCHAR2(100) PRIMARY KEY,
          PLATE_NUMBER VARCHAR2(50) NOT NULL,
          MODEL VARCHAR2(100),
          YEAR NUMBER,
          COLOR VARCHAR2(50),
          MILEAGE NUMBER,
          STATUS VARCHAR2(50),
          DRIVER_NAME VARCHAR2(100),
          DRIVER_ID VARCHAR2(100),
          CHASSIS_NUMBER VARCHAR2(100)
        )`
      },
      {
        name: 'GAWB_T_DRIVERS',
        sql: `CREATE TABLE GAWB_T_DRIVERS (
          ID VARCHAR2(100) PRIMARY KEY,
          NAME VARCHAR2(100) NOT NULL,
          PHONE VARCHAR2(50),
          SIM_NUMBER VARCHAR2(100),
          SIM_EXPIRY VARCHAR2(50),
          ASSIGNED_VEHICLE_PLATE VARCHAR2(50),
          STATUS VARCHAR2(50),
          ACCOUNT_EMAIL VARCHAR2(100),
          AVATAR_TEXT VARCHAR2(20)
        )`
      },
      {
        name: 'GAWB_T_MAINTENANCE',
        sql: `CREATE TABLE GAWB_T_MAINTENANCE (
          ID VARCHAR2(100) PRIMARY KEY,
          VEHICLE_PLATE VARCHAR2(50) NOT NULL,
          VEHICLE_MODEL VARCHAR2(100),
          SERVICE_TYPE VARCHAR2(50),
          LOG_DATE VARCHAR2(50),
          COST NUMBER,
          WORKSHOP VARCHAR2(150),
          STATUS VARCHAR2(50),
          NOTES CLOB
        )`
      },
      {
        name: 'GAWB_T_DAILY_CHECKLISTS',
        sql: `CREATE TABLE GAWB_T_DAILY_CHECKLISTS (
          ID VARCHAR2(100) PRIMARY KEY,
          VEHICLE_PLATE VARCHAR2(50) NOT NULL,
          DRIVER_NAME VARCHAR2(100),
          LOG_DATE VARCHAR2(50),
          LOG_TIME VARCHAR2(50),
          RESULTS_JSON CLOB,
          NOTES CLOB,
          STATUS VARCHAR2(50)
        )`
      },
      {
        name: 'GAWB_T_EXPENSES',
        sql: `CREATE TABLE GAWB_T_EXPENSES (
          ID VARCHAR2(100) PRIMARY KEY,
          EXPENSE_DATE VARCHAR2(50),
          VEHICLE_PLATE VARCHAR2(50),
          CATEGORY VARCHAR2(50),
          DESCRIPTION VARCHAR2(200),
          AMOUNT NUMBER,
          DRIVER_NAME VARCHAR2(100)
        )`
      },
      {
        name: 'GAWB_T_ACTIVITY_LOGS',
        sql: `CREATE TABLE GAWB_T_ACTIVITY_LOGS (
          ID VARCHAR2(100) PRIMARY KEY,
          USERNAME VARCHAR2(100),
          USER_ROLE VARCHAR2(50),
          ACTION_DONE VARCHAR2(100),
          DETAILS VARCHAR2(250),
          TIMESTAMP_STR VARCHAR2(100)
        )`
      },
      {
        name: 'GAWB_T_NOTIFICATIONS',
        sql: `CREATE TABLE GAWB_T_NOTIFICATIONS (
          ID VARCHAR2(100) PRIMARY KEY,
          TYPE VARCHAR2(50),
          TITLE VARCHAR2(150),
          MESSAGE VARCHAR2(250),
          NOTIF_DATE VARCHAR2(50),
          VEHICLE_PLATE VARCHAR2(50),
          READ_STATUS NUMBER(1) DEFAULT 0
        )`
      }
    ];

    for (const table of tables) {
      try {
        await connection.execute(`SELECT 1 FROM ${table.name} WHERE ROWNUM = 1`);
        console.log(`✅ Table ${table.name} exists`);
      } catch {
        console.log(`🔨 Creating table: ${table.name}...`);
        await connection.execute(table.sql);
        console.log(`✅ Table ${table.name} created`);
      }
    }

    console.log('✅ All Oracle tables ready');

  } catch (err) {
    console.error('❌ Error bootstrapping tables:', err);
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) {}
    }
  }
}

// Initialize Oracle dengan retry mechanism
async function initOracle() {
  const env = validateOracleEnv();

  if (!env) {
    console.log('⚠️ Oracle config incomplete (.env missing ORACLE_DB_USER, ORACLE_DB_PASSWORD, or ORACLE_DB_CONNECT_STRING)');
    console.log('👉 Fallback to local JSON database (data/db.json)');
    return;
  }

  try {
    console.log(`🔌 Connecting to Oracle as user: ${env.user}`);
    console.log(`📍 Connection: ${maskConnectString(env.connectString)}`);

    const poolConfig = {
      user: env.user,
      password: env.password,
      connectString: env.connectString,
      poolMin: parseInt(process.env.ORACLE_POOL_MIN || '1'),
      poolMax: parseInt(process.env.ORACLE_POOL_MAX || '5'),
      poolIncrement: parseInt(process.env.ORACLE_POOL_INCREMENT || '1'),
      // ✅ FIX: Tambah timeout settings
      connectTimeout: 60000,
      transportConnectTimeout: 60000,
      queueTimeout: 120000,  // Naikkan queue timeout
      poolAlias: 'csrj_pool' // Untuk debugging
    } as unknown as oracledb.PoolAttributes;

    oracleConnectionPool = await oracledb.createPool(poolConfig);

    isOracleActive = true;
    console.log('✅ Connected to Oracle Database (Thin Mode)');
    await bootstrapTables();
  } catch (err) {
    console.error('❌ Failed to connect to Oracle:', err);
    console.log('👉 Fallback to local JSON database (data/db.json)');
  }
}

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  if (oracleConnectionPool && isOracleActive) {
    try {
      await oracleConnectionPool.close();
      console.log('✅ Oracle pool closed');
    } catch (err) {
      console.error('Error closing Oracle pool:', err);
    }
  }

  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============================================
// REST API ENDPOINTS
// ============================================

// Get all data
app.get('/api/all-data', (req, res) => {
  const db = readLocalDB();
  res.json(db);
});

// Save state
app.post('/api/state/save', (req, res) => {
  const incomingData = req.body;
  writeLocalDB(incomingData);
  res.json({ success: true, message: 'Local DB updated' });
});

// ============================================
// VEHICLES CRUD
// ============================================
app.post('/api/vehicles', async (req, res) => {
  const vehicle = req.body;
  const db = readLocalDB();
  db.vehicles = [vehicle, ...db.vehicles];
  writeLocalDB(db);
  await syncWithOracle('vehicles', vehicle.id, vehicle, 'INSERT');
  res.json({ success: true, entity: vehicle });
});

app.put('/api/vehicles/:id', async (req, res) => {
  const id = req.params.id;
  const fields = req.body;
  const db = readLocalDB();
  db.vehicles = db.vehicles.map((v: any) => v.id === id ? { ...v, ...fields } : v);
  writeLocalDB(db);
  const updated = db.vehicles.find((v: any) => v.id === id);
  if (updated) await syncWithOracle('vehicles', id, updated, 'UPDATE');
  res.json({ success: true, entity: updated });
});

app.delete('/api/vehicles/:id', async (req, res) => {
  const id = req.params.id;
  const db = readLocalDB();
  db.vehicles = db.vehicles.filter((v: any) => v.id !== id);
  writeLocalDB(db);
  await syncWithOracle('vehicles', id, null, 'DELETE');
  res.json({ success: true, id });
});

// ============================================
// DRIVERS CRUD
// ============================================
app.post('/api/drivers', async (req, res) => {
  const driver = req.body;
  const db = readLocalDB();
  db.drivers = [driver, ...db.drivers];
  writeLocalDB(db);
  await syncWithOracle('drivers', driver.id, driver, 'INSERT');
  res.json({ success: true, entity: driver });
});

app.put('/api/drivers/:id', async (req, res) => {
  const id = req.params.id;
  const fields = req.body;
  const db = readLocalDB();
  db.drivers = db.drivers.map((d: any) => d.id === id ? { ...d, ...fields } : d);
  writeLocalDB(db);
  const updated = db.drivers.find((d: any) => d.id === id);
  if (updated) await syncWithOracle('drivers', id, updated, 'UPDATE');
  res.json({ success: true, entity: updated });
});

app.delete('/api/drivers/:id', async (req, res) => {
  const id = req.params.id;
  const db = readLocalDB();
  db.drivers = db.drivers.filter((d: any) => d.id !== id);
  writeLocalDB(db);
  await syncWithOracle('drivers', id, null, 'DELETE');
  res.json({ success: true, id });
});

// ============================================
// MAINTENANCE CRUD
// ============================================
app.post('/api/maintenance', async (req, res) => {
  const log = req.body;
  const db = readLocalDB();
  db.maintenanceLogs = [log, ...db.maintenanceLogs];
  writeLocalDB(db);
  await syncWithOracle('maintenanceLogs', log.id, log, 'INSERT');
  res.json({ success: true, entity: log });
});

app.put('/api/maintenance/:id', async (req, res) => {
  const id = req.params.id;
  const fields = req.body;
  const db = readLocalDB();
  db.maintenanceLogs = db.maintenanceLogs.map((m: any) => m.id === id ? { ...m, ...fields } : m);
  writeLocalDB(db);
  const updated = db.maintenanceLogs.find((m: any) => m.id === id);
  if (updated) await syncWithOracle('maintenanceLogs', id, updated, 'UPDATE');
  res.json({ success: true, entity: updated });
});

app.delete('/api/maintenance/:id', async (req, res) => {
  const id = req.params.id;
  const db = readLocalDB();
  db.maintenanceLogs = db.maintenanceLogs.filter((m: any) => m.id !== id);
  writeLocalDB(db);
  await syncWithOracle('maintenanceLogs', id, null, 'DELETE');
  res.json({ success: true, id });
});

// ============================================
// CHECKLISTS
// ============================================
app.post('/api/checklists', async (req, res) => {
  const checklist = req.body;
  const db = readLocalDB();
  db.dailyChecklists = [checklist, ...db.dailyChecklists];
  writeLocalDB(db);
  await syncWithOracle('dailyChecklists', checklist.id, checklist, 'INSERT');
  res.json({ success: true, entity: checklist });
});

// ============================================
// EXPENSES CRUD
// ============================================
app.post('/api/expenses', async (req, res) => {
  const expense = req.body;
  const db = readLocalDB();
  db.expenses = [expense, ...db.expenses];
  writeLocalDB(db);
  await syncWithOracle('expenses', expense.id, expense, 'INSERT');
  res.json({ success: true, entity: expense });
});

app.delete('/api/expenses/:id', async (req, res) => {
  const id = req.params.id;
  const db = readLocalDB();
  db.expenses = db.expenses.filter((e: any) => e.id !== id);
  writeLocalDB(db);
  await syncWithOracle('expenses', id, null, 'DELETE');
  res.json({ success: true, id });
});

// ============================================
// NOTIFICATIONS
// ============================================
app.put('/api/notifications/:id', async (req, res) => {
  const id = req.params.id;
  const fields = req.body;
  const db = readLocalDB();
  db.notifications = db.notifications.map((n: any) => n.id === id ? { ...n, ...fields } : n);
  writeLocalDB(db);
  const updated = db.notifications.find((n: any) => n.id === id);
  if (updated) await syncWithOracle('notifications', id, updated, 'UPDATE');
  res.json({ success: true, entity: updated });
});

// ============================================
// ACTIVITY LOGS
// ============================================
app.post('/api/activities', async (req, res) => {
  const activity = req.body;
  const db = readLocalDB();
  db.activityLogs = [activity, ...db.activityLogs];
  writeLocalDB(db);
  await syncWithOracle('activityLogs', activity.id, activity, 'INSERT');
  res.json({ success: true, entity: activity });
});

// ============================================
// DATABASE CHECK ENDPOINTS
// ============================================

// 1. Status koneksi & info database
app.get('/api/database/status', async (req, res) => {
  let connection: oracledb.Connection | null = null;
  let oracleDetails = null;

  if (isOracleActive && oracleConnectionPool) {
    try {
      connection = await oracleConnectionPool.getConnection();

      const versionResult = await connection.execute(
        `SELECT banner FROM v$version WHERE banner LIKE 'Oracle%'`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const userResult = await connection.execute(
        `SELECT user FROM dual`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const tablesResult = await connection.execute(
        `SELECT table_name FROM user_tables ORDER BY table_name`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      oracleDetails = {
        version: versionResult.rows?.[0]?.BANNER || 'Unknown',
        user: userResult.rows?.[0]?.USER || 'Unknown',
        tables: tablesResult.rows?.map((r: any) => r.TABLE_NAME) || [],
        tableCount: tablesResult.rows?.length || 0
      };

    } catch (err) {
      console.error('Error checking Oracle status:', err);
    } finally {
      if (connection) {
        try { await connection.close(); } catch (e) {}
      }
    }
  }

  res.json({
    connected: isOracleActive,
    provider: isOracleActive ? 'Oracle Database (Thin Mode)' : 'Local File Storage (data/db.json)',
    environmentSet: !!(process.env.ORACLE_DB_USER && process.env.ORACLE_DB_PASSWORD && process.env.ORACLE_DB_CONNECT_STRING),
    oracleDetails,
    localDB: {
      fileExists: fs.existsSync(DB_FILE),
      fileSize: fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE).size : 0
    }
  });
});

// 2. Hitung jumlah data per tabel
app.get('/api/database/counts', async (req, res) => {
  if (!isOracleActive || !oracleConnectionPool) {
    return res.status(503).json({
      error: 'Oracle not connected',
      message: 'Database Oracle tidak terkoneksi. Menggunakan local JSON fallback.'
    });
  }

  let connection: oracledb.Connection | null = null;
  try {
    connection = await oracleConnectionPool.getConnection();

    const tables = [
      'GAWB_T_VEHICLES', 'GAWB_T_DRIVERS', 'GAWB_T_MAINTENANCE', 
      'GAWB_T_DAILY_CHECKLISTS', 'GAWB_T_EXPENSES', 'GAWB_T_ACTIVITY_LOGS', 'GAWB_T_NOTIFICATIONS'
    ];

    const counts: Record<string, number> = {};

    for (const table of tables) {
      try {
        const result = await connection.execute(
          `SELECT COUNT(*) as count FROM ${table}`,
          [],
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        counts[table] = result.rows?.[0]?.COUNT || 0;
      } catch {
        counts[table] = -1;
      }
    }

    res.json({
      connected: true,
      counts,
      totalRecords: Object.values(counts).reduce((a, b) => a + (b > 0 ? b : 0), 0)
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to get counts', details: String(err) });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) {}
    }
  }
});

// 3. Lihat sample data dari tabel
app.get('/api/database/sample/:table', async (req, res) => {
  if (!isOracleActive || !oracleConnectionPool) {
    return res.status(503).json({ error: 'Oracle not connected' });
  }

  const tableName = req.params.table.toUpperCase();
  const validTables = ['GAWB_T_VEHICLES', 'GAWB_T_DRIVERS', 'GAWB_T_MAINTENANCE', 'GAWB_T_DAILY_CHECKLISTS', 
                       'GAWB_T_EXPENSES', 'GAWB_T_ACTIVITY_LOGS', 'GAWB_T_NOTIFICATIONS'];

  if (!validTables.includes(tableName)) {
    return res.status(400).json({ error: 'Invalid table name', validTables });
  }

  let connection: oracledb.Connection | null = null;
  try {
    connection = await oracleConnectionPool.getConnection();

    const result = await connection.execute(
      `SELECT * FROM ${tableName} FETCH FIRST 5 ROWS ONLY`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({
      table: tableName,
      rowCount: result.rows?.length || 0,
      columns: result.metaData?.map((m: any) => m.name) || [],
      data: result.rows || []
    });

  } catch (err) {
    res.status(500).json({ error: `Failed to query ${tableName}`, details: String(err) });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) {}
    }
  }
});

// 4. Test INSERT ke Oracle
app.post('/api/database/test-insert', async (req, res) => {
  if (!isOracleActive || !oracleConnectionPool) {
    return res.status(503).json({ error: 'Oracle not connected' });
  }

  let connection: oracledb.Connection | null = null;
  try {
    connection = await oracleConnectionPool.getConnection();

    const testId = `test-${Date.now()}`;

    await connection.execute(
      `INSERT INTO GAWB_T_VEHICLES (ID, PLATE_NUMBER, MODEL, YEAR, COLOR, MILEAGE, STATUS) 
       VALUES (:id, :plate, :model, :year, :color, :mileage, :status)`,
      {
        id: testId,
        plate: 'TEST-1234',
        model: 'Test Vehicle',
        year: 2024,
        color: 'Test',
        mileage: 0,
        status: 'test'
      },
      { autoCommit: true }
    );

    const verify = await connection.execute(
      `SELECT * FROM GAWB_T_VEHICLES WHERE ID = :id`,
      [testId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await connection.execute(
      `DELETE FROM GAWB_T_VEHICLES WHERE ID = :id`,
      [testId],
      { autoCommit: true }
    );

    res.json({
      success: true,
      message: 'Test INSERT berhasil!',
      inserted: verify.rows?.[0] || null
    });

  } catch (err) {
    res.status(500).json({ error: 'Test INSERT gagal', details: String(err) });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) {}
    }
  }
});

// 5. Sync local JSON ke Oracle (migration) - VERSI LENGKAP
app.post('/api/database/sync-all', async (req, res) => {
  if (!isOracleActive || !oracleConnectionPool) {
    return res.status(503).json({
      error: 'Oracle not connected',
      message: 'Database Oracle tidak terkoneksi. Cek .env dan restart server.'
    });
  }

  const db = readLocalDB();
  const results: Record<string, { inserted: number; skipped: number; errors: string[] }> = {};

  let connection: oracledb.Connection | null = null;

  try {
    connection = await oracleConnectionPool.getConnection();

    // ========== 1. SYNC VEHICLES ==========
    console.log('🚗 Syncing vehicles...');
    results.vehicles = { inserted: 0, skipped: 0, errors: [] };

    for (const v of db.vehicles) {
      try {
        const exists = await connection.execute(
          `SELECT 1 FROM GAWB_T_VEHICLES WHERE ID = :id`,
          [v.id],
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (exists.rows && exists.rows.length > 0) {
          results.vehicles.skipped++;
          continue;
        }

        await connection.execute(
          `INSERT INTO GAWB_T_VEHICLES (ID, PLATE_NUMBER, MODEL, YEAR, COLOR, MILEAGE, STATUS, DRIVER_NAME, DRIVER_ID, CHASSIS_NUMBER) 
           VALUES (:id, :plate, :model, :year, :color, :mileage, :status, :driverName, :driverId, :chassis)`,
          {
            id: v.id,
            plate: v.plateNumber,
            model: v.model,
            year: v.year,
            color: v.color,
            mileage: v.mileage,
            status: v.status,
            driverName: v.driverName || '',
            driverId: v.driverId || '',
            chassis: v.chassisNumber || ''
          },
          { autoCommit: true }
        );
        results.vehicles.inserted++;
      } catch (err: any) {
        results.vehicles.errors.push(`ID ${v.id}: ${err.message}`);
      }
    }

    // ========== 2. SYNC DRIVERS ==========
    console.log('👨‍✈️ Syncing drivers...');
    results.drivers = { inserted: 0, skipped: 0, errors: [] };

    for (const d of db.drivers) {
      try {
        const exists = await connection.execute(
          `SELECT 1 FROM GAWB_T_DRIVERS WHERE ID = :id`,
          [d.id],
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (exists.rows && exists.rows.length > 0) {
          results.drivers.skipped++;
          continue;
        }

        await connection.execute(
          `INSERT INTO GAWB_T_DRIVERS (ID, NAME, PHONE, SIM_NUMBER, SIM_EXPIRY, ASSIGNED_VEHICLE_PLATE, STATUS, ACCOUNT_EMAIL, AVATAR_TEXT) 
           VALUES (:id, :name, :phone, :sim, :simExpiry, :plate, :status, :email, :avatar)`,
          {
            id: d.id,
            name: d.name,
            phone: d.phone,
            sim: d.simNumber,
            simExpiry: d.simExpiry,
            plate: d.assignedVehiclePlate || '',
            status: d.status,
            email: d.accountEmail || '',
            avatar: d.avatarText || 'DR'
          },
          { autoCommit: true }
        );
        results.drivers.inserted++;
      } catch (err: any) {
        results.drivers.errors.push(`ID ${d.id}: ${err.message}`);
      }
    }

    // ========== 3. SYNC MAINTENANCE ==========
    console.log('🔧 Syncing maintenance logs...');
    results.maintenance = { inserted: 0, skipped: 0, errors: [] };

    for (const m of db.maintenanceLogs) {
      try {
        const exists = await connection.execute(
          `SELECT 1 FROM GAWB_T_MAINTENANCE WHERE ID = :id`,
          [m.id],
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (exists.rows && exists.rows.length > 0) {
          results.maintenance.skipped++;
          continue;
        }

        await connection.execute(
          `INSERT INTO GAWB_T_MAINTENANCE (ID, VEHICLE_PLATE, VEHICLE_MODEL, SERVICE_TYPE, LOG_DATE, COST, WORKSHOP, STATUS, NOTES) 
           VALUES (:id, :plate, :model, :service, :logDate, :cost, :workshop, :status, :notes)`,
          {
            id: m.id,
            plate: m.vehiclePlate,
            model: m.vehicleModel,
            service: m.serviceType,
            logDate: m.date,
            cost: m.cost,
            workshop: m.workshop,
            status: m.status,
            notes: m.notes || ''
          },
          { autoCommit: true }
        );
        results.maintenance.inserted++;
      } catch (err: any) {
        results.maintenance.errors.push(`ID ${m.id}: ${err.message}`);
      }
    }

    // ========== 4. SYNC DAILY CHECKLISTS ==========
    console.log('📋 Syncing daily checklists...');
    results.checklists = { inserted: 0, skipped: 0, errors: [] };

    for (const c of db.dailyChecklists) {
      try {
        const exists = await connection.execute(
          `SELECT 1 FROM GAWB_T_DAILY_CHECKLISTS WHERE ID = :id`,
          [c.id],
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (exists.rows && exists.rows.length > 0) {
          results.checklists.skipped++;
          continue;
        }

        await connection.execute(
          `INSERT INTO GAWB_T_DAILY_CHECKLISTS (ID, VEHICLE_PLATE, DRIVER_NAME, LOG_DATE, LOG_TIME, RESULTS_JSON, NOTES, STATUS) 
           VALUES (:id, :plate, :driver, :logDate, :logTime, :results, :notes, :status)`,
          {
            id: c.id,
            plate: c.vehiclePlate,
            driver: c.driverName,
            logDate: c.date,
            logTime: c.time,
            results: JSON.stringify(c.results),
            notes: c.notes || '',
            status: c.status
          },
          { autoCommit: true }
        );
        results.checklists.inserted++;
      } catch (err: any) {
        results.checklists.errors.push(`ID ${c.id}: ${err.message}`);
      }
    }

    // ========== 5. SYNC EXPENSES ==========
    console.log('💰 Syncing expenses...');
    results.expenses = { inserted: 0, skipped: 0, errors: [] };

    for (const e of db.expenses) {
      try {
        const exists = await connection.execute(
          `SELECT 1 FROM GAWB_T_EXPENSES WHERE ID = :id`,
          [e.id],
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (exists.rows && exists.rows.length > 0) {
          results.expenses.skipped++;
          continue;
        }

        await connection.execute(
          `INSERT INTO GAWB_T_EXPENSES (ID, EXPENSE_DATE, VEHICLE_PLATE, CATEGORY, DESCRIPTION, AMOUNT, DRIVER_NAME) 
           VALUES (:id, :date, :plate, :category, :desc, :amount, :driver)`,
          {
            id: e.id,
            date: e.date,
            plate: e.vehiclePlate,
            category: e.category,
            desc: e.description,
            amount: e.amount,
            driver: e.driverName
          },
          { autoCommit: true }
        );
        results.expenses.inserted++;
      } catch (err: any) {
        results.expenses.errors.push(`ID ${e.id}: ${err.message}`);
      }
    }

    // ========== 6. SYNC ACTIVITY LOGS ==========
    console.log('📝 Syncing activity logs...');
    results.activities = { inserted: 0, skipped: 0, errors: [] };

    for (const a of db.activityLogs) {
      try {
        const exists = await connection.execute(
          `SELECT 1 FROM GAWB_T_ACTIVITY_LOGS WHERE ID = :id`,
          [a.id],
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (exists.rows && exists.rows.length > 0) {
          results.activities.skipped++;
          continue;
        }

        await connection.execute(
          `INSERT INTO GAWB_T_ACTIVITY_LOGS (ID, USERNAME, USER_ROLE, ACTION_DONE, DETAILS, TIMESTAMP_STR) 
           VALUES (:id, :user, :role, :action, :details, :timestamp)`,
          {
            id: a.id,
            user: a.username,
            role: a.role,
            action: a.action,
            details: a.details,
            timestamp: a.timestamp
          },
          { autoCommit: true }
        );
        results.activities.inserted++;
      } catch (err: any) {
        results.activities.errors.push(`ID ${a.id}: ${err.message}`);
      }
    }

    // ========== 7. SYNC NOTIFICATIONS ==========
    console.log('🔔 Syncing notifications...');
    results.notifications = { inserted: 0, skipped: 0, errors: [] };

    for (const n of db.notifications) {
      try {
        const exists = await connection.execute(
          `SELECT 1 FROM GAWB_T_NOTIFICATIONS WHERE ID = :id`,
          [n.id],
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (exists.rows && exists.rows.length > 0) {
          results.notifications.skipped++;
          continue;
        }

        await connection.execute(
          `INSERT INTO GAWB_T_NOTIFICATIONS (ID, TYPE, TITLE, MESSAGE, NOTIF_DATE, VEHICLE_PLATE, READ_STATUS) 
           VALUES (:id, :type, :title, :message, :date, :plate, :read)`,
          {
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            date: n.date,
            plate: n.vehiclePlate,
            read: n.read ? 1 : 0
          },
          { autoCommit: true }
        );
        results.notifications.inserted++;
      } catch (err: any) {
        results.notifications.errors.push(`ID ${n.id}: ${err.message}`);
      }
    }

    // Summary
    const totalInserted = Object.values(results).reduce((sum, r) => sum + r.inserted, 0);
    const totalSkipped = Object.values(results).reduce((sum, r) => sum + r.skipped, 0);

    console.log('✅ Sync completed!');
    console.log(`   Inserted: ${totalInserted}`);
    console.log(`   Skipped: ${totalSkipped}`);

    res.json({
      success: true,
      message: 'Sync completed',
      summary: {
        totalInserted,
        totalSkipped,
        totalErrors: Object.values(results).reduce((sum, r) => sum + r.errors.length, 0)
      },
      results
    });

  } catch (err: any) {
    console.error('❌ Sync failed:', err);
    res.status(500).json({ 
      error: 'Sync failed', 
      details: err.message 
    });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) {}
    }
  }
});

// Sync per tabel (opsional, untuk sync parsial)
app.post('/api/database/sync/:table', async (req, res) => {
  if (!isOracleActive || !oracleConnectionPool) {
    return res.status(503).json({ error: 'Oracle not connected' });
  }

  const tableName = req.params.table;
  const db = readLocalDB();

  let connection: oracledb.Connection | null = null;
  const result = { inserted: 0, skipped: 0, errors: [] as string[] };

  try {
    connection = await oracleConnectionPool.getConnection();

    switch (tableName) {
      case 'vehicles':
        for (const v of db.vehicles) {
          try {
            const exists = await connection.execute(
              `SELECT 1 FROM GAWB_T_VEHICLES WHERE ID = :id`,
              [v.id],
              { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            if (exists.rows && exists.rows.length > 0) { result.skipped++; continue; }
            await connection.execute(
              `INSERT INTO GAWB_T_VEHICLES (ID, PLATE_NUMBER, MODEL, YEAR, COLOR, MILEAGE, STATUS, DRIVER_NAME, DRIVER_ID, CHASSIS_NUMBER) 
               VALUES (:id, :plate, :model, :year, :color, :mileage, :status, :driverName, :driverId, :chassis)`,
              { id: v.id, plate: v.plateNumber, model: v.model, year: v.year, color: v.color, mileage: v.mileage, status: v.status, driverName: v.driverName || '', driverId: v.driverId || '', chassis: v.chassisNumber || '' },
              { autoCommit: true }
            );
            result.inserted++;
          } catch (err: any) { result.errors.push(err.message); }
        }
        break;

      case 'drivers':
        for (const d of db.drivers) {
          try {
            const exists = await connection.execute(
              `SELECT 1 FROM GAWB_T_DRIVERS WHERE ID = :id`,
              [d.id],
              { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            if (exists.rows && exists.rows.length > 0) { result.skipped++; continue; }
            await connection.execute(
              `INSERT INTO GAWB_T_DRIVERS (ID, NAME, PHONE, SIM_NUMBER, SIM_EXPIRY, ASSIGNED_VEHICLE_PLATE, STATUS, ACCOUNT_EMAIL, AVATAR_TEXT) 
               VALUES (:id, :name, :phone, :sim, :simExpiry, :plate, :status, :email, :avatar)`,
              { id: d.id, name: d.name, phone: d.phone, sim: d.simNumber, simExpiry: d.simExpiry, plate: d.assignedVehiclePlate || '', status: d.status, email: d.accountEmail || '', avatar: d.avatarText || 'DR' },
              { autoCommit: true }
            );
            result.inserted++;
          } catch (err: any) { result.errors.push(err.message); }
        }
        break;

      default:
        return res.status(400).json({ error: 'Invalid table name', valid: ['vehicles', 'drivers'] });
    }

    res.json({ success: true, table: tableName, result });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) {}
    }
  }
});

// ============================================
// VITE & STATIC SERVING
// ============================================
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
    console.log(`🚀 CSRJ Fleet Server running on http://localhost:${PORT}`);
    console.log(`📊 Database: ${isOracleActive ? 'Oracle' : 'Local JSON'}`);
  });
}

// ✅ FIX: Jalankan initOracle dulu, baru startAppServer
async function main() {
  await initOracle();
  await startAppServer();
}

main();