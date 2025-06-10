const pool = require('../Config/db');

// @desc    Get budgets for a specific month and year
// @route   GET /api/budgets?year=YYYY&month=MM
// @access  Private
const getBudgets = async (req, res) => {
  const { year, month } = req.query;
  if (!year || !month) {
    return res.status(400).json({ message: 'Tahun dan bulan diperlukan' });
  }

  try {
    const query = `
      SELECT 
        c.id as category_id, 
        c.name as category_name,
        b.id as budget_id,
        b.amount,
        (SELECT SUM(t.amount) 
         FROM transactions t 
         WHERE t.category_id = c.id 
           AND t.user_id = ? 
           AND YEAR(t.transaction_date) = ? 
           AND MONTH(t.transaction_date) = ?
           AND t.type = 'expense'
        ) as used
      FROM categories c
      LEFT JOIN budgets b ON c.id = b.category_id AND b.user_id = ? AND b.year = ? AND b.month = ?
      WHERE c.user_id = ? OR c.user_id IS NULL
    `;
    
    const [budgets] = await pool.query(query, [req.user.id, year, month, req.user.id, year, month, req.user.id]);
    
    res.json(budgets);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Set or update a budget for a category
// @route   POST /api/budgets
// @access  Private
const setBudget = async (req, res) => {
  const { category_id, amount, year, month } = req.body;
  if (!category_id || amount === undefined || !year || !month) {
    return res.status(400).json({ message: 'Harap isi semua field' });
  }

  try {
    // Menggunakan ON DUPLICATE KEY UPDATE untuk insert atau update budget
    const query = `
      INSERT INTO budgets (user_id, category_id, month, year, amount)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE amount = VALUES(amount)
    `;

    await pool.query(query, [req.user.id, category_id, month, year, amount]);

    res.status(201).json({ message: 'Budget berhasil disimpan' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getBudgets,
  setBudget,
};