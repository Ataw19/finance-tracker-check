import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

export async function getUserByEmail(email) {
  const [rows] = await pool.query(
    `
    SELECT * FROM users WHERE email = ?
  `,
    [email]
  );
  return rows[0];
}

export async function createUser(email, passwordHash) {
  const [result] = await pool.query(
    `
    INSERT INTO users (email, password_hash)
    VALUES (?, ?)
  `,
    [email, passwordHash]
  );
  return result.insertId;
}

export async function getCategories(userId) {
  const [rows] = await pool.query(
    `
    SELECT * FROM categories
    WHERE user_id IS NULL OR user_id = ?
  `,
    [userId]
  );
  return rows;
}

export async function createCategory(userId, name) {
  const [result] = await pool.query(
    `
    INSERT INTO categories (user_id, name)
    VALUES (?, ?)
  `,
    [userId, name]
  );
  return result.insertId;
}

export async function updateCategory(id, name) {
  const [result] = await pool.query(
    `
    UPDATE categories SET name = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
    [name, id]
  );
  return result;
}

export async function deleteCategory(id) {
  const [result] = await pool.query(
    `
    DELETE FROM categories WHERE id = ?
  `,
    [id]
  );
  return result;
}

export async function createTransaction(
  userId,
  categoryId,
  type,
  amount,
  description,
  date
) {
  const [result] = await pool.query(
    `
    INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
    [userId, categoryId, type, amount, description, date]
  );
  return result.insertId;
}

export async function getTransactions(userId) {
  const [rows] = await pool.query(
    `
    SELECT * FROM transactions
    WHERE user_id = ?
    ORDER BY transaction_date DESC
  `,
    [userId]
  );
  return rows;
}

export async function updateTransaction(
  id,
  categoryId,
  type,
  amount,
  description,
  date
) {
  const [result] = await pool.query(
    `
    UPDATE transactions
    SET category_id = ?, type = ?, amount = ?, description = ?, transaction_date = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
    [categoryId, type, amount, description, date, id]
  );
  return result;
}

export async function deleteTransaction(id) {
  const [result] = await pool.query(
    `
    DELETE FROM transactions WHERE id = ?
  `,
    [id]
  );
  return result;
}

export async function upsertBudget(userId, categoryId, month, year, amount) {
  const [result] = await pool.query(
    `
    INSERT INTO budgets (user_id, category_id, month, year, amount)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE amount = VALUES(amount)
  `,
    [userId, categoryId, month, year, amount]
  );
  return result;
}

export async function getBudgets(userId, month, year) {
  const [rows] = await pool.query(
    `
    SELECT * FROM budgets
    WHERE user_id = ? AND month = ? AND year = ?
  `,
    [userId, month, year]
  );
  return rows;
}

export async function updateBudget(id, amount) {
  const [result] = await pool.query(
    `
    UPDATE budgets SET amount = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
    [amount, id]
  );
  return result;
}

export async function deleteBudget(id) {
  const [result] = await pool.query(
    `
    DELETE FROM budgets WHERE id = ?
  `,
    [id]
  );
  return result;
}

export async function createDebt(userId, description, totalAmount, dueDate) {
  const [result] = await pool.query(
    `
    INSERT INTO debts (user_id, description, total_amount, due_date)
    VALUES (?, ?, ?, ?)
  `,
    [userId, description, totalAmount, dueDate]
  );
  return result.insertId;
}

export async function getUpcomingDebts(userId) {
  const [rows] = await pool.query(
    `
    SELECT * FROM debts
    WHERE user_id = ? AND due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
  `,
    [userId]
  );
  return rows;
}

export async function updateDebt(id, amountPaid) {
  const [result] = await pool.query(
    `
    UPDATE debts SET amount_paid = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
    [amountPaid, id]
  );
  return result;
}

export async function deleteDebt(id) {
  const [result] = await pool.query(
    `
    DELETE FROM debts WHERE id = ?
  `,
    [id]
  );
  return result;
}
