import { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { translations } from '../translations';
import { Bell, Search, Globe, Check, Clock, Menu } from 'lucide-react';

interface NavbarProps {
  title: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setSidebarOpen?: (open: boolean) => void;
}

export default function Navbar({ title, searchQuery, setSearchQuery, setSidebarOpen }: NavbarProps) {
  const {
    currentUser,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    language,
    setLanguage
  } = useDatabase();
  const t = translations[language];

  const [showNotifications, setShowNotifications] = useState(false);
  const [time, setTime] = useState(new Date());

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentUser) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'overdue': return 'border-red-500 bg-red-50 text-red-800';
      case 'tax': return 'border-orange-500 bg-orange-50 text-orange-800';
      case 'failed_checklist': return 'border-pink-500 bg-pink-50 text-pink-800';
      default: return 'border-blue-500 bg-blue-50 text-blue-800';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <header className="bg-white border-b border-slate-200 h-18 px-4 md:px-8 flex items-center justify-between shadow-sm sticky top-0 z-30 select-none">
      {/* Title & Time */}
      <div className="flex items-center gap-3 md:gap-6">
        {setSidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 text-slate-600 hover:bg-slate-100 rounded-xl md:hidden cursor-pointer"
            title="Open Menu"
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 id="navbar-title" className="text-lg md:text-xl font-extrabold text-slate-905 tracking-tight font-sans">
          {title}
        </h1>
        {/* Real-time Clock Banner */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-150 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 font-mono">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>{formatDate(time)} &bull; {formatTime(time)}</span>
        </div>
      </div>

      {/* Utilities Column */}
      <div className="flex items-center gap-5">
        
        {/* Search Input */}
        <div className="relative hidden md:block">
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPh}
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm w-64 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-700"
          />
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
        </div>

        {/* Language Toggler */}
        <div id="language-toggler" className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 shadow-sm">
          <button
            id="lang-btn-id"
            onClick={() => setLanguage('id')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              language === 'id'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>ID</span>
          </button>
          <button
            id="lang-btn-en"
            onClick={() => setLanguage('en')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              language === 'en'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>EN</span>
          </button>
        </div>

        {/* Notifications Toggle Button */}
        <div className="relative">
          <button
            id="notification-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-650 hover:bg-slate-100 rounded-xl border border-slate-200 shadow-sm transition-all cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span id="notification-badge" className="absolute -top-1 -right-1 w-5 h-5 bg-red-550 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div id="notifications-panel" className="absolute right-0 mt-3.5 w-80 md:w-96 bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
                <span className="font-extrabold text-sm text-slate-800 tracking-tight">{t.notifications}</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notification Content List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-medium">
                    Tidak ada notifikasi aktif.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-4 transition-colors hover:bg-slate-50 flex gap-3.5 cursor-pointer relative ${
                        !notif.read ? 'bg-blue-50/20' : ''
                      }`}
                    >
                      {!notif.read && (
                        <span className="absolute top-4 left-2 w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                      
                      <div className={`p-2 rounded-xl border self-start ${getNotificationColor(notif.type)}`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 leading-snug truncate">
                          {notif.title}
                        </div>
                        <p className="text-xxs text-slate-500 font-medium leading-relaxed mt-0.5 whitespace-pre-wrap">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-slate-450 mt-1.5 block font-medium font-mono">
                          {notif.date} {notif.vehiclePlate ? `| ${notif.vehiclePlate}` : ''}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
