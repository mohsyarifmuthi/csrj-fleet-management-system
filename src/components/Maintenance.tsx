import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { translations } from '../translations';
import { Plus, Edit2, Trash2, CheckCircle, Clock, AlertTriangle, X, Play, Landmark, FileText } from 'lucide-react';
import { MaintenanceLog, ServiceType, MaintenanceStatus } from '../types';

export default function Maintenance() {
  const {
    maintenanceLogs,
    vehicles,
    addMaintenanceLog,
    updateMaintenanceLog,
    deleteMaintenanceLog,
    language
  } = useDatabase();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'all' | MaintenanceStatus>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingLog, setEditingLog] = useState<MaintenanceLog | null>(null);

  // Form states
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('Mesin');
  const [date, setDate] = useState('');
  const [cost, setCost] = useState(100000);
  const [workshop, setWorkshop] = useState('');
  const [status, setStatus] = useState<MaintenanceStatus>('ongoing');
  const [notes, setNotes] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingLog(null);
    setVehiclePlate(vehicles[0]?.plateNumber || '');
    setServiceType('Mesin');
    setDate('');
    setCost(100000);
    setWorkshop('');
    setStatus('ongoing');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (log: MaintenanceLog) => {
    setEditingLog(log);
    setVehiclePlate(log.vehiclePlate);
    setServiceType(log.serviceType);
    setDate(log.date);
    setCost(log.cost);
    setWorkshop(log.workshop);
    setStatus(log.status);
    setNotes(log.notes);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehiclePlate || !workshop || !date) {
      alert('Tolong lengkapi plat, lokasi bengkel, dan tanggal janji servis.');
      return;
    }

    const matchedVehicleModel = vehicles.find(v => v.plateNumber === vehiclePlate)?.model || 'Unknown';

    const payload = {
      vehiclePlate,
      vehicleModel: matchedVehicleModel,
      serviceType,
      date,
      cost: Number(cost),
      workshop,
      status,
      notes
    };

    if (editingLog) {
      updateMaintenanceLog(editingLog.id, payload);
    } else {
      addMaintenanceLog(payload);
    }

    setShowModal(false);
  };

  const handleStatusChange = (id: string, nextStatus: MaintenanceStatus) => {
    updateMaintenanceLog(id, { status: nextStatus });
  };

  // Filter based on tab active
  const filteredLogs = maintenanceLogs.filter(log => {
    if (activeTab === 'all') return true;
    return log.status === activeTab;
  });

  const getStatusBadgeStyle = (s: MaintenanceStatus) => {
    switch (s) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-250';
      case 'ongoing': return 'bg-amber-100 text-amber-700 border-amber-250';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tab filter pill bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-150 shadow-xs">
        
        {/* State filters */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.all}
          </button>
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ongoing'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.ongoing}
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.upcoming}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'completed'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.completed}
          </button>
        </div>

        {/* Add maintenance button */}
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addMaintenance}</span>
        </button>

      </div>

      {/* Structured log lists */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-450 text-xs font-medium bg-white rounded-2xl border border-slate-150 shadow-xs">
            Tidak ada riwayat perbaikan yang terdaftar dengan status ini.
          </div>
        ) : (
          filteredLogs.map(log => (
            <div key={log.id} className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border font-semibold shrink-0 ${
                  log.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-150'
                    : log.status === 'ongoing'
                      ? 'bg-amber-50 text-amber-600 border-amber-150'
                      : 'bg-blue-50 text-blue-600 border-blue-150'
                }`}>
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-xs text-slate-805 tracking-wide font-mono">{log.vehiclePlate}</span>
                    <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-550">{log.vehicleModel}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700 mt-1">
                    {log.serviceType === 'Mesin' && t.engineService}
                    {log.serviceType === 'Oli' && t.oilChange}
                    {log.serviceType === 'Rem' && t.brakeService}
                    {log.serviceType === 'Ban' && t.tireChange}
                    {log.serviceType === 'Lainnya' && 'Layanan Servis Rutin'} 
                    <span className="text-slate-400 font-medium"> @ {log.workshop}</span>
                  </div>
                  
                  {/* Notes text banner */}
                  {log.notes && (
                    <div className="flex items-start gap-1.5 bg-slate-50 border border-slate-100 p-2 rounded-lg text-[11px] text-slate-550 font-medium mt-2 leading-relaxed max-w-lg">
                      <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span>{log.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* State and Cost summary column */}
              <div className="flex justify-between md:flex-col items-center md:items-end w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                <div className="text-left md:text-right">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t.cost}</div>
                  <div className="text-sm font-black text-slate-800 font-mono mt-0.5">
                    Rp {log.cost.toLocaleString('id-ID')}
                  </div>
                  <span className="text-[10px] text-slate-450 font-semibold mt-1 block font-mono">{log.date}</span>
                </div>

                <div className="flex items-center gap-2.5 mt-3">
                  <span className={`status-badge border py-1 ${getStatusBadgeStyle(log.status)}`}>
                    {log.status === 'completed' ? t.completed : log.status === 'ongoing' ? t.ongoing : t.upcoming}
                  </span>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5 border-l border-slate-205 pl-2.5">
                    {/* Tick action if ongoing or upcoming */}
                    {log.status !== 'completed' && (
                      <button
                        onClick={() => handleStatusChange(log.id, 'completed')}
                        title="Tandai Selesai"
                        className="p-1 px-1.5 text-emerald-700 bg-emerald-55 hover:bg-emerald-100 rounded-lg text-[10px] font-bold flex items-center gap-0.5 transition-all cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Selesai</span>
                      </button>
                    )}

                    <button
                      onClick={() => openEditModal(log)}
                      className="p-1.5 text-blue-650 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {confirmDeleteId === log.id ? (
                      <g className="flex gap-1">
                        <button
                          onClick={() => deleteMaintenanceLog(log.id)}
                          className="px-2 py-1 text-white bg-red-650 rounded-lg text-xxs font-bold cursor-pointer"
                        >
                          Ya
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-1.5 py-1 text-slate-650 bg-slate-100 border border-slate-200 rounded-lg text-xxs font-bold cursor-pointer"
                        >
                          X
                        </button>
                      </g>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(log.id)}
                        className="p-1.5 text-red-650 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Repair registry Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-101 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">
                {editingLog ? t.editMaintenance : t.addMaintenance}
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
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.selectVehicle}</label>
                <select
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.plateNumber}>{v.plateNumber} &bull; ({v.model})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.serviceType}</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as ServiceType)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="Mesin">{t.engineService}</option>
                    <option value="Oli">{t.oilChange}</option>
                    <option value="Rem">{t.brakeService}</option>
                    <option value="Ban">{t.tireChange}</option>
                    <option value="Lainnya">Layanan Servis Rutin Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.date}</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.cost}</label>
                  <input
                    type="number"
                    required
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.workshop}</label>
                  <input
                    type="text"
                    required
                    value={workshop}
                    onChange={(e) => setWorkshop(e.target.value)}
                    placeholder="Contoh: Astra Sentra TB Simatupang"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.status}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="ongoing">{t.ongoing}</option>
                  <option value="upcoming">{t.upcoming}</option>
                  <option value="completed">{t.completed}</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.notes}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Isi rincian diagnosa kerusakan atau rincian komponen pengganti..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  rows={3}
                />
              </div>

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
