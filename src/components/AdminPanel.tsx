import { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { translations } from '../translations';
import { Shield, ShieldAlert, Users, Trash2, Calendar, FileClock, Wifi, ShieldOff } from 'lucide-react';

export default function AdminPanel() {
  const {
    activityLogs,
    users,
    clearLogs,
    language
  } = useDatabase();
  const t = translations[language];

  const [confirmClear, setConfirmClear] = useState(false);

  const formatTimestamp = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleString(language === 'id' ? 'id-ID' : 'en-US', {
        dateStyle: 'short',
        timeStyle: 'medium'
      });
    } catch {
      return isoStr;
    }
  };

  const handleClear = () => {
    clearLogs();
    setConfirmClear(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Users grid of system actors */}
      <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 mb-5">
          <Users className="w-5 h-5 text-blue-500" />
          <h3 className="font-extrabold text-slate-805 text-sm tracking-tight">Akun Aktor Terdaftar di Sistem</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {users.map(u => (
            <div key={u.id} className="p-3.5 bg-slate-50 border border-slate-150/70 rounded-xl hover:shadow-2xs transition-all flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-inner shrink-0">
                {u.avatarText}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-800 text-xs truncate leading-snug">{u.fullName}</div>
                <div className="text-[10px] text-slate-450 leading-none mt-0.5 truncate">{u.email}</div>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold mt-1.5 inline-block uppercase font-mono ${
                  u.role === 'admin'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {u.role === 'admin' ? t.admin : t.driverRole}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Logs Screen lists */}
      <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        
        {/* Header toolbar */}
        <div className="p-5 border-b border-slate-150 bg-slate-50/15 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1 px-1.5 bg-red-50 border border-red-100 rounded-lg text-red-650 flex items-center gap-1 text-[10px] uppercase font-mono font-bold animate-pulse">
              <Wifi className="w-3 h-3" />
              <span>LIVE FEED</span>
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{t.activityLogsTitle}</h3>
          </div>

          {/* Flush logs action */}
          {activityLogs.length > 0 && (
            confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-xxs font-bold text-red-600">Hapus Semua?</span>
                <button
                  onClick={handleClear}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] rounded-lg transition-all cursor-pointer"
                >
                  Ya
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-2.5 py-1 bg-slate-200 text-slate-700 font-extrabold text-[10px] rounded-lg transition-all cursor-pointer"
                >
                  X
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1 py-1.5 px-3 border border-red-100 text-xxs font-bold text-red-650 bg-red-50 hover:bg-red-100/50 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.clearLogsButton}</span>
              </button>
            )
          )}
        </div>

        {/* List Logs content */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-left">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.logTableHeaderUser}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.logTableHeaderRole}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.logTableHeaderAction}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.logTableHeaderDetail}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.logTableHeaderTime}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-slate-700 font-medium text-xs">
              {activityLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs font-medium">
                    {t.noLogs}
                  </td>
                </tr>
              ) : (
                activityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-extrabold text-slate-805">{log.username}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`status-badge px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.role === 'admin'
                          ? 'bg-blue-50 text-blue-700 border border-blue-150/40'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-150/40'
                      }`}>
                        {log.role === 'admin' ? t.admin : t.driverRole}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-slate-800 font-extrabold bg-slate-50 px-2 py-1 rounded border border-slate-200 text-xxs block w-max">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-550 leading-relaxed max-w-sm whitespace-normal font-medium">
                      {log.details}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xxs font-semibold text-slate-450 font-mono">
                      {formatTimestamp(log.timestamp)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
