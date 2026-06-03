import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { translations } from '../translations';
import { Mail, Lock, ShieldCheck, Key, RefreshCw, Github, Chrome, Settings } from 'lucide-react';
import { UserRole } from '../types';

export default function Login() {
  const { login, loginOAuth, language, setLanguage } = useDatabase();
  const t = translations[language];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123'); // Preset password
  const [role, setRole] = useState<UserRole>('admin');
  const [isPending, setIsPending] = useState(false);
  const [isOAuthPending, setIsOAuthPending] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      alert('Tolong lengkapi alamat email institusi Anda.');
      return;
    }

    if (!email.includes('@')) {
      alert(t.invalidEmailError);
      return;
    }

    setIsPending(true);
    await login(email, role);
    setIsPending(false);
  };

  // Highly robust OAuth2 handshakes simulation
  const handleOAuthClick = async (provider: 'Google' | 'GitHub') => {
    setIsOAuthPending(provider);
    await loginOAuth(provider);
    setIsOAuthPending(null);
  };

  const handleDemoPreset = (presetEmail: string, presetRole: UserRole) => {
    setEmail(presetEmail);
    setRole(presetRole);
    setPassword('csrj_secure_2026!');
  };

  return (
    <div className="min-h-screen gradient-blue flex flex-col items-center justify-center p-4 selection:bg-blue-200 selection:text-blue-900 font-sans">
      
      {/* Absolute Header Language Toggler */}
      <div className="absolute top-6 right-6 flex items-center bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/10 shadow-lg">
        <button
          onClick={() => setLanguage('id')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            language === 'id' ? 'bg-white text-slate-900 shadow' : 'text-white/80 hover:text-white'
          }`}
        >
          INDONESIA
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            language === 'en' ? 'bg-white text-slate-900 shadow' : 'text-white/80 hover:text-white'
          }`}
        >
          ENGLISH
        </button>
      </div>

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-2xl p-8 overflow-hidden relative">
        
        {/* Loader backdrop during API login delays */}
        {(isPending || isOAuthPending) && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-in fade-in duration-200 p-6 text-center">
            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-3" />
            <h4 className="font-extrabold text-slate-800 text-sm tracking-tight">{t.authWaiting}</h4>
            <p className="text-xxs text-slate-500 font-medium leading-relaxed max-w-xs mt-1">
              {isOAuthPending ? `Mengambil token verifikasi federasi digital melalui ${isOAuthPending}...` : 'Sedang memuat data instansi dan konfigurasi cache lokal.'}
            </p>
          </div>
        )}

        {/* Brand Banner */}
        <div className="text-center mb-6">
          <div className="w-13 h-13 mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-lg border border-blue-400/25 mb-4 animate-bounce duration-1000">
            C
          </div>
          <h2 className="text-lg font-black text-slate-905 tracking-tight">{t.loginTitle}</h2>
          <p className="text-xxs text-slate-500 font-medium mt-1 leading-relaxed whitespace-normal">
            {t.loginSubtitle}
          </p>
        </div>

        {/* Roles Tabs bar */}
        <div id="role-selector" className="grid grid-cols-2 bg-slate-50 p-1 rounded-2xl border border-slate-150 mb-5">
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`py-2 rounded-xl text-xxs font-extrabold uppercase transition-all cursor-pointer ${
              role === 'admin'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.admin}
          </button>
          <button
            type="button"
            onClick={() => setRole('driver')}
            className={`py-2 rounded-xl text-xxs font-extrabold uppercase transition-all cursor-pointer ${
              role === 'driver'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.driverRole}
          </button>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-455 tracking-wider block mb-1">{t.loginEmailLabel}</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Contoh: nama@csrj.id"
                className="w-full pl-9.5 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white text-slate-705"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-455 tracking-wider block mb-1">{t.loginPasswordLabel}</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata sandi rahasia"
                className="w-full pl-9.5 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white text-slate-705"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-blue-500/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.loginButton}</span>
          </button>
        </form>

        {/* Federal OAuth Federated Handshake Section */}
        <div className="mt-5.5 pt-5.5 border-t border-slate-150">
          <div className="text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-3 relative -top-8 block w-max mx-auto border border-slate-150/60 rounded-full py-0.5">
              OAuth2 Portal
            </span>
            <p className="text-xxs text-slate-450 font-semibold mb-3.5">{t.oauthSectionTitle}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Google OAuth2 Button */}
            <button
              type="button"
              onClick={() => handleOAuthClick('Google')}
              className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xxs font-bold text-slate-650 transition-colors cursor-pointer"
            >
              <Chrome className="w-4 h-4 text-red-500" />
              <span>Google ID</span>
            </button>
            
            {/* GitHub OAuth2 Button */}
            <button
              type="button"
              onClick={() => handleOAuthClick('GitHub')}
              className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xxs font-bold text-slate-650 transition-colors cursor-pointer"
            >
              <Github className="w-4 h-4 text-slate-800" />
              <span>GitHub ID</span>
            </button>
          </div>
        </div>

        {/* Demo Fast Preset Clicks */}
        <div className="mt-5.5 bg-slate-50 border border-slate-150 p-4 rounded-2xl">
          <div className="flex items-center gap-1.5 text-blue-600 mb-2.5">
            <Key className="w-4 h-4" />
            <span className="text-xxs uppercase font-extrabold tracking-wide">{t.quickDemoTitle}</span>
          </div>

          <div className="space-y-2">
            {/* Admin preset */}
            <button
              type="button"
              onClick={() => handleDemoPreset('admin@csrj.id', 'admin')}
              className="w-full text-left p-2 bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 rounded-xl text-xxs transition-colors cursor-pointer flex justify-between items-center"
            >
              <span className="font-extrabold text-slate-700">admin@csrj.id</span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{t.admin}</span>
            </button>
            {/* Driver Budi preset */}
            <button
              type="button"
              onClick={() => handleDemoPreset('budi@csrj.id', 'driver')}
              className="w-full text-left p-2 bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 rounded-xl text-xxs transition-colors cursor-pointer flex justify-between items-center"
            >
              <span className="font-extrabold text-slate-700">budi@csrj.id</span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{t.driverRole}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Humble Footer tag */}
      <span className="text-white/50 text-[10px] font-medium tracking-wide mt-6 font-mono">
        CSRJ Fleet Management Console &bull; Secure Protocol Suite 2.0.26
      </span>
    </div>
  );
}
