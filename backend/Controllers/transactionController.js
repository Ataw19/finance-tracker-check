const pool = require('../db.js');

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    // Kita join dengan accounts dan categories untuk mendapatkan nama
    const query = `
      SELECT 
        t.id, t.description, t.amount, t.transaction_date, t.type, t.account_id,
        a.name as account_name,
        c.name as category_name,
        c.id as category_id
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
      ORDER BY t.transaction_date DESC, t.created_at DESC
    `;
    const [transactions] = await pool.query(query, [req.user.id]);
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  const { account_id, category_id, type, amount, description, transaction_date } = req.body;

  if (!account_id || !type || !amount || !transaction_date) {
    return res.status(400).json({ message: 'Field wajib: account_id, type, amount, transaction_date' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Masukkan transaksi baru
    const [result] = await connection.query(
      'INSERT INTO transactions (user_id, account_id, category_id, type, amount, description, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, account_id, category_id || null, type, amount, description, transaction_date]
    );

    // 2. Update saldo akun
    const balanceChange = type === 'income' ? parseFloat(amount) : -parseFloat(amount);
    await connection.query(
      'UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?',
      [balanceChange, account_id, req.user.id]
    );

    // Jika semua berhasil, commit perubahan
    await connection.commit();
    
    res.status(201).json({ id: result.insertId, ...req.body });

  } catch (error) {
    // Jika ada error, batalkan semua perubahan
    if (connection) await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server Error saat membuat transaksi' });
  } finally {
    // Selalu lepaskan koneksi
    if (connection) connection.release();
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { category_id, amount, description, transaction_date } = req.body;
  
  try {
    const [result] = await pool.query(
      'UPDATE transactions SET category_id = ?, amount = ?, description = ?, transaction_date = ? WHERE id = ? AND user_id = ?',
      [category_id, amount, description, transaction_date, id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }
    res.json({ message: 'Transaksi berhasil diupdate' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }
    res.json({ message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
