import React, { useState } from "react";
import { Trash } from "lucide-react";

function FilterTransaksi({ budgets, akun, onRowsChange, tab, transactions, setTransactions,type ,onDelete,onEdit}) {
  const [expandedGroups, setExpandedGroups] = useState({});
  const [sortBy, setSortBy] = useState("date");
  

  const formatGroupKey = (dateStr) => {
    const date = new Date(dateStr);
    if (tab === "Harian") {
      return date.toLocaleDateString("id-ID", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      });
    } else if (tab === "Bulanan") {
      return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    } else if (tab === "Tahunan") {
      return date.getFullYear().toString();
    }
    return "Semua Transaksi";
  };

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

  const groupBy = (data) => {
    const grouped = {};
    data.forEach((item) => {
      const key = formatGroupKey(item.date);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    return grouped;
  };

  const sortItems = (items) => {
  return [...items].sort((a, b) => {
    if (sortBy === "category") return (a.category || "").localeCompare(b.category || "");
    if (sortBy === "akun") return (a.akun || "").localeCompare(b.akun || "");
    if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
    return new Date(b.date) - new Date(a.date);
  });
};
  
  const grouped = groupBy(transactions);

  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const handleChange = (id, field, value) => {
    const updated = transactions.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setTransactions(updated);
    onRowsChange(updated);
  };

  const handleAdd = (date) => {
    const newItem = {
      id: Date.now(),
      name: "",
      amount: 0,
      category: "",
      date: date,
    };
    const updated = [newItem, ...transactions];
    setTransactions(updated);
    onRowsChange(updated);
  };

  return (
    <div className="mx-2">
      <div className="mb-4">
        <label className="text-sm font-medium mr-2">Filter : </label>
        <select
          className="text-sm border px-0 py-1 rounded bg-gray-200"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date">Tanggal</option>
          {type === "Budget" && <option value="category">Kategori</option>}
          {type === "Akun" && <option value="akun">Akun</option>}
          <option value="name">Nama</option>
        </select>
      </div>

      {Object.keys(grouped)
        .sort((a, b) => {
          const dateA = new Date(grouped[a][0].date);
          const dateB = new Date(grouped[b][0].date);
          return dateB - dateA;
        })
        .map((groupKey) => {
          const groupDate = grouped[groupKey][0]?.date;
          const sortedItems = sortItems(grouped[groupKey]);
          return (
            <div key={groupKey} className="mb-4">
              <div
                className="flex items-center justify-between bg-gray-300 px-4 py-2 rounded cursor-pointer"
                onClick={() => toggleGroup(groupKey)}
              >
                <span className="font-semibold text-gray-800">{groupKey}</span>
                <span>{expandedGroups[groupKey] ? "▲" : "▼"}</span>
              </div>
              {expandedGroups[groupKey] && (
                <>
                  <table className="w-full text-sm text-left text-gray-700 border mt-1">
                   <thead>
                      <tr className="bg-gray-100">
                        <th className="px-2 py-1 border">Nama</th>
                        <th className="px-2 py-1 border">Jumlah</th>
                        {type === "Budget" && <th className="px-2 py-1 border">Kategori</th>}
                        {type === "Akun" &&<th className="px-2 py-1 border">Akun</th>}
                        <th className="px-2 py-1 border">Tanggal</th>
                        <th className="px-2 py-1 border"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedItems.map((row) => (
                        <tr key={row.id}>
                          <td className="px-2 py-1 border">
                            <input
                              value={row.name}
                              onChange={(e) => handleChange(row.id, "name", e.target.value)}
                              className="w-full outline-none bg-transparent"
                            />
                          </td>
                          <td className="px-2 py-1 border">
                            <input
                              type="number"
                              value={row.amount}
                              onChange={(e) =>
                                handleChange(row.id, "amount", parseInt(e.target.value) || 0)
                              }
                              className="w-full outline-none bg-transparent"
                            />
                          </td>
                          {type === "Budget" && (
                            <td className="px-2 py-1 border">
                              <select
                                value={row.category}
                                onChange={(e) => handleChange(row.id, "category", e.target.value)}
                                className="w-full outline-none bg-transparent"
                              >
                                {getBudgetOptions(row.date).length === 0 ? (
                                  <option value="">Tidak ada kategori</option>
                                ) : (
                                  <>
                                    <option value="">Pilih</option>
                                    {getBudgetOptions(row.date).map((b) => (
                                      <option key={b.id} value={b.name}>
                                        {b.name}
                                      </option>
                                    ))}
                                  </>
                                )}
                              </select>
                            </td>
                          )}

                          {type === "Akun" && (
                            <td className="px-2 py-1 border">
                              <select
                                value={row.akun}
                                onChange={(e) => handleChange(row.id, "akun", e.target.value)}
                                className="w-full outline-none bg-transparent"
                              >
                               {getAkunOptions(row.date).length === 0 ? (
                                  <option value="">Tidak ada Akun</option>
                                ) : (
                                  <>
                                    <option value="">Pilih</option>
                                    {getAkunOptions(row.date).map((b) => (
                                      <option key={b.id} value={b.name}>
                                        {b.name}
                                      </option>
                                    ))}
                                  </>
                                )}
                              </select>
                            </td>
                          )}
                          <td className="px-2 py-1 border">
                            <input
                              type="date"
                              value={row.date}
                              onChange={(e) => handleChange(row.id, "date", e.target.value)}
                              className="w-full outline-none bg-transparent"
                            />
                          </td>

                          <td className="border px-2 py-1 text-center">
                            {/* 2. Tambah tombol Edit */}
                            <button
                              className="text-sm text-blue-600 hover:text-blue-800"
                              onClick={() => onEdit(row)} // Panggil onEdit dengan data baris
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              className="ml-2 text-sm text-red-600 hover:text-red-800"
                              onClick={() => onDelete(row.id)}
                              title="Hapus"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    onClick={() => handleAdd(groupDate)}
                    className="mt-1 text-sm text-blue-600 hover:underline"
                  >
                    + Tambah Transaksi
                  </button>
                </>
              )}
            </div>
          );
        })}
    </div>
  );
}

export default FilterTransaksi;
