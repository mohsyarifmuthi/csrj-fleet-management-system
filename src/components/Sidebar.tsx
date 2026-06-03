import { useDatabase } from '../context/DatabaseContext';
import { translations } from '../translations';
import {
  LayoutDashboard,
  Truck,
  Users,
  Wrench,
  CheckSquare,
  DollarSign,
  BarChart3,
  ShieldAlert,
  LogOut,
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

export default function Sidebar({
  activeSection,
  setActiveSection,
  sidebarOpen,
  setSidebarOpen
}: SidebarProps) {
  const { currentUser, logout, language } = useDatabase();
  const t = translations[language];

  if (!currentUser) return null;

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'vehicles', label: t.vehicles, icon: Truck, roles: ['admin'] },
    { id: 'drivers', label: t.drivers, icon: Users, roles: ['admin'] },
    { id: 'maintenance', label: t.maintenance, icon: Wrench, roles: ['admin'] },
    { id: 'dailycheck', label: t.dailyCheck, icon: CheckSquare, roles: ['admin', 'driver'] },
    { id: 'expenses', label: t.expenses, icon: DollarSign, roles: ['admin', 'driver'] },
    { id: 'reports', label: t.reports, icon: BarChart3, roles: ['admin'] },
    { id: 'adminPanel', label: t.adminPanel, icon: ShieldAlert, roles: ['admin'] },
  ];

  const allowedMenuItems = menuItems.filter(item => !item.roles || item.roles.includes(currentUser.role));

  return (
    <aside
      id="sidebar-panel"
      className={`bg-slate-900 text-slate-100 flex flex-col h-screen border-r border-slate-800 shrink-0 transition-transform duration-300 ease-in-out z-50
        fixed inset-y-0 left-0 w-68 md:static md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Brand Logo Header */}
      <div className="p-6 border-b border-slate-850 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-650 rounded-xl flex items-center justify-center shadow-lg shadow-blue-550/10 font-bold text-white text-xl border border-blue-500/30">
            C
          </div>
          <div>
            <div className="font-extrabold text-base tracking-wide text-white leading-tight">CSRJ FLEET</div>
            <div className="text-xs text-slate-400 font-medium tracking-wider uppercase">{t.fleetMgmt}</div>
          </div>
        </div>

        {/* Mobile close button */}
        {setSidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 px-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-lg md:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="p-4 flex-1 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        <div className="px-3 mb-2 text-xxs font-semibold uppercase tracking-wider text-slate-500">
          {t.menu}
        </div>
        
        {allowedMenuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => {
                setActiveSection(item.id);
                if (setSidebarOpen) {
                  setSidebarOpen(false);
                }
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-250 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20 translate-x-1'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <IconComponent className={`w-5 h-5 transition-transform ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* User Information Footer Panel */}
      <div className="p-4 border-t border-slate-850 bg-slate-950/60">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/40 border border-slate-800/50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-inner">
            {currentUser.avatarText}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-200 truncate leading-snug">
              {currentUser.fullName}
            </div>
            <div className="text-xxs font-semibold text-blue-400 uppercase tracking-widest leading-none mt-0.5">
              {currentUser.role === 'admin' ? t.admin : t.driverRole}
            </div>
          </div>
        </div>
        
        {/* Sign Out Button */}
        <button
          id="btn-signout"
          onClick={logout}
          className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 bg-red-950/20 hover:bg-red-900/20 hover:text-red-300 border border-red-900/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.logout}</span>
        </button>
      </div>
    </aside>
  );
}
