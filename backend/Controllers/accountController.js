// backend/controllers/accountController.js

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

module.exports = {
  getAccounts,
  createAccount,
  // Anda bisa menambahkan fungsi update dan delete di sini nanti
};