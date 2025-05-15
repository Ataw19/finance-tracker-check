import React, { useState } from "react";

function FilterTransaksi({ budgets, onRowsChange, tab, transactions, setTransactions }) {
  const [expandedGroups, setExpandedGroups] = useState({});

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

  const filteredTransactions = transactions;

  const groupBy = (data) => {
    const grouped = {};
    data.forEach((item) => {
      const key = formatGroupKey(item.date);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    return grouped;
  };

  const grouped = groupBy(filteredTransactions);

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
    const updated = [newItem, ...transactions]; // Keep the same order for added items
    setTransactions(updated);
    onRowsChange(updated);
  };

  return (
    <div className="mx-2">
      {Object.keys(grouped)
        .sort((a, b) => {
          const dateA = new Date(grouped[a][0].date);
          const dateB = new Date(grouped[b][0].date);
          return dateB - dateA; // dari terbaru ke terlama
        })
        .map((groupKey) => {
        const groupDate = grouped[groupKey][0]?.date;
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
                      <th className="px-2 py-1 border">Kategori</th>
                      <th className="px-2 py-1 border">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped[groupKey].map((row) => (
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
                        <td className="px-2 py-1 border">
                          <select
                            value={row.category}
                            onChange={(e) => handleChange(row.id, "category", e.target.value)}
                            className="w-full outline-none bg-transparent"
                          >
                            <option value="">Pilih</option>
                            {budgets.map((b) => (
                              <option key={b.id} value={b.name}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-1 border">
                          <input
                            type="date"
                            value={row.date}
                            onChange={(e) => handleChange(row.id, "date", e.target.value)}
                            className="w-full outline-none bg-transparent"
                          />
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