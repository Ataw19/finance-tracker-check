import React, { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChartKeuangan = ({ transactions, type }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  // Filter transaksi berdasarkan tipe dan bulan
  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      const txMonth = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Sesuaikan kondisi berdasarkan type:
      if (txMonth !== selectedMonth) return false;

      if (type === "Pendapatan") {
        // Misal pendapatan ditandai budget == null atau kategori khusus
        return tx.budget === null || tx.akun !== null;
      } else if (type === "Pengeluaran") {
        // Pengeluaran adalah transaksi yang ada kategori budget (bukan pendapatan)
        return tx.budget !== null && tx.akun == null;
      }

      return true; // fallback, tampilkan semua
    });
  }, [transactions, selectedMonth, type]);

  const categoryTotals = useMemo(() => {
    return filtered.reduce((acc, tx) => {
      const label = type === "Pendapatan" ? tx.akun || "Lain-lain" : tx.category || "Lain-lain";
      acc[label] = (acc[label] || 0) + (tx.amount || 0);
      return acc;
    }, {});
  }, [filtered]);

  const data = useMemo(() => {
    const categories = Object.keys(categoryTotals);
    const colors = ['#60a5fa', '#f87171', '#34d399', '#fbbf24', '#a78bfa'];
    return {
      labels: ['Total'],
      datasets: categories.map((category, index) => ({
        label: category,
        data: [categoryTotals[category]],
        backgroundColor: colors[index % colors.length],
      })),
    };
  }, [categoryTotals]);

  const options = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Laporan ${type} (${selectedMonth})` },
    },
  }), [selectedMonth, type]);

  if (filtered.length === 0) {
    return (
      <div className="w-full max-w-xl mx-auto py-2">
        <div className="mb-1">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded px-3 py-1 bg-gray-100"
          />
        </div>
        <div className="flex justify-center items-center h-10">
          <p className='text-xl text-red-700'>
            Tidak ada transaksi {type.toLowerCase()} di bulan ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto py-2">
      <div className="mb-1">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border rounded px-3 py-1 bg-gray-100"
        />
      </div>
      <Bar data={data} options={options} />
    </div>
  );
};

export default ChartKeuangan;