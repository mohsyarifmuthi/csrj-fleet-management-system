import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { translations } from '../translations';
import { Plus, Edit2, Trash2, Search, Filter, AlertCircle, X, Check, Eye } from 'lucide-react';
import { Vehicle, VehicleStatus } from '../types';

export default function Vehicles() {
  const {
    vehicles,
    drivers,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    language
  } = useDatabase();
  const t = translations[language];

  // Search and filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | VehicleStatus>('all');

  // Modal control states
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  
  // Form input states
  const [plateNumber, setPlateNumber] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2022);
  const [color, setColor] = useState('');
  const [mileage, setMileage] = useState(10000);
  const [driverSelection, setDriverSelection] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [vehicleStatusVal, setVehicleStatusVal] = useState<VehicleStatus>('operational');

  // Confirmation alert states
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingVehicle(null);
    setPlateNumber('');
    setModel('');
    setYear(2022);
    setColor('');
    setMileage(10000);
    setDriverSelection('');
    setChassisNumber('');
    setVehicleStatusVal('operational');
    setShowModal(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setPlateNumber(vehicle.plateNumber);
    setModel(vehicle.model);
    setYear(vehicle.year);
    setColor(vehicle.color);
    setMileage(vehicle.mileage);
    setDriverSelection(vehicle.driverName);
    setChassisNumber(vehicle.chassisNumber);
    setVehicleStatusVal(vehicle.status);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Quick validation
    if (!plateNumber || !model || !chassisNumber) {
      alert('Tolong lengkapi kode plat, model, dan nomor rangka kendaraan.');
      return;
    }

    const payload = {
      plateNumber,
      model,
      year: Number(year),
      color,
      mileage: Number(mileage),
      status: vehicleStatusVal,
      driverName: driverSelection || 'Belum Ditugaskan',
      driverId: drivers.find(d => d.name === driverSelection)?.id || '',
      chassisNumber
    };

    if (editingVehicle) {
      updateVehicle(editingVehicle.id, payload);
    } else {
      addVehicle(payload);
    }

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteVehicle(id);
    setConfirmDeleteId(null);
  };

  // Filter and search computation
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
                          v.model.toLowerCase().includes(search.toLowerCase()) ||
                          v.driverName.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (s: VehicleStatus) => {
    switch (s) {
      case 'operational': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'maintenance': return 'bg-amber-100 text-amber-700 border-amber-250';
      default: return 'bg-slate-100 text-slate-700 border-slate-205';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Utilities Header Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-150 shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Internal Search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchVehiclePh}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-full sm:w-64 focus:outline-none focus:border-blue-500 font-medium text-slate-700"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          </div>

          {/* Condition status filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-500"
            >
              <option value="all">{t.filterStatus}</option>
              <option value="operational">{t.operational}</option>
              <option value="maintenance">{t.inMaintenance}</option>
              <option value="idle">{t.idle}</option>
            </select>
          </div>
        </div>

        {/* Add Vehicle Button */}
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addVehicle}</span>
        </button>
      </div>

      {/* Main Table Cargo */}
      <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150 text-left">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.plateNumber}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.model}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.year}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.mileage}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.driver}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.status}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-xs font-medium">
                    Tidak ditemukan data armada kendaraan yang cocok.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((val) => (
                  <tr key={val.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center font-black text-blue-600 text-xxs font-mono">
                          {val.plateNumber.split(' ')[0]}
                        </div>
                        <span className="font-extrabold text-xs text-slate-805 tracking-wide font-mono select-all">
                          {val.plateNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-700">{val.model}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-500 font-mono">{val.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-750 font-mono">
                      {val.mileage.toLocaleString('id-ID')} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-600">{val.driverName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`status-badge border px-2.5 py-1 ${getStatusStyle(val.status)}`}>
                        {val.status === 'operational' && t.operational}
                        {val.status === 'maintenance' && t.inMaintenance}
                        {val.status === 'idle' && t.idle}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(val)}
                          className="p-1 px-2 text-blue-650 bg-blue-50 hover:bg-blue-105 rounded-md text-xxs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>{t.edit}</span>
                        </button>

                        {/* Trash Button or Confirmation state */}
                        {confirmDeleteId === val.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(val.id)}
                              className="px-2 py-1 text-emerald-700 bg-emerald-50 rounded-md text-xxs font-bold transition-all cursor-pointer"
                            >
                              Yakin
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 text-slate-600 bg-slate-100 rounded-md text-xxs font-bold transition-all cursor-pointer"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(val.id)}
                            className="p-1 px-2 text-red-650 bg-red-50 hover:bg-red-105 rounded-md text-xxs font-bold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{t.delete}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Form Dynamic Entry Modal (Shared Add/Edit) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">
                {editingVehicle ? t.editVehicle : t.addVehicle}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Input fields */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">{t.plateNumber}</label>
                  <input
                    type="text"
                    required
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="Contoh: B 1234 XYZ"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">{t.model}</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Contoh: Toyota Hiace"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">{t.year}</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    placeholder="2020"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">{t.color}</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Contoh: Putih"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">{t.mileage}</label>
                  <input
                    type="number"
                    value={mileage}
                    onChange={(e) => setMileage(Number(e.target.value))}
                    placeholder="Jarak Tempuh"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">{t.chassisNo}</label>
                  <input
                    type="text"
                    required
                    value={chassisNumber}
                    onChange={(e) => setChassisNumber(e.target.value)}
                    placeholder="Nomor Rangka Mesin"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">{t.assignDriver}</label>
                <select
                  value={driverSelection}
                  onChange={(e) => setDriverSelection(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="">{t.unassigned}</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.name}>{d.name} &bull; (SIM: {d.simNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">{t.status}</label>
                <select
                  value={vehicleStatusVal}
                  onChange={(e) => setVehicleStatusVal(e.target.value as VehicleStatus)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="operational">{t.operational}</option>
                  <option value="maintenance">{t.inMaintenance}</option>
                  <option value="idle">{t.idle}</option>
                </select>
              </div>

              {/* Modal controls actions */}
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
