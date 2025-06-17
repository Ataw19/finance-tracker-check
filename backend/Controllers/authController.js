const pool = require('../db.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new users
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Harap isi semua field' });
  }

  try {
    // Cek jika user sudah ada
    const [userExists] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (userExists.length > 0) {
      return res.status(400).json({ message: 'User sudah terdaftar' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Buat user baru
    const [result] = await pool.query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, password_hash]);
    const insertedId = result.insertId;

    if (insertedId) {
      res.status(201).json({
        id: insertedId,
        email: email,
        token: generateToken(insertedId),
      });
    } else {
      res.status(400).json({ message: 'Data user tidak valid' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      res.json({
        id: user.id,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Email atau password salah' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
