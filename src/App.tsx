/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import { translations } from './translations';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Vehicles from './components/Vehicles';
import Drivers from './components/Drivers';
import Maintenance from './components/Maintenance';
import DailyCheck from './components/DailyCheck';
import Expenses from './components/Expenses';
import Reports from './components/Reports';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';

function FleetAppContent() {
  const { currentUser, language } = useDatabase();
  const t = translations[language];

  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-redirect drivers when logged in to driver-available views (no access to admin sections)
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'driver') {
        setActiveSection('dailycheck');
      } else {
        setActiveSection('dashboard');
      }
    }
  }, [currentUser]);

  if (!currentUser) {
    return <Login />;
  }

  // Get localized header text for topbar navbar
  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard': return t.dashboard;
      case 'vehicles': return t.vehicles;
      case 'drivers': return t.drivers;
      case 'maintenance': return t.maintenance;
      case 'dailycheck': return t.dailyCheck;
      case 'expenses': return t.expenses;
      case 'reports': return t.reports;
      case 'adminPanel': return t.adminPanel;
      default: return t.dashboard;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
      
      {/* Left Sidebar Navigation Panel */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Main Content View Frame */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Sticky Header Nav with search query input */}
        <Navbar
          title={getSectionTitle()}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Scrollable Main Screen Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <div className="max-w-7xl mx-auto h-full">
            {activeSection === 'dashboard' && <Dashboard onNavigateToSection={setActiveSection} />}
            {activeSection === 'vehicles' && <Vehicles />}
            {activeSection === 'drivers' && <Drivers />}
            {activeSection === 'maintenance' && <Maintenance />}
            {activeSection === 'dailycheck' && <DailyCheck />}
            {activeSection === 'expenses' && <Expenses />}
            {activeSection === 'reports' && <Reports />}
            {activeSection === 'adminPanel' && <AdminPanel />}
          </div>
        </main>

      </div>

    </div>
  );
}

export default function App() {
  return (
    <DatabaseProvider>
      <FleetAppContent />
    </DatabaseProvider>
  );
}
