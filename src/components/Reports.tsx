import { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { translations } from '../translations';
import { FileDown, Printer, CheckSquare, Calendar, FolderHeart, Info, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { ExpenseCategory } from '../types';
//import { svgString } from '../assets/icons/logo';
export default function Reports() {
  const {
    expenses,
    vehicles,
    drivers,
    dailyChecklists,
    maintenanceLogs,
    language
  } = useDatabase();
  const t = translations[language];

  const [dateFilter, setDateFilter] = useState('2026');
  const [filterPlate, setFilterPlate] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Perform filtering
  const filteredExpenses = expenses.filter(e => {
    const matchesPlate = filterPlate === 'all' || e.vehiclePlate === filterPlate;
    const matchesCategory = filterCategory === 'all' || e.category === filterCategory;
    const matchesStartDate = !filterStartDate || e.date >= filterStartDate;
    const matchesEndDate = !filterEndDate || e.date <= filterEndDate;
    return matchesPlate && matchesCategory && matchesStartDate && matchesEndDate;
  });

  // Calculate sum of each category dynamically based on filtered data
  const getSumOfCategory = (cat: ExpenseCategory) => {
    return filteredExpenses
      .filter(e => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getSumOfVehicle = (plate: string) => {
    return filteredExpenses
      .filter(e => e.vehiclePlate === plate)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  // Generate dynamic CSV file representation for Excel
  const handleExportExcelCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Include BOM for Excel Indonesian localizations
    
    // Header
    let filterDetails = [];
    if (filterStartDate) filterDetails.push(`Dari: ${filterStartDate}`);
    if (filterEndDate) filterDetails.push(`Sampai: ${filterEndDate}`);
    if (filterPlate !== 'all') filterDetails.push(`Plat: ${filterPlate}`);
    if (filterCategory !== 'all') filterDetails.push(`Kategori: ${filterCategory.toUpperCase()}`);
    const filterStr = filterDetails.length > 0 ? ` (Saringan: ${filterDetails.join(' | ')})` : '';

    csvContent += "Laporan Kas Pengeluaran Armada CSRJ" + filterStr + "\n\n";
    csvContent += "ID,Tanggal,No Plat Kendaraan,Kategori Biaya,Keterangan Deskripsi,Nominal (IDR),Operator Pengemudi\n";
    
    // Rows
    filteredExpenses.forEach((expense) => {
      const row = [
        expense.id,
        expense.date,
        `"${expense.vehiclePlate}"`,
        expense.category.toUpperCase(),
        `"${expense.description}"`,
        expense.amount,
        `"${expense.driverName}"`
      ].join(",");
      csvContent += row + "\n";
    });

    // Create trigger link to download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const downloadName = filterPlate !== 'all' 
      ? `Laporan_Keuangan_Armada_${filterPlate}.csv` 
      : 'Laporan_Keuangan_Armada_CSRJ.csv';
    link.setAttribute("download", downloadName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable Window trigger
  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Tolong perbolehkan pop-up browser Anda untuk mencetak.');
      return;
    }

    const totalCalculatedCost = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalMaintenanceCost = maintenanceLogs.reduce((sum, e) => sum + e.cost, 0);

    const htmlContent = `
      <html>
       <head>
            <title>CSRJ Fleet Management System - Laporan Kendaraan</title>
                <style>
                    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; background: white; }
                    .header { 
                        text-align: center; 
                        border-bottom: 3px double #cbd5e1; 
                        padding-bottom: 20px; 
                        margin-bottom: 30px;
                    }
                    .header-content {
                        display: flex;
                        align-items: center;      
                        justify-content: center;   
                        gap: 16px;                
                        margin-bottom: 5px;
                    }
                    .header h1 { font-size: 26px; font-weight: 800; color: #1e3a8a; margin: 0; }
                    .header p { font-size: 13px; color: #64748b; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; }
                    
                    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; }
                    .meta-item { font-size: 12px; font-weight: 600; color: #475569; }
                    .meta-item span { font-weight: 800; color: #0f172a; font-family: monospace; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
                    th { border-bottom: 2px solid #e2e8f0; padding: 12px 10px; font-weight: 700; color: #64748b; text-transform: uppercase; text-align: left; }
                    td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; color: #334155; }
                    .total-row { background: #f8fafc; font-size: 13px; font-weight: 850; border-top: 2px solid #cbd5e1; }
                    .footer { text-align: center; margin-top: 100px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
                </style>
            </head>
            <body>
        <div class="header">
            <!-- PERUBAHAN: Bungkus logo dan teks dalam div .header-content -->
            <div class="header-content">
            <img src="/CSG.jpg" alt="CSG Logo" width="60" height="60" />
            <div>
                <h1>JJ2 FLEET MANAGEMENT SYSTEM</h1>
                <p>Laporan Resmi Rekapitulasi Kas Operasional & Pemeliharaan</p>
            </div>
            </div>
        </div>
          <div class="meta-grid">
            <div class="meta-item">Tanggal Cetak: <span>${new Date().toLocaleDateString('id-ID')}</span></div>
            <div class="meta-item">No Plat: <span>${filterPlate === 'all' ? 'Semua Armada' : filterPlate}</span></div>
            <div class="meta-item">Kategori: <span>${filterCategory === 'all' ? 'Semua Kategori' : filterCategory.toUpperCase()}</span></div>
            <div class="meta-item">Mulai Tanggal: <span>${filterStartDate || '-'}</span></div>
            <div class="meta-item">Sampai Tanggal: <span>${filterEndDate || '-'}</span></div>
            <div class="meta-item">Total Biaya Operasional: <span>Rp ${totalCalculatedCost.toLocaleString('id-ID')}</span></div>
          </div>

          <h2>Catatan Kas Biaya Operasional Harian</h2>
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Armada</th>
                <th>Kategori</th>
                <th>Keterangan</th>
                <th>Nominal</th>
                <th>Operator</th>
              </tr>
            </thead>
            <tbody>
              ${filteredExpenses.map(e => `
                <tr>
                  <td>${e.date}</td>
                  <td><b>${e.vehiclePlate}</b></td>
                  <td>${e.category.toUpperCase()}</td>
                  <td>${e.description}</td>
                  <td>Rp ${e.amount.toLocaleString('id-ID')}</td>
                  <td>${e.driverName}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colSpan="4" style="text-align: right;">TOTAL OPERASIONAL SECARA FILTER:</td>
                <td colSpan="2">Rp ${totalCalculatedCost.toLocaleString('id-ID')}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>Dokumen Laporan Kas CSRJ ini dikeluarkan secara digital oleh Sistem Audit Trail Terpusat.</p>
            <p>&copy; <span id="tahun-cetak"></span> CSRJ Fleet Management System, Garut-Leles, Indonesia.</p>
          </div>

          <script>
            window.onload = function() { window.print();
            document.getElementById('tahun-cetak').textContent = new Date().getFullYear(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Map spending per plates
  const expenseMapPlates = vehicles
    .filter(v => filterPlate === 'all' || v.plateNumber === filterPlate)
    .map(v => {
      return { plate: v.plateNumber, amount: getSumOfVehicle(v.plateNumber) / 1000000 }; // inside Millions Rp
    });

  const maxSpendingPlateVal = Math.max(...expenseMapPlates.map(v => v.amount)) || 1;

  // Pie distributions
  const totalSumDist = filteredExpenses.reduce((sum, e) => sum + e.amount, 0) || 1;
  const pieDistribution = [
    { cat: 'fuel', label: t.fuel, amount: getSumOfCategory('fuel'), color: 'bg-blue-500' },
    { cat: 'toll', label: t.toll, amount: getSumOfCategory('toll'), color: 'bg-amber-500' },
    { cat: 'oil', label: t.oil, amount: getSumOfCategory('oil'), color: 'bg-purple-500' },
    { cat: 'parking', label: t.parking, amount: getSumOfCategory('parking'), color: 'bg-emerald-400' },
    { cat: 'other', label: t.other, amount: getSumOfCategory('other'), color: 'bg-pink-500' },
  ].filter(item => filterCategory === 'all' || item.cat === filterCategory);

  return (
    <div className="space-y-6">
      
      {/* Top action links triggers */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-150 shadow-xs">
        
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{t.monthlySummary}</h3>
          <p className="text-xxs text-slate-500 mt-0.5">Sistem kompilasi data otomatis dari seluruh aktivitas CRUD armada.</p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Print trigger */}
          <button
            onClick={handlePrintPDF}
            className="flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 text-xs font-bold text-slate-650 bg-white hover:bg-slate-50 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4 text-blue-500" />
            <span>{t.exportPdf}</span>
          </button>

          {/* Excel CSV trigger */}
          <button
            onClick={handleExportExcelCSV}
            className="flex items-center justify-center gap-1.5 px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow-md cursor-pointer shadow-blue-500/20 transition-all font-mono"
          >
            <FileDown className="w-4 h-4" />
            <span>CSV EXCEL</span>
          </button>
        </div>

      </div>

      {/* Filter panel */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-150 shadow-xs">
        <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 font-sans leading-none">
          <FolderHeart className="w-3.5 h-3.5 text-blue-500" />
          <span>Saring Laporan Keuangan</span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
          {/* Vehicle Dropdown */}
          <select
            value={filterPlate}
            onChange={(e) => setFilterPlate(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-500 w-full sm:w-auto shrink-0 cursor-pointer"
          >
            <option value="all">{t.allVehicles}</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.plateNumber}>{v.plateNumber}</option>
            ))}
          </select>

          {/* Category Dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-500 w-full sm:w-auto shrink-0 cursor-pointer"
          >
            <option value="all">{t.allCategories}</option>
            <option value="fuel">{t.fuel}</option>
            <option value="toll">{t.toll}</option>
            <option value="oil">{t.oil}</option>
            <option value="parking">{t.parking}</option>
            <option value="other">{t.other}</option>
          </select>

          {/* Start Date */}
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-slate-50/50 border border-slate-150 rounded-xl px-3 py-1.5 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 w-full sm:w-auto">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 font-sans shrink-0">{t.startDateFilter}</span>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="bg-slate-50 border border-slate-150 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-500 font-sans cursor-pointer w-32"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-slate-50/50 border border-slate-150 rounded-xl px-3 py-1.5 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 w-full sm:w-auto">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 font-sans shrink-0">{t.endDateFilter}</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="bg-slate-50 border border-slate-150 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-500 font-sans cursor-pointer w-32"
            />
          </div>

          {/* Reset Filters */}
          {(filterStartDate || filterEndDate || filterPlate !== 'all' || filterCategory !== 'all') && (
            <button
              onClick={() => {
                setFilterPlate('all');
                setFilterCategory('all');
                setFilterStartDate('');
                setFilterEndDate('');
              }}
              className="px-3 py-2 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl bg-slate-50 hover:bg-slate-100 font-extrabold text-xs sm:text-[10px] sm:px-2.5 sm:py-1.5 transition-all cursor-pointer w-full sm:w-auto text-center"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Visual Analysis charts rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cost per Plate list and micro barcharts */}
        <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{t.costByVehicle}</h3>
          </div>

          <div className="space-y-4">
            {expenseMapPlates.map(item => {
              const percentage = (item.amount / maxSpendingPlateVal) * 100;
              return (
                <div key={item.plate} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 font-mono tracking-wide">{item.plate}</span>
                    <span className="text-slate-900 font-mono">Rp {item.amount.toFixed(2)} JT</span>
                  </div>
                  {/* Micro horizontal bar representer */}
                  <div className="w-full bg-slate-50 h-3.5 rounded-full overflow-hidden border border-slate-100">
                    <div
                      style={{ width: `${Math.max(4, percentage)}%` }}
                      className="bg-blue-600 h-full rounded-full transition-all duration-500 shadow-sm"
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distributions Pie categories representations */}
        <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-4 h-4 text-purple-500" />
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{t.costByCategory}</h3>
            </div>
            
            {/* Pie Category stack items distribution */}
            <div className="space-y-3.5 my-4">
              {pieDistribution.map(item => {
                const proportion = (item.amount / totalSumDist) * 100;
                return (
                  <div key={item.cat} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-50/70 transition-all">
                    <div className="flex items-center gap-3">
                      <span className={`w-3.5 h-3.5 ${item.color} rounded-sm block shadow-2xs`}></span>
                      <span className="text-xs font-bold text-slate-700">{item.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-805 font-mono">Rp {item.amount.toLocaleString('id-ID')}</span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block leading-none mt-1 font-mono">{proportion.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-150/40 p-3 rounded-xl mt-4 text-[10px] text-indigo-800 font-medium">
            <Info className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Analisis distribusi kas operasional di-generate secara live berdasarkan kuintansi bukti transaksi digital driver Anda.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
