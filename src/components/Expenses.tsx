import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { translations } from '../translations';
import { Plus, Trash2, Search, Filter, Calendar, DollarSign, FileText, Image, X, Upload, Lock } from 'lucide-react';
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
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Input states & Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedPlate, setSelectedPlate] = useState(vehicles[0]?.plateNumber || '');
  const [category, setCategory] = useState<ExpenseCategory>('fuel');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState(50000);
  const [description, setDescription] = useState('');
  const [passenger, setPassenger] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState('');
  const [selectedReceiptImage, setSelectedReceiptImage] = useState<string | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Calculate sum of each category dynamically based on all data
  const getSumOfCategory = (cat: ExpenseCategory) => {
    return expenses
      .filter(e => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const handleImageUpload = (file: File) => {
    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptPhoto(e.target?.result as string || '');
      };
      reader.readAsDataURL(file);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 640;
        const MAX_HEIGHT = 640;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
          setReceiptPhoto(dataUrl);
        } else {
          setReceiptPhoto(e.target?.result as string || '');
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
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
      driverName: currentUser?.fullName || 'Anonim Operator',
      passenger: passenger || undefined,
      startLocation: startLocation || undefined,
      destination: destination || undefined,
      departureTime: departureTime || undefined,
      returnTime: returnTime || undefined,
      receiptPhoto: receiptPhoto || undefined,
    };

    addExpense(payload);
    setShowModal(false);

    // Reset Form Input
    setDate('');
    setAmount(50.000);
    setDescription('');
    setPassenger('');
    setStartLocation('');
    setDestination('');
    setDepartureTime('');
    setReturnTime('');
    setReceiptPhoto('');
  };

  // Perform filtering
  const filteredExpenses = expenses.filter(exp => {
    const matchesPlate = filterPlate === 'all' || exp.vehiclePlate === filterPlate;
    const matchesCat = filterCategory === 'all' || exp.category === filterCategory;
    const matchesStartDate = !filterStartDate || exp.date >= filterStartDate;
    const matchesEndDate = !filterEndDate || exp.date <= filterEndDate;
    return matchesPlate && matchesCat && matchesStartDate && matchesEndDate;
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
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        <div className="bg-white border border-slate-150 p-3.5 sm:p-4.5 rounded-2xl shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.fuel}</div>
          <div className="text-base sm:text-lg font-black text-slate-800 font-mono mt-2">
            {formatAmount(getSumOfCategory('fuel'))}
          </div>
          <div className="text-[10px] font-semibold text-emerald-600 mt-1">✓ Berhasil teraudit</div>
        </div>

        <div className="bg-white border border-slate-150 p-3.5 sm:p-4.5 rounded-2xl shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.toll}</div>
          <div className="text-base sm:text-lg font-black text-slate-800 font-mono mt-2">
            {formatAmount(getSumOfCategory('toll'))}
          </div>
          <div className="text-[10px] font-semibold text-emerald-600 mt-1">✓ Berhasil teraudit</div>
        </div>

        <div className="bg-white border border-slate-150 p-3.5 sm:p-4.5 rounded-2xl shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.oil}</div>
          <div className="text-base sm:text-lg font-black text-slate-800 font-mono mt-2">
            {formatAmount(getSumOfCategory('oil'))}
          </div>
          <div className="text-[10px] font-semibold text-slate-400 mt-1">Statis</div>
        </div>

        <div className="bg-white border border-slate-150 p-3.5 sm:p-4.5 rounded-2xl shadow-xs">
          <div className="text-[10px] font-bold text-slate-405 uppercase tracking-wider">Parkir & Lainnya</div>
          <div className="text-base sm:text-lg font-black text-slate-800 font-mono mt-2">
            {formatAmount(getSumOfCategory('parking') + getSumOfCategory('other'))}
          </div>
          <div className="text-[10px] font-semibold text-amber-600 mt-1">↗ Menanjak</div>
        </div>

      </div>

      {/* Filter panel & Add budget action */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-150 shadow-xs">
        
        {/* Dynamic filter selectors */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 flex-1 min-w-0">
          <select
            value={filterPlate}
            onChange={(e) => setFilterPlate(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-500 w-full sm:w-auto shrink-0"
          >
            <option value="all">{t.allVehicles}</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.plateNumber}>{v.plateNumber}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-500 w-full sm:w-auto shrink-0"
          >
            <option value="all">{t.allCategories}</option>
            <option value="fuel">{t.fuel}</option>
            <option value="toll">{t.toll}</option>
            <option value="oil">{t.oil}</option>
            <option value="parking">{t.parking}</option>
            <option value="other">{t.other}</option>
          </select>

          {/* Start date filter */}
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-slate-50/50 border border-slate-150 rounded-xl px-3 py-1.5 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 w-full sm:w-auto">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 font-sans shrink-0">{t.startDateFilter}</span>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* End date filter */}
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-slate-50/50 border border-slate-150 rounded-xl px-3 py-1.5 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 w-full sm:w-auto">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 font-sans shrink-0">{t.endDateFilter}</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {(filterStartDate || filterEndDate) && (
            <button
              onClick={() => {
                setFilterStartDate('');
                setFilterEndDate('');
              }}
              className="px-3 py-2 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl bg-slate-50 hover:bg-slate-100 font-extrabold text-xs sm:text-[10px] sm:px-2.5 sm:py-1.5 transition-all cursor-pointer w-full sm:w-auto text-center"
              title="Reset Filter Tanggal"
            >
              Reset
            </button>
          )}
        </div>

        {/* Trigger Button */}
        <button
          onClick={() => {
            setSelectedPlate(filterPlate !== 'all' ? filterPlate : (vehicles[0]?.plateNumber || ''));
            setCategory(filterCategory !== 'all' ? filterCategory : 'fuel');
            setPassenger('');
            setStartLocation('');
            setDestination('');
            setDepartureTime('');
            setReturnTime('');
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow-md cursor-pointer whitespace-nowrap"
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
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.detailsOnly}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.remarksOnly}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.amount}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.driver}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-xs font-medium">
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
                    <td className="px-6 py-4 text-xs font-bold text-slate-800">
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{exp.description}</span>
                        {exp.receiptPhoto && (
                          <button
                            onClick={() => setSelectedReceiptImage(exp.receiptPhoto!)}
                            className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 border border-blue-250/60 hover:bg-blue-100 rounded px-1.5 py-0.5 font-bold cursor-pointer transition-all whitespace-nowrap"
                            title="Klik untuk melihat bukti kuitansi"
                          >
                            <FileText className="w-3 h-3 text-blue-500" />
                            <span>Lihat Bukti</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                      {(exp.passenger || exp.startLocation || exp.destination || exp.departureTime || exp.returnTime) ? (
                        <div className="p-2 bg-slate-50 border border-slate-150 rounded-xl space-y-1 text-[11px] text-slate-550 max-w-xs md:max-w-md">
                          {exp.passenger && (
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-750">{t.passenger}:</span>
                              <span className="text-slate-600 font-medium">{exp.passenger}</span>
                            </div>
                          )}
                          {(exp.startLocation || exp.destination) && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-755">Rute:</span>
                              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-sans">{exp.startLocation || '-'}</span>
                              <span className="text-slate-400">➔</span>
                              <span className="bg-blue-50 text-blue-800 border border-blue-100/40 px-1.5 py-0.2 rounded font-sans font-medium">{exp.destination || '-'}</span>
                            </div>
                          )}
                          {(exp.departureTime || exp.returnTime) && (
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-755">Waktu:</span>
                              <span className="font-mono text-slate-600 bg-slate-100/50 px-1.2 py-0.2 rounded">{exp.departureTime || '--:--'}</span>
                              <span className="text-slate-400 font-sans text-[10px]">s/d</span>
                              <span className="font-mono text-slate-600 bg-slate-100/50 px-1.2 py-0.2 rounded">{exp.returnTime || '--:--'}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px] font-sans">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-extrabold text-slate-900 font-mono">
                      {formatAmount(exp.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-500">{exp.driverName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {currentUser?.role === 'admin' || exp.driverName === currentUser?.fullName ? (
                        confirmDeleteId === exp.id ? (
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
                        )
                      ) : (
                        <span className="text-slate-300 bg-slate-50 border border-slate-100 p-1.5 rounded-lg inline-block cursor-not-allowed" title="Hanya pemilik rekaman biaya & Admin">
                          <Lock className="w-3 h-3" />
                        </span>
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
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-150 flex items-center justify-between bg-slate-50 shrink-0">
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
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
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

              {/* Travel and Route specifications */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3 shadow-2xs">
                <div className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase flex items-center gap-1.5 pb-1 border-b border-slate-150">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  Informasi Perjalanan / Tugas (Opsional)
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-450 block mb-1">{t.passenger}</label>
                  <input
                    type="text"
                    value={passenger}
                    onChange={(e) => setPassenger(e.target.value)}
                    placeholder="Contoh: Tim Direksi (4 Orang), Budi, Susi"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-450 block mb-1">{t.startLocation}</label>
                    <input
                      type="text"
                      value={startLocation}
                      onChange={(e) => setStartLocation(e.target.value)}
                      placeholder="Contoh: Kantor Jakarta"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-450 block mb-1">{t.destination}</label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Contoh: Pabrik Karawang"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-450 block mb-1">{t.departureTime}</label>
                    <input
                      type="time"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-450 block mb-1">{t.returnTime}</label>
                    <input
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Drag-and-drop Receipt area */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.receiptPhoto}</label>
                
                {receiptPhoto ? (
                  <div className="relative border border-slate-200 rounded-2xl p-4 bg-slate-50 flex flex-col items-center gap-3">
                    {receiptPhoto.startsWith('data:application/pdf') ? (
                      <div className="flex items-center gap-2 p-4 bg-white border border-slate-200 rounded-xl w-full">
                        <FileText className="w-8 h-8 text-red-500" />
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">Kuitansi_Transaksi.pdf</p>
                          <p className="text-[10px] text-slate-400">Dokumen PDF Tersimpan</p>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={receiptPhoto}
                        alt="Preview Kuitansi"
                        className="max-h-48 rounded-xl object-contain border border-slate-150 shadow-xs"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setReceiptPhoto('')}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xxs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      Hapus & Ganti Bukti
                    </button>
                  </div>
                ) : (
                  <div 
                    className="border bg-slate-50 border-dashed border-slate-250 rounded-2xl p-5 text-center text-xs text-slate-400 hover:bg-slate-100/60 hover:border-blue-400 hover:text-slate-600 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 shadow-2xs relative"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  >
                    <Upload className="w-6 h-6 text-slate-400 animate-pulse" />
                    <div className="space-y-1">
                      <span className="font-extrabold text-slate-700 text-xs block">Unggah Foto Bukti Transaksi</span>
                      <span className="text-[10px] text-slate-450 block">Mendukung format PNG, JPG, PDF (Maks. 5MB)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 w-full max-w-xs pt-1">
                      {/* Gallery Input */}
                      <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 rounded-xl text-[11px] font-bold text-slate-600 cursor-pointer transition-all active:scale-97">
                        <Image className="w-3.5 h-3.5 text-blue-500" />
                        Galeri Foto
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                          className="hidden"
                        />
                      </label>

                      {/* Camera Input */}
                      <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 rounded-xl text-[11px] font-bold text-slate-600 cursor-pointer transition-all active:scale-97">
                        <Upload className="w-3.5 h-3.5 text-emerald-500" />
                        Kamera HP
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
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

      {/* Lightbox / Receipt image viewer modal */}
      {selectedReceiptImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-150">
          <div className="relative bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100">
            <div className="px-5 py-3.5 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-500" />
                Bukti Transaksi Terlampir
              </h3>
              <button
                onClick={() => setSelectedReceiptImage(null)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 bg-slate-100 flex items-center justify-center min-h-[300px] max-h-[75vh] overflow-y-auto">
              {selectedReceiptImage.startsWith('data:application/pdf') ? (
                <iframe
                  src={selectedReceiptImage}
                  title="Bukti PDF"
                  className="w-full h-[50vh] border border-slate-200 rounded-xl"
                />
              ) : (
                <img
                  src={selectedReceiptImage}
                  alt="Bukti Transaksi"
                  className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-md border border-slate-200"
                />
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-150 bg-slate-50 text-right">
              <button
                onClick={() => setSelectedReceiptImage(null)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-705 text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
