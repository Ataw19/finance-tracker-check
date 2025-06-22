import React, { useState, useEffect } from "react";
import CurrencyInput from "react-currency-input-field";
import { Trash } from "lucide-react";


const Recent = ({ budgets, akun, transactions, onRowsChange, type, onDelete ,onEdit}) => {
  const [rows, setRows] = useState(transactions);

  const sortedTransactions = [...rows].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  // Menampilkan hanya baris sesuai jumlah halaman
  const rowsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const displayedRows = sortedTransactions.slice(0, currentPage * rowsPerPage);
  const hasMoreRows = sortedTransactions.length > displayedRows.length;

  const getBudgetOptions = (date) => {
  if (!budgets) return []; // amanin kalau budgets = null
  const monthKey = new Date(date).toISOString().slice(0, 7);
  return budgets[monthKey] || [];
};

  const getAkunOptions = (date) => {
    if (!akun) return []; 
    const monthKey = new Date(date).toISOString().slice(0, 7); // "YYYY-MM"
    return akun[monthKey] || [];
  };

  const handleChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const handleAddRow = () => {
  const today = new Date().toISOString().slice(0, 10); // format yyyy-mm-dd
  const newRow = {
    id: Date.now(),
    name: "",
    amount: "",
    category: "",
    account: "",
    date: today,
  };
  setRows((prevRows) => [...prevRows, newRow]);
};
  

  useEffect(() => {
    onRowsChange(rows);
  }, [rows, onRowsChange]); // Kirim rows setiap kali berubah

  return (
    <div className="mt-3 p-4 bg-none rounded shadow-md w-full bg-gray-200">
      <table className="table-auto w-full text-sm">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="border px-2 py-1 border-black/40 text-black/50 border-l-transparent">Nama</th>
            <th className="border px-2 py-1 border-black/40 text-black/50">Total</th>
            <th className="border px-2 py-1 border-black/40 text-black/50">Kategori</th>
            <th className="border px-2 py-1 border-black/40 text-black/50">Tanggal</th>
            <th className="border px-2 py-1 border-black/40 text-black/50 border-r-transparent">Aksi</th>
          </tr>
        </thead>
        <tbody>
            {displayedRows.map((row) => (
            <tr key={row.id}>
              {/* Menampilkan deskripsi sebagai teks biasa */}
              <td className="border px-2 py-1 bg-gray-200 border-opacity-40 border-r-black border-b-black">{row.description}</td>
              
              {/* Menampilkan jumlah dengan format Rupiah */}
              <td className="border px-2 py-1 bg-gray-200 border-opacity-40 border-r-black border-b-black text-black/60">
                Rp {Number(row.amount).toLocaleString('id-ID')}
              </td>
              
              {/* Menampilkan nama kategori sebagai teks biasa */}
              <td className="border px-2 py-1 bg-gray-200 border-opacity-40 border-r-black border-b-black text-black/60">
                {row.category_name}
              </td>
              
              {/* Menampilkan tanggal dengan format Indonesia */}
              <td className="border px-2 py-1 bg-gray-200 border-opacity-40 border-b-black text-black/60">
                {new Date(row.transaction_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
              </td>
              
              {/* Tombol Aksi (Edit & Hapus) */}
              <td className="border px-2 py-1 text-center bg-gray-200 border-opacity-40 border-b-black">
                <button
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => onEdit(row)}
                  title="Edit"
                >
                  Edit
                </button>
                <button
                  className="ml-2 text-sm text-red-600 hover:underline"
                  onClick={() => onDelete(row.id)}
                  title="Hapus"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
          {hasMoreRows && (
            <tr>
              <td colSpan="5" className="border px-2 text-left">
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="text-black/40 hover:text-black/80 text-sm"
                >
                  + Load More
                </button>
              </td>
            </tr>
          )}

          <tr>
            <td colSpan="5" className="border px-2 text-left border-b-black/40">
                <button
                    // Panggil fungsi onEdit dengan mengirim 'type' sesuai tabelnya
                    onClick={() => onEdit({ type: type === 'Budget' ? 'expense' : 'income' })}
                    className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                >
                    + Tambah {type === 'Budget' ? 'Pengeluaran' : 'Pendapatan'}
                </button>
            </td>
        </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Recent;