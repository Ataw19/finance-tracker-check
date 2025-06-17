const express = require('express');
const router = express.Router();
const { getBudgets, setBudget } = require('../Controllers/budgetController.js');
const { protect } = require('../middleware/auth.js');

router.route('/').get(protect, getBudgets).post(protect, setBudget);

module.exports = router;
