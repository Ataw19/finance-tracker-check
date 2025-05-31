import React, { useState, useEffect } from "react";
import IconPickerModal from "./IconPickerModal";

const ModalBudget = ({ isOpen, onClose, akunList = [], initialData = null, onSave, type = "budget"}) => {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [nama, setNama] = useState("");
  const [akunDipakai, setAkunDipakai] = useState({});
  const [isEditingNama, setEditingNama] = useState(false);
  
  useEffect(() => {
    if (initialData) {
      setSelectedIcon(initialData.icon || null);
      setNama(initialData.name || "");
      if (type === "budget" && initialData.akunDipakai) {
        setAkunDipakai(initialData.akunDipakai);
      }
    } else {
      setSelectedIcon(null);
      setNama("");
      setAkunDipakai({});
    }
  }, [initialData, type]);

  const handleIconSelect = (iconPath) => {
    setSelectedIcon(iconPath);
    setShowIconPicker(false);
  };

  const toggleAkun = (akunName) => {
  setAkunDipakai((prev) => {
    // Kalau sebelumnya sudah dipilih (ada di objek)
    if (prev.hasOwnProperty(akunName)) {
      // Hapus kategori agar input hilang & checkbox unchecked
      const copy = { ...prev };
      delete copy[akunName];
      return copy;
    } else {
      // Kalau belum dipilih, tambah dengan default 0 (atau bisa 1)
      return { ...prev, [akunName]: 0 };
    }
  });
};

  const handleAkunAmountChange = (akunName, value) => {
  const jumlahBaru = parseInt(value) || 0;

  setAkunDipakai((prev) => ({
    ...prev,
    [akunName]: jumlahBaru,
  }));
};

  const totalBudget = Object.values(akunDipakai).reduce((sum, val) => sum + val, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedItem = {
      id: initialData?.id || Date.now(),
      name: nama,
      icon: selectedIcon,
      used: initialData?.used || 0,
    };

    if (type === "akun") {
      updatedItem.Total = initialData?.Total || 0; // Tidak bisa diubah
    } else {
      updatedItem.budgets = totalBudget;
      updatedItem.akunDipakai = akunDipakai;
    }

    onSave(updatedItem);
    onClose();
  };

  const typeLabel = type === "akun" ? "Akun" : "Kategori";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative dark:bg-gray-700">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white">✕</button>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {initialData ? `Edit ${typeLabel}` : `Tambah ${typeLabel}`}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Icon Picker */}
          <div className="mb-4">
            <div
              className="w-12 h-12 rounded-full border cursor-pointer bg-gray-300 flex items-center justify-center"
              onClick={() => setShowIconPicker(true)}
            >
              {selectedIcon ? (
                <img src={selectedIcon} alt="Selected Icon" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-gray-500">+</span>
              )}
            </div>
          </div>

          {/* Nama */}
          <div className="mt-2">
            {isEditingNama ? (
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                onBlur={() => setEditingNama(false)}
                autoFocus
                className="bg-transparent border-none outline-none focus:ring-0 text-base text-gray-300 dark:text-gray-300 placeholder-gray-400"
                required
              />
            ) : (
              <div
                className="text-gray-300 dark:text-gray-300 cursor-text text-base"
                onClick={() => setEditingNama(true)}
              >
                {nama || <span className="italic text-gray-400 text-base">Nama {typeLabel}</span>}
              </div>
            )}
          </div>

          {/* Akun List untuk budget */}
          {type === "budget" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sumber Dana:</label>
              {akunList.map((akun) => {
                return (
                  <div key={akun.name} className="mb-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={akunDipakai.hasOwnProperty(akun.name)}
                        onChange={() => toggleAkun(akun.name)}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-800 dark:text-white">
                        {akun.name}{" "}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          (Sisa: Rp {(akun.Total - akun.used - (akunDipakai[akun.name] || 0)).toLocaleString()})
                        </span>
                      </span>
                    </label>
                    {akun.name in akunDipakai && (
                      <div className="mt-1 ml-6">
                        <input
                          type="number"
                          min="0"
                          max={akun.Total - akun.used}
                          value={akunDipakai[akun.name]}
                          onChange={(e) => handleAkunAmountChange(akun.name, e.target.value)}
                          className="w-32 text-sm border rounded px-2 py-1 dark:bg-gray-600 dark:text-white"
                          placeholder={`Maks: ${akun.Total - akun.used}`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Total: Rp {totalBudget.toLocaleString()}</p>
            </div>
          )}

          {/* Tidak bisa edit jumlah jika tipe akun */}
          {type === "akun" && (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-300">Total Saldo: Rp {(initialData?.Total || 0).toLocaleString()}</p>
          )}

          <button type="submit" className="w-full bg-blue-700 text-white py-2 mt-5 rounded hover:bg-blue-800">
            Simpan
          </button>
        </form>
      </div>

      {showIconPicker && (
        <IconPickerModal onSelect={handleIconSelect} onClose={() => setShowIconPicker(false)} />
      )}
    </div>
  );
};

export default ModalBudget;
