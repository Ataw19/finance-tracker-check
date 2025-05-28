import React, { useState, useEffect } from "react";
import IconPickerModal from "./IconPickerModal";

const ModalBudget = ({ isOpen, onClose, initialData = null, onSave, type = "budget" }) => {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [nama, setNama] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [isEditingNama, setEditingNama] = useState(false);

  useEffect(() => {
  if (initialData) {
    setSelectedIcon(initialData.icon || null);
    setNama(initialData.name || "");

    if (type === "akun") {
      setJumlah(initialData.Total || "");
    } else {
      setJumlah(initialData.budgets || "");
    }
  } else {
    setSelectedIcon(null);
    setNama("");
    setJumlah("");
  }
}, [initialData, type]);

  if (!isOpen) return null;

  const handleIconSelect = (iconPath) => {
    setSelectedIcon(iconPath);
    setShowIconPicker(false);
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  const updatedItem = {
    id: initialData?.id || Date.now(),
    name: nama,
    icon: selectedIcon,
    used: initialData?.used || 0,
  };

  if (type === "akun") {
    updatedItem.Total = parseInt(jumlah);
  } else {
    // budget
    updatedItem.budgets = parseInt(jumlah);
  }

  onSave(updatedItem);
  onClose();
};

  const typeLabel = type === "akun" ? "Akun" : "Kategori";

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

          {/* Jumlah */}
          <div className="relative z-0 w-full mt-3.5 mb-5 group">
            <input
              type="number"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              placeholder=" "
              required
              className="block py-1.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            />
            <label className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] 
              peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
              Jumlah 
            </label>
          </div>

          <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800">
            Simpan
          </button>
        </form>
      </div>

      {/* Icon Picker Modal */}
      {showIconPicker && (
        <IconPickerModal onSelect={handleIconSelect} onClose={() => setShowIconPicker(false)} />
      )}
    </div>
  );
};

export default ModalBudget;