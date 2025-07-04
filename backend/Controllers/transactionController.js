const pool = require('../db');

// getTransactions tidak berubah, sudah benar.
const getTransactions = async (req, res) => {
  try {
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

// createTransaction tidak berubah, sudah benar.
const createTransaction = async (req, res) => {
  const { account_id, category_id, type, amount, description, transaction_date } = req.body;
  if (!account_id || !type || !amount || !transaction_date) {
    return res.status(400).json({ message: 'Field wajib: account_id, type, amount, transaction_date' });
  }
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [result] = await connection.query(
      'INSERT INTO transactions (user_id, account_id, category_id, type, amount, description, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, account_id, category_id || null, type, amount, description, transaction_date]
    );
    const balanceChange = type === 'income' ? parseFloat(amount) : -parseFloat(amount);
    await connection.query(
      'UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?',
      [balanceChange, account_id, req.user.id]
    );
    await connection.commit();
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server Error saat membuat transaksi' });
  } finally {
    if (connection) connection.release();
  }
};

// =====================================================================
// ===== FUNGSI UPDATE BARU YANG SUDAH DIPERBAIKI DAN AMAN =====
// =====================================================================
const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { account_id, category_id, amount, description, transaction_date } = req.body;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Ambil data transaksi lama untuk menghitung pembalikan saldo
    const [oldTransactions] = await connection.query('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (oldTransactions.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }
    const oldTx = oldTransactions[0];
    
    // 2. Kembalikan saldo akun lama
    const oldBalanceChange = oldTx.type === 'income' ? -parseFloat(oldTx.amount) : parseFloat(oldTx.amount);
    await connection.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [oldBalanceChange, oldTx.account_id]);

    // 3. Update data transaksi dengan data baru
    // Pastikan category_id menjadi NULL jika kosong
    const finalCategoryId = category_id || null;
    await connection.query(
      'UPDATE transactions SET account_id = ?, category_id = ?, amount = ?, description = ?, transaction_date = ? WHERE id = ?',
      [account_id, finalCategoryId, amount, description, transaction_date, id]
    );

    // 4. Terapkan saldo ke akun baru (bisa jadi akun yang sama atau berbeda)
    const newBalanceChange = oldTx.type === 'income' ? parseFloat(amount) : -parseFloat(amount);
    await connection.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [newBalanceChange, account_id]);

    await connection.commit();
    res.json({ message: 'Transaksi berhasil diupdate' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server Error saat update transaksi' });
  } finally {
    if (connection) connection.release();
  }
};

// =====================================================================
// ===== FUNGSI DELETE BARU YANG SUDAH DIPERBAIKI DAN AMAN =====
// =====================================================================
const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Ambil data transaksi yang akan dihapus
    const [transactionsToDelete] = await connection.query('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (transactionsToDelete.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }
    const txToDelete = transactionsToDelete[0];

    // 2. Kembalikan saldo akun
    const balanceChange = txToDelete.type === 'income' ? -parseFloat(txToDelete.amount) : parseFloat(txToDelete.amount);
    await connection.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [balanceChange, txToDelete.account_id]);

    // 3. Hapus transaksi
    await connection.query('DELETE FROM transactions WHERE id = ?', [id]);

    await connection.commit();
    res.json({ message: 'Transaksi berhasil dihapus' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server Error saat menghapus transaksi' });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
