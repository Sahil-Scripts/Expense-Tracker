const express = require('express');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/dashboard/monthly-summary?month=YYYY-MM
router.get('/monthly-summary', auth, async (req, res) => {
  try {
    const { month } = req.query; // e.g., "2025-11"
    const [y, m] = (month || new Date().toISOString().slice(0, 7)).split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);

    const userId = new mongoose.Types.ObjectId(req.user.id);

    const agg = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: '$_id.category',
          totals: { $push: { type: '$_id.type', total: '$total' } }
        }
      }
    ]);

    // format: byCategory: { labels: [...], values: [...] }, totals
    const byCategory = {};
    let totalIncome = 0, totalExpense = 0;
    agg.forEach(entry => {
      const cat = entry._id;
      const obj = { income: 0, expense: 0 };
      entry.totals.forEach(t => {
        obj[t.type] = t.total;
        if (t.type === 'income') totalIncome += t.total;
        if (t.type === 'expense') totalExpense += t.total;
      });
      if (obj.expense > 0) {
        byCategory[cat] = obj.expense;
      }
    });

    res.json({
      byCategory: { labels: Object.keys(byCategory), values: Object.values(byCategory) },
      totals: { totalIncome, totalExpense }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/dashboard/trends?months=6
// returns monthly totals for last N months
router.get('/trends', auth, async (req, res) => {
  try {
    const months = Number(req.query.months || 6);
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth() - (months - 1), 1);

    const userId = new mongoose.Types.ObjectId(req.user.id);

    const agg = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Build month labels and totals
    const map = {};
    for (let i = 0; i < months; i++) {
      const d = new Date(end.getFullYear(), end.getMonth() - (months - 1) + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = { income: 0, expense: 0 };
    }
    agg.forEach(it => {
      const k = `${it._id.year}-${String(it._id.month).padStart(2, '0')}`;
      if (!map[k]) return;
      if (it._id.type === 'income') map[k].income = it.total;
      if (it._id.type === 'expense') map[k].expense = it.total;
    });

    const labels = Object.keys(map);
    const incomes = labels.map(l => map[l].income);
    const expenses = labels.map(l => map[l].expense);

    res.json({ labels, incomes, expenses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/dashboard/budget-alerts?month=YYYY-MM
router.get('/budget-alerts', auth, async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const [y, m] = month.split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);

    const user = await User.findById(req.user.id);
    const budget = user?.monthlyBudget || 0;

    const agg = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id), date: { $gte: start, $lt: end }, type: 'expense' } },
      { $group: { _id: null, totalExpense: { $sum: '$amount' } } }
    ]);

    const totalExpense = (agg[0] && agg[0].totalExpense) || 0;
    let level = 'ok', title = 'All good', message = '';

    if (budget > 0) {
      const pct = (totalExpense / budget) * 100;
      if (pct >= 100) { level = 'critical'; title = 'Budget exceeded'; message = `You spent ${pct.toFixed(0)}% of your budget (${totalExpense}/${budget})`; }
      else if (pct >= 90) { level = 'high'; title = 'Near budget (>=90%)'; message = `You spent ${pct.toFixed(0)}% of your budget (${totalExpense}/${budget})`; }
      else if (pct >= 75) { level = 'warning'; title = '75% of budget used'; message = `You spent ${pct.toFixed(0)}% of your budget (${totalExpense}/${budget})`; }
      else { level = 'ok'; title = 'Within budget'; message = `You spent ${pct.toFixed(0)}% of your budget (${totalExpense}/${budget})`; }
    } else {
      title = 'No budget set';
      message = 'Set a monthly budget in settings to receive alerts';
      level = 'info';
    }

    res.json({ totalExpense, budget, level, title, message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
