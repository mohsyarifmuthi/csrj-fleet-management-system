import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { translations } from '../translations';
import { Plus, Edit2, Trash2, Search, Mail, Phone, Calendar, Truck, UserCheck, X } from 'lucide-react';
import { Driver } from '../types';

export default function Drivers() {
  const {
    drivers,
    vehicles,
    addDriver,
    updateDriver,
    deleteDriver,
    language
  } = useDatabase();
  const t = translations[language];

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [simNumber, setSimNumber] = useState('');
  const [simExpiry, setSimExpiry] = useState('');
  const [assignedVehiclePlate, setAssignedVehiclePlate] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [driverStatus, setDriverStatus] = useState<'active' | 'suspended'>('active');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingDriver(null);
    setName('');
    setPhone('');
    setSimNumber('');
    setSimExpiry('');
    setAssignedVehiclePlate('');
    setAccountEmail('');
    setDriverStatus('active');
    setShowModal(true);
  };

  const openEditModal = (driver: Driver) => {
    setEditingDriver(driver);
    setName(driver.name);
    setPhone(driver.phone);
    setSimNumber(driver.simNumber);
    setSimExpiry(driver.simExpiry);
    setAssignedVehiclePlate(driver.assignedVehiclePlate);
    setAccountEmail(driver.accountEmail);
    setDriverStatus(driver.status);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !simNumber) {
      alert('Tolong lengkapi nama pengemudi, telepon, dan nomor SIM.');
      return;
    }

    const payload = {
      name,
      phone,
      simNumber,
      simExpiry,
      assignedVehiclePlate,
      accountEmail,
      status: driverStatus
    };

    if (editingDriver) {
      updateDriver(editingDriver.id, payload);
    } else {
      addDriver(payload);
    }

    setShowModal(false);
  };

  // Filters computed list
  const filteredDrivers = drivers.filter(d => {
    return d.name.toLowerCase().includes(search.toLowerCase()) ||
           d.phone.includes(search) ||
           d.simNumber.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* Search and Action header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-150 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchDriverPh}
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-full focus:outline-none focus:border-blue-500 font-medium text-slate-700"
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addDriver}</span>
        </button>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDrivers.length === 0 ? (
          <div className="col-span-full py-12 p-6 text-center text-slate-450 text-xs font-medium bg-white rounded-2xl border border-slate-150 shadow-xs">
            Tidak ditemukan data pengemudi yang terdaftar.
          </div>
        ) : (
          filteredDrivers.map(driver => (
            <div key={driver.id} className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-250 flex flex-col justify-between">
              
              {/* Card Header */}
              <div>
                <div className="flex items-center gap-4.5 mb-5">
                  <div className="w-13 h-13 ring-4 ring-slate-50 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-base shadow-inner">
                    {driver.avatarText}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">{driver.name}</h3>
                    <span className={`status-badge px-2 py-0.5 mt-1 rounded-md text-[9px] font-bold border inline-block ${
                      driver.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {driver.status === 'active' ? t.active : t.suspended}
                    </span>
                  </div>
                </div>

                {/* Body Details Column */}
                <div className="space-y-2.5 text-xs font-medium border-t border-slate-50 pt-4.5">
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="font-mono">{driver.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{driver.accountEmail || 'No Linked Account'}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl mt-2 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400">{t.simNumber}</span>
                    <span className="font-extrabold text-slate-700 text-xxs font-mono">{driver.simNumber}</span>
                  </div>
                  <div className="flex justify-between items-center pl-2 pr-2">
                    <span className="text-[10px] font-bold text-slate-450">{t.simExpiry}</span>
                    <span className="font-bold text-slate-700 text-xxs font-mono">{driver.simExpiry}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Binder panel & Control links */}
              <div className="mt-5.5 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-xxs text-slate-500 font-bold mb-4.5 bg-slate-50/55 p-2 rounded-lg border border-slate-100">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <span>{t.assignedVehicle}:</span>
                  <span className="text-blue-600 font-semibold font-mono select-all ml-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded-sm shadow-2xs">
                    {driver.assignedVehiclePlate || t.unassigned}
                  </span>
                </div>

                {/* Sub-Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(driver)}
                    className="flex-1 py-2 text-blue-650 bg-blue-50 hover:bg-blue-105 rounded-xl text-xxs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border border-blue-100"
                  >
                    <Edit2 className="w-3" />
                    <span>{t.edit}</span>
                  </button>

                  {confirmDeleteId === driver.id ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          deleteDriver(driver.id);
                          setConfirmDeleteId(null);
                        }}
                        className="py-2 px-3 text-white bg-red-600 rounded-xl text-xxs font-bold transition-all cursor-pointer"
                      >
                        Ya, Hapus
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="py-2 px-2 text-slate-600 bg-slate-100 border border-slate-200 rounded-xl text-xxs font-bold transition-all cursor-pointer"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(driver.id)}
                      className="py-2 px-3 text-red-650 bg-red-50 hover:bg-red-105 rounded-xl text-xxs font-bold flex items-center gap-1 transition-all cursor-pointer border border-red-100"
                    >
                      <Trash2 className="w-3" />
                      <span>{t.delete}</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Custom form modal for Driver */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">
                {editingDriver ? t.editDriver : t.addDriver}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inputs Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.fullName}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.phone}</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: +62 812-3456"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.simNumber}</label>
                  <input
                    type="text"
                    required
                    value={simNumber}
                    onChange={(e) => setSimNumber(e.target.value)}
                    placeholder="Nomor SIM"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.simExpiry}</label>
                  <input
                    type="date"
                    required
                    value={simExpiry}
                    onChange={(e) => setSimExpiry(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.accountEmail}</label>
                <input
                  type="email"
                  required
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  placeholder="Contoh: budi@csrj.id"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.assignedVehicle}</label>
                  <select
                    value={assignedVehiclePlate}
                    onChange={(e) => setAssignedVehiclePlate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="">{t.unassigned}</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.plateNumber}>{v.plateNumber} &bull; ({v.model})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.status}</label>
                  <select
                    value={driverStatus}
                    onChange={(e) => setDriverStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="active">{t.active}</option>
                    <option value="suspended">{t.suspended}</option>
                  </select>
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-all cursor-pointer"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
