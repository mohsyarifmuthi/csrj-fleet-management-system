import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Vehicle,
  Driver,
  MaintenanceLog,
  DailyChecklist,
  Expense,
  ActivityLog,
  AlertNotification,
  UserRole,
  ExpenseCategory,
  ServiceType,
  VehicleStatus,
  MaintenanceStatus,
  CheckItemStatus
} from '../types';

interface DatabaseContextProps {
  currentUser: User | null;
  users: User[];
  vehicles: Vehicle[];
  drivers: Driver[];
  maintenanceLogs: MaintenanceLog[];
  dailyChecklists: DailyChecklist[];
  expenses: Expense[];
  activityLogs: ActivityLog[];
  notifications: AlertNotification[];
  isLoading: boolean;
  
  // Auth actions
  login: (email: string, role: UserRole) => Promise<boolean>;
  loginOAuth: (provider: string) => Promise<boolean>;
  logout: () => void;
  
  // Vehicle CRUD
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  
  // Driver CRUD
  addDriver: (driver: Omit<Driver, 'id' | 'avatarText'>) => void;
  updateDriver: (id: string, driver: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;
  
  // Maintenance CRUD
  addMaintenanceLog: (log: Omit<MaintenanceLog, 'id'>) => void;
  updateMaintenanceLog: (id: string, log: Partial<MaintenanceLog>) => void;
  deleteMaintenanceLog: (id: string) => void;
  
  // Daily Checklist
  submitChecklist: (checklist: Omit<DailyChecklist, 'id' | 'date' | 'time'>) => void;
  
  // Expenses CRUD
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  
  // Clear logs/notifs
  clearLogs: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Language settings
  language: 'id' | 'en';
  setLanguage: (lang: 'id' | 'en') => void;
}

const DatabaseContext = createContext<DatabaseContextProps | undefined>(undefined);

const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    email: 'admin@csrj.id',
    fullName: 'Andi Saputra',
    role: 'admin',
    phone: '+62 812-3456-7890',
    employeeId: 'ADM-2026-001',
    avatarText: 'AS'
  },
  {
    id: 'user-driver1',
    email: 'budi@csrj.id',
    fullName: 'Budi Santoso',
    role: 'driver',
    phone: '+62 813-9876-5432',
    employeeId: 'DRV-2026-002',
    avatarText: 'BS'
  },
  {
    id: 'user-driver2',
    email: 'hendra@csrj.id',
    fullName: 'Hendra Wijaya',
    role: 'driver',
    phone: '+62 821-1111-2222',
    employeeId: 'DRV-2026-003',
    avatarText: 'HW'
  }
];

const INITIAL_VEHICLES: Vehicle[] = [
  { id: 'v-1', plateNumber: 'B 1234 XYZ', model: 'Toyota Hiace', year: 2020, color: 'Putih', mileage: 45200, status: 'operational', driverName: 'Andi Saputra', driverId: 'user-admin', chassisNumber: 'MHYGAS12345678' },
  { id: 'v-2', plateNumber: 'B 9876 ABC', model: 'Toyota Hiace', year: 2019, color: 'Silver', mileage: 78500, status: 'maintenance', driverName: 'Budi Santoso', driverId: 'user-driver1', chassisNumber: 'MHYGAS87654321' },
  { id: 'v-3', plateNumber: 'B 5678 DEF', model: 'Mitsubishi Fuso', year: 2021, color: 'Kuning', mileage: 32100, status: 'operational', driverName: 'Hendra Wijaya', driverId: 'user-driver2', chassisNumber: 'MHYGAS56781234' },
  { id: 'v-4', plateNumber: 'B 8888 GHI', model: 'Isuzu Elf', year: 2022, color: 'Putih', mileage: 18900, status: 'operational', driverName: 'Rudi Hartono', driverId: '', chassisNumber: 'MHYGAS99999999' },
  { id: 'v-5', plateNumber: 'B 5550 KLM', model: 'Isuzu Elf', year: 2018, color: 'Abu-Abu', mileage: 95300, status: 'operational', driverName: 'Joko Susilo', driverId: '', chassisNumber: 'MHYGAS55554444' },
  { id: 'v-6', plateNumber: 'B 2222 NBC', model: 'Mitsubishi Fuso', year: 2020, color: 'Oranye', mileage: 52400, status: 'maintenance', driverName: 'Bambang Tri', driverId: '', chassisNumber: 'MHYGAS22221111' },
];

const INITIAL_DRIVERS: Driver[] = [
  { id: 'dr-1', name: 'Andi Saputra', phone: '+62 812-3456-7890', simNumber: 'A 123456', simExpiry: '2028-08-15', assignedVehiclePlate: 'B 1234 XYZ', status: 'active', accountEmail: 'admin@csrj.id', avatarText: 'AS' },
  { id: 'dr-2', name: 'Budi Santoso', phone: '+62 813-9876-5432', simNumber: 'A 234567', simExpiry: '2027-11-20', assignedVehiclePlate: 'B 9876 ABC', status: 'active', accountEmail: 'budi@csrj.id', avatarText: 'BS' },
  { id: 'dr-3', name: 'Hendra Wijaya', phone: '+62 821-1111-2222', simNumber: 'A 345678', simExpiry: '2029-03-10', assignedVehiclePlate: 'B 5678 DEF', status: 'active', accountEmail: 'hendra@csrj.id', avatarText: 'HW' },
  { id: 'dr-4', name: 'Rudi Hartono', phone: '+62 822-3333-4444', simNumber: 'A 456789', simExpiry: '2028-06-25', assignedVehiclePlate: 'B 8888 GHI', status: 'active', accountEmail: 'rudi@csrj.id', avatarText: 'RH' },
  { id: 'dr-5', name: 'Joko Susilo', phone: '+62 823-5555-6666', simNumber: 'A 567890', simExpiry: '2027-09-12', assignedVehiclePlate: 'B 5550 KLM', status: 'active', accountEmail: 'joko@csrj.id', avatarText: 'JS' },
  { id: 'dr-6', name: 'Bambang Tri', phone: '+62 824-7777-8888', simNumber: 'A 678901', simExpiry: '2028-12-30', assignedVehiclePlate: 'B 2222 NBC', status: 'active', accountEmail: 'bambang@csrj.id', avatarText: 'BT' },
];

const INITIAL_MAINTENANCE: MaintenanceLog[] = [
  { id: 'm-1', vehiclePlate: 'B 9876 ABC', vehicleModel: 'Toyota Hiace', serviceType: 'Mesin', date: '2026-05-15', cost: 4500000, workshop: 'Bengkel Astra Sentra', status: 'ongoing', notes: 'Pemeriksaan sistem pengapian dan penggantian timing belt.' },
  { id: 'm-2', vehiclePlate: 'B 1234 XYZ', vehicleModel: 'Toyota Hiace', serviceType: 'Oli', date: '2026-05-10', cost: 850000, workshop: 'Prima Toyota Cawang', status: 'completed', notes: 'Ganti oli mesin Shell Helix, saringan oli, saringan udara.' },
  { id: 'm-3', vehiclePlate: 'B 5550 KLM', vehicleModel: 'Isuzu Elf', serviceType: 'Rem', date: '2026-05-08', cost: 2200000, workshop: 'Isuzu Prima Motor', status: 'completed', notes: 'Penggantian piringan rem depan dan minyak rem lengkap.' },
  { id: 'm-4', vehiclePlate: 'B 2222 NBC', vehicleModel: 'Mitsubishi Fuso', serviceType: 'Ban', date: '2026-06-05', cost: 3800000, workshop: 'Sentra Ban Bekas & Baru', status: 'upcoming', notes: 'Rencana ganti dua ban depan Bridgestone radial.' },
];

const INITIAL_CHECKLISTS: DailyChecklist[] = [
  {
    id: 'ch-1',
    vehiclePlate: 'B 1234 XYZ',
    driverName: 'Andi Saputra',
    date: '2026-05-30',
    time: '08:15',
    results: { engineOil: 'ok', brake: 'ok', tires: 'ok', lights: 'ok', wipers: 'ok', ac: 'ok', battery: 'ok', steering: 'ok' },
    notes: 'Kondisi kendaraan sangat baik, siap jalan.',
    status: 'passed'
  },
  {
    id: 'ch-2',
    vehiclePlate: 'B 5678 DEF',
    driverName: 'Hendra Wijaya',
    date: '2026-05-30',
    time: '08:30',
    results: { engineOil: 'ok', brake: 'ok', tires: 'ok', lights: 'ok', wipers: 'ok', ac: 'ok', battery: 'ok', steering: 'ok' },
    notes: 'Tekanan ban oke, AC dingin.',
    status: 'passed'
  },
  {
    id: 'ch-3',
    vehiclePlate: 'B 8888 GHI',
    driverName: 'Rudi Hartono',
    date: '2026-05-29',
    time: '09:00',
    results: { engineOil: 'ok', brake: 'issue', tires: 'ok', lights: 'ok', wipers: 'ok', ac: 'ok', battery: 'ok', steering: 'ok' },
    notes: 'Pegangan rem terasa agak longgar, perlu pengancangan ringan.',
    status: 'failed'
  },
  {
    id: 'ch-4',
    vehiclePlate: 'B 5550 KLM',
    driverName: 'Joko Susilo',
    date: '2026-05-29',
    time: '09:20',
    results: { engineOil: 'ok', brake: 'ok', tires: 'ok', lights: 'ok', wipers: 'ok', ac: 'ok', battery: 'ok', steering: 'ok' },
    notes: 'Aman tanpa kendala.',
    status: 'passed'
  }
];

const INITIAL_EXPENSES: Expense[] = [
  { id: 'ex-1', date: '2026-05-29', vehiclePlate: 'B 1234 XYZ', category: 'fuel', description: 'Pembelian Pertamax 50 Liter', amount: 750000, driverName: 'Andi Saputra' },
  { id: 'ex-2', date: '2026-05-29', vehiclePlate: 'B 9876 ABC', category: 'toll', description: 'Tol Jakarta - Cikampek', amount: 145000, driverName: 'Budi Santoso' },
  { id: 'ex-3', date: '2026-05-28', vehiclePlate: 'B 5678 DEF', category: 'fuel', description: 'Solar Biosolar 80 Liter', amount: 1080000, driverName: 'Hendra Wijaya' },
  { id: 'ex-4', date: '2026-05-28', vehiclePlate: 'B 1234 XYZ', category: 'parking', description: 'Parkir Mall Kelapa Gading', amount: 25000, driverName: 'Andi Saputra' },
  { id: 'ex-5', date: '2026-05-27', vehiclePlate: 'B 8888 GHI', category: 'oil', description: 'Ganti oli darurat Castrol 4L', amount: 480000, driverName: 'Rudi Hartono' },
  { id: 'ex-6', date: '2026-05-27', vehiclePlate: 'B 5550 KLM', category: 'fuel', description: 'Biosolar 100 Liter', amount: 1350000, driverName: 'Joko Susilo' },
  { id: 'ex-7', date: '2026-05-26', vehiclePlate: 'B 1234 XYZ', category: 'toll', description: 'Tol Cipularang Barat', amount: 95000, driverName: 'Andi Saputra' },
];

const INITIAL_LOGS: ActivityLog[] = [
  { id: 'log-1', username: 'Andi Saputra', role: 'admin', action: 'Sistem Inisialisasi', details: 'Database lokal diinisialisasi dengan data default armada.', timestamp: '2026-05-29T10:00:00Z' },
  { id: 'log-2', username: 'Andi Saputra', role: 'admin', action: 'Registrasi Kendaraan', details: 'Kendaraan Isuzu Elf (B 8888 GHI) berhasil ditambahkan.', timestamp: '2026-05-29T11:30:00Z' },
  { id: 'log-3', username: 'Budi Santoso', role: 'driver', action: 'Ubah Data Driver', details: 'Mengubah pembagian armada penugasan.', timestamp: '2026-05-29T14:45:00Z' },
  { id: 'log-4', username: 'System', role: 'admin', action: 'Peringatan Pemeliharaan', details: 'Pecahan status Toyota Hiace (B 9876 ABC) dirubah ke 정비 (perbaikan/maintenance).', timestamp: '2026-05-30T00:10:00Z' },
];

const INITIAL_NOTIFICATIONS: AlertNotification[] = [
  { id: 'nt-1', type: 'overdue', title: 'Pemeliharaan Terlambat', message: 'Toyota Hiace B 9876 ABC telah melewati batas masa servis rutin mesin berkala.', date: '2026-05-28', vehiclePlate: 'B 9876 ABC', read: false },
  { id: 'nt-2', type: 'tax', title: 'Pajak Kendaraan Segera Jatuh Tempo', message: 'Masa pajak tahunan Isuzu Elf B 5550 KLM segera berakhir dalam 7 hari.', date: '2026-05-29', vehiclePlate: 'B 5550 KLM', read: false },
  { id: 'nt-3', type: 'failed_checklist', title: 'Checklist Harian Gagal', message: 'Pemeriksaan harian pada B 8888 GHI mendeteksi adanya kendala di bagian Rem.', date: '2026-05-29', vehiclePlate: 'B 8888 GHI', read: true },
];

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>(INITIAL_MAINTENANCE);
  const [dailyChecklists, setDailyChecklists] = useState<DailyChecklist[]>(INITIAL_CHECKLISTS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_LOGS);
  const [notifications, setNotifications] = useState<AlertNotification[]>(INITIAL_NOTIFICATIONS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<'id' | 'en'>('id');

  // Load database from backend API on initialization
  useEffect(() => {
    // Session parameters (safely held locally)
    const localUser = localStorage.getItem('csrj_current_user');
    const localLang = localStorage.getItem('csrj_language');

    if (localUser) setCurrentUser(JSON.parse(localUser));
    if (localLang) setLanguage(localLang as 'id' | 'en');

    setIsLoading(true);
    fetch('/api/all-data')
      .then(res => {
        if (!res.ok) throw new Error('API server unreachable');
        return res.json();
      })
      .then(data => {
        if (data.users) setUsers(data.users);
        if (data.vehicles) setVehicles(data.vehicles);
        if (data.drivers) setDrivers(data.drivers);
        if (data.maintenanceLogs) setMaintenanceLogs(data.maintenanceLogs);
        if (data.dailyChecklists) setDailyChecklists(data.dailyChecklists);
        if (data.expenses) setExpenses(data.expenses);
        if (data.activityLogs) setActivityLogs(data.activityLogs);
        if (data.notifications) setNotifications(data.notifications);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load fleet data from backend, using local fallback:', err);
        const localVehicles = localStorage.getItem('csrj_vehicles');
        const localDrivers = localStorage.getItem('csrj_drivers');
        const localMaintenance = localStorage.getItem('csrj_maintenance');
        const localChecklists = localStorage.getItem('csrj_checklists');
        const localExpenses = localStorage.getItem('csrj_expenses');
        const localLogs = localStorage.getItem('csrj_logs');
        const localNotifications = localStorage.getItem('csrj_notifications');

        if (localVehicles) setVehicles(JSON.parse(localVehicles));
        if (localDrivers) setDrivers(JSON.parse(localDrivers));
        if (localMaintenance) setMaintenanceLogs(JSON.parse(localMaintenance));
        if (localChecklists) setDailyChecklists(JSON.parse(localChecklists));
        if (localExpenses) setExpenses(JSON.parse(localExpenses));
        if (localLogs) setActivityLogs(JSON.parse(localLogs));
        if (localNotifications) setNotifications(JSON.parse(localNotifications));
        
        setIsLoading(false);
      });
  }, []);

  const logActivity = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      username: currentUser ? currentUser.fullName : 'Sistem',
      role: currentUser ? currentUser.role : 'admin',
      action,
      details,
      timestamp: new Date().toISOString()
    };
    
    setActivityLogs(prev => [newLog, ...prev]);

    fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog)
    }).catch(err => console.error('Failed to log activity to backend:', err));
  };

  const login = async (email: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!matchedUser) {
      const name = email.split('@')[0];
      const fullName = name.charAt(0).toUpperCase() + name.slice(1) + ' CSRJ';
      matchedUser = {
        id: `user-${Date.now()}`,
        email: email,
        fullName: fullName,
        role: role,
        phone: '+62 812-0000-1111',
        employeeId: `${role === 'admin' ? 'ADM' : 'DRV'}-2026-${Math.floor(Math.random() * 900 + 100)}`,
        avatarText: name.substring(0, 2).toUpperCase()
      };
      setUsers(prev => {
        const next = [...prev, matchedUser!];
        fetch('/api/state/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ users: next })
        }).catch(err => console.error(err));
        return next;
      });
    } else {
      matchedUser.role = role;
    }
    
    setCurrentUser(matchedUser);
    localStorage.setItem('csrj_current_user', JSON.stringify(matchedUser));
    
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      username: matchedUser.fullName,
      role: matchedUser.role,
      action: 'Otentikasi Sukses',
      details: `User berhasil masuk ke sistem melalui email (${matchedUser.email})`,
      timestamp: new Date().toISOString()
    };
    
    setActivityLogs(prev => [newLog, ...prev]);
    fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog)
    }).catch(err => console.error(err));
    
    setIsLoading(false);
    return true;
  };

  const loginOAuth = async (provider: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const matchedUser: User = {
      id: `user-oauth-${Date.now()}`,
      email: `${provider.toLowerCase()}User@csrj.id`,
      fullName: `User ${provider}`,
      role: 'admin',
      phone: '+62 821-2222-3333',
      employeeId: `OATH-2026-088`,
      avatarText: provider.substring(0, 2).toUpperCase()
    };
    
    setCurrentUser(matchedUser);
    localStorage.setItem('csrj_current_user', JSON.stringify(matchedUser));
    
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      username: matchedUser.fullName,
      role: matchedUser.role,
      action: 'OAuth2 Otentikasi',
      details: `Masuk aman terverifikasi via Provider OAuth ${provider}.`,
      timestamp: new Date().toISOString()
    };
    
    setActivityLogs(prev => [newLog, ...prev]);
    fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog)
    }).catch(err => console.error(err));
    
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    logActivity('Keluar Akun', `${currentUser?.fullName} keluar dari sesi.`);
    setCurrentUser(null);
    localStorage.removeItem('csrj_current_user');
  };

  // ==================== VEHICLE CRUD ====================
  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newV: Vehicle = {
      ...vehicle,
      id: `v-${Date.now()}`
    };
    
    setVehicles(prev => [newV, ...prev]);
    
    fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newV)
    }).catch(err => console.error(err));

    logActivity('Registrasi Kendaraan', `Menambahkan kendaraan baru: ${newV.model} (${newV.plateNumber})`);
  };

  const updateVehicle = (id: string, updatedFields: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updatedFields } : v));
    
    fetch(`/api/vehicles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields)
    }).catch(err => console.error(err));

    const original = vehicles.find(v => v.id === id);
    logActivity('Update Kendaraan', `Mengubah data kendaraan ${original?.plateNumber || ''}. Detail perubahan diaplikasikan.`);
  };

  const deleteVehicle = (id: string) => {
    const original = vehicles.find(v => v.id === id);
    setVehicles(prev => prev.filter(v => v.id !== id));
    
    fetch(`/api/vehicles/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error(err));

    logActivity('Hapus Kendaraan', `Menghapus kendaraan ${original?.plateNumber} (${original?.model}) dari database.`);
  };

  // ==================== DRIVER CRUD ====================
  const addDriver = (driver: Omit<Driver, 'id' | 'avatarText'>) => {
    const initials = driver.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const newD: Driver = {
      ...driver,
      id: `dr-${Date.now()}`,
      avatarText: initials || 'DR'
    };
    
    setDrivers(prev => [newD, ...prev]);

    fetch('/api/drivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newD)
    }).catch(err => console.error(err));

    logActivity('Tambah Driver', `Menambahkan driver baru ke armada: ${newD.name}. SIM: ${newD.simNumber}`);
    
    if (newD.assignedVehiclePlate) {
      setVehicles(prev => {
        const next = prev.map(v => v.plateNumber === newD.assignedVehiclePlate ? { ...v, driverName: newD.name } : v);
        // Sync vehicle plate assignment change
        const targetV = next.find(v => v.plateNumber === newD.assignedVehiclePlate);
        if (targetV) {
          fetch(`/api/vehicles/${targetV.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ driverName: newD.name })
          }).catch(err => console.error(err));
        }
        return next;
      });
    }
  };

  const updateDriver = (id: string, updatedFields: Partial<Driver>) => {
    const original = drivers.find(d => d.id === id);
    
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...updatedFields } : d));

    fetch(`/api/drivers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields)
    }).catch(err => console.error(err));
    
    logActivity('Update Driver', `Mengubah profil driver ${original?.name}: perubahan detail berhasil disimpan.`);

    if (updatedFields.assignedVehiclePlate !== undefined && original) {
      setVehicles(prev => {
        let next = prev.map(v => v.driverName === original.name ? { ...v, driverName: '' } : v);
        
        // Remove binding logic on old vehicle in backend
        const oldV = prev.find(v => v.driverName === original.name);
        if (oldV) {
          fetch(`/api/vehicles/${oldV.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ driverName: '' })
          }).catch(err => console.error(err));
        }

        if (updatedFields.assignedVehiclePlate) {
          next = next.map(v => v.plateNumber === updatedFields.assignedVehiclePlate ? { ...v, driverName: original.name } : v);
          const newV = next.find(v => v.plateNumber === updatedFields.assignedVehiclePlate);
          if (newV) {
            fetch(`/api/vehicles/${newV.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ driverName: original.name })
            }).catch(err => console.error(err));
          }
        }
        return next;
      });
    }
  };

  const deleteDriver = (id: string) => {
    const original = drivers.find(d => d.id === id);
    setDrivers(prev => prev.filter(d => d.id !== id));

    fetch(`/api/drivers/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error(err));

    logActivity('Hapus Driver', `Menghapus driver ${original?.name} dari database.`);
    
    if (original?.assignedVehiclePlate) {
      setVehicles(prev => {
        const next = prev.map(v => v.plateNumber === original.assignedVehiclePlate ? { ...v, driverName: '' } : v);
        const tv = next.find(v => v.plateNumber === original.assignedVehiclePlate);
        if (tv) {
          fetch(`/api/vehicles/${tv.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ driverName: '' })
          }).catch(err => console.error(err));
        }
        return next;
      });
    }
  };

  // ==================== MAINTENANCE CRUD ====================
  const addMaintenanceLog = (log: Omit<MaintenanceLog, 'id'>) => {
    const newM: MaintenanceLog = {
      ...log,
      id: `m-${Date.now()}`
    };
    
    setMaintenanceLogs(prev => [newM, ...prev]);

    fetch('/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newM)
    }).catch(err => console.error(err));

    if (newM.status === 'ongoing') {
      setVehicles(prev => {
        const next = prev.map(v => v.plateNumber === newM.vehiclePlate ? { ...v, status: 'maintenance' as const } : v);
        const targetV = next.find(v => v.plateNumber === newM.vehiclePlate);
        if (targetV) {
          fetch(`/api/vehicles/${targetV.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'maintenance' })
          }).catch(err => console.error(err));
        }
        return next;
      });
    }
    
    logActivity('Tambah Servis Pemeliharaan', `Registrasi log perawatan ${newM.serviceType} untuk ${newM.vehiclePlate} di ${newM.workshop}.`);
  };

  const updateMaintenanceLog = (id: string, updatedFields: Partial<MaintenanceLog>) => {
    const original = maintenanceLogs.find(m => m.id === id);
    setMaintenanceLogs(prev => prev.map(m => m.id === id ? { ...m, ...updatedFields } : m));

    fetch(`/api/maintenance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields)
    }).catch(err => console.error(err));

    logActivity('Update Log Pemeliharaan', `Memperbarui info perawatan ${original?.vehiclePlate}.`);

    if (updatedFields.status === 'completed' && original) {
      setVehicles(prev => {
        const next = prev.map(v => v.plateNumber === original.vehiclePlate ? { ...v, status: 'operational' as const } : v);
        const targetV = next.find(v => v.plateNumber === original.vehiclePlate);
        if (targetV) {
          fetch(`/api/vehicles/${targetV.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'operational' })
          }).catch(err => console.error(err));
        }
        return next;
      });
    }
  };

  const deleteMaintenanceLog = (id: string) => {
    const original = maintenanceLogs.find(m => m.id === id);
    setMaintenanceLogs(prev => prev.filter(m => m.id !== id));

    fetch(`/api/maintenance/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error(err));
    
    logActivity('Hapus Log Servis', `Menghapus log pemeliharaan kendaraan ${original?.vehiclePlate}.`);
  };

  // ==================== DAILY CHECKLIST ====================
  const submitChecklist = (checklist: Omit<DailyChecklist, 'id' | 'date' | 'time'>) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const hasIssues = Object.values(checklist.results).includes('issue');
    const finalStatus = hasIssues ? 'failed' as const : 'passed' as const;
    
    const newCheck: DailyChecklist = {
      ...checklist,
      id: `ch-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      status: finalStatus
    };
    
    setDailyChecklists(prev => [newCheck, ...prev]);

    fetch('/api/checklists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCheck)
    }).catch(err => console.error(err));
    
    logActivity('Kirim Checklist Harian', `Merilis inspeksi harian plat ${newCheck.vehiclePlate} oleh ${newCheck.driverName}. Hasil: ${finalStatus === 'passed' ? 'LOLOS' : 'Gagal / Butuh Perhatian'}`);
    
    if (finalStatus === 'failed') {
      const newNotif: AlertNotification = {
        id: `nt-${Date.now()}`,
        type: 'failed_checklist',
        title: 'Kerusakan Terdeteksi oleh Inspeksi',
        message: `Driver ${checklist.driverName} melaporkan kegagalan poin pemeriksaan pada plat ${checklist.vehiclePlate}. Catatan: "${checklist.notes}"`,
        date: dateStr,
        vehiclePlate: checklist.vehiclePlate,
        read: false
      };
      
      setNotifications(prev => [newNotif, ...prev]);
      // Note: Backend server generates notification sync trigger or updates state as well

      setVehicles(prev => {
        const next = prev.map(v => v.plateNumber === checklist.vehiclePlate ? { ...v, status: 'idle' as const } : v);
        const targetV = next.find(v => v.plateNumber === checklist.vehiclePlate);
        if (targetV) {
          fetch(`/api/vehicles/${targetV.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'idle' })
          }).catch(err => console.error(err));
        }
        return next;
      });
    }
  };

  // ==================== EXPENSES CRUD ====================
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newE: Expense = {
      ...expense,
      id: `ex-${Date.now()}`
    };
    
    setExpenses(prev => [newE, ...prev]);

    fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newE)
    }).catch(err => console.error(err));
    
    logActivity('Tambah Biaya Operasional', `Melaporkan biaya ${newE.category} senilai Rp ${newE.amount.toLocaleString('id-ID')} untuk ${newE.vehiclePlate}`);
  };

  const deleteExpense = (id: string) => {
    const original = expenses.find(e => e.id === id);
    setExpenses(prev => prev.filter(e => e.id !== id));

    fetch(`/api/expenses/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error(err));
    
    logActivity('Catatan Biaya Dihapus', `Menghapus catatan biaya ${original?.description} (Rp ${original?.amount}) dari sistem.`);
  };

  // ==================== LOGS & NOTIFS ACTIONS ====================
  const clearLogs = () => {
    setActivityLogs([]);
    fetch('/api/state/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activityLogs: [] })
    }).catch(err => console.error(err));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    fetch(`/api/notifications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true })
    }).catch(err => console.error(err));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    // Save standard bulk state
    fetch('/api/state/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifications: notifications.map(n => ({ ...n, read: true })) })
    }).catch(err => console.error(err));
  };

  // Language adjustment
  const handleSetLanguage = (lang: 'id' | 'en') => {
    setLanguage(lang);
    localStorage.setItem('csrj_language', lang);
  };

  return (
    <DatabaseContext.Provider
      value={{
        currentUser,
        users,
        vehicles,
        drivers,
        maintenanceLogs,
        dailyChecklists,
        expenses,
        activityLogs,
        notifications,
        isLoading,
        login,
        loginOAuth,
        logout,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addDriver,
        updateDriver,
        deleteDriver,
        addMaintenanceLog,
        updateMaintenanceLog,
        deleteMaintenanceLog,
        submitChecklist,
        addExpense,
        deleteExpense,
        clearLogs,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        language,
        setLanguage: handleSetLanguage
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
