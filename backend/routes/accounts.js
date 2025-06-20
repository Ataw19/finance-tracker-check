// backend/routes/accounts.js

const express = require('express');
const router = express.Router();
const { getAccounts, createAccount } = require('../Controllers/accountController');

// Rute ini sudah otomatis terproteksi jika kita terapkan 'protect' di server.js
router.route('/').get(getAccounts).post(createAccount);

module.exports = router;