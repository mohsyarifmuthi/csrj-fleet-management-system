import { useDatabase } from '../context/DatabaseContext';
import { translations } from '../translations';
import {
  Truck,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  AlertOctagon,
  Calendar,
  Eye,
  Wrench,
  ShieldCheck,
  Zap,
  Info,
  Database,
  Server,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { VehicleStatus } from '../types';

interface DashboardProps {
  onNavigateToSection: (section: string) => void;
}

export default function Dashboard({ onNavigateToSection }: DashboardProps) {
  const {
    vehicles,
    expenses,
    maintenanceLogs,
    notifications,
    markNotificationAsRead,
    language,
    dbConnected,
    dbProvider,
    dbConfigured,
    apiBaseUrl,
    dbError,
    refreshData
  } = useDatabase();
  const t = translations[language];

  // Calculated Stats
  const totalVehiclesCount = vehicles.length;
  const operationalCount = vehicles.filter(v => v.status === 'operational').length;
  const maintenanceCount = vehicles.filter(v => v.status === 'maintenance').length;
  const watchdogCount = vehicles.filter(v => v.status === 'idle').length;

  const totalExpensesSum = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Filter 3 latest ongoing or completed maintenance records
  const recentServis = maintenanceLogs.slice(0, 3);

  // Active unread notifications
  const activeAlerts = notifications.filter(n => !n.read).slice(0, 3);

  // SVG Chart: Area Trend of operations expenditure (6 values, hardcoded for nice aesthetics)
  const chartExpValues = [340, 390, 385, 420, 410, totalExpensesSum / 1000000]; // in million Rp
  const chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Juni'];

  // Svg chart helpers
  const svgWidth = 500;
  const svgHeight = 150;
  const maxVal = Math.max(...chartExpValues) * 1.25;
  const points = chartExpValues.map((val, idx) => {
    const x = (idx / (chartExpValues.length - 1)) * (svgWidth - 40) + 20;
    const y = svgHeight - (val / maxVal) * (svgHeight - 40) - 20;
    return { x, y, val };
  });

  const pathD = points.length > 0 ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') : '';
  const areaD = points.length > 0 ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - 10} L ${points[0].x} ${svgHeight - 10} Z` : '';

  // Doughnut layout
  const statusDoughnut = [
    { label: t.operational, count: operationalCount, color: 'bg-emerald-500', fill: '#10b981' },
    { label: t.inMaintenance, count: maintenanceCount, color: 'bg-amber-500', fill: '#f59e0b' },
    { label: t.idle, count: watchdogCount, color: 'bg-slate-400', fill: '#9ca3af' },
  ];
  const doughnutTotal = totalVehiclesCount || 1;

  const formatIDR = (num: number) => {
    if (num >= 1000000000) {
      return `Rp ${(num / 1000000000).toFixed(2)} M`;
    }
    return `Rp ${(num / 1000000).toFixed(1)} JT`;
  };

  const getStatusStyle = (status: VehicleStatus) => {
    switch (status) {
      case 'operational': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'maintenance': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'overdue': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'tax': return <Calendar className="w-5 h-5 text-amber-550" />;
      case 'failed_checklist': return <AlertOctagon className="w-5 h-5 text-pink-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'overdue': return 'border-red-100 bg-red-50 hover:bg-red-100/60';
      case 'tax': return 'border-amber-100 bg-amber-50 hover:bg-amber-100/60';
      case 'failed_checklist': return 'border-pink-100 bg-pink-50 hover:bg-pink-100/60';
      default: return 'border-blue-100 bg-blue-50 hover:bg-blue-100/60';
    }
  };

  return (
    <div className="space-y-6">

      {/* STATUS KONEKSI SUBTIL */}
      <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-3 bg-white border border-slate-150 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative flex">
            <span className={`animate-ping absolute inline-flex h-3 w-3 rounded-full opacity-75 ${dbConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${dbConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span>Status Sistem DB:</span>
              <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wide font-extrabold rounded-md border ${dbConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                {dbConnected ? 'Terkoneksi (Oracle DB)' : 'Mode Uji Coba (Simulasi / Fallback JSON)'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block font-medium mt-0.5">
              Endpoint API: <code className="text-blue-600 font-mono text-[10px] bg-slate-50 px-1 py-0.5 rounded">{apiBaseUrl || 'Internal Node Dev'}</code> &bull; Provider: <strong className="text-slate-650">{dbProvider}</strong>
            </span>
          </div>
        </div>
        <button
          onClick={refreshData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-250/70 text-slate-650 rounded-xl text-xxs font-extrabold transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <RefreshCw className="w-3 h-3 text-blue-500" />
          <span>Sinkronisasi Ulang</span>
        </button>
      </div>

      {/* 4 Pillars Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Total Vehicles Card */}
        <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-650 rounded-xl flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <span className="text-xxs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-150/40">
              +10%
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 leading-none">
            {totalVehiclesCount}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-2">
            {t.totalVehicles}
          </div>
        </div>

        {/* Operational Vehicles Card */}
        <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-green-500/20">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-xxs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-150/40">
              {((operationalCount / doughnutTotal) * 10).toFixed(0)}/10
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 leading-none">
            {operationalCount}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-2">
            {t.operational}
          </div>
        </div>

        {/* Maintenance Count Card */}
        <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-xxs font-extrabold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100/30 font-medium">
              Aktif
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 leading-none">
            {maintenanceCount}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-2">
            {t.inMaintenance}
          </div>
        </div>

        {/* Operating Costs Card */}
        <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 font-sans font-black text-sm select-none">
              Rp
            </div>
            <span className="text-xxs font-extrabold text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-150/40">
              +1.2%
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 leading-snug">
            {formatIDR(totalExpensesSum)}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-2">
            {t.monthlyExpenses}
          </div>
        </div>

      </div>

      {/* Main Graphs Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Charts & Expenditure Trend */}
        <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{t.expenseTrend}</h3>
              <p className="text-xxs text-slate-550 mt-0.5">{t.last6Months}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Real-time Log</span>
            </div>
          </div>

          {/* Custom SVG Line Chart */}
          <div className="relative w-full h-44 my-4 flex items-center justify-center">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="20" y1="10" x2={svgWidth - 20} y2="10" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="20" y1="50" x2={svgWidth - 20} y2="50" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="20" y1="90" x2={svgWidth - 20} y2="90" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="20" y1="130" x2={svgWidth - 20} y2="130" stroke="#e2e8f0" strokeWidth="1.5" />

              {/* Area Under Line */}
              <path d={areaD} fill="url(#gradientArea)" />

              {/* Highlight Path Line */}
              <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

              {/* Interactive Point Bullets */}
              {points.map((p, idx) => (
                <g key={idx} className="group cursor-pointer">
                  <circle cx={p.x} cy={p.y} r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" className="hover:scale-130 transition-transform" />

                  {/* Tooltip on hovering */}
                  <rect x={p.x - 30} y={p.y - 30} width="60" height="20" rx="6" fill="#1e293b" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  <text x={p.x} y={p.y - 17} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" className="opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                    Rp {p.val.toFixed(0)}JT
                  </text>
                </g>
              ))}

              {/* Labels */}
              {points.map((p, idx) => (
                <text key={idx} x={p.x} y={svgHeight - 2} fill="#64748b" fontSize="9" fontWeight="600" textAnchor="middle" className="font-mono">
                  {chartLabels[idx]}
                </text>
              ))}
            </svg>
          </div>

          <div className="flex gap-4 items-center border-t border-slate-100 pt-4 text-xxs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-blue-600 rounded-full inline-block"></span>
              <span>Bahan Bakar & Biaya Servis Terhitung</span>
            </div>
            <span>&bull;</span>
            <span className="italic">Data diperbarui otomatis dari pencatatan harian Anda.</span>
          </div>
        </div>

        {/* Condition Pie-Donut representation */}
        <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs">
          <h3 className="font-extrabold text-slate-800 text-sm tracking-tight mb-4">{t.vehicleStatus}</h3>

          {/* Built-in Status Visual Panel */}
          <div className="flex items-center justify-around h-36">

            {/* Minimalist Multi-Donut Ring Meter */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="44" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                <circle
                  cx="56"
                  cy="56"
                  r="44"
                  stroke="#10b981"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={2 * Math.PI * 44 * (1 - (operationalCount / doughnutTotal))}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-slate-900">{totalVehiclesCount}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">{t.vehicle}</span>
              </div>
            </div>

            {/* Side-legends indicator */}
            <div className="space-y-2.5">
              {statusDoughnut.map((item, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 ${item.color} rounded-sm block`}></span>
                    <span className="text-xs font-bold text-slate-700 leading-none">{item.count}</span>
                    <span className="text-xxs font-semibold text-slate-500 leading-none">{item.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono pl-5 mt-0.5 font-medium">
                    {((item.count / doughnutTotal) * 100).toFixed(0)}% dari armada
                  </span>
                </div>
              ))}
            </div>

          </div>

          <button
            onClick={() => onNavigateToSection('vehicles')}
            className="w-full mt-4 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xxs font-bold text-slate-650 rounded-xl transition-all cursor-pointer"
          >
            <span>Kelola Hub Kendaraan</span>
            <span>&rarr;</span>
          </button>
        </div>

      </div>

      {/* Sibling rows: maintenance & notifications list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Service */}
        <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{t.recentMaintenance}</h3>
            <button
              onClick={() => onNavigateToSection('maintenance')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
            >
              <span>{t.viewAll}</span>
              <span>&rarr;</span>
            </button>
          </div>

          <div className="space-y-3.5 flex-1">
            {recentServis.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-xl">
                Tidak ada riwayat perbaikan terdaftar.
              </div>
            ) : (
              recentServis.map((log) => (
                <div key={log.id} className="flex items-center gap-3.5 p-3.5 bg-slate-50/60 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-850 text-xs truncate flex items-center gap-2">
                      <span>{log.vehiclePlate}</span>
                      <span className="text-xxs font-medium text-slate-400">({log.vehicleModel})</span>
                    </div>
                    <div className="text-xxs text-slate-500 font-medium leading-relaxed mt-0.5 truncate">
                      {log.serviceType === 'Mesin' && t.engineService}
                      {log.serviceType === 'Oli' && t.oilChange}
                      {log.serviceType === 'Rem' && t.brakeService}
                      {log.serviceType === 'Ban' && t.tireChange}
                      {log.serviceType === 'Lainnya' && 'Layanan Pemeliharaan Rutin'}
                      <span> &bull; </span>
                      <span className="font-semibold font-mono">{log.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-805 leading-none block">
                      Rp {(log.cost / 1000).toLocaleString('id-ID')}K
                    </span>
                    <span className={`status-badge px-2 py-0.5 rounded-md text-[9px] font-bold mt-1.5 inline-block ${getStatusStyle(log.status as VehicleStatus)}`}>
                      {log.status === 'ongoing' ? t.ongoing : log.status === 'completed' ? t.completed : t.upcoming}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dynamic Alerts watchlist */}
        <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{t.notifications}</h3>
            <span className="text-xxs font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded-lg">
              Siaga Bahaya
            </span>
          </div>

          <div className="space-y-3.5 flex-1">
            {activeAlerts.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
                <span>Seluruh armada terverifikasi aman & bebas peringatan bahaya!</span>
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => markNotificationAsRead(alert.id)}
                  className={`flex gap-3.5 p-3.5 border-l-4 rounded-r-xl shadow-xs cursor-pointer transition-all ${getAlertStyle(alert.type)}`}
                >
                  <div className="shrink-0 mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-slate-800 tracking-tight leading-snug">
                      {alert.title}
                    </div>
                    <p className="text-xxs text-slate-600 font-medium leading-relaxed mt-0.5">
                      {alert.message}
                    </p>
                    <span className="text-[9px] text-slate-400 mt-1.5 block font-medium font-mono">
                      Dirilis Tanggal: {alert.date} {alert.vehiclePlate ? `| Armada: ${alert.vehiclePlate}` : ''}
                    </span>
                  </div>
                  <span className="text-xxs font-bold text-blue-600 hover:underline hover:text-blue-700 shrink-0 self-center">
                    Tandai Selesai
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
