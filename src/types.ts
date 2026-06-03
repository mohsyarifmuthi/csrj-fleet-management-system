/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'driver';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone: string;
  employeeId: string;
  avatarText: string;
}

export type VehicleStatus = 'operational' | 'maintenance' | 'idle';

export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  year: number;
  color: string;
  mileage: number;
  status: VehicleStatus;
  driverName: string;
  driverId: string;
  chassisNumber: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  simNumber: string;
  simExpiry: string;
  assignedVehiclePlate: string;
  status: 'active' | 'suspended';
  accountEmail: string;
  avatarText: string;
}

export type ServiceType = 'Mesin' | 'Oli' | 'Rem' | 'Ban' | 'Lainnya';
export type MaintenanceStatus = 'ongoing' | 'completed' | 'upcoming';

export interface MaintenanceLog {
  id: string;
  vehiclePlate: string;
  vehicleModel: string;
  serviceType: ServiceType;
  date: string;
  cost: number;
  workshop: string;
  status: MaintenanceStatus;
  notes: string;
}

export type CheckItemStatus = 'ok' | 'issue';

export interface DailyChecklist {
  id: string;
  vehiclePlate: string;
  driverName: string;
  date: string;
  time: string;
  results: {
    [key: string]: CheckItemStatus; // key: engineOil, brake, tires, lights, wipers, ac, battery, steering
  };
  notes: string;
  status: 'passed' | 'failed';
}

export type ExpenseCategory = 'fuel' | 'toll' | 'oil' | 'parking' | 'other';

export interface Expense {
  id: string;
  date: string;
  vehiclePlate: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  driverName: string;
  passenger?: string;
  startLocation?: string;
  destination?: string;
  departureTime?: string;
  returnTime?: string;
  receiptPhoto?: string;
}

export interface ActivityLog {
  id: string;
  username: string;
  role: UserRole;
  action: string; // e.g. "Create Vehicle", "Delete Driver"
  details: string; // e.g. "Menambahkan kendaraan Toyota Hiace (B 1234 XYZ)"
  timestamp: string; // ISO string or relative time
}

export interface AlertNotification {
  id: string;
  type: 'overdue' | 'tax' | 'failed_checklist' | 'general';
  title: string;
  message: string;
  date: string;
  vehiclePlate?: string;
  read: boolean;
}
