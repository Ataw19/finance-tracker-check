// src/ModalKategori.js

import React, { useState, useEffect } from 'react';

const ModalKategori = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Jika mode edit, isi input dengan nama yang ada. Jika tidak, kosongkan.
      setName(initialData ? initialData.name : '');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return; // Jangan simpan jika nama kosong
    
    // Kirim data kembali ke HalamanUtama
    onSave({ id: initialData?.id, name });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">{initialData ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="Nama Kategori"
            required
            autoFocus
          />
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" className="bg-gray-200 px-4 py-2 rounded-md" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalKategori;