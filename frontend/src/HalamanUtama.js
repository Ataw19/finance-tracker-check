
import ModalAddMonth from "./ModalAddMonth";
import React, { useEffect, useState, useCallback } from "react";
//import IconPickerModal from "./IconPickerModal";
import Recent from './RecentTransaction';
import FilterTransaksi from './FilterTransaksi';
import ChartKeuangan from './ChartKeuangan';
import ModalTransaksi from './ModalTransaksi';
import ModalKategori from './ModalKategori';
import ModalAkun from './ModalAkun';
import { useNavigate } from 'react-router-dom';
import DropdownAksi from "./DropdownButton";
import { getTransactions, getBudgets, getCategories, deleteTransaction, deleteCategory, setBudget,createTransaction, updateTransaction, createCategory, updateCategory, createAccount, getAccounts, updateAccount, deleteAccount} from './apiservice';

function App() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [budgetsByMonth, setBudgetsByMonth] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [pendapatan, setPendapatan] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [editingBudgetAmount, setEditingBudgetAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalAddMonthOpen, setIsModalAddMonthOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Terkini");
  const [selectedTabPendapatan, setSelectedTabPendapatan] = useState("Terkini");

  //Variabel
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

 
  //Fungsi atau Method
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [year, month] = selectedMonth.split('-');
      
      const [accountData, budgetData, transactionData, categoryData] = await Promise.all([
        getAccounts(),
        getBudgets(year, month),
        getTransactions(),
        getCategories()
      ]);
      setAccounts(accountData);
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

 function handleAddMonth(newMonth) {
  if (budgetsByMonth[newMonth]) {
    alert("Maaf, bulan sudah ada!");
    return;
  }
  // Tambahkan bulan baru dengan data kosong, lalu pilih bulan tersebut
  setBudgetsByMonth(prev => ({
    ...prev,
    [newMonth]: []
  }));
  setSelectedMonth(newMonth);
  setIsModalAddMonthOpen(false); // Tutup modal setelah selesai
}

 const handleSaveBudget = async (categoryId, amount) => {
  const [year, month] = selectedMonth.split('-');
  try {
    await setBudget({
      category_id: categoryId,
      amount: parseFloat(amount) || 0,
      year: parseInt(year),
      month: parseInt(month),
    });
    fetchData(); // Refresh data untuk menampilkan perubahan
  } catch (error) {
    console.error("Gagal simpan budget:", error);
    alert(error.message);
  } finally {
    setEditingBudgetId(null); // Tutup mode edit
  }
};
  const handleDeleteTransaction = async (transactionId) => {
  if (window.confirm("Anda yakin ingin menghapus transaksi ini?")) {
    try {
      await deleteTransaction(transactionId);
      // Update state secara manual agar UI cepat merespons
      setTransactions(prev => prev.filter(tx => tx.id !== transactionId));
      setPendapatan(prev => prev.filter(p => p.id !== transactionId));
      alert('Transaksi berhasil dihapus.');
    } catch (error) {
      console.error("Gagal menghapus transaksi:", error);
      alert(error.message);
    }
  }
};
  
  const handleHapusKategori = async (categoryId) => {
  if (window.confirm("Yakin ingin menghapus kategori ini?")) {
    try {
      await deleteCategory(categoryId); // <-- PERBAIKI DI SINI
      fetchData();
      alert('Kategori berhasil dihapus.');
    } catch (error) {
      console.error("Gagal hapus kategori:", error);
      alert(error.message);
    }
  }
};

  // Untuk membuka modal dalam mode 'edit'
  const handleOpenEditTransactionModal = (transaction) => {
    setSelectedTransaction(transaction); // Isi dengan data transaksi yang akan diedit
    setTransactionModalOpen(true);
  };

  // Fungsi yang dipanggil saat tombol 'Simpan' di modal ditekan
  const handleSaveTransaction = async (data) => {
    try {
      if (data.id) {
        // Jika data punya id, artinya kita sedang UPDATE (mengubah)
        const { type, ...updateData } = data; // Backend tidak mengizinkan 'type' diubah saat edit
        await updateTransaction(data.id, updateData);
      } else {
        // Jika tidak punya id, artinya kita sedang CREATE (tambah baru)
        await createTransaction(data);
      }
      setTransactionModalOpen(false); // Tutup modal setelah berhasil
      fetchData(); // Ambil data terbaru dari server agar tampilan update
      alert('Transaksi berhasil disimpan!');
    } catch (error) {
      console.error('Gagal menyimpan transaksi:', error);
      alert(error.message);
    }
  };
  const handleOpenAddCategoryModal = () => {
    setSelectedCategory(null);
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (category) => {
    // Data dari API budget memiliki 'category_id' dan 'category_name'
    // Kita sesuaikan agar konsisten
    setSelectedCategory({ id: category.category_id, name: category.category_name });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (data) => {
    try {
    if (data.id) {
      // MODE EDIT: Hanya update nama kategori
      await updateCategory(data.id, { name: data.name });
      alert('Nama kategori berhasil diupdate!');

    } else {
      // MODE TAMBAH BARU:
      // Langkah 1: Buat kategori baru dan dapatkan ID-nya
      const newCategory = await createCategory({ name: data.name });

      // Langkah 2: Jika user memasukkan jumlah budget, set budget untuk kategori baru tersebut
      if (data.amount > 0) {
        const [year, month] = selectedMonth.split('-');
        await setBudget({
          category_id: newCategory.id,
          amount: data.amount,
          year: parseInt(year),
          month: parseInt(month),
        });
      }
      alert('Kategori baru berhasil ditambahkan!');
    }

    setCategoryModalOpen(false);
    fetchData(); // Selalu refresh data setelah berhasil

  } catch (error) {
    console.error('Gagal menyimpan kategori:', error);
    alert(error.message);
  }
};
  const [isAccountModalOpen, setAccountModalOpen] = useState(false);

  const handleOpenAddAccountModal = () => setAccountModalOpen(true);

  const handleSaveAccount = async (data) => {
    try {
      if (data.id) { // Jika ada id, berarti edit
        await updateAccount(data.id, data);
      } else { // Jika tidak, tambah baru
        await createAccount(data);
      }
      setAccountModalOpen(false);
      fetchData();
      alert('Akun berhasil disimpan!');
    } catch (error) {
      alert(error.message);
    }
  };
  const handleDeleteAccount = async (accountId) => {
  if(window.confirm('Yakin ingin menghapus akun ini? Aksi ini tidak bisa dibatalkan.')){
    try {
      await deleteAccount(accountId);
      fetchData();
      alert('Akun berhasil dihapus.');
    } catch (error) {
      alert(error.message);
    }
  }
}
const handleOpenEditAccountModal = (account) => {
  setSelectedAccount(account); // Simpan data akun yang dipilih
  setAccountModalOpen(true);   // Buka modal akun
};
const handleLogout = () => {
    // Hapus token dari penyimpanan browser
    localStorage.removeItem('userToken');
    // Arahkan pengguna ke halaman login
    navigate('/');
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
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow"
        >
          Logout
        </button>
      </div>
      <div className="flex justify-center mt-5">
        <div className="inline-flex rounded-full overflow-hidden shadow-md border border-gray-500">
          <button
            className="bg-gray-500 text-white px-6 py-2 text-sm md:text-base font-medium rounded-l-full"
          >
            Transaksi
          </button>
          <button
            onClick={() => navigate("/hutang")}
            className="bg-white text-gray-500 hover:bg-gray-100 px-6 py-2 text-sm md:text-base font-medium rounded-r-full"
          >
            Hutang 
          </button>
        </div>
      </div>
      {/* Tampilan kolom bagian kiri */}
      <div className="py-10 px-10 flex flex-row bg-gray-200">
        <div className="flex flex-col w-1/6 mr-8">
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
                const budgetAmount = parseFloat(item.amount) || 0;
                const usedAmount = parseFloat(item.used) || 0;
                const percentage = budgetAmount > 0 ? (usedAmount / budgetAmount) * 100 : 0;
                const isEditing = editingBudgetId === item.category_id;
  
                return (
                  <div
                    key={item.category_id}
                    className="w-4/6 sm:w-4/6 lg:w-2/3"
                  >
                    <div className="bg-white border rounded-xl px-2 py-1 gap-1 flex flex-col w-full border-gray-300">
                      <div className="flex flex-row">
                        <div className="flex flex-wrap items-center w-5/6">
                          {/* Icon Picker */}
                          <span className="text-[10px] text-left 
                            md:text-[10px] 
                            lg:text-[10px]
                            xl:text-[11px]
                            2xl:text-[12px]">
                            {item.category_name}
                          </span>
                        </div>
                        <DropdownAksi
                            onEdit={() => handleOpenEditCategoryModal(item)}
                            onDelete={() => handleHapusKategori(item.category_id)}
                        />
                      </div>
                      <div className="text-[11px] mt-1 w-fit relative group inline-block">
                          {isEditing ? (
                              <input
                                  type="number"
                                  value={editingBudgetAmount}
                                  onChange={(e) => setEditingBudgetAmount(e.target.value)}
                                  onBlur={() => handleSaveBudget(item.category_id, editingBudgetAmount)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveBudget(item.category_id, editingBudgetAmount) }}
                                  autoFocus
                                  className="w-24 border-b-2 border-blue-500 outline-none"
                              />
                          ) : (
                              <span onClick={() => {
                                  setEditingBudgetId(item.category_id);
                                  setEditingBudgetAmount(budgetAmount);
                              }}
                              className="cursor-pointer"
                              >
                                  Rp {budgetAmount.toLocaleString('id-ID')}
                              </span>
                          )}
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
                    onClick={handleOpenAddCategoryModal}
                    className="bg-gray-100 text-gray-300 xl:text-[12px] 2xl:text-[15px] px-5 py-2 rounded hover:bg-gray-500 w-9/12"
                  >
                    + Tambah Kategori
                  </button>
            </div>
          </div>
          {/*Tampilan Konten Kedua bagian kiri */}
            <h1 className="bg-gray-500 rounded-md text-[13px] md:text-base lg:text-lg font-bold text-white px-2 w-3/4">
            Daftar Akun
        </h1>
        <div className="flex flex-wrap gap-3 py-1 w-full">
            {accounts.length > 0 ? (
                accounts.map(account => (
                    // Kita gunakan gaya yang sama seperti Kategori
                    <div key={account.id} className="w-4/6 sm:w-4/6 lg:w-2/3">
                        <div className="bg-white border rounded-xl px-2 py-2 gap-1 flex flex-col w-full border-gray-300">
                           <div className="flex flex-row justify-between items-center">
                                <span className="text-sm font-medium text-gray-800">{account.name}</span>
                                {/* DropdownAksi untuk Akun (fungsi edit/hapus bisa ditambahkan nanti) */}
                                <DropdownAksi
                                    onEdit={() => handleOpenEditAccountModal(account)}
                                    onDelete={() => handleDeleteAccount(account.id)}
                                />
                           </div>
                           <span className="text-sm font-semibold text-gray-900">
                                Rp {Number(account.balance).toLocaleString('id-ID')}
                           </span>
                        </div>
                    </div>
                    ))
            ) : (
                <p className="p-2 text-sm text-gray-500">Belum ada akun.</p>
            )}
            {/* Tombol Tambah Akun */}
            <button
                onClick={handleOpenAddAccountModal}
                className="bg-gray-100 text-gray-400 text-sm px-5 py-2 rounded-xl hover:bg-gray-200 w-4/6 sm:w-4/6 lg:w-2/3"
            >
                + Tambah Akun
            </button>
            </div>
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
                  // <-- pakai handler Pendapatan
                type={"Budget"}
                onDelete={handleDeleteTransaction}
                onEdit={handleOpenEditTransactionModal}
              />
            )}
            {selectedTab === "Harian" && (
              <FilterTransaksi
                budgets={budgetsByMonth}
                akun={null}
                tab={"Harian"}
                transactions={transactions} // <-- DIPERBAIKI
                setTransactions={setTransactions} // <-- DIPERBAIKI
                 // <-- DIPERBAIKI
                type={"Budget"}
                onDelete={handleDeleteTransaction}
                onEdit={handleOpenEditTransactionModal}
              />
            )}
            {selectedTab === "Bulanan" && (
              <FilterTransaksi
                budgets={budgetsByMonth}
                akun={null}
                tab={"Bulanan"}
                transactions={transactions} // <-- DIPERBAIKI
                setTransactions={setTransactions} // <-- DIPERBAIKI
                 // <-- DIPERBAIKI
                type={"Budget"}
                onDelete={handleDeleteTransaction}
                onEdit={handleOpenEditTransactionModal}
              />
            )}
            {selectedTab === "Tahunan" && (
              <FilterTransaksi
                budgets={budgetsByMonth}
                akun={null}
                tab={"Tahunan"}
                transactions={transactions} // <-- DIPERBAIKI
                setTransactions={setTransactions} // <-- DIPERBAIKI
                 // <-- DIPERBAIKI
                type={"Budget"}
                onDelete={handleDeleteTransaction}
                onEdit={handleOpenEditTransactionModal}
              />
            )}
          </div>

          {/*Tampilan kedua konten tengah*/}
          <div className="flex flex-col mt-10">
              <h1 className="bg-gray-300 rounded-md text-lg md:2xl lg:text-3xl font-bold text-white mx-2 px-2 w-5/6">
                  Pendapatan
              </h1>
              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-2">
                  <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                  {["Terkini", "Harian", "Bulanan", "Tahunan"].map((tab) => (
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
                  budgets={null}
                  akun={null} // <-- Diperbaiki
                  transactions={pendapatan} // <-- Diperbaiki (p kecil)
                  
                  onDelete={handleDeleteTransaction}
                  onEdit={handleOpenEditTransactionModal}
                  type={"Akun"}
                  />
              )}
              {selectedTabPendapatan === "Harian" && (
                  <FilterTransaksi
                  budgets={null}
                  akun={null} // <-- Diperbaiki
                  tab={"Harian"}
                  transactions={pendapatan} // <-- Diperbaiki (p kecil)
                  setTransactions={setPendapatan}
                  
                  type={"Akun"}
                  onDelete={handleDeleteTransaction}
                  />
              )}
              {selectedTabPendapatan === "Bulanan" && (
                  <FilterTransaksi
                  budgets={null}
                  akun={null} // <-- Diperbaiki
                  tab={"Bulanan"}
                  transactions={pendapatan} // <-- Diperbaiki (p kecil)
                  setTransactions={setPendapatan}
                  
                  type={"Akun"}
                  onDelete={handleDeleteTransaction}
                  />
              )}
              {selectedTabPendapatan === "Tahunan" && (
                  <FilterTransaksi
                  budgets={null}
                  akun={null} // <-- Diperbaiki
                  tab={"Tahunan"}
                  transactions={pendapatan} // <-- Diperbaiki (p kecil)
                  setTransactions={setPendapatan}
                  
                  type={"Akun"}
                  onDelete={handleDeleteTransaction}
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
            <ChartKeuangan transactions={transactions} type={"expense"} />
          </div>
          <div className="flex flex-col mt-5">
            <h1 className="bg-gray-300 rounded-md text-[13px] md:text-base lg:text-lg font-bold text-white mx-2 px-2 w-full">
              Graph Pendapatan
            </h1>
            <ChartKeuangan transactions={pendapatan} type={"income"} />
          </div>
        </div>
      </div>
          
      
        {/* Modal */}

        <ModalAddMonth
                    isOpen={isModalAddMonthOpen}
                    onClose={() => setIsModalAddMonthOpen(false)}
                    onAddMonth={handleAddMonth}
        />
        <ModalTransaksi
        isOpen={isTransactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        onSave={handleSaveTransaction}
        initialData={selectedTransaction}
        categories={categories} /* Kirim daftar kategori ke modal */
        accounts={accounts}
      />
      <ModalKategori
        isOpen={isCategoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        initialData={selectedCategory}
      />
      <ModalAkun 
        isOpen={isAccountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        onSave={handleSaveAccount}
        initialData={selectedAccount}
      />
    </div>
  );
}

export default App;
