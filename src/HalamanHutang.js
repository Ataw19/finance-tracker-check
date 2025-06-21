import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HalamanHutang() {
  const navigate = useNavigate();

  const [data, setData] = useState([
    {
      id: 1,
      nama: 'Budi',
      nominal: 1000000,
      jenis: 'hutang',
      status: 'belum lunas',
      jatuhTempo: '2025-06-18',
    },
    {
      id: 2,
      nama: 'Ani',
      nominal: 500000,
      jenis: 'piutang',
      status: 'lunas',
      jatuhTempo: '2025-06-10',
    },
  ]);

  const [form, setForm] = useState({
    nama: '',
    nominal: '',
    jenis: '',
    jatuhTempo: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      ...form,
      nominal: Number(form.nominal),
      status: 'belum lunas',
    };
    setData([newEntry, ...data]);
    setForm({ nama: '', nominal: '', jenis: '', jatuhTempo: '' });
  };

  const handleLunas = (id) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'lunas' } : item
      )
    );
  };

  const handleHapus = (id) => {
    setData((prev) => prev.filter((item) => item.id !== id));
  };

  const isDueSoon = (dateStr) => {
    const today = new Date();
    const dueDate = new Date(dateStr);
    const diffDays = (dueDate - today) / (1000 * 60 * 60 * 24);
    return diffDays <= 3 && diffDays >= 0;
  };

  return (
    <div className="flex-col items-start justify-center min-h-screen bg-gray-200 pb-20">
      <div className="w-full bg-gray-700 shadow-md text-center py-9 md:py-32 lg:py-32">
        <h1 className="font-semibold text-white mb-4 text-4xl md:text-6xl lg:text-7xl">
          KeuanganKu
        </h1>
      </div>

      <div className="flex justify-center mt-5">
        <div className="inline-flex rounded-full overflow-hidden shadow-md border border-gray-500">
          <button
            onClick={() => navigate("/Dashboard")}
            className="bg-white text-gray-500 hover:bg-gray-100 px-6 py-2 text-sm md:text-base font-medium rounded-l-full"
          >
            Transaksi
          </button>
          <button
            className="bg-gray-500 text-white px-6 py-2 text-sm md:text-base font-medium rounded-r-full"
          >
            Hutang 
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white p-5 rounded-md shadow-md mt-10">
        <h1 className="text-2xl text-center font-semibold mb-6">Hutang & Piutang</h1>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" onSubmit={handleSubmit}>
          <input
            name="nama"
            value={form.nama}
            onChange={handleInputChange}
            type="text"
            placeholder="Nama Pihak"
            required
            className="p-2 border rounded"
          />
          <input
            name="nominal"
            value={form.nominal}
            onChange={handleInputChange}
            type="number"
            placeholder="Nominal (Rp)"
            required
            className="p-2 border rounded"
          />
          <select
            name="jenis"
            value={form.jenis}
            onChange={handleInputChange}
            required
            className="p-2 border rounded"
          >
            <option value="">Pilih Jenis</option>
            <option value="hutang">Hutang</option>
            <option value="piutang">Piutang</option>
          </select>
          <input
            name="jatuhTempo"
            value={form.jatuhTempo}
            onChange={handleInputChange}
            type="date"
            required
            className="p-2 border rounded"
          />
          <button
            type="submit"
            className="col-span-1 md:col-span-2 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
          >
            Tambah
          </button>
        </form>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2 border-b">Nama</th>
              <th className="text-left p-2 border-b">Nominal</th>
              <th className="text-left p-2 border-b">Jenis</th>
              <th className="text-left p-2 border-b">Status</th>
              <th className="text-left p-2 border-b">Jatuh Tempo</th>
              <th className="text-left p-2 border-b">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className={isDueSoon(item.jatuhTempo) && item.status === 'belum lunas' ? 'bg-yellow-100' : ''}
              >
                <td className="p-2 border-b">{item.nama}</td>
                <td className="p-2 border-b">Rp {item.nominal.toLocaleString()}</td>
                <td className="p-2 border-b">
                  <span
                    className={`text-white text-xs px-2 py-1 rounded ${
                      item.jenis === 'hutang' ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                  >
                    {item.jenis.charAt(0).toUpperCase() + item.jenis.slice(1)}
                  </span>
                </td>
                <td className="p-2 border-b">
                  <span
                    className={`text-white text-xs px-2 py-1 rounded ${
                      item.status === 'lunas' ? 'bg-green-500' : 'bg-yellow-400'
                    }`}
                  >
                    {item.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                  </span>
                </td>
                <td className="p-2 border-b">{item.jatuhTempo}</td>
                <td className="p-2 border-b">
                  {item.status === 'belum lunas' ? (
                    <button
                      onClick={() => handleLunas(item.id)}
                      className="text-sm bg-green-500 text-white px-2 py-1 mr-1 rounded"
                    >
                      Tandai Lunas
                    </button>
                  ) : (
                    <button
                      disabled
                      className="text-sm bg-gray-300 text-white px-2 py-1 mr-1 rounded"
                    >
                      Selesai
                    </button>
                  )}
                  <button
                    onClick={() => handleHapus(item.id)}
                    className="text-sm bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center p-4 text-gray-500">
                  Belum ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HalamanHutang;
