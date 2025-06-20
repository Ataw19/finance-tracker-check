// src/ChartKeuangan.js (VERSI FINAL YANG SUDAH DIPERBAIKI)

import React, { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChartKeuangan = ({ transactions, type }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  // Filter transaksi berdasarkan tipe (income/expense) dan bulan yang dipilih
  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      // Gunakan 'transaction_date' dari API
      const txDate = new Date(tx.transaction_date);
      const txMonth = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (txMonth !== selectedMonth) return false;

      // Cek tipe transaksi langsung dari properti 'type'
      if (type === "pendapatan") {
        return tx.type === 'income';
      } else if (type === "pengeluaran") {
        return tx.type === 'expense';
      }

      return false;
    });
  }, [transactions, selectedMonth, type]);

  // Kelompokkan total berdasarkan nama kategori
  const categoryTotals = useMemo(() => {
    return filtered.reduce((acc, tx) => {
      // Gunakan 'category_name' dari API sebagai label
      const label = tx.category_name || "Lain-lain";
      acc[label] = (acc[label] || 0) + (Number(tx.amount) || 0);
      return acc;
    }, {});
  }, [filtered]);

  // Siapkan data untuk ditampilkan di grafik
  const data = useMemo(() => {
    const categories = Object.keys(categoryTotals);
    const colors = ['#60a5fa', '#f87171', '#34d399', '#fbbf24', '#a78bfa', '#f472b6'];
    return {
      labels: categories, // Tampilkan nama kategori di sumbu X
      datasets: [{
        label: `Total ${type}`,
        data: categories.map(cat => categoryTotals[cat]), // Data untuk setiap kategori
        backgroundColor: colors,
      }],
    };
  }, [categoryTotals, type]);

  const options = useMemo(() => ({
    indexAxis: 'y', // Membuat bar chart menjadi horizontal agar label mudah dibaca
    responsive: true,
    plugins: {
      legend: { display: false }, // Sembunyikan legenda karena sudah jelas dari label
      title: { display: false },
    },
    scales: {
        x: {
            ticks: {
                callback: function(value) {
                    return 'Rp ' + (value / 1000) + 'k'; // Format sumbu X (misal: Rp 50k)
                }
            }
        }
    }
  }), []);
  
  const formattedTitle = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className="w-full max-w-xl mx-auto py-2">
      <div className="mb-2 flex justify-between items-center">
        <p className="font-semibold">{formattedTitle}</p>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border rounded px-2 py-1 bg-gray-100 text-sm"
        />
      </div>
      {filtered.length === 0 ? (
        <div className="flex justify-center items-center h-48 bg-gray-50 rounded-md">
          <p className='text-sm text-gray-500'>
            Tidak ada data {type.toLowerCase()} di bulan ini.
          </p>
        </div>
      ) : (
        <Bar data={data} options={options} />
      )}
    </div>
  );
};

export default ChartKeuangan;