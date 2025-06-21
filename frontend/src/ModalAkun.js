import React, { useState } from 'react';

const ModalAkun = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name, balance, type: 'General' }); // Kirim data ke parent
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Tambah Akun Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Akun (cth: Dompet, Bank BRI)</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Saldo Awal</label>
            <input
              type="number" value={balance} onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" className="bg-gray-200 px-4 py-2 rounded-md" onClick={onClose}>Batal</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAkun;