import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import oracledb from 'oracledb';

// Initializing configuration
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to persistent fallback JSON storage
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
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

// Read local JSON helper
function readLocalDB() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_DB;
  }
}

// Write local JSON helper
function writeLocalDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error writing local JSON db:', e);
  }
}

// --- ORACLE DATABASE INTEGRATION STUFF ---
let oracleConnectionPool: oracledb.Pool | null = null;
let isOracleActive = false;

async function syncWithOracle(dataType: string, id: string, entityData: any, operationType: 'INSERT' | 'UPDATE' | 'DELETE') {
  if (!isOracleActive || !oracleConnectionPool) return;

  let connection;
  try {
    connection = await oracleConnectionPool.getConnection();
    
    // Select SQL operation based on data types
    if (dataType === 'vehicles') {
      if (operationType === 'DELETE') {
        await connection.execute(`DELETE FROM T_VEHICLES WHERE ID = :id`, [id], { autoCommit: true });
      } else if (operationType === 'INSERT') {
        const sql = `INSERT INTO T_VEHICLES (ID, PLATE_NUMBER, MODEL, YEAR, COLOR, MILEAGE, STATUS, DRIVER_NAME, DRIVER_ID, CHASSIS_NUMBER) 
                     VALUES (:id, :plateNumber, :model, :year, :color, :mileage, :status, :driverName, :driverId, :chassisNumber)`;
        await connection.execute(sql, {
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
      } else if (operationType === 'UPDATE') {
        const sql = `UPDATE T_VEHICLES SET PLATE_NUMBER = :plateNumber, MODEL = :model, YEAR = :year, COLOR = :color, 
                     MILEAGE = :mileage, STATUS = :status, DRIVER_NAME = :driverName, DRIVER_ID = :driverId, 
                     CHASSIS_NUMBER = :chassisNumber WHERE ID = :id`;
        await connection.execute(sql, {
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
    } else if (dataType === 'drivers') {
      if (operationType === 'DELETE') {
        await connection.execute(`DELETE FROM T_DRIVERS WHERE ID = :id`, [id], { autoCommit: true });
      } else if (operationType === 'INSERT') {
        const sql = `INSERT INTO T_DRIVERS (ID, NAME, PHONE, SIM_NUMBER, SIM_EXPIRY, ASSIGNED_VEHICLE_PLATE, STATUS, ACCOUNT_EMAIL, AVATAR_TEXT) 
                     VALUES (:id, :name, :phone, :simNumber, :simExpiry, :assignedVehiclePlate, :status, :accountEmail, :avatarText)`;
        await connection.execute(sql, {
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
      } else if (operationType === 'UPDATE') {
        const sql = `UPDATE T_DRIVERS SET NAME = :name, PHONE = :phone, SIM_NUMBER = :simNumber, SIM_EXPIRY = :simExpiry, 
                     ASSIGNED_VEHICLE_PLATE = :assignedVehiclePlate, STATUS = :status, ACCOUNT_EMAIL = :accountEmail, 
                     AVATAR_TEXT = :avatarText WHERE ID = :id`;
        await connection.execute(sql, {
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
    } else if (dataType === 'maintenanceLogs') {
      if (operationType === 'DELETE') {
        await connection.execute(`DELETE FROM T_MAINTENANCE WHERE ID = :id`, [id], { autoCommit: true });
      } else if (operationType === 'INSERT') {
        const sql = `INSERT INTO T_MAINTENANCE (ID, VEHICLE_PLATE, VEHICLE_MODEL, SERVICE_TYPE, LOG_DATE, COST, WORKSHOP, STATUS, NOTES) 
                     VALUES (:id, :vehiclePlate, :vehicleModel, :serviceType, :log_date, :cost, :workshop, :status, :notes)`;
        await connection.execute(sql, {
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
      } else if (operationType === 'UPDATE') {
        const sql = `UPDATE T_MAINTENANCE SET VEHICLE_PLATE = :vehiclePlate, VEHICLE_MODEL = :vehicleModel, SERVICE_TYPE = :serviceType, 
                     LOG_DATE = :log_date, COST = :cost, WORKSHOP = :workshop, STATUS = :status, NOTES = :notes WHERE ID = :id`;
        await connection.execute(sql, {
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
    } else if (dataType === 'dailyChecklists') {
      if (operationType === 'INSERT') {
        const sql = `INSERT INTO T_DAILY_CHECKLISTS (ID, VEHICLE_PLATE, DRIVER_NAME, LOG_DATE, LOG_TIME, RESULTS_JSON, NOTES, STATUS) 
                     VALUES (:id, :vehiclePlate, :driverName, :log_date, :log_time, :resultsJson, :notes, :status)`;
        await connection.execute(sql, {
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
    } else if (dataType === 'expenses') {
      if (operationType === 'DELETE') {
        await connection.execute(`DELETE FROM T_EXPENSES WHERE ID = :id`, [id], { autoCommit: true });
      } else if (operationType === 'INSERT') {
        const sql = `INSERT INTO T_EXPENSES (ID, EXPENSE_DATE, VEHICLE_PLATE, CATEGORY, DESCRIPTION, AMOUNT, DRIVER_NAME, PASSENGER, START_LOCATION, DESTINATION, DEPARTURE_TIME, RETURN_TIME) 
                     VALUES (:id, :expenseDate, :vehiclePlate, :category, :description, :amount, :driverName, :passenger, :startLocation, :destination, :departureTime, :returnTime)`;
        await connection.execute(sql, {
          id,
          expenseDate: entityData.date,
          vehiclePlate: entityData.vehiclePlate,
          category: entityData.category,
          description: entityData.description,
          amount: Number(entityData.amount),
          driverName: entityData.driverName,
          passenger: entityData.passenger || '',
          startLocation: entityData.startLocation || '',
          destination: entityData.destination || '',
          departureTime: entityData.departureTime || '',
          returnTime: entityData.returnTime || ''
        }, { autoCommit: true });
      }
    } else if (dataType === 'activityLogs') {
      if (operationType === 'INSERT') {
        const sql = `INSERT INTO T_ACTIVITY_LOGS (ID, USERNAME, USER_ROLE, ACTION_DONE, DETAILS, TIMESTAMP_STR) 
                     VALUES (:id, :username, :userRole, :actionDone, :details, :timestampStr)`;
        await connection.execute(sql, {
          id,
          username: entityData.username,
          userRole: entityData.role,
          actionDone: entityData.action,
          details: entityData.details,
          timestampStr: entityData.timestamp
        }, { autoCommit: true });
      }
    } else if (dataType === 'notifications') {
      if (operationType === 'UPDATE') {
        const sql = `UPDATE T_NOTIFICATIONS SET READ_STATUS = :readStatus WHERE ID = :id`;
        await connection.execute(sql, {
          id,
          readStatus: entityData.read ? 1 : 0
        }, { autoCommit: true });
      }
    }

    console.log(`Oracle successfully synced: [${operationType}] ${dataType} (ID: ${id})`);
  } catch (err) {
    console.error(`Error syncing with Oracle Database for ${dataType}:`, err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing Oracledb connection:', err);
      }
    }
  }
}

async function bootstrapTables() {
  if (!oracleConnectionPool) return;
  let connection;
  try {
    connection = await oracleConnectionPool.getConnection();

    // 1. Vehicles
    try {
      await connection.execute(`SELECT 1 FROM T_VEHICLES WHERE ROWNUM = 1`);
    } catch {
      console.log('Creating Table: T_VEHICLES...');
      await connection.execute(`
        CREATE TABLE T_VEHICLES (
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
        )
      `);
    }

    // 2. Drivers
    try {
      await connection.execute(`SELECT 1 FROM T_DRIVERS WHERE ROWNUM = 1`);
    } catch {
      console.log('Creating Table: T_DRIVERS...');
      await connection.execute(`
        CREATE TABLE T_DRIVERS (
          ID VARCHAR2(100) PRIMARY KEY,
          NAME VARCHAR2(100) NOT NULL,
          PHONE VARCHAR2(50),
          SIM_NUMBER VARCHAR2(100),
          SIM_EXPIRY VARCHAR2(50),
          ASSIGNED_VEHICLE_PLATE VARCHAR2(50),
          STATUS VARCHAR2(50),
          ACCOUNT_EMAIL VARCHAR2(100),
          AVATAR_TEXT VARCHAR2(20)
        )
      `);
    }

    // 3. Maintenance Logs
    try {
      await connection.execute(`SELECT 1 FROM T_MAINTENANCE WHERE ROWNUM = 1`);
    } catch {
      console.log('Creating Table: T_MAINTENANCE...');
      await connection.execute(`
        CREATE TABLE T_MAINTENANCE (
          ID VARCHAR2(100) PRIMARY KEY,
          VEHICLE_PLATE VARCHAR2(50) NOT NULL,
          VEHICLE_MODEL VARCHAR2(100),
          SERVICE_TYPE VARCHAR2(50),
          LOG_DATE VARCHAR2(50),
          COST NUMBER,
          WORKSHOP VARCHAR2(150),
          STATUS VARCHAR2(50),
          NOTES CLOB
        )
      `);
    }

    // 4. Daily Checklists
    try {
      await connection.execute(`SELECT 1 FROM T_DAILY_CHECKLISTS WHERE ROWNUM = 1`);
    } catch {
      console.log('Creating Table: T_DAILY_CHECKLISTS...');
      await connection.execute(`
        CREATE TABLE T_DAILY_CHECKLISTS (
          ID VARCHAR2(100) PRIMARY KEY,
          VEHICLE_PLATE VARCHAR2(50) NOT NULL,
          DRIVER_NAME VARCHAR2(100),
          LOG_DATE VARCHAR2(50),
          LOG_TIME VARCHAR2(50),
          RESULTS_JSON CLOB,
          NOTES CLOB,
          STATUS VARCHAR2(50)
        )
      `);
    }

    // 5. Expenses
    try {
      await connection.execute(`SELECT 1 FROM T_EXPENSES WHERE ROWNUM = 1`);
    } catch {
      console.log('Creating Table: T_EXPENSES...');
      await connection.execute(`
        CREATE TABLE T_EXPENSES (
          ID VARCHAR2(100) PRIMARY KEY,
          EXPENSE_DATE VARCHAR2(50),
          VEHICLE_PLATE VARCHAR2(50),
          CATEGORY VARCHAR2(50),
          DESCRIPTION VARCHAR2(200),
          AMOUNT NUMBER,
          DRIVER_NAME VARCHAR2(100),
          PASSENGER VARCHAR2(200),
          START_LOCATION VARCHAR2(200),
          DESTINATION VARCHAR2(200),
          DEPARTURE_TIME VARCHAR2(50),
          RETURN_TIME VARCHAR2(50)
        )
      `);
    }

    // Resilient schema update for existing T_EXPENSES table
    try {
      await connection.execute(`SELECT PASSENGER FROM T_EXPENSES WHERE ROWNUM = 1`);
    } catch {
      try {
        console.log('Altering T_EXPENSES to add travel columns...');
        await connection.execute(`ALTER TABLE T_EXPENSES ADD PASSENGER VARCHAR2(200)`);
        await connection.execute(`ALTER TABLE T_EXPENSES ADD START_LOCATION VARCHAR2(200)`);
        await connection.execute(`ALTER TABLE T_EXPENSES ADD DESTINATION VARCHAR2(200)`);
        await connection.execute(`ALTER TABLE T_EXPENSES ADD DEPARTURE_TIME VARCHAR2(50)`);
        await connection.execute(`ALTER TABLE T_EXPENSES ADD RETURN_TIME VARCHAR2(50)`);
      } catch (altErr) {
        console.log('Dual-layer warning: Travel columns could not be dynamically created (might exist):', altErr);
      }
    }

    // 6. Activity Logs
    try {
      await connection.execute(`SELECT 1 FROM T_ACTIVITY_LOGS WHERE ROWNUM = 1`);
    } catch {
      console.log('Creating Table: T_ACTIVITY_LOGS...');
      await connection.execute(`
        CREATE TABLE T_ACTIVITY_LOGS (
          ID VARCHAR2(100) PRIMARY KEY,
          USERNAME VARCHAR2(100),
          USER_ROLE VARCHAR2(50),
          ACTION_DONE VARCHAR2(100),
          DETAILS VARCHAR2(250),
          TIMESTAMP_STR VARCHAR2(100)
        )
      `);
    }

    // 7. Notifications
    try {
      await connection.execute(`SELECT 1 FROM T_NOTIFICATIONS WHERE ROWNUM = 1`);
    } catch {
      console.log('Creating Table: T_NOTIFICATIONS...');
      await connection.execute(`
        CREATE TABLE T_NOTIFICATIONS (
          ID VARCHAR2(100) PRIMARY KEY,
          TYPE VARCHAR2(50),
          TITLE VARCHAR2(150),
          MESSAGE VARCHAR2(250),
          NOTIF_DATE VARCHAR2(50),
          VEHICLE_PLATE VARCHAR2(50),
          READ_STATUS NUMBER(1) DEFAULT 0
        )
      `);
    }

    console.log('✅ Semua tabel Oracle Database siap dan terverifikasi.');

  } catch (err) {
    console.error('Error bootstrapping tables in Oracle DB:', err);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function initOracle() {
  const user = process.env.ORACLE_DB_USER;
  const password = process.env.ORACLE_DB_PASSWORD;
  const connectString = process.env.ORACLE_DB_CONNECT_STRING;

  if (!user || !password || !connectString) {
    console.log('⚠️  Info penting: Konfigurasi Oracle (.env) belum lengkap.');
    console.log('👉 Sistem beralih ke local JSON file database (/data/db.json) untuk kelancaran preview.');
    return;
  }

  try {
    // node-oracledb operates in Thin client mode automatically in v6+ (pure JS, no instant client required)
    oracleConnectionPool = await oracledb.createPool({
      user,
      password,
      connectString,
      poolMin: 1,
      poolMax: 5,
      poolIncrement: 1
    });

    isOracleActive = true;
    console.log('⚡ Sukses terkoneksi ke Oracle Database menggunakan Thin Mode (100% JS).');
    await bootstrapTables();
  } catch (err) {
    console.error('❌ Gagal menyambung ke Oracle Database:', err);
    console.log('👉 Sistem beralih ke local JSON file database (/data/db.json) untuk kelancaran preview.');
  }
}

// Initialize connections
initOracle();

// --- REST API Proxy Endpoints ---

// Check database status
app.get('/api/database/status', (req, res) => {
  res.json({
    connected: isOracleActive,
    provider: isOracleActive ? 'Oracle Database (Thin Mode)' : 'Local File Storage (data/db.json)',
    environmentSet: !!(process.env.ORACLE_DB_USER && process.env.ORACLE_DB_PASSWORD && process.env.ORACLE_DB_CONNECT_STRING)
  });
});

// Get completely consolidated database state
app.get('/api/all-data', (req, res) => {
  const db = readLocalDB();
  res.json(db);
});

// Update standard full schema or discrete components
app.post('/api/state/save', (req, res) => {
  const incomingData = req.body;
  writeLocalDB(incomingData);
  res.json({ success: true, message: 'Local DB updated' });
});

// Specific CRUD operations for vehicles
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
  if (updated) {
    await syncWithOracle('vehicles', id, updated, 'UPDATE');
  }
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

// Specific CRUD operations for drivers
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
  if (updated) {
    await syncWithOracle('drivers', id, updated, 'UPDATE');
  }
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

// Specific CRUD operations for maintenance
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
  if (updated) {
    await syncWithOracle('maintenanceLogs', id, updated, 'UPDATE');
  }
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

// Specific operations for daily checklist
app.post('/api/checklists', async (req, res) => {
  const checklist = req.body;
  const db = readLocalDB();
  db.dailyChecklists = [checklist, ...db.dailyChecklists];
  writeLocalDB(db);

  await syncWithOracle('dailyChecklists', checklist.id, checklist, 'INSERT');
  res.json({ success: true, entity: checklist });
});

// Specific operations for expenses
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

// Notifications update
app.put('/api/notifications/:id', async (req, res) => {
  const id = req.params.id;
  const fields = req.body;
  const db = readLocalDB();
  db.notifications = db.notifications.map((n: any) => n.id === id ? { ...n, ...fields } : n);
  writeLocalDB(db);

  const updated = db.notifications.find((n: any) => n.id === id);
  if (updated) {
    await syncWithOracle('notifications', id, updated, 'UPDATE');
  }
  res.json({ success: true, entity: updated });
});

// Handle logs activity creation in Oracle
app.post('/api/activities', async (req, res) => {
  const activity = req.body;
  const db = readLocalDB();
  db.activityLogs = [activity, ...db.activityLogs];
  writeLocalDB(db);

  await syncWithOracle('activityLogs', activity.id, activity, 'INSERT');
  res.json({ success: true, entity: activity });
});

// --- CLIENT SERVER INTERACTION & STATIC SERVING ---

// Vite Integration
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
    console.log(`🚀 CSRJ Fleet Full-Stack Server Running on http://localhost:${PORT}`);
  });
}

startAppServer();
