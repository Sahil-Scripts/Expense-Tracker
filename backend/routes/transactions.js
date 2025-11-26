const express = require('express');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const router = express.Router();

// create
router.post('/', auth, async (req,res)=>{
  const { type, amount, category, date, note } = req.body;
  const t = await Transaction.create({ user: req.user.id, type, amount, category, date, note });
  res.json(t);
});

// list with optional month filter ?month=YYYY-MM
router.get('/', auth, async (req,res)=>{
  const { month } = req.query;
  const filter = { user: req.user.id };
  if (month) {
    const [y,m] = month.split('-').map(Number);
    const start = new Date(y, m-1, 1);
    const end = new Date(y, m, 1);
    filter.date = { $gte: start, $lt: end };
  }
  const list = await Transaction.find(filter).sort({ date: -1 });
  res.json(list);
});

// delete
router.delete('/:id', auth, async (req,res)=>{
  await Transaction.deleteOne({ _id: req.params.id, user: req.user.id });
  res.json({ ok: true });
});

module.exports = router;
