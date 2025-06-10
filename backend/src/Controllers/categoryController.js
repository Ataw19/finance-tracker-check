const pool = require('../Config/db');

// @desc    Get all categories for a user
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT id, name FROM categories WHERE user_id = ? OR user_id IS NULL ORDER BY name', 
      [req.user.id]
    );
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Nama kategori tidak boleh kosong' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO categories (user_id, name) VALUES (?, ?)',
      [req.user.id, name]
    );
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'UPDATE categories SET name = ? WHERE id = ? AND user_id = ?',
      [name, id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }
    res.json({ message: 'Kategori berhasil diupdate' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    // PERHATIAN: Menghapus kategori bisa berdampak pada transaksi dan budget.
    // Sebaiknya, Anda handle ini (misal: set category_id di transaksi jadi NULL atau cegah hapus jika masih dipakai).
    // Untuk saat ini, kita akan langsung menghapusnya.
    const [result] = await pool.query(
      'DELETE FROM categories WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};