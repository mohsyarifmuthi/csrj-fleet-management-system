import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { translations } from '../translations';
import { Plus, Trash2, Search, Filter, Calendar, DollarSign, FileText, Image, X, Upload } from 'lucide-react';
import { Expense, ExpenseCategory } from '../types';

export default function Expenses() {
  const {
    expenses,
    vehicles,
    currentUser,
    addExpense,
    deleteExpense,
    language
  } = useDatabase();
  const t = translations[language];

  // Filters state
  const [filterPlate, setFilterPlate] = useState('all');
  const [filterCategory, setFilterCategory] = useState<'all' | ExpenseCategory>('all');

  // Input states & Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedPlate, setSelectedPlate] = useState(vehicles[0]?.plateNumber || '');
  const [category, setCategory] = useState<ExpenseCategory>('fuel');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState(50000);
  const [description, setDescription] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Calculate sum of each category dynamically
  const getSumOfCategory = (cat: ExpenseCategory) => {
    return expenses
      .filter(e => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlate || !date || !amount || !description) {
      alert('Tolong isi seluruh rincian nominal, tanggal, dan deskripsi kwitansi.');
      return;
    }

    const payload = {
      date,
      vehiclePlate: selectedPlate,
      category,
      description,
      amount: Number(amount),
      driverName: currentUser?.fullName || 'Anonim Operator'
    };

    addExpense(payload);
    setShowModal(false);

    // Reset Form Input
    setDate('');
    setAmount(50000);
    setDescription('');
  };

  // Perform filtering
  const filteredExpenses = expenses.filter(exp => {
    const matchesPlate = filterPlate === 'all' || exp.vehiclePlate === filterPlate;
    const matchesCat = filterCategory === 'all' || exp.category === filterCategory;
    return matchesPlate && matchesCat;
  });

  const getCategoryTheme = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'fuel': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'toll': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'oil': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'parking': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-pink-100 text-pink-700 border-pink-200';
    }
  };

  const formatAmount = (num: number) => {
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  return (
    <div className="space-y-6">
      
      {/* 4 Categorized totals indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        
        <div className="bg-white border border-slate-150 p-4.5 rounded-2xl shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.fuel}</div>
          <div className="text-lg font-black text-slate-800 font-mono mt-2">
            {formatAmount(getSumOfCategory('fuel'))}
          </div>
          <div className="text-[10px] font-semibold text-emerald-600 mt-1">✓ Berhasil teraudit</div>
        </div>

        <div className="bg-white border border-slate-150 p-4.5 rounded-2xl shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.toll}</div>
          <div className="text-lg font-black text-slate-800 font-mono mt-2">
            {formatAmount(getSumOfCategory('toll'))}
          </div>
          <div className="text-[10px] font-semibold text-emerald-600 mt-1">✓ Berhasil teraudit</div>
        </div>

        <div className="bg-white border border-slate-150 p-4.5 rounded-2xl shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.oil}</div>
          <div className="text-lg font-black text-slate-800 font-mono mt-2">
            {formatAmount(getSumOfCategory('oil'))}
          </div>
          <div className="text-[10px] font-semibold text-slate-400 mt-1">Statis</div>
        </div>

        <div className="bg-white border border-slate-150 p-4.5 rounded-2xl shadow-xs">
          <div className="text-[10px] font-bold text-slate-405 uppercase tracking-wider">Parkir & Lainnya</div>
          <div className="text-lg font-black text-slate-800 font-mono mt-2">
            {formatAmount(getSumOfCategory('parking') + getSumOfCategory('other'))}
          </div>
          <div className="text-[10px] font-semibold text-amber-600 mt-1">↗ Menanjak</div>
        </div>

      </div>

      {/* Filter panel & Add budget action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-150 shadow-xs">
        
        {/* Dynamic filter selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={filterPlate}
            onChange={(e) => setFilterPlate(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-500"
          >
            <option value="all">{t.vehicles}</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.plateNumber}>{v.plateNumber}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-500"
          >
            <option value="all">{t.allCategories}</option>
            <option value="fuel">{t.fuel}</option>
            <option value="toll">{t.toll}</option>
            <option value="oil">{t.oil}</option>
            <option value="parking">{t.parking}</option>
            <option value="other">{t.other}</option>
          </select>
        </div>

        {/* Trigger Button */}
        <button
          onClick={() => {
            setSelectedPlate(vehicles[0]?.plateNumber || '');
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addExpense}</span>
        </button>

      </div>

      {/* Expenses list ledger */}
      <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-150 bg-slate-50/15">
          <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{t.latestExpenses}</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-left">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.date}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.vehicle}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.category}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.description}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.amount}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.driver}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-xs font-medium">
                    Belum terdapat rekaman biaya operasional masuk untuk kategori ini.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-550 font-mono">{exp.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-extrabold text-slate-800 font-mono select-all">
                      {exp.vehiclePlate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`status-badge border px-2.5 py-0.5 rounded-md text-[10px] ${getCategoryTheme(exp.category)}`}>
                        {exp.category === 'fuel' && t.fuel}
                        {exp.category === 'toll' && t.toll}
                        {exp.category === 'oil' && t.oil}
                        {exp.category === 'parking' && t.parking}
                        {exp.category === 'other' && t.other}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">{exp.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-extrabold text-slate-900 font-mono">
                      {formatAmount(exp.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-500">{exp.driverName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {confirmDeleteId === exp.id ? (
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => {
                              deleteExpense(exp.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 text-white bg-red-600 rounded-lg text-xxs font-bold cursor-pointer"
                          >
                            Ya
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 text-slate-600 bg-slate-100 rounded-lg text-xxs font-bold cursor-pointer"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(exp.id)}
                          className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100/60 p-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">
                {t.addExpense}
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
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.selectVehicle}</label>
                  <select
                    value={selectedPlate}
                    onChange={(e) => setSelectedPlate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.plateNumber}>{v.plateNumber}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.category}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="fuel">{t.fuel}</option>
                    <option value="toll">{t.toll}</option>
                    <option value="oil">{t.oil}</option>
                    <option value="parking">{t.parking}</option>
                    <option value="other">{t.other}</option>
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
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.amount}</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.description}</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Isi rincian transaksi (Contoh: Solar 55 Liter, Tol Pasteur)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Drag-and-drop Receipt area */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.receiptPhoto}</label>
                <div className="border bg-slate-50 border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400 hover:bg-slate-100/60 hover:border-blue-400 hover:text-slate-600 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 shadow-2xs">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="font-semibold text-slate-700 text-xxs block">{t.uploadPhoto}</span>
                  <span className="text-[10px] text-slate-450 inline-block">Mendukung format PNG, JPG, PDF (Maks. 5MB)</span>
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
