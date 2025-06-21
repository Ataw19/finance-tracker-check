import React, { useState, useRef, useEffect } from "react";

const DropdownAksi = ({ item, handleEdit, handleHapus, month, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Tutup dropdown jika klik di luar komponen
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-1/6 flex justify-end items-start" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-600 text-lg p-0 m-0 leading-none"
      >
        &#8230;
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 bg-white border rounded shadow z-10 w-24">
          <button
            onClick={() => {
              handleEdit(item);
              setIsOpen(false);
            }}
            className="block w-full text-left px-3 py-1 text-gray-700 hover:bg-gray-100 text-xs"
          >
            Edit
          </button>
          <button
            onClick={() => {
              handleHapus(item.id, month, type);
              setIsOpen(false);
            }}
            className="block w-full text-left px-3 py-1 text-red-600 hover:bg-gray-100 text-xs"
          >
            Hapus
          </button>
        </div>
      )}
    </div>
  );
};

export default DropdownAksi;