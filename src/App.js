import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from "react";
import ModalBudget from './ModalBudget';
import IconPickerModal from "./IconPickerModal";
import Recent from './RecentTransaction';
import FilterTransaksi from './FilterTransaksi';

function App() {

  {/*Variabel*/}
  const [budgets, setBudgets] = useState([
    { id: 1, name: "Makanan",budgets: 200,used : 100, icon:null },
    { id: 2, name: "Transportasi",budgets: 400,used : 125, icon:null },
  ]);
  const initialTransactions = [
    { id: 1, name: "Nasi Goreng", amount: 25000, category: "Makanan", date: "2025-05-09" },
    { id: 2, name: "Ojek", amount: 10000, category: "Transportasi", date: "2025-05-09" },
    { id: 3, name: "Sate", amount: 20000, category: "Makanan", date: "2025-04-12" },
    { id: 4, name: "Bensin", amount: 50000, category: "Transportasi", date: "2025-04-01" },
    { id: 5, name: "Cemilan", amount: 5000, category: "Makanan", date: "2024-12-20" },
  ];
  
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null); // Data untuk edit
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [iconTargetId, setIconTargetId] = useState(null);
  const [selectedTab, setSelectedTab] = useState("Recent");

  {/*Fungsi atau Method*/}
  const handleTransactionsChange = (updatedRows) => {
    setTransactions(updatedRows);
  };

  const handleIconSelect = (iconPath) => {
  setShowIconPicker(false);
  setSelectedIcon(iconPath);

  if (iconTargetId !== null) {
    setBudgets((prev) =>
      prev.map((b) =>
        b.id === iconTargetId ? { ...b, icon: iconPath } : b
      )
    );
    setIconTargetId(null); // Reset setelah selesai
  }
};

  const handleEdit = (budget) => {
    setSelectedBudget(budget);
    setModalOpen(true);
  };
  
  const handleSaveBudget = (updatedBudget) => {
    setBudgets((prevBudgets) => {
      const index = prevBudgets.findIndex((b) => b.id === updatedBudget.id);
      if (index !== -1) {
        // Mode edit
        const newBudgets = [...prevBudgets];
        newBudgets[index] = {
          ...newBudgets[index], // pertahankan nilai yang lama
          ...updatedBudget,     // timpa dengan data baru
        };
        return newBudgets;
      } else {
        // Mode tambah
        return [...prevBudgets, { ...updatedBudget, used: 0 }];
      }
    });
  };
  
  const handleHapus = (id) => {
    setBudgets((prevBudgets) => prevBudgets.filter((b) => b.id !== id));
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

  useEffect(() => {
    const updatedBudgets = budgets.map(budget => {
      const totalUsed = transactions
        .filter(tx => tx.category === budget.name)
        .reduce((sum, tx) => sum + tx.amount, 0);
  
      return { ...budget, used: totalUsed };
    });
  
    setBudgets(updatedBudgets);
  }, [transactions]);

  {/*Tampilan*/}
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
  
      {/* Tampilan kolom budget */}
      <div className="py-10 px-10 flex flex-row bg-gray-200">
        <div className="flex flex-col w-1/6">
          <div className="flex flex-col">
            <h1 className="bg-gray-500 rounded-md text-[13px] md:text-base lg:text-lg font-bold text-white px-2 w-3/4">
              Budgets
            </h1>
            <div className="flex flex-wrap gap-3 py-3 w-full">
              {budgets.map((item) => {
                const percentage =
                  item.budgets > 0 ? ((item.used || 0) / item.budgets) * 100 : 0;
  
                return (
                  <div
                    key={item.id}
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
                                onSelect={handleIconSelect}
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
                            onClick={() => handleEdit(item)}
                            className="text-gray-500 text-[10px] hover:text-gray-700 ml-auto mr-2"
                          >
                            edit
                          </button>
                          <button
                            onClick={() => handleHapus(item.id)}
                            className="text-gray-500 text-[10px] hover:text-gray-700"
                          >
                            X
                          </button>
                        </div>
                      </div>
                      <div className="text-[11px] mt-1 w-fit relative group inline-block cursor-pointer">
                        ${item.budgets}
                        <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2
                            bg-gray-500 text-white text-[11px] px-2 py-1 rounded 
                            opacity-0 group-hover:opacity-100 transition-all duration-200 
                            whitespace-nowrap z-10
                            pointer-events-none">
                          Pendapatan
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
                  setSelectedBudget(null);
                  setModalOpen(true);
                }}
                className="bg-gray-100 text-gray-300 xl:text-[12px] 2xl:text-[15px] px-5 py-2 rounded hover:bg-gray-500 w-9/12"
              >
                + Tambah Budgets
              </button>
  
              {/* Modal */}
              <ModalBudget
                isOpen={isModalOpen}
                onClose={() => {
                  setModalOpen(false);
                  setSelectedBudget(null);
                  setSelectedIcon(null);
                }}
                initialData={selectedBudget}
                onSave={handleSaveBudget}
              />
            </div>
          </div>
        </div>
  
        <div className="w-3/6">
          <div className="flex flex-col">
            {/* Title + Table */}
            <h1 className="bg-gray-300 rounded-md text-lg md:2xl lg:text-3xl font-bold text-white mx-2 px-2 w-5/6">
              Transaction
            </h1>
           {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-2">
              <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                {["Recent", "Harian","Bulanan","Tahunan"].map((tab) => (
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
            {selectedTab === "Recent" && (
              <Recent budgets={budgets} transactions={transactions} onRowsChange={handleTransactionsChange} />
            )}
            {selectedTab === "Harian" && (
              <FilterTransaksi
              budgets={budgets}
              tab={"Harian"}
              transactions={transactions}
              setTransactions={setTransactions}
              onRowsChange={handleTransactionsChange}
            />
            )}
            {selectedTab === "Bulanan" && (
              <FilterTransaksi
              budgets={budgets}
              tab={"Bulanan"}
              transactions={transactions}
              setTransactions={setTransactions}
              onRowsChange={handleTransactionsChange}
            />
            )}
            {selectedTab === "Tahunan" && (
              <FilterTransaksi
              budgets={budgets}
              tab={"Tahunan"}
              transactions={transactions}
              setTransactions={setTransactions}
              onRowsChange={handleTransactionsChange}
            />
            )}
          </div>
        </div>
  
        {/* Tampilan Graph */}
        <div className="w-2/6">
          <div className="flex flex-col">
            <h1 className="bg-gray-300 rounded-md text-[13px] md:text-base lg:text-lg font-bold text-white mx-2 px-2 w-full">
              Graph
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
