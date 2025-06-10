const pool = require('../database.js');

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { type } = req.query; // filter by 'income' or 'expense'
    let query = 'SELECT t.id, t.description, t.amount, t.transaction_date, t.type, c.name as category_name FROM transactions t JOIN categories c ON t.category_id = c.id WHERE t.user_id = ?';
    const params = [req.user.id];

    if (type) {
        query += ' AND t.type = ?';
        params.push(type);
    }
    
    query += ' ORDER BY t.transaction_date DESC';
    
    const [transactions] = await pool.query(query, params);
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
  const { category_id, type, amount, description, transaction_date } = req.body;
  if (!category_id || !type || !amount || !transaction_date) {
    return res.status(400).json({ message: 'Field yang wajib diisi: category_id, type, amount, transaction_date' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, category_id, type, amount, description, transaction_date]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
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
