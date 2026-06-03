import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { translations } from '../translations';
import { CheckSquare, AlertCircle, FileText, Check, AlertTriangle, Play, ClipboardList, Info, HelpCircle } from 'lucide-react';
import { DailyChecklist, CheckItemStatus } from '../types';

export default function DailyCheck() {
  const {
    vehicles,
    dailyChecklists,
    submitChecklist,
    currentUser,
    language
  } = useDatabase();
  const t = translations[language];

  // Selected vehicle for checkup
  const [vehiclePlate, setVehiclePlate] = useState(vehicles[0]?.plateNumber || '');

  // Individual point checklist state
  const [engineOil, setEngineOil] = useState<CheckItemStatus>('ok');
  const [brake, setBrake] = useState<CheckItemStatus>('ok');
  const [tires, setTires] = useState<CheckItemStatus>('ok');
  const [lights, setLights] = useState<CheckItemStatus>('ok');
  const [wipers, setWipers] = useState<CheckItemStatus>('ok');
  const [ac, setAc] = useState<CheckItemStatus>('ok');
  const [battery, setBattery] = useState<CheckItemStatus>('ok');
  const [steering, setSteering] = useState<CheckItemStatus>('ok');

  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Statistics counters
  const totalCompletedChecks = dailyChecklists.filter(c => c.date === '2026-05-30').length;
  const totalIssuesDetected = dailyChecklists.filter(c => c.status === 'failed').length;
  const pendingInspections = Math.max(0, vehicles.length - totalCompletedChecks);

  const checkItemsFields = [
    { key: 'engineOil', label: t.engineOil, state: engineOil, setState: setEngineOil },
    { key: 'brake', label: t.brake, state: brake, setState: setBrake },
    { key: 'tires', label: t.tires, state: tires, setState: setTires },
    { key: 'lights', label: t.lights, state: lights, setState: setLights },
    { key: 'wipers', label: t.wipers, state: wipers, setState: setWipers },
    { key: 'ac', label: t.ac, state: ac, setState: setAc },
    { key: 'battery', label: t.battery, state: battery, setState: setBattery },
    { key: 'steering', label: t.steering, state: steering, setState: setSteering },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiclePlate) return;

    setIsSubmitting(true);
    
    const results = {
      engineOil,
      brake,
      tires,
      lights,
      wipers,
      ac,
      battery,
      steering
    };

    const status: 'failed' | 'passed' = Object.values(results).some(v => v === 'issue') ? 'failed' : 'passed';

    const payload = {
      vehiclePlate,
      driverName: currentUser?.fullName || 'Anonim Driver',
      results,
      notes: notes || 'Kondisi bagus layak jalan.',
      status
    };

    // Submit state to database provider
    submitChecklist(payload);

    // Reset inputs
    setNotes('');
    setEngineOil('ok');
    setBrake('ok');
    setTires('ok');
    setLights('ok');
    setWipers('ok');
    setAc('ok');
    setBattery('ok');
    setSteering('ok');

    setIsSubmitting(false);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const checklistHasIssue = (results: { [key: string]: CheckItemStatus }) => {
    return Object.values(results).includes('issue');
  };

  return (
    <div className="space-y-6">
      
      {/* 3 Stats Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs">
          <div className="text-xxs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-150/40 inline-block">
            {t.todayChecked}
          </div>
          <div className="text-3xl font-black text-slate-805 leading-none mt-3">
            {totalCompletedChecks}
          </div>
        </div>

        <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs">
          <div className="text-xxs font-extrabold text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100 inline-block">
            {t.todayPending}
          </div>
          <div className="text-3xl font-black text-slate-805 leading-none mt-3">
            {pendingInspections}
          </div>
        </div>

        <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs">
          <div className="text-[10px] font-extrabold text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100 inline-block">
            {t.issuesFound}
          </div>
          <div className="text-3xl font-black text-red-650 leading-none mt-3">
            {totalIssuesDetected}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Fill Out Inspection Form */}
        <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-blue-500" />
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{t.newChecklist}</h3>
            </div>
            
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-150 p-3.5 rounded-xl text-emerald-800 text-xs font-bold mb-4.5 flex items-center gap-2 animate-in fade-in duration-200">
                <Check className="w-4 h-4" />
                <span>Form Checklist harian berhasil dikirimkan ke sistem logs admin.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.selectVehicleCheck}</label>
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

              {/* Point Check list grid selectors */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-2">{t.checkItems}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  {checkItemsFields.map(field => (
                    <div
                      key={field.key}
                      onClick={() => field.setState(field.state === 'ok' ? 'issue' : 'ok')}
                      className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer select-none transition-all ${
                        field.state === 'ok'
                          ? 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
                          : 'bg-pink-50/20 border-pink-200 hover:bg-pink-100/10'
                      }`}
                    >
                      <span className="text-xxs font-bold text-slate-700 leading-snug">{field.label}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                        field.state === 'ok'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-150/50'
                          : 'bg-red-50 text-red-700 border border-red-150/50'
                      }`}>
                        {field.state === 'ok' ? t.checkOk : t.checkBad}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.notes}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Deskripsikan isu / kerusakan jika ada poin 'Waspada'..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  rows={2}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                {isSubmitting ? 'Mengirim...' : t.submitChecklist}
              </button>
            </form>
          </div>
        </div>

        {/* History Inspections List */}
        <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs">
          <h3 className="font-extrabold text-slate-800 text-sm tracking-tight mb-4">{t.recentChecks}</h3>
          
          <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
            {dailyChecklists.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-medium">
                Belum ada rilis checklist inspeksi masuk.
              </div>
            ) : (
              dailyChecklists.map(checklist => {
                const failed = checklistHasIssue(checklist.results);
                return (
                  <div key={checklist.id} className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="font-extrabold text-xs text-slate-805 tracking-wide font-mono">{checklist.vehiclePlate}</span>
                        <span className="text-xxs font-medium text-slate-450">&bull; {checklist.driverName}</span>
                      </div>
                      
                      <span className={`status-badge px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${
                        !failed
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-250'
                          : 'bg-pink-100 text-pink-700 border-pink-200'
                      }`}>
                        {!failed ? t.passed : t.failed}
                      </span>
                    </div>

                    {/* Display check criteria statuses */}
                    <div className="grid grid-cols-4 gap-1.5 mt-3 pt-2 border-t border-slate-100">
                      {Object.entries(checklist.results).map(([k, v]) => (
                        <div key={k} className="text-center bg-white p-1 rounded border border-slate-150/70">
                          <div className="text-[8px] font-bold text-slate-450 truncate uppercase leading-none">{k}</div>
                          <span className={`text-[8px] font-bold ${v === 'ok' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {v === 'ok' ? 'OK' : 'FAIL'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Notes block */}
                    <div className="text-xxs font-medium text-slate-500 mt-2.5 bg-white border border-slate-150/50 p-2 rounded flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate italic">Catatan: "{checklist.notes || t.noNotes}"</span>
                    </div>

                    <div className="flex items-center gap-1 mt-2.5 text-[9px] text-slate-400 font-mono font-medium">
                      <span>Hari & Jam: {checklist.date} &bull; {checklist.time}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
