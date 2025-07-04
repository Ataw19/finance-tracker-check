const pool = require('../db');

// @desc    Get all accounts for a user
// @route   GET /api/accounts
// @access  Private
const getAccounts = async (req, res) => {
  try {
    const [accounts] = await pool.query(
      'SELECT id, name, type, balance FROM accounts WHERE user_id = ? ORDER BY name',
      [req.user.id]
    );
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new account
// @route   POST /api/accounts
// @access  Private
const createAccount = async (req, res) => {
  const { name, type, balance } = req.body;
  if (!name || balance === undefined) {
    return res.status(400).json({ message: 'Nama dan saldo awal wajib diisi' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO accounts (user_id, name, type, balance) VALUES (?, ?, ?, ?)',
      [req.user.id, name, type, balance]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
// @desc    Update an account
// @route   PUT /api/accounts/:id
const updateAccount = async (req, res) => {
  const { id } = req.params;
  const { name, type, balance } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE accounts SET name = ?, type = ?, balance = ? WHERE id = ? AND user_id = ?',
      [name, type, balance, id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Akun tidak ditemukan' });
    res.json({ message: 'Akun berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete an account
// @route   DELETE /api/accounts/:id
const deleteAccount = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'DELETE FROM accounts WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Akun tidak ditemukan' });
    res.json({ message: 'Akun berhasil dihapus' });
  } catch (error) {
    // Tangani error jika akun masih digunakan oleh transaksi
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'Tidak bisa menghapus akun karena masih memiliki riwayat transaksi.' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  // Anda bisa menambahkan fungsi update dan delete di sini nanti
};