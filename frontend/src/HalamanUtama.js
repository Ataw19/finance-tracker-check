
import ModalAddMonth from "./ModalAddMonth";
import React, { useEffect, useState, useCallback } from "react";
import ModalBudget from './ModalBudget';
import IconPickerModal from "./IconPickerModal";
import Recent from './RecentTransaction';
import FilterTransaksi from './FilterTransaksi';
import ChartKeuangan from './ChartKeuangan';
import { getTransactions, getBudgets, getCategories, deleteTransaction, deleteCategory } from './apiservice';

function App() {
  const [budgetsByMonth, setBudgetsByMonth] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [pendapatan, setPendapatan] = useState([]);
  const [categories, setCategories] = useState([]);
  //Variabel
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeAddMonthTarget, setActiveAddMonthTarget] = useState(null);
  const [isModalAddMonthOpen, setIsModalAddMonthOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [iconTargetId, setIconTargetId] = useState(null);
  const [selectedTab, setSelectedTab] = useState("Terkini");
  const [selectedTabPendapatan, setSelectedTabPendapatan] = useState("Terkini");
  const budgets = budgetsByMonth[selectedMonth] || [];
  const Budgetperpage = 5;
  const [currentBudget, setCurrentBudget] = useState(1);
  const displayedBudgets = budgets.slice(0, currentBudget * Budgetperpage);
  const hasMoreBudget = budgets.length > displayedBudgets.length;
  
  const [akunSementara, setAkunSementara] = useState([]);
  const [selectedMonthAkun, setSelectedMonthAkun] = useState("2025-05");
  const Akun = AkunByMonth[selectedMonthAkun] || [];
  const Akunperpage = 5;
  const [currentAkun, setCurrentAkun] = useState(1);
  const displayedAkun = Akun.slice(0, currentAkun * Akunperpage);
  const hasMoreAkun = Akun.length > displayedAkun.length;
  const [selectedItem, setSelectedItem] = useState(null); // bisa untuk akun atau budget
  const [modalType, setModalType] = useState(null); // "budget" atau "akun"
  const [iconTargetType, setIconTargetType] = useState(null);
  
  //Fungsi atau Method
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [year, month] = selectedMonth.split('-');
      
      const [budgetData, transactionData, categoryData] = await Promise.all([
        getBudgets(year, month),
        getTransactions(),
        getCategories()
      ]);

      // 3. Proses dan set data ke state
      const budgetMap = { [selectedMonth]: budgetData };
      setBudgetsByMonth(budgetMap);
      
      const expenseTxs = transactionData.filter(tx => tx.type === 'expense'); //
      const incomeTxs = transactionData.filter(tx => tx.type === 'income'); //
      setTransactions(expenseTxs);
      setPendapatan(incomeTxs);
      
      setCategories(categoryData);

    } catch (error) {
      console.error("Gagal mengambil data:", error);
      // Di sini Anda bisa menambahkan logika redirect ke halaman login jika token tidak valid
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);
  // Panggil fetchData saat komponen mount atau saat bulan diganti
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddMonthWrapper = (newMonth) => {
  if (activeAddMonthTarget === "budget") {
    handleAddMonth(newMonth);
  } else if (activeAddMonthTarget === "akun") {
    handleAddMonthAkun(newMonth);
  }
  setIsModalAddMonthOpen(false);
};

  const handleTransactionsChange = (updatedRows) => {
    setTransactions(updatedRows);
  };

  const handlePendaptanChange = (updatedRows) => {
    setPendapatan(updatedRows);
  };

  const handleIconSelect = (iconPath) => {
  setShowIconPicker(false);
  setSelectedIcon(iconPath);

  if (iconTargetId !== null && iconTargetType !== null) {
    if (iconTargetType === "budget") {
      setBudgetsByMonth((prev) => ({
        ...prev,
        [selectedMonth]: prev[selectedMonth].map((b) =>
          b.id === iconTargetId ? { ...b, icon: iconPath } : b
        ),
      }));
    } else if (iconTargetType === "akun") {
      setAkunByMonth((prev) => ({
        ...prev,
        [selectedMonth]: prev[selectedMonth].map((a) =>
          a.id === iconTargetId ? { ...a, icon: iconPath } : a
        ),
      }));
    }

    setIconTargetId(null);
    setIconTargetType(null);
  }
}

  function handleAddMonth(newMonth) {
  if (budgetsByMonth[newMonth]) {
    alert("Maaf, bulan sudah ada!");
    return;
  }

  setBudgetsByMonth(prev => ({
    ...prev,
    [newMonth]: []
  }));
  setSelectedMonth(newMonth);
  setModalOpen(false);
}
  function handleAddMonthAkun(newMonth) {
  if (AkunByMonth[newMonth]) {
    alert("Maaf, bulan sudah ada!");
    return;
  }

  setAkunByMonth(prev => ({
    ...prev,
    [newMonth]: []
  }));
  setSelectedMonthAkun(newMonth);
  setModalOpen(false);
}
  const handleAddBudget = () => {
  setSelectedItem(null);           // Tidak ada data sebelumnya (bukan edit)
  setModalType("budget");          // Mode budget

  const akunList = AkunByMonth[selectedMonth] || [];
  // Tidak perlu pengurangan used karena tidak sedang edit
  const akunTemp = akunList.map((akun) => ({ ...akun }));

  setAkunSementara(akunTemp);      // ← untuk modal
  setModalOpen(true);
};

  const handleEdit = (item, type) => {
  setSelectedItem(item);
  setModalType(type);
  if (type === "budget") {
    const akunList = AkunByMonth[selectedMonth] || [];
    // Salin akun dan kurangi used sementara jika item sedang diedit
    const akunTemp = akunList.map((akun) => {
      const dikurang = item?.akunDipakai?.[akun.name] || 0;
      return {
        ...akun,
        used: (akun.used || 0) - dikurang,
      };
    });
    setAkunSementara(akunTemp); // ← pakai di sini
  }
  setModalOpen(true);
};
  
 const handleSaveBudget = async (data) => {
    try {
        // Data dari modal harus mengandung: category_id, amount, year, month
        await setBudget(data);
        fetchData(); // Refresh data
        setModalOpen(false); // Tutup modal
        alert('Budget berhasil disimpan');
    } catch (error) {
        console.error("Gagal simpan budget:", error);
        alert(error.message);
    }
};

  
  const handleHapusKategori = async (categoryId) => {
  if (window.confirm("Anda yakin ingin menghapus transaksi ini?")) {
    try {
      // Panggil API untuk menghapus
      await deleteTransaction(transactionId);

      // Update state secara manual agar UI cepat merespons tanpa perlu fetch ulang
      setTransactions(prev => prev.filter(tx => tx.id !== transactionId));
      setPendapatan(prev => prev.filter(tx => tx.id !== transactionId));

      // Opsional: panggil fetchData() untuk memastikan data 100% sinkron
      // fetchData(); 

      alert('Transaksi berhasil dihapus.');
    } catch (error) {
      console.error("Gagal menghapus transaksi:", error);
      alert(error.message);
    }
  }
};
  
  const CircularProgress = ({ percentage }) => {
    const pct = Number(percentage); // pastikan tipe number
    const radius = 20;
    const stroke = 4;
    const normalized = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalized;
  
    // Batasi offset hanya sampai 100%
    const clamped = Math.min(pct, 100); // agar offset mentok di 100%
    const offset = circumference * (1 - clamped / 100);
  
    const color =
      pct > 99 ? 'stroke-red-500'
      : pct > 50 ? 'stroke-yellow-400'
      : pct > 0 ? 'stroke-green-400'
      : 'stroke-transparent';
  
    return (
      <svg className="w-5 h-5" viewBox="0 0 48 48">
        <circle
          className="stroke-gray-200"
          strokeWidth={stroke}
          fill="transparent"
          r={normalized}
          cx="24"
          cy="24"
        />
        <circle
          className={`transition-all duration-300 ${color}`}
          strokeWidth={stroke}
          fill="transparent"
          r={normalized}
          cx="24"
          cy="24"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
    );
  };

  function formatMonth(monthStr) {
  // monthStr: "2024-01"
  const [year, month] = monthStr.split("-");
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
}
  if (isLoading) {
    return <div>Loading...</div>; // Tampilkan loading indicator
  }
  //Tampilan
  return (
    <div className="flex-col items-start justify-center min-h-screen bg-gray-200">
      {/* Tampilan Paling atas garis item */}
      <div className="flex flex-row w-full bg-black shadow-md">
        <h1 className="px-5 py-4 text-xl font-bold text-white">=</h1>
      </div>
  
      <div className="w-full bg-gray-700 shadow-md text-center py-9 md:py-32 lg:py-32">
        <h1 className="font-semibold text-white mb-4 text-4xl md:text-6xl lg:text-7xl">
          KeuanganKu
        </h1>
      </div>
  
      {/* Tampilan kolom bagian kiri */}
      <div className="py-10 px-10 flex flex-row bg-gray-200">
        <div className="flex flex-col w-1/6">
          <div className="flex flex-col">
            <h1 className="bg-gray-500 rounded-md text-[13px] md:text-base lg:text-lg font-bold text-white px-2 w-3/4">
              Kategori Bulanan
            </h1>
            <div className="mb-4 py-2">
              <label htmlFor="month-select" className="text-sm font-semibold mr-2 text-gray-700">
                Pilih Bulan:
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "add_new") {
                    setIsModalAddMonthOpen(true);
                    setActiveAddMonthTarget("budget");
                  } else {
                    setSelectedMonth(val);
                  }
                }}
              >
                {Object.keys(budgetsByMonth)
                  .sort((a, b) => new Date(a) - new Date(b))
                  .map((month) => (
                    <option key={month} value={month}>
                      {formatMonth(month)}
                    </option>
                  ))
                }
                <option value="add_new">+ Tambah Bulan</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-3 py-1 w-full">
              {(budgetsByMonth[selectedMonth] || []).map((item) => {
                  // Gunakan properti 'amount' dan 'used' dari API
                  const budgetAmount = parseFloat(item.amount) || 0;
                  const usedAmount = parseFloat(item.used) || 0;
                  const percentage = budgetAmount > 0 ? (usedAmount / budgetAmount) * 100 : 0;
  
                return (
                  <div
                    key={item.category_id}
                    className="w-4/6 sm:w-4/6 lg:w-2/3"
                  >
                    <div className="bg-white border rounded-xl px-2 py-1 gap-1 flex flex-col w-full border-gray-300">
                      <div className="flex flex-row">
                        <div className="flex flex-wrap items-center w-5/6">
                          {/* Icon Picker */}
                          <div>
                            <div
                              className={`w-6 h-6 rounded-full border cursor-pointer flex items-center justify-center mr-2 ${
                                item.icon ? "border-none" : "bg-gray-300"
                              }`}
                              onClick={() => {
                                setIconTargetType("budget");
                                setIconTargetId(item.id);
                                setShowIconPicker(true);
                              }}
                            >
                              {item.icon ? (
                                <img
                                  src={item.icon}
                                  alt="Selected Icon"
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <span className="text-gray-500">+</span>
                              )}
                            </div>
                            {showIconPicker && (
                              <IconPickerModal
                                onSelect={(icon) => {
                                  console.log("Icon saat ini:", selectedIcon);
                                  handleIconSelect(icon);
                                }}
                                onClose={() => setShowIconPicker(false)}
                              />
                            )}
                          </div>
                          <span className="text-[10px] text-left 
                            md:text-[10px] 
                            lg:text-[10px]
                            xl:text-[11px]
                            2xl:text-[12px]">
                            {item.category_name}
                          </span>
                        </div>
                        <div className="w-1/6 flex justify-end items-start">
                          <button
                            onClick={() => handleEdit(item, "budget")}
                            className="text-gray-500 text-[10px] hover:text-gray-700 ml-auto mr-2"
                          >
                            edit
                          </button>
                          <button
                            onClick={() => handleHapusKategori(item.category_id)}
                            className="text-gray-500 text-[10px] hover:text-gray-700"
                          >
                            X
                          </button>
                        </div>
                      </div>
                      <div className="text-[11px] mt-1 w-fit relative group inline-block cursor-pointer">
                        Rp.{budgetAmount.toLocaleString()}
                        <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2
                            bg-gray-500 text-white text-[11px] px-2 py-1 rounded 
                            opacity-0 group-hover:opacity-100 transition-all duration-200 
                            whitespace-nowrap z-10
                            pointer-events-none">
                          Jumlah 
                        </div>
                      </div>
                      <div className="flex flex-row gap-1 items-center relative w-fit group cursor-pointer">
                        <div className="text-[11px]">
                          {percentage.toFixed(0)}%
                        </div>
                        <CircularProgress percentage={percentage} />
                        <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2
                            bg-gray-500 text-white text-[11px] px-1 py-1 rounded 
                            opacity-0 group-hover:opacity-100 transition-all duration-200 
                            whitespace-nowrap z-10
                            pointer-events-none">
                          Pemakaian
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
  
              {/* Tombol tambah budget */}
              <button
                    onClick={() => {
                      handleAddBudget();
                    }}
                    className="bg-gray-100 text-gray-300 xl:text-[12px] 2xl:text-[15px] px-5 py-2 rounded hover:bg-gray-500 w-9/12"
                  >
                    + Tambah Kategori
                  </button>
            </div>
            {hasMoreBudget && (
              <button
                onClick={() => setCurrentBudget(prev => prev + 1)}
                className="bg-gray-300 text-gray-800 text-sm px-3 py-1 rounded hover:bg-gray-400 mt-3"
              >
                Tampilkan lebih banyak...
              </button>
            )}
          </div>
          {/*Tampilan Konten Kedua bagian kiri */}
       {/*  <div className="flex flex-col w-full mt-7">
              <div className="flex flex-col">
                <h1 className="bg-gray-500 rounded-md text-[13px] md:text-base lg:text-lg font-bold text-white px-2 w-3/4">
                  Akun Bulanan
                </h1>
                <div className="mb-4 py-2">
                  <label htmlFor="month-select" className="text-sm font-semibold mr-2 text-gray-700">
                    Pilih Bulan:
                  </label>
                  <select
                    value={selectedMonthAkun}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "add_new") {
                        setIsModalAddMonthOpen(true);
                        setActiveAddMonthTarget("akun"); 
                      } else {
                        setSelectedMonthAkun(val);
                      }
                    }}
                  >
                    {Object.keys(AkunByMonth)
                      .sort((a, b) => new Date(a) - new Date(b))
                      .map((month) => (
                        <option key={month} value={month}>
                          {formatMonth(month)}
                        </option>
                      ))
                    }
                    <option value="add_new">+ Tambah Bulan</option>
                  </select>
                </div>
                <div className="flex flex-wrap gap-3 py-1 w-full">
                  {displayedAkun.map((item) => {
                    const percentage =
                      item.Total > 0 ? ((item.used || 0) / item.Total) * 100 : 0;
      
                    return (
                      <div
                        key={item.id}
                        className="w-4/6 sm:w-4/6 lg:w-2/3"
                      >
                        <div className="bg-white border rounded-xl px-2 py-1 gap-1 flex flex-col w-full border-gray-300">
                          <div className="flex flex-row">
                            <div className="flex flex-wrap items-center w-5/6">
                              {/* Icon Picker */} {/*
                              <div>
                                <div
                                  className={`w-6 h-6 rounded-full border cursor-pointer flex items-center justify-center mr-2 ${
                                    item.icon ? "border-none" : "bg-gray-300"
                                  }`}
                                  onClick={() => {
                                    setIconTargetType("akun");
                                    setIconTargetId(item.id);
                                    setShowIconPicker(true);
                                  }}
                                >
                                  {item.icon ? (
                                    <img
                                      src={item.icon}
                                      alt="Selected Icon"
                                      className="w-full h-full object-cover rounded-full"
                                    />
                                  ) : (
                                    <span className="text-gray-500">+</span>
                                  )}
                                </div>
                                {showIconPicker && (
                                  <IconPickerModal
                                    onSelect={(icon) => {
                                      console.log("Icon saat ini:", selectedIcon);
                                      handleIconSelect(icon);
                                    }}
                                    onClose={() => setShowIconPicker(false)}
                                  />
                                )}
                              </div>
                              <span className="text-[10px] text-left 
                                md:text-[10px] 
                                lg:text-[10px]
                                xl:text-[11px]
                                2xl:text-[12px]">
                                {item.name}
                              </span>
                            </div>
                            <div className="w-1/6 flex justify-end items-start">
                              <button
                                onClick={() => handleEdit(item, "akun")}
                                className="text-gray-500 text-[10px] hover:text-gray-700 ml-auto mr-2"
                              >
                                edit
                              </button>
                              <button
                                onClick={() => handleHapusKategori(item.category_id)}
                                className="text-gray-500 text-[10px] hover:text-gray-700"
                              >
                                X
                              </button>
                            </div>
                          </div>
                          <div className="text-[11px] mt-1 w-fit relative group inline-block cursor-pointer">
                            Rp.{item.Total}
                            <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2
                                bg-gray-500 text-white text-[11px] px-2 py-1 rounded 
                                opacity-0 group-hover:opacity-100 transition-all duration-200 
                                whitespace-nowrap z-10
                                pointer-events-none">
                              Jumlah 
                            </div>
                          </div>
                          <div className="flex flex-row gap-1 items-center relative w-fit group cursor-pointer">
                            <div className="text-[11px]">
                              {percentage.toFixed(0)}%
                            </div>
                            <CircularProgress percentage={percentage} />
                            <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2
                                bg-gray-500 text-white text-[11px] px-1 py-1 rounded 
                                opacity-0 group-hover:opacity-100 transition-all duration-200 
                                whitespace-nowrap z-10
                                pointer-events-none">
                              Pemakaian
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
      
                  {/* Tombol tambah akun */} {/*
                  <button
                    onClick={() => {
                      setModalType("akun")
                      setSelectedItem(null);
                      setModalOpen(true);
                    }}
                    className="bg-gray-100 text-gray-300 xl:text-[12px] 2xl:text-[15px] px-5 py-2 rounded hover:bg-gray-500 w-9/12"
                  >
                    + Tambah Akun
                  </button>
                </div>
                {hasMoreAkun && (
                  <button
                    onClick={() => setCurrentAkun(prev => prev + 1)}
                    className="bg-gray-300 text-gray-800 text-sm px-3 py-1 rounded hover:bg-gray-400 mt-3"
                  >
                    Tampilkan lebih banyak...
                  </button>
                )}
              </div>
        </div>
        */}
        </div>
        {/* bagian tengah */}
        <div className="w-3/6">
          <div className="flex flex-col">
            {/* Title + Table */}
            <h1 className="bg-gray-300 rounded-md text-lg md:2xl lg:text-3xl font-bold text-white mx-2 px-2 w-5/6">
              Transaksi
            </h1>
           {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-2">
              <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                {["Terkini", "Harian","Bulanan","Tahunan"].map((tab) => (
                  <li key={tab} className="me-2">
                    <button
                      onClick={() => setSelectedTab(tab)}
                      className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group ${
                        selectedTab === tab
                          ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                          : "border-transparent"
                      }`}
                    >
                      {tab}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {/* Content berdasarkan tab */}
            {selectedTab === "Terkini" && (
              <Recent
                budgets={budgetsByMonth} // atau tetap budgetsByMonth kalau mau
                akun={null}
                transactions={transactions}          // <-- pakai data Pendapatan
                onRowsChange={handleTransactionsChange}  // <-- pakai handler Pendapatan
                type={"Budget"}
                onDelete={handleDeleteTransaction}
              />
            )}
            {selectedTab === "Harian" && (
              <FilterTransaksi
              budgets={budgetsByMonth}
              akun = {null}
              tab={"Harian"}
              transactions={transactions}
              setTransactions={setTransactions}
              onRowsChange={handleTransactionsChange}
              type={"Budget"}
              onDelete={handleDeleteTransaction}
            />
            )}
            {selectedTab === "Bulanan" && (
              <FilterTransaksi
              budgets={budgetsByMonth}
              akun = {null}
              tab={"Bulanan"}
              transactions={transactions}
              setTransactions={setTransactions}
              onRowsChange={handleTransactionsChange}
              type={"Budget"}
              onDelete={handleDeleteTransaction}
            />
            )}
            {selectedTab === "Tahunan" && (
              <FilterTransaksi
              budgets={budgetsByMonth}
              akun = {null}
              tab={"Tahunan"}
              transactions={transactions}
              setTransactions={setTransactions}
              onRowsChange={handleTransactionsChange}
              type={"Budget"}
              onDelete={handleDeleteTransaction}
            />
            )}
          </div>

          {/*Tampilan kedua konten tengah*/}
          <div className="flex flex-col mt-10">
            {/* Title + Table */}
            <h1 className="bg-gray-300 rounded-md text-lg md:2xl lg:text-3xl font-bold text-white mx-2 px-2 w-5/6">
              Pendapatan
            </h1>
           {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-2">
              <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                {["Terkini", "Harian","Bulanan","Tahunan"].map((tab) => (
                  <li key={tab} className="me-2">
                    <button
                      onClick={() => setSelectedTabPendapatan(tab)}
                      className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group ${
                        selectedTabPendapatan === tab
                          ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                          : "border-transparent"
                      }`}
                    >
                      {tab}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {/* Content berdasarkan tab */}
            {selectedTabPendapatan === "Terkini" && (
              <Recent
                budgets={null} // atau tetap budgetsByMonth kalau mau
                akun={AkunByMonth}
                transactions={Pendapatan}          // <-- pakai data Pendapatan
                onRowsChange={handlePendaptanChange}  // <-- pakai handler Pendapatan
                type={"Akun"}
              />
            )}
            {selectedTabPendapatan === "Harian" && (
              <FilterTransaksi
              budgets = {null}
              akun = {AkunByMonth}
              tab={"Harian"}
              transactions={Pendapatan}
              setTransactions={setPendapatan}
              onRowsChange={handlePendaptanChange}
              type={"Akun"}
            />
            )}
            {selectedTabPendapatan === "Bulanan" && (
              <FilterTransaksi
              budgets={null}
              akun = {AkunByMonth}
              tab={"Bulanan"}
              transactions={Pendapatan}
              setTransactions={setPendapatan}
              onRowsChange={handlePendaptanChange}
              type={"Akun"}
            />
            )}
            {selectedTabPendapatan === "Tahunan" && (
              <FilterTransaksi
              budgets={null}
              akun = {AkunByMonth}
              tab={"Tahunan"}
              transactions={Pendapatan}
              setTransactions={setPendapatan}
              onRowsChange={handlePendaptanChange}
              type={"Akun"}
            />
            )}
          </div>
        </div>
  
        {/* Bagian Kanan */}
        <div className="w-2/6 px-2">
          <div className="flex flex-col">
            <h1 className="bg-gray-300 rounded-md text-[13px] md:text-base lg:text-lg font-bold text-white mx-2 px-2 w-full">
              Graph Pengeluaran
            </h1>
            <ChartKeuangan transactions={transactions} type={"pengeluaran"} />
          </div>
          <div className="flex flex-col mt-5">
            <h1 className="bg-gray-300 rounded-md text-[13px] md:text-base lg:text-lg font-bold text-white mx-2 px-2 w-full">
              Graph Pendapatan
            </h1>
            <ChartKeuangan transactions={Pendapatan} type={"Pendapatan"} />
          </div>
        </div>
      </div>

      
        {/* Modal */}
        <ModalBudget
          isOpen={isModalOpen}
          onClose={() => {
          setModalOpen(false);
          setSelectedItem(null);
          setSelectedIcon(null);
            }}
          akunList={akunSementara}
          initialData={selectedItem}
          onSave={handleSaveBudget}
          type={modalType}
        />
        <ModalAddMonth
                    isOpen={isModalAddMonthOpen}
                    onClose={() => setIsModalAddMonthOpen(false)}
                    onAddMonth={handleAddMonthWrapper}
        />
    </div>
  );
}

export default App;
